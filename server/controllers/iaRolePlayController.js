// server/controllers/iaRolePlayController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");
const Session = require("../models/session");

const {
  buildRolePlayPrompt,
  clampText,
  normalizeAIResult,
  addLabelsToResult,
  extractRPDataFromInstance,
} = require("../utils/analisisRolePlayIA");

const { callLLMJson } = require("../utils/llmClient");

/* =========================================================
   Helpers
========================================================= */
function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return fallback;
}

/**
 * ✅ Normaliza evaluaciones:
 * - si viene ARRAY => ok
 * - si viene OBJ => convierte a array de keys con valor truthy
 */
function normalizeEvaluaciones(evaluacionesRaw) {
  if (Array.isArray(evaluacionesRaw)) {
    return evaluacionesRaw.filter((x) => typeof x === "string" && x.trim());
  }
  if (isObj(evaluacionesRaw)) {
    return Object.keys(evaluacionesRaw).filter((k) => Boolean(evaluacionesRaw[k]));
  }
  return [];
}

/**
 * ✅ Normaliza herramientas:
 * - si viene OBJ => ok
 * - si viene ARRAY => convierte a { key:true }
 */
function normalizeHerramientas(herramientasRaw) {
  if (isObj(herramientasRaw)) return herramientasRaw;
  if (Array.isArray(herramientasRaw)) {
    const out = {};
    for (const k of herramientasRaw) {
      if (typeof k === "string" && k.trim()) out[k.trim()] = true;
    }
    return out;
  }
  return {};
}

/**
 * ✅ Guarda el análisis en EjercicioInstancia, manteniendo compat con UI actual.
 */
function setAnalysisInInstance(inst, result, fuente = "real", replace = true) {
  const now = new Date();

  inst.analisisIA = replace ? result : { ...(inst.analisisIA || {}), ...result };
  inst.analisisGeneradoAt = now;
  inst.analisisFuente = fuente;

  inst.intentosUsados = Number(inst.intentosUsados || 0) + 1;

  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};

  // compat UI actual
  inst.respuestas.rolePlaying.analysisResult = result;
  inst.respuestas.rolePlaying.savedAt = now.toISOString();

  return inst;
}

/**
 * ✅ Resolver EjercicioInstancia:
 * - prioridad: instanciaId
 * - fallback: buscar por (estudiante + ejercicioId [+ moduloInstanciaId])
 *
 * NOTA: tu schema usa "estudiante", NO "usuario"
 *       dejamos compat con "usuario" por si tuvieras datos viejos.
 */
async function resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId }) {
  let inst = null;

  if (instanciaId) {
    inst = await EjercicioInstancia.findById(instanciaId);
    if (inst) return inst;
  }

  if (!userId || !ejercicioId) return null;

  const q = {
    ejercicio: ejercicioId,
    $or: [{ estudiante: userId }, { usuario: userId }], // compat
  };

  if (moduloInstanciaId) q.moduloInstancia = moduloInstanciaId;

  inst = await EjercicioInstancia.findOne(q).sort({ createdAt: -1, updatedAt: -1 });
  return inst;
}

/* =========================================================
   Controller
========================================================= */
module.exports.analizarRolePlayIA = async (req, res) => {
  try {
    const {
      ejercicioId,
      tipo,

      evaluaciones: evaluacionesRaw,
      herramientas: herramientasRaw,
      data,

      enfoque, // opcional

      instanciaId,
      moduloInstanciaId,
      sessionId,

      replace: replaceRaw = true,
      fuente = "real", // "real" | "mock"
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    // ===== Normalizaciones =====
    const evaluaciones = normalizeEvaluaciones(evaluacionesRaw);
    const herramientas = normalizeHerramientas(herramientasRaw);

    // ===== Validaciones mínimas =====
    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    if (tipo && tipo !== "role_play") {
      return res.status(400).json({ message: "tipo inválido (usa role_play)" });
    }

    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return res.status(400).json({
        message:
          "Falta evaluaciones. Envía array (['rapport', ...]) o un objeto ({rapport:true, ...}).",
        debug: { type: typeof evaluacionesRaw, sample: evaluacionesRaw || null },
      });
    }

    if (!isObj(herramientas) || Object.keys(herramientas).length === 0) {
      return res.status(400).json({
        message:
          "Falta herramientas. Envía objeto ({ fichaTecnica:true, ... }) o array (['fichaTecnica', ...]).",
        debug: { type: typeof herramientasRaw, sample: herramientasRaw || null },
      });
    }

    // ===== 1) Resolver instancia =====
    const userId = req.user?._id || req.user?.id || null;

    const inst = await resolveInstancia({
      instanciaId,
      ejercicioId,
      moduloInstanciaId,
      userId,
    });

    if (!inst) {
      return res.status(400).json({
        message:
          "No se encontró instancia (EjercicioInstancia). Asegura que el FE envía instanciaId (ctx.ejercicioInstanciaId).",
        debug: {
          hasReqUser: Boolean(userId),
          instanciaId: instanciaId || null,
          moduloInstanciaId: moduloInstanciaId || null,
          ejercicioId: ejercicioId || null,
        },
      });
    }

    // ===== 2) Resolver data real =====
    let resolvedData = null;

    if (isObj(data)) resolvedData = data;
    else resolvedData = extractRPDataFromInstance(inst);

    if (!isObj(resolvedData)) {
      return res.status(400).json({
        message:
          "Falta data (sessionData) o no se pudo obtener desde la instancia (EjercicioInstancia.respuestas.rolePlaying).",
      });
    }

    // ===== 3) clamp =====
    const safeData = {
      ...resolvedData,
      transcripcion: clampText(resolvedData?.transcripcion || "", 12000),
      pruebaTranscripcion: clampText(resolvedData?.pruebaTranscripcion || "", 6000),
      interpretacionPrueba: clampText(resolvedData?.interpretacionPrueba || "", 6000),
      anexos: clampText(resolvedData?.anexos || "", 6000),
      planIntervencion: clampText(resolvedData?.planIntervencion || "", 6000),
    };

    // ===== 4) Prompt =====
    const prompt = buildRolePlayPrompt({
      evaluaciones,
      herramientas,
      data: safeData,
      enfoque: enfoque || null,
    });

    // ===== 5) LLM JSON =====
    const raw = await callLLMJson({
      system:
        "Eres un supervisor clínico experto. Debes devolver SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    });

    // ===== 6) Normaliza EXACTO a lo que tu FE consume =====
    let result = normalizeAIResult(raw, { evaluaciones, herramientas, enfoque });
    result = addLabelsToResult(result, { evaluaciones, herramientas });

    // ===== 7) Persistencia =====
    setAnalysisInInstance(inst, result, fuente, replace);
    await inst.save();

    // (opcional) Guardar en Session
    if (sessionId) {
      const ses = await Session.findById(sessionId);
      if (ses) {
        ses.analisisIA = result;
        await ses.save();
      }
    }

    return res.json({
      ...result,
      _metaPersistencia: {
        instanciaId: String(inst._id),
        analisisGeneradoAt: inst.analisisGeneradoAt || null,
        analisisFuente: inst.analisisFuente || fuente,
        intentosUsados: inst.intentosUsados ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Error analizarRolePlayIA:", err);

    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Error interno del servidor";

    return res.status(500).json({ message: msg });
  }
};