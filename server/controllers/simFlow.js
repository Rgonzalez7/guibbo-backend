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

const DG_KEY = process.env.DEEPGRAM_API_KEY || "";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch {}
}

function log(...a) {
  console.log("🤖 [SIM]", ...a);
  console.log("ELEVEN KEY:", process.env.ELEVENLABS_API_KEY ? "OK" : "MISSING");
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
  return String(tipoRole || "").toLowerCase() === "simulada" ? 15 * 60 : 60 * 60;
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
function buildPrompt(ctx, transcript) {
  const { edad, genero, problema } = ctx || {};
  return `Contexto del paciente simulado:
- Edad: ${edad ?? "N/D"}
- Género: ${genero ?? "N/D"}
- Motivo principal: ${problema ?? "N/D"}

Terapeuta dijo: "${transcript}"

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

function createDGClientWS({ sampleRate = 16000 }) {
  const qs = new URLSearchParams({
    model: "nova-2",
    language: "es",
    punctuate: "true",
    smart_format: "true",
    encoding: "linear16",
    sample_rate: String(sampleRate),
    diarize: "false",
    interim_results: "true",
  });

  const url = `wss://api.deepgram.com/v1/listen?${qs.toString()}`;
  const headers = { Authorization: `Token ${DG_KEY}` };
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
        "respuestas.rolePlaying.transcripcion.turns": { ts, speaker, text: clean },
      },
      $set: {
        "respuestas.rolePlaying.transcripcion.updatedAt": ts,
      },
    }
  );
}

/* =========================================================
   ✅ WS factory
   ========================================================= */
