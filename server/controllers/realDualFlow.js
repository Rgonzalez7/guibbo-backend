// server/controllers/realDualFlow.js
const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");

const resolveFfmpegPath = require("../utils/resolveFfmpegPath");
ffmpeg.setFfmpegPath(resolveFfmpegPath());

const DG_KEY = String(process.env.DEEPGRAM_API_KEY || "").trim();

function safeSend(ws, obj) {
  try {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify(obj));
  } catch {}
}

function safeClose(ws, code = 1000, reason = "") {
  try {
    if (!ws) return;
    if (ws.readyState === 2 || ws.readyState === 3) return;
    ws.close(code, reason);
  } catch {}
}

function log(...a) {
  console.log("🎛️ [REAL-DUAL]", ...a);
}

/* =========================================================
   ✅ Auth Host (JWT normal)
========================================================= */
function verifyWsToken(token) {
  const raw0 = String(token || "").trim();
  const raw = raw0.replace(/^Bearer\s+/i, "").trim();
  if (!raw) return null;
  try {
    const decoded = jwt.verify(raw, process.env.JWT_SECRET);
    return decoded?.id || decoded?._id || decoded?.userId || null;
  } catch {
    return null;
  }
}

/* =========================================================
   ✅ Audio helpers
========================================================= */
function selectInputFormat(mime) {
  if (!mime) return "webm";
  const m = String(mime).toLowerCase();

  // iOS/Safari típicamente manda mp4/m4a/aac
  if (m.includes("m4a") || m.includes("aac")) return "mp4";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4") || m.includes("mpeg")) return "mp4";
  return "webm";
}

function isMimePCM(mime) {
  return String(mime || "").toLowerCase().includes("audio/pcm");
}

/* =========================================================
   ✅ Deepgram WS factory
   Fix #2: interim_results true + vad_events true + endpointing más bajo
========================================================= */
function createDGClientWS({ sampleRate = 16000 }) {
  const endpointing = String(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 600); // ✅ antes 1200
  const model = process.env.DG_MODEL || "nova-2";

  const qs = new URLSearchParams({
    model,
    language: "es",
    punctuate: "true",
    interim_results: "true", // ✅ FIX #2
    vad_events: "true", // ✅ FIX #2
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",
    endpointing,
  });

  const url = `wss://api.deepgram.com/v1/listen?${qs.toString()}`;
  const headers = { Authorization: `Token ${DG_KEY}` };

  return new WebSocket(url, { headers });
}

/* =========================================================
   ✅ Rooms in-memory (NO BD)
========================================================= */
const ROOMS = new Map();
const ROOM_TTL_MS = Number(process.env.REAL_DUAL_ROOM_TTL_MS || 20 * 60 * 1000); // 20 min

function randomId(len = 16) {
  return crypto.randomBytes(len).toString("hex");
}

function nowMs() {
  return Date.now();
}

function touchRoom(room) {
  if (room) room.lastSeenAt = nowMs();
}

function cleanupPeer(peer) {
  try {
    peer?.dg?.close();
  } catch {}
  try {
    if (peer?.ff?.stdin) peer.ff.stdin.end();
  } catch {}
  try {
    peer?.ff?.kill("SIGKILL");
  } catch {}

  if (peer) {
    peer.dg = null;
    peer.ff = null;
    peer.dgReady = false;
    peer.pcmBuffer = [];
    peer.mimeType = peer.mimeType || "";
    peer.sampleRate = peer.sampleRate || 16000;

    // ✅ FIX #1: buffer de finals
    peer.finalBuf = "";
  }
}

function closePeerWs(peer) {
  try {
    safeClose(peer?.ws);
  } catch {}
}

function deleteRoom(roomId) {
  const room = ROOMS.get(roomId);
  if (!room) return;

  cleanupPeer(room.host);
  cleanupPeer(room.patient);

  closePeerWs(room.host);
  closePeerWs(room.patient);

  ROOMS.delete(roomId);
  log("Room deleted:", roomId);
}

