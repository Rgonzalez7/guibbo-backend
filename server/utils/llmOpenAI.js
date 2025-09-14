// utils/llm.js (CommonJS)
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function llmRespond({ userText, edad, genero, problema }) {
  const sys = `Eres un paciente simulado para entrenamiento clínico.
- Responde como un paciente humano, con naturalidad y brevedad (1-3 frases).
- Contexto: edad=${edad}, genero=${genero}, motivo=${problema}.
- Mantén coherencia entre respuestas.`;

  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: userText }
    ],
    temperature: 0.6
  });

  return res.choices?.[0]?.message?.content?.trim() || '...';
}

module.exports = { llmRespond };