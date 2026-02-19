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
    ws.send(JSON.stringify(obj));
  } catch {}
}

function log(...a) {
  console.log("🎛️ [REAL-DUAL]", ...a);
}

/* =========================================================
   ✅ Auth Host (JWT normal)
   ========================================================= */
function verifyWsToken(token) {
  const raw = String(token || "").trim();
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
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4") || m.includes("mpeg")) return "mp4";
  return "webm";
}

function isMimePCM(mime) {
  return String(mime || "").toLowerCase().includes("audio/pcm");
}

/* =========================================================
   ✅ Deepgram WS factory
   (real-dual: cada canal tiene su DG ws independiente)
   ========================================================= */
function createDGClientWS({ sampleRate = 16000 }) {
  const endpointing = String(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 1200);
  const model = process.env.DG_MODEL || "nova-2";

  const qs = new URLSearchParams({
    model,
    language: "es",
    punctuate: "true",
    interim_results: "false",
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",
    endpointing, // tolera micro-pausas
  });

  const url = `wss://api.deepgram.com/v1/listen?${qs.toString()}`;
  const headers = { Authorization: `Token ${DG_KEY}` };

  return new WebSocket(url, { headers });
}

/* =========================================================
   ✅ Rooms in-memory (NO BD)
   - host crea roomId + joinToken
   - patient entra con roomId + joinToken
   - TTL para limpiar rooms colgados
   ========================================================= */
const ROOMS = new Map();
// room shape:
// {
//   roomId, joinToken,
//   createdAt, lastSeenAt,
//   host: { ws, dg, dgReady, ff, pcmBuffer, mimeType, sampleRate },
//   patient: { ws, dg, dgReady, ff, pcmBuffer, mimeType, sampleRate },
// }

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
    if (peer?.ff) peer.ff.kill("SIGKILL");
  } catch {}

  if (peer) {
    peer.dg = null;
    peer.ff = null;
    peer.dgReady = false;
    peer.pcmBuffer = [];
  }
}

function closePeerWs(peer) {
  try {
    peer?.ws?.close();
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
// GC cada 30s
setInterval(gcRooms, 30_000).unref?.();

/* =========================================================
   ✅ Turn emit (mismo “formato” que FE ya entiende)
   ========================================================= */
function broadcastTurn(room, turn) {
  // turn = {type:"turn", speaker, text, ts, roomId}
  if (!room) return;
  if (room.host?.ws) safeSend(room.host.ws, turn);
  if (room.patient?.ws) safeSend(room.patient.ws, turn);
}

/* =========================================================
   ✅ Hook Deepgram transcript -> turn
   - Solo disparamos cuando is_final && speech_final
   ========================================================= */
function attachDGHandlers({ room, peerRole, peer }) {
  // peerRole: "estudiante" | "paciente"
  // peer: { ws, dg, ... }

  let lastFinalAt = 0;
  const MIN_GAP_FINAL_MS = Number(process.env.REAL_DUAL_MIN_GAP_FINAL_MS || 350);

  peer.dg.on("open", () => {
    peer.dgReady = true;
    log("Deepgram OPEN ✅", { roomId: room.roomId, peerRole });

    // flush buffer
    if (peer.pcmBuffer?.length) {
      try {
        for (const chunk of peer.pcmBuffer) peer.dg.send(chunk);
      } catch {}
      peer.pcmBuffer = [];
    }

    // notify ready channel
    safeSend(peer.ws, {
      type: "channel_ready",
      roomId: room.roomId,
      role: peerRole,
    });
  });

  peer.dg.on("close", (code, reason) => {
    log("Deepgram CLOSE", { roomId: room.roomId, peerRole, code, reason: String(reason || "") });
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
        try {
          peer.ws.close();
        } catch {}
      });
    } catch {
      safeSend(peer.ws, { type: "error", message: "Deepgram handshake failed" });
      try {
        peer.ws.close();
      } catch {}
    }
  });

  peer.dg.on("error", (e) => {
    log("Deepgram ERROR ❌", { roomId: room.roomId, peerRole, message: e?.message || String(e) });
    safeSend(peer.ws, {
      type: "error",
      message: `Deepgram WS error: ${e?.message || ""}`,
    });
    try {
      peer.ws.close();
    } catch {}
  });

  peer.dg.on("message", (data) => {
    try {
      touchRoom(room);

      const payload = JSON.parse(data.toString("utf8"));
      const alt = payload?.channel?.alternatives?.[0];
      const transcript = String(alt?.transcript || "").trim();

      const isFinal = Boolean(payload?.is_final);
      const speechFinal = Boolean(payload?.speech_final);

      if (!isFinal || !transcript) return;
      if (!speechFinal) return;

      const t = Date.now();
      if (t - lastFinalAt < MIN_GAP_FINAL_MS) return;
      lastFinalAt = t;

      broadcastTurn(room, {
        type: "turn",
        roomId: room.roomId,
        speaker: peerRole, // ✅ aquí está la magia: NO diarización
        text: transcript,
        ts: new Date().toISOString(),
      });
    } catch (e) {
      log("DG message parse error", { roomId: room.roomId, peerRole, err: e?.message || String(e) });
    }
  });
}