function gcRooms() {
  const t = nowMs();
  for (const [roomId, room] of ROOMS.entries()) {
    if (!room) continue;
    if (t - (room.lastSeenAt || room.createdAt || t) > ROOM_TTL_MS) {
      log("GC room timeout:", roomId);
      deleteRoom(roomId);
    }
  }
}
setInterval(gcRooms, 30_000).unref?.();

/* =========================================================
   ✅ Heartbeat WS (ping/pong)
========================================================= */
function attachHeartbeat(ws, label = "ws") {
  if (!ws) return () => {};
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  const intervalMs = Number(process.env.REAL_DUAL_HEARTBEAT_MS || 15000);
  const timer = setInterval(() => {
    try {
      if (!ws || ws.readyState !== 1) return;
      if (ws.isAlive === false) {
        log(`🫀 heartbeat dead -> closing (${label})`);
        safeClose(ws, 4000, "heartbeat_timeout");
        return;
      }
      ws.isAlive = false;
      ws.ping();
    } catch {}
  }, intervalMs);

  timer.unref?.();
  return () => {
    try {
      clearInterval(timer);
    } catch {}
  };
}

/* =========================================================
   ✅ Turn emit
========================================================= */
function broadcastTurn(room, turn) {
  if (!room) return;
  if (room.host?.ws) safeSend(room.host.ws, turn);
  if (room.patient?.ws) safeSend(room.patient.ws, turn);
}

/* =========================================================
   ✅ Host notifications for patient status
========================================================= */
function notifyPatientStatus(room, connected, extra = {}) {
  if (!room) return;
  room.patientConnected = Boolean(connected);

  if (room.host?.ws) {
    safeSend(room.host.ws, {
      type: "patient_status",
      roomId: room.roomId,
      connected: Boolean(connected),
      ...extra,
    });
  }
}

/* =========================================================
   ✅ DG handlers
   Fix #1: acumular finals aunque speech_final sea false
   Fix (nuevo): mandar partial a host cuando is_final=false
========================================================= */
function attachDGHandlers({ room, peerRole, peer }) {
  let lastFinalAt = 0;
  const MIN_GAP_FINAL_MS = Number(process.env.REAL_DUAL_MIN_GAP_FINAL_MS || 150); // ✅ más suave que 350

  // ✅ FIX #1: buffer por peer
  peer.finalBuf = peer.finalBuf || "";

  peer.dg.on("open", () => {
    peer.dgReady = true;
    log("Deepgram OPEN ✅", { roomId: room.roomId, peerRole });

    if (peer.pcmBuffer?.length) {
      try {
        for (const chunk of peer.pcmBuffer) peer.dg.send(chunk);
      } catch {}
      peer.pcmBuffer = [];
    }

    safeSend(peer.ws, {
      type: "channel_ready",
      roomId: room.roomId,
      role: peerRole,
    });
  });

  peer.dg.on("close", (code, reason) => {
    log("Deepgram CLOSE", {
      roomId: room.roomId,
      peerRole,
      code,
      reason: String(reason || ""),
    });
  });

  peer.dg.on("unexpected-response", (_req, res) => {
    let body = "";
    try {
      res.on("data", (c) => (body += c.toString("utf8")));
      res.on("end", () => {
        log("DG unexpected-response ❌", {
          roomId: room.roomId,
          peerRole,
          status: res.statusCode,
          body: String(body || "").slice(0, 300),
        });
        safeSend(peer.ws, {
          type: "error",
          message: `Deepgram handshake failed (${res.statusCode})`,
        });
        safeClose(peer.ws, 1011, "dg_handshake_failed");
      });
    } catch {
      safeSend(peer.ws, { type: "error", message: "Deepgram handshake failed" });
      safeClose(peer.ws, 1011, "dg_handshake_failed");
    }
  });

  peer.dg.on("error", (e) => {
    log("Deepgram ERROR ❌", {
      roomId: room.roomId,
      peerRole,
      message: e?.message || String(e),
    });
    safeSend(peer.ws, {
      type: "error",
      message: `Deepgram WS error: ${e?.message || ""}`,
    });
    safeClose(peer.ws, 1011, "dg_ws_error");
  });

  // ✅ REEMPLAZO COMPLETO (partial + finalBuf + turn)
  peer.dg.on("message", (data) => {
    try {
      touchRoom(room);

      const payload = JSON.parse(data.toString("utf8"));
      const alt = payload?.channel?.alternatives?.[0];
      const transcript = String(alt?.transcript || "").trim();

      const isFinal = Boolean(payload?.is_final);
      const speechFinal = Boolean(payload?.speech_final);

      if (!transcript) return;

      /* =========================================================
         ✅ 1) PARTIAL (interim) -> SOLO AL HOST (NO persistir)
      ========================================================= */
      if (!isFinal) {
        if (room.host?.ws) {
          safeSend(room.host.ws, {
            type: "partial",
            roomId: room.roomId,
            speaker: peerRole,
            text: transcript,
            ts: new Date().toISOString(),
          });
        }
        return;
      }

      /* =========================================================
         ✅ 2) FINAL (acumulado)
      ========================================================= */
      peer.finalBuf = (peer.finalBuf ? peer.finalBuf + " " : "") + transcript;

      // solo emitimos turno cuando Deepgram marca fin de habla
      if (speechFinal) {
        const out = String(peer.finalBuf || "").trim();
        peer.finalBuf = "";

        if (!out) return;

        const t = Date.now();
        if (t - lastFinalAt < MIN_GAP_FINAL_MS) return;
        lastFinalAt = t;

        broadcastTurn(room, {
          type: "turn",
          roomId: room.roomId,
          speaker: peerRole,
          text: out,
          ts: new Date().toISOString(),
        });
      }
    } catch (e) {
      log("DG message parse error", {
        roomId: room.roomId,
        peerRole,
        err: e?.message || String(e),
      });
    }
  });
}

