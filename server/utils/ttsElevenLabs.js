// utils/tts.js (CommonJS)
const axios = require('axios');

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

async function ttsSynthesizeBase64(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=3`;

  const res = await axios.post(
    url,
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    },
    {
      responseType: 'arraybuffer',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  const base64 = Buffer.from(res.data).toString('base64');
  return { base64, mime: 'audio/mpeg' };
}

module.exports = { ttsSynthesizeBase64 };