const { registerPrompt, getPrompt, render } = require("../utils/promptStore");

// ✅ Prompts de paciente por trastorno (se registran al requerirse)
const { resolverClavePrompt } = require("../utils/promptsTrastornos");

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
/** Los IDs de voz de ElevenLabs son alfanuméricos de 20 caracteres. */
function esVoiceIdValido(v) {
  return /^[A-Za-z0-9]{20}$/.test(String(v || "").trim());
}

function resolveElevenVoiceIdFromProblema(problema) {
  const envKey = toEnvKeyFromProblema(problema);
  const propia = String(envKey ? process.env[envKey] : "" || "").trim();

  const porDefecto =
    String(process.env.ELEVEN_VOICE_DEFAULT || "").trim() ||
    String(process.env.ELEVEN_VOICE_ID || "").trim();

  // Un ID mal copiado hace que ElevenLabs rechace la petición y la
  // sesión se quede sin audio. Si no tiene forma válida, usamos el
  // de respaldo en vez de fallar en silencio.
  if (propia && !esVoiceIdValido(propia)) {
    log(
      `⚠️  ${envKey} tiene un ID inválido ("${propia}", ${propia.length} caracteres; ` +
        "se esperan 20). Se usará la voz por defecto."
    );
    return porDefecto;
  }

  return propia || porDefecto || "";
}

/* =========================================================
   ✅ Prompt
   ---------------------------------------------------------
   Cada trastorno tiene su propio prompt en utils/promptsTrastornos.
   Si no existe uno específico (o su texto quedó vacío desde el
   panel), se usa el genérico "sim.paciente.turno".
   ========================================================= */
