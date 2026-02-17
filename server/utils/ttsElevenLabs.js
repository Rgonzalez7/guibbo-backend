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
 * Acepta voiceId dinámico
 */
async function ttsSynthesizeBase64(text, voiceId) {
  const ELEVEN_API_KEY = ensureElevenKey();

  const finalVoiceId = String(voiceId || "").trim() || DEFAULT_VOICE_ID;

  // (opcional) sanitize texto
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

    const base64 = Buffer.from(res.data).toString("base64");
    if (!base64 || base64.length < 20) {
      const err = new Error("TTS: respuesta sin audio (base64 vacío)");
      err.code = "ELEVEN_EMPTY_AUDIO";
      throw err;
    }

    return { base64, mime: "audio/mpeg", voiceId: finalVoiceId };
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

    // Mensaje más claro en 401
    const hint401 =
      status === 401
        ? " (401 Unauthorized) -> Revisa que tu ELEVEN_API_KEY sea válida, que el .env esté cargando ANTES de require/import, y reinicia el backend."
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