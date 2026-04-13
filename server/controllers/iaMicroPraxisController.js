// server/controllers/iaMicroPraxisController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");
const { EjercicioGrabarVoz } = require("../models/modulo");
const { callLLMJson } = require("../utils/llmClient");
const {
  buildPromptCaso,
  buildPromptGlobal,
  normalizeCasoResult,
  normalizeGlobalResult,
  INTERVENCION_LABELS,
  NIVEL_LABELS,
} = require("../utils/analisisMicroPraxis");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.trim().toLowerCase() === "true";
  return fallback;
}

async function callLLMJsonWithRetry(opts, retries = 1) {
  try { return await callLLMJson(opts); }
  catch (e) {
    if (retries <= 0) throw e;
    await sleep(1200);
    return callLLMJsonWithRetry(opts, retries - 1);
  }
}

async function resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId }) {
  if (instanciaId) {
    const inst = await EjercicioInstancia.findById(instanciaId);
    if (inst) return inst;
  }
  if (!userId || !ejercicioId) return null;
  const q = {
    ejercicio: ejercicioId,
    $or: [{ estudiante: userId }, { usuario: userId }],
  };
  if (moduloInstanciaId) q.moduloInstancia = moduloInstanciaId;
  return EjercicioInstancia.findOne(q).sort({ createdAt: -1 });
}

/* =========================================================
   POST /ia/grabar-voz/analizar-caso
   Analiza una respuesta individual de un caso
========================================================= */
module.exports.analizarCasoGV = async (req, res) => {
  try {
    const {
      ejercicioId,
      instanciaId,
      moduloInstanciaId,
      habilidad,
      nivel,
      casoIdx,
      casoTexto,
      transcripcion,
      replace: replaceRaw = true,
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId." });
    if (!habilidad)   return res.status(400).json({ message: "Falta habilidad." });
    if (!nivel)       return res.status(400).json({ message: "Falta nivel." });
    if (!transcripcion?.trim()) return res.status(400).json({ message: "Falta transcripcion." });

    const userId = req.user?._id || req.user?.id || null;

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
    if (!inst) return res.status(400).json({ message: "No se encontró instancia." });

    // Construir prompt
    const prompt = buildPromptCaso({
      habilidad,
      nivel,
      caso:         casoTexto || "",
      transcripcion,
    });

    // Llamar a la IA
    const raw = await callLLMJsonWithRetry({
      system:      "Eres un supervisor clínico experto. Evalúa la micro-intervención del estudiante. Devuelve SOLO JSON válido, sin texto adicional.",
      prompt,
      model:       process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    }, 1);

    // Normalizar
    const resultado = normalizeCasoResult(raw, { habilidad, nivel, casoIdx: Number(casoIdx ?? 0) });

    // Persistir en instancia — guardamos por índice de caso
    if (!inst.respuestas) inst.respuestas = {};
    if (!inst.respuestas.casosPraxis) inst.respuestas.casosPraxis = {};
    const key = `caso_${casoIdx}`;
    if (replace || !inst.respuestas.casosPraxis[key]) {
      inst.respuestas.casosPraxis[key] = resultado;
    }
    if (typeof inst.markModified === "function") {
      inst.markModified("respuestas");
      inst.markModified("respuestas.casosPraxis");
    }
    await inst.save();

    return res.json({ resultado });
  } catch (err) {
    console.error("❌ analizarCasoGV error:", err);
    return res.status(500).json({ message: err?.message || "Error interno." });
  }
};

/* =========================================================
   POST /ia/grabar-voz/analizar-global
   Analiza el desempeño global en base a los resultados por caso
========================================================= */
module.exports.analizarGlobalGV = async (req, res) => {
  try {
    const {
      ejercicioId,
      instanciaId,
      moduloInstanciaId,
      habilidad,
      nivel,
      resultadosCasos,   // array de normalizeCasoResult
      replace: replaceRaw = true,
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    if (!ejercicioId)                          return res.status(400).json({ message: "Falta ejercicioId." });
    if (!habilidad)                             return res.status(400).json({ message: "Falta habilidad." });
    if (!nivel)                                 return res.status(400).json({ message: "Falta nivel." });
    if (!Array.isArray(resultadosCasos) || !resultadosCasos.length)
      return res.status(400).json({ message: "Falta resultadosCasos (array)." });

    const userId = req.user?._id || req.user?.id || null;

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
    if (!inst) return res.status(400).json({ message: "No se encontró instancia." });

    // Construir prompt global
    const prompt = buildPromptGlobal({ habilidad, nivel, resultadosCasos });

    // Llamar a la IA
    const raw = await callLLMJsonWithRetry({
      system:      "Eres un supervisor clínico experto. Genera un análisis global pedagógico. Devuelve SOLO JSON válido, sin texto adicional.",
      prompt,
      model:       process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
    }, 1);

    // Normalizar
    const resultado = normalizeGlobalResult(raw, { habilidad, nivel, resultadosCasos });

    // Persistir
    if (!inst.respuestas) inst.respuestas = {};
    if (replace || !inst.respuestas.analisisGlobal) {
      inst.respuestas.analisisGlobal = resultado;
    }
    // También guardar en analisisIA para compatibilidad con el perfil terapéutico
    inst.analisisIA          = resultado;
    inst.analisisGeneradoAt  = new Date();
    inst.analisisFuente      = "real";
    if (typeof inst.markModified === "function") {
      inst.markModified("respuestas");
      inst.markModified("analisisIA");
    }
    await inst.save();

    return res.json({ resultado });
  } catch (err) {
    console.error("❌ analizarGlobalGV error:", err);
    return res.status(500).json({ message: err?.message || "Error interno." });
  }
};
