// server/controllers/iaMultiSesionController.js
//
// Análisis de "cumplimiento del plan de intervención" para una sesión de un
// ejercicio Multi Sesión. NO persiste (el frontend guarda el resultado dentro
// de la sesión vía multiSesionController.guardarSesion).
//
// Reutiliza el mismo cliente LLM que el resto de análisis IA.

const { callLLMJson } = require("../utils/llmClient");

function toStr(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

function buildPrompt({ planIntervencion, transcripcion, expediente, numeroSesion }) {
  return `
Eres un supervisor clínico. Analiza si la sesión de terapia cumple con los objetivos
definidos en el PLAN DE INTERVENCIÓN del paciente.

PLAN DE INTERVENCIÓN (compartido entre todas las sesiones):
${toStr(planIntervencion) || "(sin plan definido)"}

NÚMERO DE SESIÓN: ${numeroSesion || "?"}

TRANSCRIPCIÓN DE LA SESIÓN:
${toStr(transcripcion) || "(sin transcripción)"}

EXPEDIENTE DE LA SESIÓN (datos clínicos registrados por el estudiante):
${toStr(expediente) || "(vacío)"}

Devuelve SOLO un JSON válido con esta forma:
{
  "cumplimientoGeneral": <número 0-100>,
  "resumen": "<2-4 oraciones sobre el grado de cumplimiento>",
  "objetivos": [
    {
      "objetivo": "<texto del objetivo del plan>",
      "estado": "cumplido" | "parcial" | "no_abordado",
      "evidencia": "<qué en la sesión lo respalda o por qué no>",
      "sugerencia": "<recomendación breve para próximas sesiones>"
    }
  ],
  "recomendacionesGenerales": "<texto>"
}
Si el plan no tiene objetivos claros, devuelve cumplimientoGeneral 0 y explica en resumen
que aún no hay un plan de intervención definido.
`.trim();
}

/**
 * POST /ia/multisesion/cumplimiento-plan
 * body: { planIntervencion, transcripcion, expediente, numeroSesion }
 * → { analisisPlan }
 */
exports.analizarCumplimientoPlan = async (req, res) => {
  try {
    const { planIntervencion, transcripcion, expediente, numeroSesion } = req.body || {};

    const prompt = buildPrompt({ planIntervencion, transcripcion, expediente, numeroSesion });

    const raw = await callLLMJson({
      system:
        "Eres un supervisor clínico experto en planes de intervención psicológica. " +
        "Evalúas el cumplimiento de objetivos terapéuticos. Devuelve SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    });

    const analisisPlan =
      raw && typeof raw === "object"
        ? raw
        : { cumplimientoGeneral: 0, resumen: "No se pudo analizar el cumplimiento.", objetivos: [], recomendacionesGenerales: "" };

    return res.json({ analisisPlan, esTutorial: true });
  } catch (e) {
    console.error("❌ analizarCumplimientoPlan:", e);
    return res.status(500).json({ message: e?.message || "Error al analizar el cumplimiento del plan." });
  }
};
