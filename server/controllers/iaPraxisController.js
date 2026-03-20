// server/controllers/iaPraxisController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");
const Session = require("../models/session");
const { EjercicioRolePlay } = require("../models/modulo");

const {
  buildPraxisPrompt,
  clampText,
  normalizePraxisResult,
  addLabelsToPraxisResult,
  extractRPDataFromInstance,
  normalizePraxisNivel,
  normalizeModeloIntervencion,
  normalizeContextoSesion,
} = require("../utils/analisisPraxisIA");

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
function safeStr(v, fallback = "") {
  if (typeof v === "string") return v;
  if (v == null) return fallback;
  return String(v);
}
function now() { return new Date(); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function setPraxisInInstance(inst, analisisIA, fuente = "real", replace = true) {
  const t = now();
  inst.analisisIA = replace ? analisisIA : { ...(inst.analisisIA || {}), ...(analisisIA || {}) };
  inst.analisisGeneradoAt = t;
  inst.analisisFuente = fuente;
  inst.intentosUsados = Number(inst.intentosUsados || 0) + 1;
  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};
  inst.respuestas.rolePlaying.analisisIA = inst.analisisIA;
  inst.respuestas.rolePlaying.savedAt = t.toISOString();
  if (typeof inst.markModified === "function") {
    inst.markModified("analisisIA");
    inst.markModified("respuestas");
    inst.markModified("respuestas.rolePlaying");
    inst.markModified("respuestas.rolePlaying.analisisIA");
    inst.markModified("respuestas.rolePlaying.savedAt");
  }
  return inst;
}

// BD tiene prioridad sobre el body. Body es solo fallback.
async function resolvePraxisConfig({
  ejercicioId,
  praxisNivelRaw,
  modeloIntervencionRaw,
  enfoqueRaw,
  contextoSesionRaw,
}) {
  let detalle = null;
  if (ejercicioId) {
    try {
      detalle = await EjercicioRolePlay.findOne({ ejercicio: ejercicioId })
        .select("praxisNivel modeloIntervencion contextoSesion")
        .lean();
    } catch {
      detalle = null;
    }
  }
  return {
    praxisNivel: normalizePraxisNivel(detalle?.praxisNivel || praxisNivelRaw || "nivel_1"),
    modeloIntervencion: normalizeModeloIntervencion(
      detalle?.modeloIntervencion || modeloIntervencionRaw || enfoqueRaw || ""
    ),
    contextoSesion: normalizeContextoSesion(
      detalle?.contextoSesion || contextoSesionRaw || "exploracion_clinica"
    ),
  };
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
  return EjercicioInstancia.findOne(q).sort({ createdAt: -1, updatedAt: -1 });
}

// contextoSesion siempre viene del valor resuelto (BD > body).
// Nunca se lee desde resolvedData.
function buildSafePraxisData(resolvedData = {}, contextoSesion = "exploracion_clinica") {
  return {
    transcripcion: clampText(
      resolvedData?.transcripcion ||
        resolvedData?.transcription ||
        resolvedData?.textoTranscripcion ||
        "",
      12000
    ),
    transcripcionDiarizada:
      resolvedData?.transcripcionDiarizada ||
      resolvedData?.diarizacion ||
      resolvedData?.turnosDiarizados ||
      null,
    tipoRole: resolvedData?.tipoRole || "",
    trastorno: resolvedData?.trastorno || "",
    consentimiento: resolvedData?.consentimiento || false,
    tipoConsentimiento: resolvedData?.tipoConsentimiento || "",
    contextoSesion,
  };
}

async function callLLMJsonWithRetry(opts, retries = 1) {
  try {
    return await callLLMJson(opts);
  } catch (e) {
    if (retries <= 0) throw e;
    await sleep(1200);
    return callLLMJsonWithRetry(opts, retries - 1);
  }
}

