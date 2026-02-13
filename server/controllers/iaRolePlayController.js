// server/controllers/iaRolePlayController.js
const EjercicioInstancia = require("../models/ejercicioInstancia"); // ajusta path si cambia
const Session = require("../models/session"); // si lo usas en otras pantallas

const {
  buildRolePlayPrompt,
  clampText,
  normalizeAIResult,
  addLabelsToResult,
  extractRPDataFromInstance,
} = require("../utils/analisisRolePlayIA");

const { callLLMJson } = require("../utils/llmClient");

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function setAnalysisInInstance(inst, result, fuente = "real", replace = true) {
  const now = new Date();

  // ✅ Fuente canónica (tu BD real)
  inst.analisisIA = replace ? result : { ...(inst.analisisIA || {}), ...result };
  inst.analisisGeneradoAt = now;
  inst.analisisFuente = fuente;

  // ✅ Contador de intentos (tu BD real)
  inst.intentosUsados = Number(inst.intentosUsados || 0) + 1;

  // ✅ Compat UI actual (tu BD real ya lo trae así)
  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};

  // Ojo: NO pisamos payload/sessionData si ya existen, solo guardamos analysisResult + savedAt
  inst.respuestas.rolePlaying.analysisResult = result;
  inst.respuestas.rolePlaying.savedAt = now.toISOString();

  return inst;
}

module.exports.analizarRolePlayIA = async (req, res) => {
  try {
    const {
      ejercicioId,
      tipo,
      evaluaciones,
      herramientas,
      data,
      enfoque,          // opcional
      instanciaId,      // opcional: si ya tienes id de EjercicioInstancia
      sessionId,        // opcional: si quieres guardarlo también en Session
      replace = true,
      fuente = "real",  // "real" o "mock" (por defecto real)
    } = req.body || {};

    // ===== Validaciones mínimas (compat con tu flujo actual) =====
    if (!ejercicioId) {
      return res.status(400).json({ message: "Falta ejercicioId" });
    }
    if (tipo && tipo !== "role_play") {
      return res.status(400).json({ message: "tipo inválido (usa role_play)" });
    }
    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return res.status(400).json({ message: "Falta evaluaciones (array)" });
    }
    if (!isObj(herramientas)) {
      return res.status(400).json({ message: "Falta herramientas (objeto)" });
    }

    // ===== 1) Resolver data real (preferir instancia si existe) =====
    let inst = null;
    if (instanciaId) {
      inst = await EjercicioInstancia.findById(instanciaId);
    }

    // data puede venir del front, pero si no viene, lo armamos desde la instancia
    let resolvedData = null;

    if (isObj(data)) {
      resolvedData = data;
    } else if (inst) {
      resolvedData = extractRPDataFromInstance(inst);
    }

    if (!isObj(resolvedData)) {
      return res.status(400).json({ message: "Falta data (sessionData) o no se pudo obtener desde instancia" });
    }

    // ===== 2) clamp para no reventar tokens =====
    const safeData = {
      ...resolvedData,
      transcripcion: clampText(resolvedData?.transcripcion || "", 12000),
      pruebaTranscripcion: clampText(resolvedData?.pruebaTranscripcion || "", 6000),
      interpretacionPrueba: clampText(resolvedData?.interpretacionPrueba || "", 6000),
      anexos: clampText(resolvedData?.anexos || "", 6000),
      planIntervencion: clampText(resolvedData?.planIntervencion || "", 6000),
    };

    // ===== 3) Prompt =====
    const prompt = buildRolePlayPrompt({
      evaluaciones,
      herramientas,
      data: safeData,
      enfoque: enfoque || null,
    });

    // ===== 4) LLM JSON =====
    const raw = await callLLMJson({
      system:
        "Eres un supervisor clínico experto. Debes devolver SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    });

    // ===== 5) Normaliza EXACTO a lo que tu FE consume =====
    let result = normalizeAIResult(raw, { evaluaciones, herramientas, enfoque });

    // ✅ Agregar labels (tu UI/BD los muestran)
    result = addLabelsToResult(result, { evaluaciones, herramientas });

    // ===== 6) Persistencia =====
    // 6.1) Guardar en EjercicioInstancia (canónico en tu flujo)
    if (inst) {
      setAnalysisInInstance(inst, result, fuente, replace);
      await inst.save();
    }

    // 6.2) (opcional) Guardar en Session para otras pantallas
    if (sessionId) {
      const ses = await Session.findById(sessionId);
      if (ses) {
        ses.analisisIA = result; // si quieres: ses.analisisIA.roleplay = result
        await ses.save();
      }
    }

    // ===== 7) Respuesta =====
    // Mantengo compat: tu FE hoy hace res.json(result)
    // pero te agrego metadatos sin romper (si no los usas, ignóralos)
    return res.json({
      ...result,
      _metaPersistencia: {
        instanciaId: inst ? String(inst._id) : null,
        analisisGeneradoAt: inst?.analisisGeneradoAt || null,
        analisisFuente: inst?.analisisFuente || fuente,
        intentosUsados: inst?.intentosUsados ?? null,
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