function buildPrompt(ctx, therapistText) {
  // La identidad del paciente (nombre, edad, etc.) la inventa la IA:
  // no se configura desde el ejercicio.
  const { problema, segundosTranscurridos, numeroTurno, limitSec } = ctx || {};

  const seg = Math.max(0, Number(segundosTranscurridos) || 0);
  const min = Math.floor(seg / 60);

  // Fase de la sesión: permite escribir reglas de ritmo en el prompt
  // (por ejemplo, no revelar el motivo real durante la apertura).
  const total = Number(limitSec) || 900;
  const avance = total ? seg / total : 0;

  const fase =
    avance < 0.25 ? "apertura" : avance < 0.7 ? "desarrollo" : "cierre";

  // ✅ Prompt propio del trastorno (o el genérico como respaldo)
  const clave = resolverClavePrompt(problema);

  return render(getPrompt(clave), {
    problema: problema ?? "N/D",
    therapistText: therapistText,

    // ✅ Contexto temporal disponible para el prompt
    minutosTranscurridos: String(min),
    tiempoTranscurrido: `${String(min).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`,
    numeroTurno: String(numeroTurno ?? 1),
    fase,
  });
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
    encoding: "linear16",
    sample_rate: String(sampleRate),
    channels: "1",

    // ✅ Necesarios para respetar las pausas del terapeuta:
    //    - interim_results + vad_events avisan cuando vuelve a hablar
    //    - utterance_end_ms marca el fin real de la intervención
    interim_results: "true",
    vad_events: "true",
    endpointing: String(process.env.SIM_DG_ENDPOINTING_MS || 400),
    utterance_end_ms: String(process.env.SIM_DG_UTTERANCE_END_MS || 1000),
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
  // En sandbox (id no-ObjectId) no persistimos
  if (!/^[a-f0-9]{24}$/i.test(id)) return;

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
async function generatePatientReply({ ctx, therapistText, historial = [] }) {
  const prompt = buildPrompt(ctx, therapistText);
  const model = process.env.SIM_OPENAI_MODEL || "gpt-4o-mini";

  // ✅ El paciente recuerda la conversación: sin esto respondía cada turno
  //    como si fuera el primero, perdiendo el hilo y repitiéndose.
  const maxTurnos = Number(process.env.SIM_HISTORIAL_TURNOS || 20);
  const recientes = historial.slice(-maxTurnos);

  const res = await openai.chat.completions.create({
    model,
    temperature: Number(process.env.SIM_OPENAI_TEMP || 0.7),
    messages: [
      { role: "system", content: getPrompt("sim.paciente.system") },
      ...recientes,
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
    let isSandbox = false;

    // half-duplex
    let speaking = false;
    let droppedAudioChunks = 0;

    // ✅ Memoria de la conversación (para OpenAI)
    const historial = [];
    let numeroTurno = 0;

    const cooldownMs = Number(process.env.SIM_TTS_COOLDOWN_MS || 350);

    // debug
    let __binFrames = 0;
    let __binLast = Date.now();

    // anti-spam
    let lastTherapistFinalAt = 0;
    const MIN_GAP_FINAL_MS = Number(process.env.SIM_MIN_GAP_FINAL_MS || 450);

    /* =========================================================
       ✅ Acumulación de la intervención del terapeuta
       ---------------------------------------------------------
       Un terapeuta hace pausas: para pensar, para dar espacio o
       simplemente para respirar. Antes, cada pausa disparaba una
       respuesta del paciente y partía la intervención en dos.

       Ahora se acumulan los tramos y solo se envía cuando hubo
       un silencio real de SIM_TURNO_SILENCIO_MS.
       ========================================================= */
    let bufferTurno = "";
    let turnoTimer = null;
    let topeTimer = null;

    // Ventana de silencio antes de dar por cerrada la intervención
    const TURNO_SILENCIO_MS = Number(process.env.SIM_TURNO_SILENCIO_MS || 900);

    // Tope: pase lo que pase, el turno se envía. Evita que un ruido
    // cancele el envío una y otra vez y el paciente nunca conteste.
    const TURNO_MAX_ESPERA_MS = Number(process.env.SIM_TURNO_MAX_ESPERA_MS || 3500);

    function cancelarCierreDeTurno() {
      if (turnoTimer) {
        clearTimeout(turnoTimer);
        turnoTimer = null;
      }
    }

    function cancelarTope() {
      if (topeTimer) {
        clearTimeout(topeTimer);
        topeTimer = null;
      }
    }

    /** Envía lo acumulado (si hay algo) y limpia el estado del turno. */
    function cerrarTurnoAhora(motivo) {
      cancelarCierreDeTurno();
      cancelarTope();

      const texto = bufferTurno.trim();
      bufferTurno = "";

      if (!texto) return;

      log(`Turno cerrado (${motivo}):`, `"${texto.slice(0, 80)}"`);
      Promise.resolve().then(() => handleTherapistFinal(texto));
    }

    /** Programa el envío del turno tras la ventana de silencio. */
    function programarCierreDeTurno() {
      cancelarCierreDeTurno();

      turnoTimer = setTimeout(() => {
        turnoTimer = null;
        cerrarTurnoAhora("silencio");
      }, TURNO_SILENCIO_MS);

      // El tope se arma una sola vez por turno
      if (!topeTimer && bufferTurno.trim()) {
        topeTimer = setTimeout(() => {
          topeTimer = null;
          cerrarTurnoAhora("tope de espera");
        }, TURNO_MAX_ESPERA_MS);
      }
    }

    function cleanup() {
      try {
        cancelarCierreDeTurno();
        cancelarTope();
      } catch {}
      bufferTurno = "";

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
      log("FINAL terapeuta:", clean ? `"${clean.slice(0, 80)}"` : "(vacío → se ignora)");
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

      numeroTurno += 1;

      let reply = "";
      try {
        reply = await generatePatientReply({
          ctx: {
            problema,
            segundosTranscurridos: Math.floor((Date.now() - startMs) / 1000),
            numeroTurno,
            limitSec,
          },
          therapistText: clean,
          historial,
        });
      } catch (e) {
        log("OpenAI error:", e?.message || String(e));
        reply = "No sé… creo que sí. No estoy seguro.";
      }

      reply = String(reply || "").trim();
      if (!reply) reply = "No sé…";

      historial.push({ role: "user", content: clean });
      historial.push({ role: "assistant", content: reply });

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

      log("RESPUESTA paciente:", `"${String(reply || "").slice(0, 80)}"`, "| sintetizando con voiceId =", voiceIdResolved || "(NINGUNO)");

      try {
        const ttsRes = await ttsSynthesizeBase64({
          text: reply,
          voiceId: voiceIdResolved,
        });

        const audio_b64 = extractB64FromTtsResult(ttsRes);
        const mime =
          (ttsRes && typeof ttsRes === "object" && ttsRes.mime) || "audio/mpeg";

        if (!audio_b64) {
          log("TTS EMPTY (no base64) | voiceId =", voiceIdResolved);
          safeSend(ws, {
            type: "tts_failed",
            motivo: "sin_audio",
            voiceId: voiceIdResolved,
          });
        } else if (!looksLikeMp3Base64(audio_b64)) {
          log("TTS INVALID base64 (len =", audio_b64.length, ")");
          safeSend(ws, {
            type: "tts_failed",
            motivo: "audio_invalido",
            voiceId: voiceIdResolved,
          });
        } else {
          log("TTS OK → enviando audio | bytes b64 =", audio_b64.length, "| mime =", mime);
          safeSend(ws, {
            type: "tts_audio",
            audio_b64,
            mime,
            voiceId: voiceIdResolved,
            ms: Date.now(),
          });
        }
      } catch (e) {
        log("TTS error:", e?.message || String(e), "| voiceId =", voiceIdResolved);
        safeSend(ws, {
          type: "tts_failed",
          motivo: "error",
          detalle: e?.message || String(e),
          voiceId: voiceIdResolved,
        });
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

          // ✅ Modo sandbox (demo guiada / super): sin instancia real
          isSandbox =
            hello.sandbox === true ||
            String(instanciaId).toLowerCase() === "sandbox" ||
            String(ejercicioId).toLowerCase() === "sandbox";

          if (!isSandbox && (!instanciaId || !ejercicioId)) {
            safeSend(ws, {
              type: "error",
              message: "Faltan ejercicioInstanciaId o ejercicioId en hello",
            });
            ws.close();
            return;
          }

          if (isSandbox) {
            // Sin instancia real: asumimos simulación y tomamos el trastorno del hello
            tipoRole = "simulada";
            problema = String(hello.problema || "").trim();
          } else {
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
          }

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
          log("VOZ resuelta | problema =", problema || "(vacío)", "| voiceId =", voiceIdResolved || "(NINGUNO)");
          if (!voiceIdResolved) {
            safeSend(ws, {
              type: "error",
              message:
                "No hay voiceId. Define ELEVEN_VOICE_DEFAULT o ELEVEN_VOICE_TRANSTORNO_<X>.",
            });
            ws.close();
            return;
          }

          // ✅ Prompt del trastorno (o el genérico si no tiene propio)
          const promptClave = resolverClavePrompt(problema);
          log(
            "PROMPT resuelto | problema =",
            problema || "(vacío)",
            "| clave =",
            promptClave,
            promptClave === "sim.paciente.turno" ? "(genérico)" : "(específico)"
          );

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

              const payload = JSON.parse(data.toString("utf8"));

              if (payload?.type === "error" || payload?.error) {
                log("DG PAYLOAD ERROR", payload);
                return;
              }

              // Mientras habla el paciente ignoramos la entrada (half-duplex),
              // pero NO descartamos lo que el terapeuta ya había dicho.
              if (speaking) return;

              /* ==========================================================
                 El terapeuta retomó la palabra: postergamos el envío.
                 Se re-arma el temporizador (no se cancela a secas) para
                 que un ruido no deje el turno colgado sin respuesta.
                 ========================================================== */
              if (payload?.type === "SpeechStarted") {
                if (bufferTurno.trim()) {
                  programarCierreDeTurno();
                  log("Pausa retomada → se posterga el envío");
                }
                return;
              }

              /* ==========================================================
                 Deepgram detectó el fin de la intervención.
                 ========================================================== */
              if (payload?.type === "UtteranceEnd") {
                if (bufferTurno.trim()) programarCierreDeTurno();
                return;
              }

              const alt = payload?.channel?.alternatives?.[0];
              const transcript = String(alt?.transcript || "").trim();
              const isFinal = Boolean(payload?.is_final);

              if (!transcript) return;

              // Los parciales solo indican que sigue hablando
              if (!isFinal) {
                if (bufferTurno.trim()) programarCierreDeTurno();
                return;
              }

              // Acumulamos: una intervención puede venir en varios tramos
              bufferTurno = `${bufferTurno} ${transcript}`.trim();
              log("Tramo acumulado:", `"${transcript.slice(0, 60)}"`);

              // Siempre dejamos programado el cierre: si no llega nada más,
              // la ventana de silencio lo envía sola.
              programarCierreDeTurno();
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
            promptClave,
            cooldownMs,
            endpointingMs: Number(process.env.SIM_DG_ENDPOINTING_MS || 400),
            utteranceEndMs: Number(process.env.SIM_DG_UTTERANCE_END_MS || 1000),
            silencioTurnoMs: TURNO_SILENCIO_MS,
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
        console.error("❌ [SIM] excepción procesando mensaje:", err?.stack || err?.message || err);
        safeSend(ws, { type: "error", message: err?.message || "Mensaje inválido" });
      }
    });
  });

  console.log(
    "✅ WS de simulación listo (noServer). Enrútalo a /ws/sim desde index.js"
  );
  return wss;
}

module.exports = { createSimWSS };

/* =========================================================
   Prompt editable desde el panel de súper usuario
   clave: sim.paciente.turno

   ⚠️ Este es el prompt GENÉRICO: se usa solo cuando el trastorno
   no tiene uno propio en utils/promptsTrastornos.
========================================================= */
const PROMPT_SIM_PACIENTE_TURNO = `QUIÉN SOS
Lo que te trae a consulta: {{problema}}

Vos inventás el resto de tu identidad: nombre, edad, trabajo, con quién vivís,
tu historia. Elegila al empezar y NO la cambies durante la sesión: si ya dijiste
tu edad o tu nombre, sostenelos. Que sea una persona verosímil y común.

Si el terapeuta te pregunta algo de tu vida que todavía no definiste, respondé
como lo haría esa persona y quedátelo para el resto de la conversación.

ESTADO DE LA SESIÓN
- Tiempo transcurrido: {{tiempoTranscurrido}} (minuto {{minutosTranscurridos}})
- Intervención número {{numeroTurno}}
- Fase: {{fase}}

CÓMO INFLUYE LA FASE EN LO QUE REVELÁS
- apertura: estás tanteando. Te cuesta. Respondés corto, hablás de lo evidente o de molestias físicas. NO cuentes todavía el fondo del asunto ni lo más doloroso.
- desarrollo: si el terapeuta generó confianza, empezás a dar detalles y a conectar con lo que sentís. Si no la generó, seguís reservado.
- cierre: podés mostrar algo más de apertura o quedarte con la sensación de lo hablado, según cómo haya ido la sesión.

Tené en cuenta todo lo que ya conversaron: no te contradigas ni repitas lo que ya contaste.

EL TERAPEUTA ACABA DE DECIR:
"{{therapistText}}"

Respondé como este paciente, en voz alta, en español, en una o dos frases.`;

registerPrompt({
  clave: "sim.paciente.turno",
  nombre: "Paciente simulado — Turno genérico (sin trastorno propio)",
  categoria: "Role playing IA (simulación)",
  descripcion:
    "Prompt de respaldo: se usa solo cuando el trastorno no tiene un prompt propio en la categoría «Pacientes simulados». Incluye el tiempo transcurrido y la fase de la sesión.",
  variables: [
    'problema',
    'therapistText',
    // ✅ Contexto temporal: permite reglas de ritmo en el prompt
    // (por ejemplo: no revelar el motivo real durante la apertura)
    'minutosTranscurridos',
    'tiempoTranscurrido',
    'numeroTurno',
    'fase',
  ],
  defecto: PROMPT_SIM_PACIENTE_TURNO,
});

registerPrompt({
  clave: "sim.paciente.system",
  nombre: "Paciente simulado — Instrucción de sistema",
  categoria: "Role playing IA (simulación)",
  descripcion:
    "Reglas que aplican a TODOS los pacientes simulados, sin importar el trastorno. El prompt de cada trastorno se suma a estas reglas.",
  variables: [],
  defecto: `Eres un paciente en una sesión de psicoterapia. NO eres un asistente: eres una persona que está pasando por un momento difícil y que hoy vino a consulta.

=== CÓMO HABLA UNA PERSONA REAL ===
- Frases cortas. Rara vez más de dos o tres oraciones seguidas.
- Lenguaje cotidiano. Nunca uses vocabulario clínico ("ansiedad generalizada", "disociación", "trauma", "episodio depresivo"). Decís lo que sentís con palabras comunes: "me late fuerte el pecho", "no me dan ganas de nada", "me quedo en blanco".
- Titubeás: "no sé…", "es raro, ¿no?", "no sé cómo explicarlo", "eh…". Te corregís a mitad de frase.
- A veces respondés con muy poco: "sí", "más o menos", "supongo".
- Nunca hablás como un libro ni das discursos ordenados sobre tu propia historia.

=== QUÉ REVELÁS Y CUÁNDO ===
- Contás SOLO lo que te preguntan. No te adelantes ni entregues tu historia completa de una vez.
- Lo más doloroso no sale al principio. Cuesta. Primero aparece lo superficial, lo cotidiano, las quejas físicas.
- Si el terapeuta pregunta algo íntimo antes de que haya confianza, esquivás: cambiás de tema, minimizás ("no es para tanto"), respondés corto o preguntás por qué lo pregunta.
- Recién si el terapeuta se muestra cálido, escucha y no te presiona, empezás a abrirte un poco más.

=== REACCIONÁS A CÓMO TE TRATAN ===
- Si te escucha y valida lo que sentís → te aflojás, contás algo más.
- Si te interroga como un cuestionario, sin conexión → te cerrás, respondés seco.
- Si te interpreta o te da consejos demasiado pronto → te incomodás, dudás o discrepás sin agresividad.
- Si te contradice algo que dijiste antes o no te prestó atención → lo notás.

=== LO QUE NUNCA HACÉS ===
- No ayudás al terapeuta a hacer su trabajo. No le sugerís qué preguntar.
- No te diagnosticás a vos mismo.
- No sos excesivamente cooperativo ni excesivamente hostil: sos una persona ambivalente, que quiere estar mejor pero a la que le cuesta hablar.
- No repetís lo que ya contaste en esta sesión, salvo que te lo vuelvan a preguntar.
- No rompés el personaje jamás. No mencionás que sos una IA ni hablás del ejercicio.

=== FORMATO DE TU RESPUESTA ===
Tu respuesta se convierte en voz y se reproduce tal cual. Por eso:
- Escribí ÚNICAMENTE lo que el paciente dice en voz alta.
- Prohibido describir gestos o acciones: nada de *suspira*, (silencio), [llora]. Eso se leería en voz alta y arruina la escena.
- Sin comillas, sin viñetas, sin encabezados, sin tu nombre delante.
- Si querés transmitir duda o pausa, usá las palabras y la puntuación: "…no sé, es que…".

=== SEGURIDAD ===
Si aparecen temas de autolesión o ideas de muerte, podés expresar el malestar emocional de forma realista ("a veces siento que no vale la pena"), pero NUNCA describas métodos, medios ni detalles operativos de ningún tipo.`,
});