/* =========================================================
   ✅ Audio pipeline per peer
========================================================= */
function setupAudioPipeline({ room, peer }) {
  const mimeType = peer.mimeType;
  const sampleRate = Number(peer.sampleRate || 16000);

  if (isMimePCM(mimeType)) return;

  const inFmt = selectInputFormat(mimeType);

  peer.ff = ffmpeg()
    .input("pipe:0")
    .inputOptions([`-f ${inFmt}`, "-vn"])
    .audioCodec("pcm_s16le")
    .audioChannels(1)
    .audioFrequency(sampleRate)
    .format("s16le")
    .on("start", (cmd) => log("ffmpeg START:", { roomId: room.roomId, cmd }))
    .on("error", (err) => {
      log("ffmpeg ERROR ❌", { roomId: room.roomId, err: err?.message || String(err) });
      safeSend(peer.ws, { type: "error", message: `ffmpeg error: ${err?.message || ""}` });
      try {
        peer.dg?.close();
      } catch {}
      safeClose(peer.ws, 1011, "ffmpeg_error");
    })
    .on("end", () => {
      try {
        peer.dg?.close();
      } catch {}
    });

  const ffOut = peer.ff.pipe();

  ffOut.on("data", (chunk) => {
    touchRoom(room);

    if (!peer.dgReady) {
      peer.pcmBuffer.push(Buffer.from(chunk));
      return;
    }
    try {
      peer.dg.send(chunk);
    } catch {}
  });

  ffOut.on("end", () => {
    try {
      peer.dg?.close();
    } catch {}
  });
}