/* =========================================================
   ✅ Audio pipeline per peer:
   - si input es PCM -> forward directo a DG
   - si no -> ffmpeg -> PCM -> DG
   ========================================================= */
function setupAudioPipeline({ room, peer }) {
  const mimeType = peer.mimeType;
  const sampleRate = Number(peer.sampleRate || 16000);

  // PCM directo
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
      safeSend(peer.ws, { type: "error", message: `ffmpeg error: ${err?.message || ""}` });
      try {
        peer.dg?.close();
      } catch {}
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
   /ws/real-dual/host
   /ws/real-dual/patient
   ========================================================= */
function createRealDualWSS() {
  const hostWSS = new WebSocketServer({ noServer: true });
  const patientWSS = new WebSocketServer({ noServer: true });

  // ----------------------------
  // HOST (estudiante)
  // ----------------------------
  hostWSS.on("connection", (ws) => {
    log("Host connected");

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
    };

    function cleanupAll() {
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
            try { ws.close(); } catch {}
            return;
          }

          hello = parsed;

          if (!DG_KEY) {
            safeSend(ws, { type: "error", message: "DEEPGRAM_API_KEY no configurada" });
            try { ws.close(); } catch {}
            return;
          }

          // JWT host
          const userId = verifyWsToken(hello.token);
          if (!userId) {
            safeSend(ws, { type: "error", message: "Token inválido o ausente (hello.token)" });
            try { ws.close(); } catch {}
            return;
          }

          // crear room
          const roomId = String(hello.roomId || "").trim() || randomId(10);
          const joinToken = randomId(10);

          room = {
            roomId,
            joinToken,
            createdAt: nowMs(),
            lastSeenAt: nowMs(),
            host: peer,
            patient: {
              ws: null,
              dg: null,
              dgReady: false,
              ff: null,
              pcmBuffer: [],
              mimeType: "",
              sampleRate: 16000,
            },
          };

          ROOMS.set(roomId, room);

          peer.mimeType = String(hello.mimeType || hello.mime || "audio/pcm;format=s16le");
          peer.sampleRate = Number(hello.sampleRate || 16000);

          // crear DG ws para host
          peer.dg = createDGClientWS({ sampleRate: peer.sampleRate });
          attachDGHandlers({ room, peerRole: "estudiante", peer });
          setupAudioPipeline({ room, peer });

          // responder con join info (para QR)
          // FE puede construir URL: `${APP_URL}/join/${roomId}?t=${joinToken}` o similar
          safeSend(ws, {
            type: "ready",
            role: "host",
            roomId,
            joinToken, // 👈 el FE lo convierte en URL/QR
            endpointingMs: Number(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 1200),
          });

          return;
        }

        // 2) control json
        if (!isBinary) {
          const evt = JSON.parse(message.toString("utf8"));
          if (evt?.type === "done") {
            try { ws.close(); } catch {}
          }
          return;
        }

        // 3) audio binary
        if (!room) return;
        touchRoom(room);

        // si PCM -> manda directo a DG
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

        // si NO PCM -> pipe a ffmpeg
        if (peer.ff && peer.ff.stdin?.writable) {
          peer.ff.stdin.write(Buffer.from(message));
        }
      } catch (e) {
        safeSend(ws, { type: "error", message: "Mensaje inválido" });
      }
    });
  });

  // ----------------------------
  // PATIENT (celular)
  // ----------------------------
  patientWSS.on("connection", (ws) => {
    log("Patient connected");

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
    };

    function cleanupSelf() {
      // NO borramos el room completo si host sigue vivo
      try {
        if (room?.patient) cleanupPeer(room.patient);
        if (room?.patient?.ws) {
          try { room.patient.ws.close(); } catch {}
        }
        if (room) {
          room.patient.ws = null;
          room.patient.dg = null;
          room.patient.ff = null;
          room.patient.dgReady = false;
          room.patient.pcmBuffer = [];
        }
      } catch {}
    }

    ws.on("close", () => {
      log("Patient WS closed", { roomId: room?.roomId || null });
      cleanupSelf();
    });

    ws.on("error", (e) => {
      log("Patient WS error", { message: e?.message || String(e) });
      cleanupSelf();
    });

    ws.on("message", async (message, isBinary) => {
      try {
        // 1) hello_patient
        if (!hello) {
          if (isBinary) return;

          const parsed = JSON.parse(message.toString("utf8"));
          if (parsed?.type !== "hello_patient") {
            safeSend(ws, { type: "error", message: 'Primer mensaje debe ser type="hello_patient"' });
            try { ws.close(); } catch {}
            return;
          }

          hello = parsed;

          const roomId = String(hello.roomId || "").trim();
          const joinToken = String(hello.joinToken || "").trim();

          if (!roomId || !joinToken) {
            safeSend(ws, { type: "error", message: "Faltan roomId o joinToken" });
            try { ws.close(); } catch {}
            return;
          }

          room = ROOMS.get(roomId);

          if (!room) {
            safeSend(ws, { type: "error", message: "Room no existe o expiró" });
            try { ws.close(); } catch {}
            return;
          }

          if (joinToken !== room.joinToken) {
            safeSend(ws, { type: "error", message: "joinToken inválido" });
            try { ws.close(); } catch {}
            return;
          }

          if (!DG_KEY) {
            safeSend(ws, { type: "error", message: "DEEPGRAM_API_KEY no configurada" });
            try { ws.close(); } catch {}
            return;
          }

          // asignar peer patient al room
          room.patient.ws = ws;
          room.patient.dg = null;
          room.patient.ff = null;
          room.patient.dgReady = false;
          room.patient.pcmBuffer = [];

          // copiar settings
          peer.mimeType = String(hello.mimeType || hello.mime || "audio/pcm;format=s16le");
          peer.sampleRate = Number(hello.sampleRate || 16000);

          // transfer a room.patient real
          Object.assign(room.patient, peer);

          touchRoom(room);

          // crear DG ws patient
          room.patient.dg = createDGClientWS({ sampleRate: room.patient.sampleRate });
          attachDGHandlers({ room, peerRole: "paciente", peer: room.patient });
          setupAudioPipeline({ room, peer: room.patient });

          // ready patient
          safeSend(ws, {
            type: "ready",
            role: "patient",
            roomId,
            endpointingMs: Number(process.env.REAL_DUAL_DG_ENDPOINTING_MS || 1200),
          });

          // avisar host que patient ya entró
          if (room.host?.ws) {
            safeSend(room.host.ws, { type: "patient_joined", roomId });
          }

          return;
        }

        // 2) control json
        if (!isBinary) {
          const evt = JSON.parse(message.toString("utf8"));
          if (evt?.type === "done") {
            try { ws.close(); } catch {}
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
      } catch (e) {
        safeSend(ws, { type: "error", message: "Mensaje inválido" });
      }
    });
  });

  console.log("✅ WS Real Dual listo (noServer). Enrútalo a /ws/real-dual/host y /ws/real-dual/patient");
  return { hostWSS, patientWSS };
}

module.exports = { createRealDualWSS };