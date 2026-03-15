// server/controllers/iaHerramientasController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");
const Session = require("../models/session");
const { EjercicioRolePlay } = require("../models/modulo");

const {
  buildHerramientasPrompt,
  normalizeHerramientasResult,
  addLabelsToHerramientasResult,
  normalizeToolKeys,
} = require("../utils/analisisHerramientasIA");

const { callLLMJson } = require("../utils/llmClient");

function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return fallback;
}
function now() { return new Date(); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function normalizeHerramientasInput(herramientasRaw) {
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

function hasAnyEnabledTool(herramientas = {}) {
  if (!herramientas || typeof herramientas !== "object") return false;
  return Object.keys(herramientas).some((k) => herramientas[k] === true);
}

function setHerramientasInInstance(inst, evaluacionHerramientas, fuente = "real", replace = true) {
  const t = now();
  inst.evaluacionHerramientas = replace
    ? evaluacionHerramientas
    : { ...(inst.evaluacionHerramientas || {}), ...(evaluacionHerramientas || {}) };
  if (!inst.analisisFuente) inst.analisisFuente = fuente;
  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};
  inst.respuestas.rolePlaying.evaluacionHerramientas = inst.evaluacionHerramientas;
  inst.respuestas.rolePlaying.herramientasSavedAt = t.toISOString();
  if (typeof inst.markModified === "function") {
    inst.markModified("evaluacionHerramientas");
    inst.markModified("respuestas");
    inst.markModified("respuestas.rolePlaying");
    inst.markModified("respuestas.rolePlaying.evaluacionHerramientas");
    inst.markModified("respuestas.rolePlaying.herramientasSavedAt");
  }
  return inst;
}

async function resolveHerramientasConfig({ ejercicioId, herramientasRaw }) {
  let detalle = null;
  if (ejercicioId) {
    try {
      detalle = await EjercicioRolePlay.findOne({ ejercicio: ejercicioId }).select("herramientas").lean();
    } catch { detalle = null; }
  }
  const herramientasFromReq = normalizeHerramientasInput(herramientasRaw);
  const herramientasFromDb = normalizeHerramientasInput(detalle?.herramientas);
  const herramientas = hasAnyEnabledTool(herramientasFromReq)
    ? herramientasFromReq
    : hasAnyEnabledTool(herramientasFromDb)
    ? herramientasFromDb
    : {};
  return { herramientas };
}

async function resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId }) {
  if (instanciaId) {
    const inst = await EjercicioInstancia.findById(instanciaId);
    if (inst) return inst;
  }
  if (!userId || !ejercicioId) return null;
  const q = { ejercicio: ejercicioId, $or: [{ estudiante: userId }, { usuario: userId }] };
  if (moduloInstanciaId) q.moduloInstancia = moduloInstanciaId;
  return EjercicioInstancia.findOne(q).sort({ createdAt: -1, updatedAt: -1 });
}

function extractHerramientasDataFromInstance(inst) {
  const rp = inst?.respuestas?.rolePlaying || {};
  return rp?.payload || rp?.sessionData || rp?.data || rp || {};
}

async function callLLMJsonWithRetry(opts, retries = 1) {
  try { return await callLLMJson(opts); }
  catch (e) {
    if (retries <= 0) throw e;
    await sleep(1200);
    return callLLMJsonWithRetry(opts, retries - 1);
  }
}

module.exports.analizarHerramientas = async (req, res) => {
  try {
    const {
      ejercicioId,
      herramientas: herramientasRaw,
      data,
      instanciaId,
      moduloInstanciaId,
      sessionId,
      replace: replaceRaw = true,
      fuente = "real",
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const userId = req.user?._id || req.user?.id || null;

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });

    if (!inst) {
      return res.status(400).json({
        message: "No se encontró instancia (EjercicioInstancia). Asegura que el FE envía instanciaId.",
        debug: { hasReqUser: Boolean(userId), instanciaId: instanciaId || null, moduloInstanciaId: moduloInstanciaId || null, ejercicioId: ejercicioId || null },
      });
    }

    let resolvedData = isObj(data) ? data : extractHerramientasDataFromInstance(inst);

    if (!isObj(resolvedData)) {
      return res.status(400).json({ message: "Falta data (herramientas) o no se pudo obtener desde la instancia." });
    }

    const { herramientas } = await resolveHerramientasConfig({ ejercicioId, herramientasRaw });
    const toolKeys = normalizeToolKeys(herramientas);

    if (toolKeys.length === 0) {
      return res.status(400).json({ message: "No hay herramientas habilitadas para evaluar. Verifica la configuración del ejercicio." });
    }

    const prompt = buildHerramientasPrompt({ herramientas, data: resolvedData });

    const raw = await callLLMJsonWithRetry({
      system: "Eres un supervisor clínico experto en evaluación de documentos clínicos. Evalúa la calidad de los instrumentos completados por el estudiante. Devuelve SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    }, 1);

    let evaluacionHerramientas = normalizeHerramientasResult(raw, { herramientas });
    evaluacionHerramientas = addLabelsToHerramientasResult(evaluacionHerramientas, { herramientas });

    setHerramientasInInstance(inst, evaluacionHerramientas, fuente, replace);
    await inst.save();

    if (sessionId) {
      const ses = await Session.findById(sessionId);
      if (ses) {
        ses.evaluacionHerramientas = evaluacionHerramientas;
        if (typeof ses.markModified === "function") ses.markModified("evaluacionHerramientas");
        await ses.save();
      }
    }

    return res.json({
      evaluacionHerramientas,
      _metaPersistencia: {
        instanciaId: String(inst._id),
        analisisFuente: inst.analisisFuente || fuente,
        herramientasEvaluadas: toolKeys,
      },
    });
  } catch (err) {
    console.error("❌ Error analizarHerramientas:", err);
    const msg = err?.response?.data?.error?.message || err?.message || "Error interno del servidor";
    return res.status(500).json({ message: msg });
  }
};
