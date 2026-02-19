// server/controllers/simFlow.js
const { WebSocketServer, WebSocket } = require("ws");
const ffmpeg = require("fluent-ffmpeg");
const OpenAI = require("openai");
const jwt = require("jsonwebtoken");

const resolveFfmpegPath = require("../utils/resolveFfmpegPath");
const { ttsSynthesizeBase64 } = require("../utils/ttsElevenLabs");

const EjercicioInstancia = require("../models/ejercicioInstancia");
const { EjercicioRolePlay } = require("../models/modulo");

ffmpeg.setFfmpegPath(resolveFfmpegPath());

const DG_KEY = (process.env.DEEPGRAM_API_KEY || "").trim();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch {}
}

function log(...a) {
  console.log("🤖 [SIM]", ...a);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* =========================================================
   ✅ TTS helpers (FIX de audio)
   ========================================================= */
function extractB64FromTtsResult(raw) {
  if (!raw) return "";

  if (typeof raw === "string") {
    return raw.trim().replace(/^data:audio\/[^;]+;base64,/i, "");
  }

  if (Buffer.isBuffer(raw)) {
    return raw.toString("base64");
  }

  if (typeof raw === "object") {
    const candidate =
      raw.base64 ||
      raw.audio_b64 ||
      raw.audioBase64 ||
      raw.data ||
      raw.audio ||
      "";

    if (Buffer.isBuffer(candidate)) return candidate.toString("base64");
    if (typeof candidate === "string") {
      return candidate.trim().replace(/^data:audio\/[^;]+;base64,/i, "");
    }
  }

  return "";
}

function looksLikeMp3Base64(b64) {
  const s = String(b64 || "").trim();
  if (!s) return false;
  return s.startsWith("SUQz") || s.startsWith("//uQ") || s.length > 2000;
}

/* =========================================================
   ✅ Auth WS (hello.token)
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
   ✅ Límites por tipoRole
   ========================================================= */
function getRoleplayLimitSeconds(tipoRole) {
  return String(tipoRole || "").toLowerCase() === "simulada"
    ? 15 * 60
    : 60 * 60;
}

/* =========================================================
   ✅ Normalización robusta para keys de env
   ========================================================= */
function normalizeProblemaKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toEnvKeyFromProblema(value) {
  const key = normalizeProblemaKey(value);
  if (!key) return "";
  return `ELEVEN_VOICE_TRANSTORNO_${key}`;
}

/* =========================================================
   ✅ Voice dinámica por agente (trastorno/problema)
   ========================================================= */
function resolveElevenVoiceIdFromProblema(problema) {
  const envKey = toEnvKeyFromProblema(problema);
  const voiceId = envKey ? process.env[envKey] : "";

  return (
    String(voiceId || "").trim() ||
    String(process.env.ELEVEN_VOICE_DEFAULT || "").trim() ||
    String(process.env.ELEVEN_VOICE_ID || "").trim() ||
    ""
  );
}

/* =========================================================
   ✅ Prompt
   ========================================================= */
function buildPrompt(ctx, therapistText) {
  const { edad, genero, problema } = ctx || {};
  return `Contexto del paciente simulado:
- Edad: ${edad ?? "N/D"}
- Género: ${genero ?? "N/D"}
- Motivo principal: ${problema ?? "N/D"}

Terapeuta dijo: "${therapistText}"

Responde como el paciente, en una o dos frases, tono natural y breve, en español.`;
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

/**
 * ✅ Deepgram WS para STT (simulación)
 */
function createDGClientWS({ sampleRate = 16000 }) {
  const qs = new URLSearchParams({
    model: process.env.DG_MODEL || "nova-2",
    language: "es",
    punctuate: "true",
    interim_results: "false",
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",

    // ✅ endpointing controla cuándo corta el turno
    endpointing: String(process.env.SIM_DG_ENDPOINTING_MS || 1200),
  });

  const url = `wss://api.deepgram.com/v1/listen?${qs.toString()}`;

  const key = String(DG_KEY || "").trim();
  const headers = { Authorization: `Token ${key}` };

  return new WebSocket(url, { headers });
}

/* =========================================================
   ✅ Persistencia turn-by-turn
   respuestas.rolePlaying.transcripcion.turns[]
   ========================================================= */
async function appendTurn({ ejercicioInstanciaId, speaker, text }) {
  const id = String(ejercicioInstanciaId || "").trim();
  const clean = String(text || "").trim();
  if (!id || !clean) return;

  const ts = new Date();

  await EjercicioInstancia.updateOne(
    { _id: id },
    {
      $push: {
        "respuestas.rolePlaying.transcripcion.turns": {
          ts,
          speaker,
          text: clean,
        },
      },
      $set: {
        "respuestas.rolePlaying.transcripcion.updatedAt": ts,
      },
    }
  );
}

/* =========================================================
   ✅ OpenAI helper (respuesta paciente)
   ========================================================= */
async function generatePatientReply({ ctx, therapistText }) {
  const prompt = buildPrompt(ctx, therapistText);
  const model = process.env.SIM_OPENAI_MODEL || "gpt-4o-mini";

  const res = await openai.chat.completions.create({
    model,
    temperature: Number(process.env.SIM_OPENAI_TEMP || 0.7),
    messages: [
      { role: "system", content: "Eres un paciente simulado en psicoterapia." },
      { role: "user", content: prompt },
    ],
  });

  const text =
    res?.choices?.[0]?.message?.content
      ? String(res.choices[0].message.content).trim()
      : "";

  return text;
}

/* =========================================================
   ✅ WS factory
   ========================================================= */
function createSimWSS() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    log("Cliente conectado a /ws/sim");

    let hello = null;

    let dg = null;
    let ff = null;
    let dgReady = false;
    let pcmBuffer = [];

    let userId = null;
    let instanciaId = null;
    let ejercicioId = null;

    let tipoRole = "simulada";
    let problema = "";
    let limitSec = 15 * 60;
    let startMs = Date.now();

    let voiceIdResolved = "";

    // half-duplex
    let speaking = false;
    let droppedAudioChunks = 0;

    const cooldownMs = Number(process.env.SIM_TTS_COOLDOWN_MS || 350);

    // ✅ IMPORTANT: por defecto NO exigir speech_final (porque a veces no viene)
    const REQUIRE_SPEECH_FINAL =
      String(process.env.SIM_REQUIRE_SPEECH_FINAL || "false").toLowerCase() ===
      "true";

    // debug
    let __binFrames = 0;
    let __binLast = Date.now();

    // anti-spam
    let lastTherapistFinalAt = 0;
    const MIN_GAP_FINAL_MS = Number(process.env.SIM_MIN_GAP_FINAL_MS || 450);

    // debounce final extra (opcional)
    let pendingFinalTimer = null;
    let pendingFinalText = "";
    const FINAL_DEBOUNCE_MS = Number(process.env.SIM_FINAL_DEBOUNCE_MS || 0);

    function cleanup() {
      try {
        if (pendingFinalTimer) clearTimeout(pendingFinalTimer);
      } catch {}
      pendingFinalTimer = null;
      pendingFinalText = "";

      try {
        if (ff?.stdin) ff.stdin.end();
      } catch {}
      try {
        if (ff) ff.kill("SIGKILL");
      } catch {}
      try {
        dg?.close();
      } catch {}

      dg = null;
      ff = null;
      dgReady = false;
      pcmBuffer = [];
      hello = null;

      speaking = false;
      droppedAudioChunks = 0;

      log("/ws/sim cerrado");
    }

    ws.on("close", (code, reason) => {
      log("WS close event", { code, reason: reason?.toString?.() || "" });
      cleanup();
    });

    ws.on("error", (err) => {
      log("WS error event", { message: err?.message || String(err) });
      cleanup();
    });

    function checkTimeUp() {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      if (elapsed >= limitSec) {
        safeSend(ws, { type: "time_up", limitSec });
        cleanup();
        try {
          ws.close();
        } catch {}
        return true;
      }
      return false;
    }

    function beginSpeaking(meta = {}) {
      speaking = true;
      safeSend(ws, { type: "tts_start", ...meta });
    }

    async function endSpeaking(meta = {}) {
      safeSend(ws, { type: "tts_end", ...meta });
      await sleep(Math.max(0, cooldownMs));
      speaking = false;

      safeSend(ws, {
        type: "listening_resumed",
        cooldownMs,
        droppedAudioChunks,
      });

      droppedAudioChunks = 0;
    }

    async function handleTherapistFinal(transcript) {
      const clean = String(transcript || "").trim();
      if (!clean) return;
      if (checkTimeUp()) return;
      if (speaking) return;

      const now = Date.now();
      if (now - lastTherapistFinalAt < MIN_GAP_FINAL_MS) return;
      lastTherapistFinalAt = now;

      // turno terapeuta
      try {
        await appendTurn({
          ejercicioInstanciaId: instanciaId,
          speaker: "terapeuta",
          text: clean,
        });
      } catch {}

      safeSend(ws, {
        type: "turn",
        speaker: "terapeuta",
        text: clean,
        ts: new Date().toISOString(),
      });

      // respuesta paciente + TTS
      beginSpeaking({
        voiceId: voiceIdResolved,
        problema,
        problemaKey: normalizeProblemaKey(problema),
      });

      let reply = "";
      try {
        reply = await generatePatientReply({
          ctx: { problema },
          therapistText: clean,
        });
      } catch (e) {
        log("OpenAI error:", e?.message || String(e));
        reply = "No sé… creo que sí. No estoy seguro.";
      }

      reply = String(reply || "").trim();
      if (!reply) reply = "No sé…";

      try {
        await appendTurn({
          ejercicioInstanciaId: instanciaId,
          speaker: "paciente",
          text: reply,
        });
      } catch {}

      safeSend(ws, {
        type: "turn",
        speaker: "paciente",
        text: reply,
        ts: new Date().toISOString(),
      });

      try {
        const ttsRes = await ttsSynthesizeBase64({
          text: reply,
          voiceId: voiceIdResolved,
        });

        const audio_b64 = extractB64FromTtsResult(ttsRes);
        const mime =
          (ttsRes && typeof ttsRes === "object" && ttsRes.mime) || "audio/mpeg";

        if (!audio_b64) {
          log("TTS EMPTY (no base64)");
        } else if (!looksLikeMp3Base64(audio_b64)) {
          log("TTS INVALID base64 (len =", audio_b64.length, ")");
        } else {
          safeSend(ws, {
            type: "tts_audio",
            audio_b64,
            mime,
            voiceId: voiceIdResolved,
            ms: Date.now(),
          });
        }
      } catch (e) {
        log("TTS error:", e?.message || String(e));
      } finally {
        await endSpeaking();
      }
    }

    ws.on("message", async (message, isBinary) => {
      try {
        if (isBinary) {
          __binFrames++;
          const now = Date.now();
          if (now - __binLast > 1000) {
            log(
              "AUDIO IN frames/sec =",
              __binFrames,
              "| bytes =",
              message?.length || 0,
              "| speaking =",
              speaking
            );
            __binFrames = 0;
            __binLast = now;
          }
        }

        // 1) HELLO
        if (!hello) {
          if (isBinary) return;

          const parsed = JSON.parse(message.toString("utf8"));
          if (parsed?.type !== "hello") {
            return safeSend(ws, {
              type: "error",
              message: 'Primer mensaje debe ser type="hello"',
            });
          }

          hello = parsed;

          userId = verifyWsToken(hello.token);
          if (!userId) {
            safeSend(ws, {
              type: "error",
              message: "Token inválido o ausente (hello.token)",
            });
            try {
              ws.close();
            } catch {}
            return;
          }

          instanciaId = String(hello.ejercicioInstanciaId || "").trim();
          ejercicioId = String(hello.ejercicioId || "").trim();

          if (!instanciaId || !ejercicioId) {
            safeSend(ws, {
              type: "error",
              message: "Faltan ejercicioInstanciaId o ejercicioId en hello",
            });
            ws.close();
            return;
          }

          const inst = await EjercicioInstancia.findOne({
            _id: instanciaId,
            estudiante: userId,
          })
            .select("_id ejercicio")
            .lean();

          if (!inst?._id) {
            safeSend(ws, {
              type: "error",
              message: "Instancia no válida para este usuario",
            });
            ws.close();
            return;
          }

          if (String(inst.ejercicio) !== String(ejercicioId)) {
            safeSend(ws, {
              type: "error",
              message:
                "La instancia no corresponde a ese ejercicio (mismatch ejercicioId)",
            });
            ws.close();
            return;
          }

          const rp = await EjercicioRolePlay.findOne({ ejercicio: ejercicioId })
            .select("tipoRole trastorno")
            .lean();

          tipoRole = rp?.tipoRole || "simulada";

          if (String(tipoRole).toLowerCase() !== "simulada") {
            safeSend(ws, {
              type: "error",
              message: "Este ejercicio NO es simulación IA (tipoRole != simulada).",
            });
            ws.close();
            return;
          }

          problema = String(rp?.trastorno || hello.problema || "").trim();

          limitSec = getRoleplayLimitSeconds(tipoRole);
          startMs = Date.now();

          if (!DG_KEY) {
            safeSend(ws, {
              type: "error",
              message: "DEEPGRAM_API_KEY no configurada",
            });
            ws.close();
            return;
          }

          voiceIdResolved = resolveElevenVoiceIdFromProblema(problema);
          if (!voiceIdResolved) {
            safeSend(ws, {
              type: "error",
              message:
                "No hay voiceId. Define ELEVEN_VOICE_DEFAULT o ELEVEN_VOICE_TRANSTORNO_<X>.",
            });
            ws.close();
            return;
          }

          const sr = Number(hello.sampleRate) || 16000;
          log(
            "HELLO OK | sr =",
            sr,
            "| mime =",
            hello.mimeType,
            "| problema =",
            problema
          );

          dg = createDGClientWS({ sampleRate: sr });

          dg.on("unexpected-response", (req, res) => {
            let body = "";
            try {
              res.on("data", (chunk) => (body += chunk.toString("utf8")));
              res.on("end", () => {
                log("Deepgram UNEXPECTED RESPONSE ❌", {
                  statusCode: res.statusCode,
                  statusMessage: res.statusMessage,
                  body: String(body || "").slice(0, 600),
                  dgKeyPrefix: String(DG_KEY || "").slice(0, 6) + "***",
                });

                safeSend(ws, {
                  type: "error",
                  message: `Deepgram handshake ${res.statusCode}: ${String(
                    body || res.statusMessage || ""
                  ).slice(0, 220)}`,
                });

                try {
                  ws.close();
                } catch {}
              });
            } catch {
              safeSend(ws, {
                type: "error",
                message: "Deepgram handshake failed (unexpected-response)",
              });
              try {
                ws.close();
              } catch {}
            }
          });

          dg.on("open", () => {
            dgReady = true;
            log("Deepgram WS OPEN ✅ | sr =", sr);

            if (pcmBuffer.length) {
              try {
                for (const chunk of pcmBuffer) dg.send(chunk);
              } catch {}
              pcmBuffer = [];
            }
          });

          dg.on("close", (code, reason) => {
            log("Deepgram WS CLOSE", { code, reason: String(reason || "") });
          });

          dg.on("message", async (data) => {
            try {
              if (checkTimeUp()) return;
              if (speaking) return;

              const payload = JSON.parse(data.toString("utf8"));

              if (payload?.type === "error" || payload?.error) {
                log("DG PAYLOAD ERROR", payload);
              }

              const alt = payload?.channel?.alternatives?.[0];
              const transcript = String(alt?.transcript || "").trim();
              const isFinal = Boolean(payload?.is_final);

              // ⚠️ speech_final a veces NO viene; por defecto no lo exigimos
              const speechFinalRaw = payload?.speech_final;
              const speechFinal =
                speechFinalRaw === undefined || speechFinalRaw === null
                  ? true
                  : Boolean(speechFinalRaw);

              // ✅ necesitamos texto final
              if (!isFinal || !transcript) return;

              // ✅ si quieres exigir speech_final, se controla con env
              if (REQUIRE_SPEECH_FINAL && !speechFinal) return;

              if (FINAL_DEBOUNCE_MS > 0) {
                pendingFinalText = transcript;
                try {
                  if (pendingFinalTimer) clearTimeout(pendingFinalTimer);
                } catch {}
                pendingFinalTimer = setTimeout(() => {
                  const t = pendingFinalText;
                  pendingFinalText = "";
                  pendingFinalTimer = null;
                  Promise.resolve().then(() => handleTherapistFinal(t));
                }, FINAL_DEBOUNCE_MS);
                return;
              }

              await handleTherapistFinal(transcript);
            } catch (e) {
              log("DG parse message error", e?.message || String(e));
            }
          });

          dg.on("error", (e) => {
            log("Deepgram WS ERROR ❌", e?.message || e);
            safeSend(ws, {
              type: "error",
              message: `Deepgram WS error: ${e?.message || ""}`,
            });
            try {
              ws.close();
            } catch {}
          });

          safeSend(ws, {
            type: "ready",
            tipoRole,
            limitSec,
            problema,
            problemaKey: normalizeProblemaKey(problema),
            cooldownMs,
            endpointingMs: Number(process.env.SIM_DG_ENDPOINTING_MS || 1200),
            finalDebounceMs: FINAL_DEBOUNCE_MS,
            requireSpeechFinal: REQUIRE_SPEECH_FINAL,
          });

          // pipeline audio
          const inFmt = selectInputFormat(hello?.mimeType);
          const isPCM = String(hello?.mimeType || "")
            .toLowerCase()
            .includes("audio/pcm");

          // ✅ si es PCM, no uses ffmpeg
          if (isPCM) return;

          const ar = Number(hello?.sampleRate) || 16000;

          ff = ffmpeg()
            .input("pipe:0")
            .inputOptions([`-f ${inFmt}`, "-vn"])
            .audioCodec("pcm_s16le")
            .audioChannels(1)
            .audioFrequency(ar)
            .format("s16le")
            .on("start", (cmd) => log("ffmpeg START:", cmd))
            .on("error", (err) => {
              safeSend(ws, {
                type: "error",
                message: `ffmpeg error: ${err?.message || ""}`,
              });
              try {
                dg?.close();
              } catch {}
            })
            .on("end", () => {
              try {
                dg?.close();
              } catch {}
            });

          const ffOut = ff.pipe();

          ffOut.on("data", (chunk) => {
            if (checkTimeUp()) return;

            if (speaking) {
              droppedAudioChunks++;
              return;
            }

            if (!dgReady) {
              pcmBuffer.push(Buffer.from(chunk));
              return;
            }
            try {
              dg.send(chunk);
            } catch {}
          });

          ffOut.on("end", () => {
            try {
              dg?.close();
            } catch {}
          });

          return;
        }

        // 2) CONTROL JSON
        if (!isBinary) {
          const evt = JSON.parse(message.toString("utf8"));

          if (evt?.type === "done") {
            cleanup();
            try {
              ws.close();
            } catch {}
          }

          return;
        }

        // 3) AUDIO BINARIO
        if (checkTimeUp()) return;

        if (speaking) {
          droppedAudioChunks++;
          return;
        }

        const isPCM = String(hello?.mimeType || "")
          .toLowerCase()
          .includes("audio/pcm");

        if (isPCM) {
          if (!dgReady) {
            pcmBuffer.push(Buffer.from(message));
            return;
          }
          try {
            dg.send(message);
          } catch {}
        } else {
          if (ff && ff.stdin?.writable) ff.stdin.write(Buffer.from(message));
        }
      } catch (err) {
        safeSend(ws, { type: "error", message: "Mensaje inválido" });
      }
    });
  });

  console.log(
    "✅ WS de simulación listo (noServer). Enrútalo a /ws/sim desde index.js"
  );
  return wss;
}

module.exports = { createSimWSS };