module.exports.analizarPraxis = async (req, res) => {
  try {
    const {
      ejercicioId,
      praxisNivel: praxisNivelRaw,
      modeloIntervencion: modeloIntervencionRaw,
      contextoSesion: contextoSesionRaw,
      enfoque,
      data,
      instanciaId,
      moduloInstanciaId,
      sessionId,
      replace: replaceRaw = true,
      fuente = "real",
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    if (!ejercicioId)
      return res.status(400).json({ message: "Falta ejercicioId" });

    const userId = req.user?._id || req.user?.id || null;

    // 1. Resolver instancia
    const inst = await resolveInstancia({
      instanciaId,
      ejercicioId,
      moduloInstanciaId,
      userId,
    });

    if (!inst) {
      return res.status(400).json({
        message:
          "No se encontró instancia (EjercicioInstancia). Asegura que el FE envía instanciaId.",
        debug: {
          hasReqUser: Boolean(userId),
          instanciaId: instanciaId || null,
          moduloInstanciaId: moduloInstanciaId || null,
          ejercicioId: ejercicioId || null,
        },
      });
    }

    // 2. Resolver datos de sesión
    let resolvedData = isObj(data) ? data : extractRPDataFromInstance(inst);

    if (!isObj(resolvedData)) {
      return res.status(400).json({
        message: "Falta data (sessionData) o no se pudo obtener desde la instancia.",
      });
    }

    const transcripcion =
      resolvedData?.transcripcion ||
      resolvedData?.transcription ||
      resolvedData?.textoTranscripcion ||
      "";
    if (!safeStr(transcripcion, "").trim()) {
      return res.status(400).json({
        message:
          "No hay transcripción disponible para evaluar con PRAXIS. Completa la sesión primero.",
      });
    }

    // 3. Resolver configuración PRAXIS desde BD (BD > body)
    const { praxisNivel, modeloIntervencion, contextoSesion } =
      await resolvePraxisConfig({
        ejercicioId,
        praxisNivelRaw,
        modeloIntervencionRaw,
        enfoqueRaw: enfoque,
        contextoSesionRaw,
      });

    // 4. Construir prompt: BASE_PROMPT + NIVEL_PROMPT
    const prompt = buildPraxisPrompt({
      praxisNivel,
      modeloIntervencion,
      data: buildSafePraxisData(resolvedData, contextoSesion),
    });

    // 5. Llamar a la IA
    const raw = await callLLMJsonWithRetry(
      {
        system:
          "Eres un supervisor clínico experto en entrenamiento formativo. Evalúa la intervención terapéutica usando la metodología PRAXIS-TH. Devuelve SOLO JSON válido, sin texto adicional.",
        prompt,
        model: process.env.AI_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
      },
      1
    );

    // 6. Normalizar con el mismo contextoSesion resuelto
    let analisisIA = normalizePraxisResult(raw, {
      praxisNivel,
      modeloIntervencion,
      contextoSesion,
    });
    analisisIA = addLabelsToPraxisResult(analisisIA, { praxisNivel, contextoSesion });

    // 7. Persistir en instancia
    setPraxisInInstance(inst, analisisIA, fuente, replace);
    await inst.save();

    // 8. Persistir en sesión si se proporcionó sessionId
    if (sessionId) {
      const ses = await Session.findById(sessionId);
      if (ses) {
        ses.analisisIA = analisisIA;
        if (typeof ses.markModified === "function") ses.markModified("analisisIA");
        await ses.save();
      }
    }

    return res.json({
      analisisIA,
      _metaPersistencia: {
        instanciaId: String(inst._id),
        analisisGeneradoAt: inst.analisisGeneradoAt || null,
        analisisFuente: inst.analisisFuente || fuente,
        intentosUsados: inst.intentosUsados ?? null,
        praxisNivel,
        modeloIntervencion,
        contextoSesion,
      },
    });
  } catch (err) {
    console.error("❌ Error analizarPraxis:", err);
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Error interno del servidor";
    return res.status(500).json({ message: msg });
  }
};
