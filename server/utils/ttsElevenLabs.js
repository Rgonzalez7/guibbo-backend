// utils/ttsElevenLabs.js (CommonJS)
const axios = require("axios");

const DEFAULT_VOICE_ID =
  process.env.ELEVEN_VOICE_DEFAULT ||
  process.env.ELEVEN_VOICE_ID ||
  "21m00Tcm4TlvDq8ikWAM";

// Lee la key SIEMPRE desde process.env (no congelarla arriba)
function getElevenKey() {
  const key =
    (process.env.ELEVEN_API_KEY || "").trim() ||
    (process.env.ELEVENLABS_API_KEY || "").trim(); // compat

  return key;
}

function ensureElevenKey() {
  const key = getElevenKey();
  if (!key) {
    const err = new Error(
      "ElevenLabs API key no configurada. Define ELEVEN_API_KEY (o ELEVENLABS_API_KEY) en tu .env"
    );
    err.code = "ELEVEN_NO_KEY";
    throw err;
  }
  return key;
}

/**
 * ✅ Normaliza cualquier forma de retorno a:
 * { base64: string, mime: string, voiceId: string }
 */
function normalizeElevenTtsResult(raw, fallbackVoiceId) {
  const voiceId = String(fallbackVoiceId || "").trim() || DEFAULT_VOICE_ID;

  // raw podría ser string base64
  if (typeof raw === "string") {
    const b64 = raw.trim().replace(/^data:audio\/[^;]+;base64,/i, "");
    return { base64: b64, mime: "audio/mpeg", voiceId };
  }

  // raw podría ser Buffer
  if (Buffer.isBuffer(raw)) {
    return { base64: raw.toString("base64"), mime: "audio/mpeg", voiceId };
  }

  // raw como objeto { base64, mime, voiceId } o similares
  if (raw && typeof raw === "object") {
    const b64Candidate =
      raw.base64 ||
      raw.audio_b64 ||
      raw.audioBase64 ||
      raw.data ||
      raw.audio ||
      "";

    const mimeCandidate = raw.mime || raw.contentType || "audio/mpeg";
    const vid = String(raw.voiceId || voiceId).trim() || voiceId;

    let b64 = "";
    if (Buffer.isBuffer(b64Candidate)) b64 = b64Candidate.toString("base64");
    else if (typeof b64Candidate === "string") b64 = b64Candidate;

    b64 = String(b64 || "")
      .trim()
      .replace(/^data:audio\/[^;]+;base64,/i, "");

    return { base64: b64, mime: String(mimeCandidate || "audio/mpeg"), voiceId: vid };
  }

  return { base64: "", mime: "audio/mpeg", voiceId };
}

/**
 * Acepta voiceId dinámico
 * ✅ Retorna: { base64, mime, voiceId }
 */
async function ttsSynthesizeBase64({ text, voiceId } = {}) {
  const ELEVEN_API_KEY = ensureElevenKey();

  const finalVoiceId = String(voiceId || "").trim() || DEFAULT_VOICE_ID;

  // sanitize texto
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    const err = new Error("TTS: texto vacío");
    err.code = "ELEVEN_EMPTY_TEXT";
    throw err;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}?optimize_streaming_latency=3`;

  try {
    const res = await axios.post(
      url,
      {
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      },
      {
        responseType: "arraybuffer",
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        timeout: 60000,
      }
    );

    // ✅ axios arraybuffer => Buffer
    const buf = Buffer.from(res.data);
    const base64 = buf.toString("base64");

    const out = normalizeElevenTtsResult(
      { base64, mime: "audio/mpeg", voiceId: finalVoiceId },
      finalVoiceId
    );

    if (!out.base64 || out.base64.length < 2000) {
      const err = new Error(
        `TTS: respuesta sin audio válido (base64 len=${String(out.base64 || "").length})`
      );
      err.code = "ELEVEN_EMPTY_AUDIO";
      throw err;
    }

    return out;
  } catch (e) {
    const status = e?.response?.status;

    let details = "";
    try {
      if (e?.response?.data) {
        details = Buffer.isBuffer(e.response.data)
          ? e.response.data.toString("utf8")
          : String(e.response.data);
      }
    } catch {}

    const hint401 =
      status === 401
        ? " (401 Unauthorized) -> Revisa ELEVEN_API_KEY, reinicia el backend y confirma que el .env carga antes del require."
        : "";

    const err = new Error(
      `ElevenLabs error ${status || ""}: ${e?.message || ""}${hint401}`.trim()
    );
    err.status = status;
    err.details = (details || "").slice(0, 800);
    err.original = e;
    throw err;
  }
}

module.exports = { ttsSynthesizeBase64 };