function createSimWSS() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    log("Cliente conectado a /ws/sim");

    let hello = null;

    let dg = null; // WS Deepgram
    let ff = null; // ffmpeg proc
    let dgReady = false;
    let pcmBuffer = [];

    // runtime
    let userId = null;
    let instanciaId = null;
    let ejercicioId = null;

    let tipoRole = "simulada"; // default seguro
    let problema = "";
    let limitSec = 15 * 60;
    let startMs = Date.now();

    let voiceIdResolved = "";

    function cleanup() {
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

      log("/ws/sim cerrado");
    }

    ws.on("close", cleanup);
    ws.on("error", cleanup);

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

    ws.on("message", async (message, isBinary) => {
      try {
        // ===========================
        // 1) HELLO
        // ===========================
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

          // ✅ Auth
          userId = verifyWsToken(hello.token);
          if (!userId) {
            log("[TTS] sending audio_b64 len =", String(tts.base64 || "").length, "| mime =", tts.mime);
            safeSend(ws, { type: "error", message: "Token inválido o ausente (hello.token)" });
            ws.close();
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

          // ✅ Seguridad: instancia pertenece al estudiante y corresponde al ejercicio
          const inst = await EjercicioInstancia.findOne({ _id: instanciaId, estudiante: userId })
            .select("_id ejercicio")
            .lean();

          if (!inst?._id) {
            safeSend(ws, { type: "error", message: "Instancia no válida para este usuario" });
            ws.close();
            return;
          }

          if (String(inst.ejercicio) !== String(ejercicioId)) {
            safeSend(ws, {
              type: "error",
              message: "La instancia no corresponde a ese ejercicio (mismatch ejercicioId)",
            });
            ws.close();
            return;
          }

          // ✅ Config RolePlay desde BD
          const rp = await EjercicioRolePlay.findOne({ ejercicio: ejercicioId })
            .select("tipoRole trastorno")
            .lean();

          tipoRole = rp?.tipoRole || "simulada";

          // ✅ ENFORCE: este WS es SOLO simulada
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
            safeSend(ws, { type: "error", message: "DEEPGRAM_API_KEY no configurada" });
            ws.close();
            return;
          }

          // ✅ VoiceId por trastorno
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
          log("HELLO OK | sr =", sr, "| mime =", hello.mimeType);

          // 1) Conectar a Deepgram
          dg = createDGClientWS({ sampleRate: sr });

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

          dg.on("message", async (data) => {
            try {
              if (checkTimeUp()) return;

              const payload = JSON.parse(data.toString("utf8"));
              const alt = payload?.channel?.alternatives?.[0];
              const transcript = alt?.transcript || "";

              if (payload.is_final && transcript.trim()) {
                // ✅ Turn: estudiante
                await appendTurn({
                  ejercicioInstanciaId: instanciaId,
                  speaker: "estudiante",
                  text: transcript,
                });
                safeSend(ws, { type: "turn", speaker: "estudiante", text: transcript });

                // ✅ IA responde
                const prompt = buildPrompt(
                  { ...hello, problema: problema || hello.problema },
                  transcript
                );

                const completion = await openai.chat.completions.create({
                  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                  messages: [
                    {
                      role: "system",
                      content:
                        "Eres un paciente simulado. Responde natural, humano, breve y en español.",
                    },
                    { role: "user", content: prompt },
                  ],
                  temperature: 0.7,
                });

                const text = completion.choices?.[0]?.message?.content?.trim() || "...";

                // ✅ Turn: paciente
                await appendTurn({
                  ejercicioInstanciaId: instanciaId,
                  speaker: "paciente",
                  text,
                });
                safeSend(ws, { type: "turn", speaker: "paciente", text });

                // ✅ TTS ElevenLabs (con debug + error hacia FE)
                safeSend(ws, { type: "tts_start" });

                try {
                  const t0 = Date.now();
                  const tts = await ttsSynthesizeBase64(text, voiceIdResolved);
                  const ms = Date.now() - t0;

                  const b64 = String(tts?.base64 || "");
                  log("TTS OK ✅", { voiceId: tts?.voiceId, ms, b64Len: b64.length });

                  if (!b64 || b64.length < 50) {
                    safeSend(ws, {
                      type: "error",
                      message: "TTS generado pero base64 vacío/corto",
                      code: "TTS_EMPTY",
                      voiceId: tts?.voiceId,
                      b64Len: b64.length,
                    });
                  } else {
                    safeSend(ws, {
                      type: "tts_audio",
                      audio_b64: b64,
                      mime: tts?.mime || "audio/mpeg",
                      voiceId: tts?.voiceId || voiceIdResolved,
                      b64Len: b64.length,
                      ms,
                    });
                  }
                } catch (e) {
                  const msg = e?.response?.data
                    ? (Buffer.isBuffer(e.response.data) ? e.response.data.toString("utf8") : String(e.response.data))
                    : (e?.message || String(e));

                  log("TTS FAIL ❌", {
                    message: e?.message,
                    status: e?.response?.status,
                    data: msg?.slice?.(0, 400),
                  });

                  safeSend(ws, {
                    type: "error",
                    code: "TTS_FAILED",
                    message: `ElevenLabs falló: ${e?.response?.status || ""} ${e?.message || ""}`.trim(),
                    status: e?.response?.status,
                    details: msg?.slice?.(0, 400),
                    voiceId: voiceIdResolved,
                  });
                } finally {
                  safeSend(ws, { type: "tts_end" });
                }
              }
            } catch (e) {
              // opcional: log(e)
            }
          });

          dg.on("error", (e) => {
            safeSend(ws, { type: "error", message: `Deepgram WS error: ${e?.message || ""}` });
          });

          // ✅ READY inmediato (tu FE espera esto para empezar a mandar PCM)
          safeSend(ws, {
            type: "ready",
            tipoRole,
            limitSec,
            problema,
            problemaKey: normalizeProblemaKey(problema),
          });

          // 2) Pipeline audio
          const inFmt = selectInputFormat(hello?.mimeType);
          const isPCM = String(hello?.mimeType || "").toLowerCase().includes("audio/pcm");

          // ✅ Si ya es PCM, NO usar ffmpeg
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
              safeSend(ws, { type: "error", message: `ffmpeg error: ${err?.message || ""}` });
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

        // ===========================
        // 2) CONTROL JSON
        // ===========================
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

        // ===========================
        // 3) AUDIO BINARIO
        // ===========================
        if (checkTimeUp()) return;

        const isPCM = String(hello?.mimeType || "").toLowerCase().includes("audio/pcm");

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

  console.log("✅ WS de simulación listo (noServer). Enrútalo a /ws/sim desde index.js");
  return wss;
}

module.exports = { createSimWSS };