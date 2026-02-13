// server/utils/llmClient.js
const axios = require("axios");

async function callLLMJson({ system, prompt, model, temperature = 0.2 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Falta OPENAI_API_KEY en env.");

  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const url = `${baseURL}/chat/completions`;

  const resp = await axios.post(
    url,
    {
      model,
      temperature,
      messages: [
        { role: "system", content: system || "Devuelve solo JSON válido." },
        { role: "user", content: prompt },
      ],
      // importante: forzar formato JSON si tu modelo lo soporta
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 120000,
    }
  );

  const content = resp?.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respuesta vacía del modelo.");

  return content;
}

module.exports = { callLLMJson };