/* =========================================================
   ✅ WS Factory
========================================================= */
function createRealDualWSS() {
  const hostWSS = new WebSocketServer({ noServer: true });
  const patientWSS = new WebSocketServer({ noServer: true });

  // ----------------------------
  // HOST (estudiante)
  // ----------------------------
  hostWSS.on("connection", (ws) => {
    log("Host connected");
    const stopHeartbeat = attachHeartbeat(ws, "host");

    let hello = null;
    let room = null;

    const peer = {
      ws,
      dg: null,
      dgReady: false,
      ff: null,
      pcmBuffer: [],
      mimeType: "",
      sampleRate: 16000,
      finalBuf: "", // ✅ FIX #1
    };

    function cleanupAll() {
      try {
        stopHeartbeat?.();
      } catch {}
      try {
        if (room?.roomId) deleteRoom(room.roomId);
      } catch {}
    }

    ws.on("close", () => {
      log("Host WS closed", { roomId: room?.roomId || null });
      cleanupAll();
    });

    ws.on("error", (e) => {
      log("Host WS error", { message: e?.message || String(e) });
      cleanupAll();
    });

    ws.on("message", async (message, isBinary) => {
      try {
        // 1) hello
        if (!hello) {
          if (isBinary) return;

          const parsed = JSON.parse(message.toString("utf8"));
          if (parsed?.type !== "hello") {
            safeSend(ws, { type: "error", message: 'Primer mensaje debe ser type="hello"' });
            safeClose(ws, 1008, "bad_hello");
            return;
          }

          hello = parsed;

          if (!DG_KEY) {
            safeSend(ws, { type: "error", message: "DEEPGRAM_API_KEY no configurada" });
            safeClose(ws, 1011, "dg_key_missing");
            return;
          }

          const userId = verifyWsToken(hello.token);
          if (!userId) {
            safeSend(ws, { type: "error", message: "Token inválido o ausente (hello.token)" });
            safeClose(ws, 1008, "invalid_token");
            return;
          }

          const roomId = randomId(10);
          const joinToken = randomId(10);

          room = {
            roomId,
            joinToken,
            createdAt: nowMs(),
            lastSeenAt: nowMs(),
            patientConnected: false,
            host: peer,
            patient: {
              ws: null,
              dg: null,
              dgReady: false,
              ff: null,
              pcmBuffer: [],
              mimeType: "",
              sampleRate: 16000,
              finalBuf: "", // ✅ FIX #1
            },
          };

          ROOMS.set(roomId, room);

          peer.mimeType = String(hello.mimeType || hello.mime || "audio/pcm;format=s16le");
          peer.sampleRate = Number(hello.sampleRate || 16000);

          peer.dg = createDGClientWS({ sampleRate: peer.sampleRate });
          attachDGHandlers({ room, peerRole: "estudiante", peer });
          setupAudioPipeline({ room, peer });

          safeSend(ws, {
            type: "ready",
            role: "host",
            roomId,
            joinToken,
            endpointingMs: Number(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 600),
          });

          notifyPatientStatus(room, false, { reason: "waiting" });
          return;
        }

        // 2) control json
        if (!isBinary) {
          const evt = JSON.parse(message.toString("utf8"));

          if (evt?.type === "ping") {
            safeSend(ws, { type: "pong", ts: Date.now() });
            return;
          }

          if (evt?.type === "done") {
            safeClose(ws, 1000, "done");
          }
          return;
        }

        // 3) audio binary
        if (!room) return;
        touchRoom(room);

        if (isMimePCM(peer.mimeType)) {
          if (!peer.dgReady) {
            peer.pcmBuffer.push(Buffer.from(message));
            return;
          }
          try {
            peer.dg.send(message);
          } catch {}
          return;
        }

        if (peer.ff && peer.ff.stdin?.writable) {
          peer.ff.stdin.write(Buffer.from(message));
        }
      } catch (_e) {
        safeSend(ws, { type: "error", message: "Mensaje inválido" });
      }
    });
  });

  // ----------------------------
  // PATIENT (celular)
  // ----------------------------
  patientWSS.on("connection", (ws) => {
    log("Patient connected");
    const stopHeartbeat = attachHeartbeat(ws, "patient");

    let hello = null;
    let room = null;

    const peer = {
      ws,
      dg: null,
      dgReady: false,
      ff: null,
      pcmBuffer: [],
      mimeType: "",
      sampleRate: 16000,
      finalBuf: "", // ✅ FIX #1
    };

    function cleanupSelf(reason = "closed") {
      try {
        stopHeartbeat?.();
      } catch {}

      try {
        if (room?.patient) cleanupPeer(room.patient);

        if (room) {
          room.patient.ws = null;
          room.patient.dg = null;
          room.patient.ff = null;
          room.patient.dgReady = false;
          room.patient.pcmBuffer = [];
          room.patient.mimeType = room.patient.mimeType || "";
          room.patient.sampleRate = room.patient.sampleRate || 16000;
          room.patient.finalBuf = "";

          notifyPatientStatus(room, false, { reason });
        }
      } catch {}
    }

    ws.on("close", () => {
      log("Patient WS closed", { roomId: room?.roomId || null });
      cleanupSelf("ws_close");
    });

    ws.on("error", (e) => {
      log("Patient WS error", { message: e?.message || String(e) });
      cleanupSelf("ws_error");
    });

    ws.on("message", async (message, isBinary) => {
      try {
        // 1) hello_patient
        if (!hello) {
          if (isBinary) return;

          const parsed = JSON.parse(message.toString("utf8"));
          if (parsed?.type !== "hello_patient") {
            safeSend(ws, { type: "error", message: 'Primer mensaje debe ser type="hello_patient"' });
            safeClose(ws, 1008, "bad_hello_patient");
            return;
          }

          hello = parsed;

          const roomId = String(hello.roomId || "").trim();
          const joinToken = String(hello.joinToken || "").trim();

          if (!roomId || !joinToken) {
            safeSend(ws, { type: "error", message: "Faltan roomId o joinToken" });
            safeClose(ws, 1008, "missing_room_or_token");
            return;
          }

          room = ROOMS.get(roomId);

          if (!room) {
            safeSend(ws, { type: "error", message: "Room no existe o expiró" });
            safeClose(ws, 1008, "room_not_found");
            return;
          }

          if (joinToken !== room.joinToken) {
            safeSend(ws, { type: "error", message: "joinToken inválido" });
            safeClose(ws, 1008, "invalid_join_token");
            return;
          }

          if (!DG_KEY) {
            safeSend(ws, { type: "error", message: "DEEPGRAM_API_KEY no configurada" });
            safeClose(ws, 1011, "dg_key_missing");
            return;
          }

          try {
            if (room.patient?.ws && room.patient.ws !== ws) {
              safeClose(room.patient.ws, 4001, "replaced_by_new_patient");
              cleanupPeer(room.patient);
            }
          } catch {}

          room.patient.ws = ws;
          room.patient.dg = null;
          room.patient.ff = null;
          room.patient.dgReady = false;
          room.patient.pcmBuffer = [];
          room.patient.finalBuf = "";

          peer.mimeType = String(hello.mimeType || hello.mime || "audio/pcm;format=s16le");
          peer.sampleRate = Number(hello.sampleRate || 16000);

          Object.assign(room.patient, peer);

          touchRoom(room);

          room.patient.dg = createDGClientWS({ sampleRate: room.patient.sampleRate });
          attachDGHandlers({ room, peerRole: "paciente", peer: room.patient });
          setupAudioPipeline({ room, peer: room.patient });

          safeSend(ws, {
            type: "ready",
            role: "patient",
            roomId,
            endpointingMs: Number(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 600),
          });

          notifyPatientStatus(room, true, { reason: "joined" });
          if (room.host?.ws) safeSend(room.host.ws, { type: "patient_joined", roomId });

          return;
        }

        // 2) control json
        if (!isBinary) {
          const evt = JSON.parse(message.toString("utf8"));

          if (evt?.type === "ping") {
            safeSend(ws, { type: "pong", ts: Date.now() });
            return;
          }

          if (evt?.type === "disconnect") {
            try {
              notifyPatientStatus(room, false, { reason: "patient_button" });
            } catch {}
            safeClose(ws, 1000, "patient_disconnect");
            return;
          }

          if (evt?.type === "done") {
            safeClose(ws, 1000, "done");
          }
          return;
        }

        // 3) audio binary
        if (!room?.patient) return;
        touchRoom(room);

        const p = room.patient;

        if (isMimePCM(p.mimeType)) {
          if (!p.dgReady) {
            p.pcmBuffer.push(Buffer.from(message));
            return;
          }
          try {
            p.dg.send(message);
          } catch {}
          return;
        }

        if (p.ff && p.ff.stdin?.writable) {
          p.ff.stdin.write(Buffer.from(message));
        }
      } catch (_e) {
        safeSend(ws, { type: "error", message: "Mensaje inválido" });
      }
    });
  });

  console.log("✅ WS Real Dual listo (noServer). Enrútalo a /ws/real-dual/host y /ws/real-dual/patient");
  return { hostWSS, patientWSS };
}

module.exports = { createRealDualWSS };