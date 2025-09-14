const openai = require('../utils/openai');
const { dividirTextoEnBloques } = require('../utils/dividirTexto');

const diarizarTextoIA = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto || texto.trim() === '') {
      return res.status(400).json({ message: 'Texto vacío o inválido.' });
    }

    const bloques = dividirTextoEnBloques(texto, 15);
    const resultados = [];

    for (const bloque of bloques) {
      const prompt = `
A continuación recibirás una transcripción de una sesión entre un paciente y un terapeuta. 
Tu tarea es determinar, en cada línea, quién está hablando: "Paciente" o "Terapeuta". 
Devuelve una lista en formato JSON como esta:

[
  { "hablante": "Paciente", "texto": "..." },
  { "hablante": "Terapeuta", "texto": "..." }
]

No incluyas ninguna explicación, solo el JSON. Aquí va la transcripción:

"""${bloque}"""
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      });

      const respuesta = completion.choices?.[0]?.message?.content || '';

      const regex = /\{\s*"hablante"\s*:\s*".*?",\s*"texto"\s*:\s*".*?"\s*\}/gs;
      const matches = respuesta.match(regex);

      if (!matches || matches.length === 0) {
        console.warn('[⚠️ No se encontraron turnos válidos en un bloque]');
        continue;
      }

      const safeJson = `[${matches.join(',')}]`;
      const parcial = JSON.parse(safeJson);

      resultados.push(...parcial);
    }

    res.json({ diarizado: resultados });
  } catch (err) {
    console.error('[❌ Error parseando JSON de diarización]', err.message);
    res.status(500).json({
      message: 'Respuesta de diarización malformada',
      error: err.message
    });
  }
};

module.exports = { diarizarTextoIA };