const openai = require('../utils/openai');

const { dividirTextoEnBloques } = require("../utils/dividirTexto");

function tryParseJsonArray(str) {
  const s = String(str || "").trim();
  // intenta extraer el primer array JSON grande: [ ... ]
  const m = s.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

function normalizeTurns(arr) {
  return (arr || [])
    .map((x) => ({
      hablante: String(x?.hablante || x?.speaker || "").trim() || "Speaker",
      texto: String(x?.texto || x?.text || "").trim(),
    }))
    .filter((x) => x.texto);
}

async function mapWithConcurrency(items, limit, worker) {
  const results = [];
  let idx = 0;

  const runners = new Array(Math.max(1, limit)).fill(null).map(async () => {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await worker(items[current], current);
    }
  });

  await Promise.all(runners);
  return results;
}

const diarizarTextoIA = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto || String(texto).trim() === "") {
      return res.status(400).json({ message: "Texto vacío o inválido." });
    }

    // ✅ menos requests: bloque más grande (ajústalo si quieres)
    const bloques = dividirTextoEnBloques(texto, 60); // antes 15
    const resultados = [];

    // ✅ concurrencia controlada (2 en paralelo)
    const parciales = await mapWithConcurrency(bloques, 2, async (bloque) => {
      const prompt = `
A continuación recibirás una transcripción de una sesión entre un paciente y un terapeuta.
Tu tarea es determinar quién habla en cada intervención: "Paciente" o "Terapeuta".

Devuelve SOLO JSON válido como una lista:
[
  { "hablante": "Paciente", "texto": "..." },
  { "hablante": "Terapeuta", "texto": "..." }
]

REGLAS:
- No agregues explicaciones.
- Mantén el texto lo más parecido posible al original.
- Si es ambiguo, elige la mejor opción según patrones lingüísticos.

TRANSCRIPCIÓN:
"""${bloque}"""
`.trim();

      const completion = await openai.chat.completions.create({
        // ✅ usa un modelo rápido (cambia aquí si tu cuenta usa otro nombre)
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      const content = completion.choices?.[0]?.message?.content || "";

      // ✅ parseo robusto (primero intenta JSON array)
      const parsed = tryParseJsonArray(content);
      if (parsed) return normalizeTurns(parsed);

      // fallback viejo: regex por objetos
      const regex = /\{\s*"hablante"\s*:\s*".*?",\s*"texto"\s*:\s*".*?"\s*\}/gs;
      const matches = content.match(regex);
      if (!matches || matches.length === 0) return [];

      const safeJson = `[${matches.join(",")}]`;
      return normalizeTurns(JSON.parse(safeJson));
    });

    for (const arr of parciales) resultados.push(...(arr || []));

    return res.json({ diarizado: resultados });
  } catch (err) {
    console.error("[❌ diarización error]", err);
    return res.status(500).json({
      message: "Error en diarización",
      error: err?.message,
    });
  }
};

module.exports = { diarizarTextoIA };