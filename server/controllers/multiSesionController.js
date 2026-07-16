// server/controllers/multiSesionController.js
//
// Runtime del ejercicio "Multi Sesión".
// Reutiliza EjercicioInstancia: todo el trabajo del estudiante vive en
// `respuestas = { planIntervencion, sesiones: [...], completado }`.
//
//   - planIntervencion: objeto COMPARTIDO entre sesiones (editable en cualquiera).
//   - sesiones[]: cada una con su transcripción + expediente + análisis.
//   - El estudiante decide cuándo termina (completar).

const mongoose = require("mongoose");
const ModuloInstancia    = require("../models/moduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");
const { Ejercicio, EjercicioMultiSesion } = require("../models/modulo");

/* ───────────────── helpers ───────────────── */

function newId() {
  return new mongoose.Types.ObjectId().toString();
}

function emptyExpediente() {
  return {
    fichaTecnica: {},
    historialClinico: {},
    examenMental: {},
    convergencia: {},
    hipotesis: "",
    diagnostico: {},
    pruebas: {},
    interpretacion: {},
    recomendaciones: "",
    anexos: "",
  };
}

function normalizeRespuestas(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  return {
    planIntervencion: r.planIntervencion && typeof r.planIntervencion === "object" ? r.planIntervencion : {},
    sesiones: Array.isArray(r.sesiones) ? r.sesiones : [],
    completado: Boolean(r.completado),
  };
}

async function asegurarModuloInstancia({ estudianteId, materiaId, moduloId }) {
  let modInst = await ModuloInstancia.findOne({ estudiante: estudianteId, materia: materiaId, modulo: moduloId });
  if (!modInst) {
    modInst = await ModuloInstancia.create({
      estudiante: estudianteId, materia: materiaId, modulo: moduloId,
      estado: "en_progreso", progreso: 0,
    });
  }
  return modInst;
}

// Resuelve (o crea) la EjercicioInstancia de este ejercicio Multi Sesión.
async function resolverInstancia({ estudianteId, materiaId, ejercicioId }) {
  const ejercicio = await Ejercicio.findById(ejercicioId).populate("modulo").lean();
  if (!ejercicio?._id) return { ok: false, code: 404, message: "Ejercicio no encontrado." };
  if (ejercicio.tipoEjercicio !== "Multi Sesion")
    return { ok: false, code: 400, message: "El ejercicio no es de tipo Multi Sesión." };

  const moduloId = ejercicio.modulo?._id;
  if (!moduloId) return { ok: false, code: 404, message: "Contexto del ejercicio no encontrado." };

  const modInst = await asegurarModuloInstancia({ estudianteId, materiaId, moduloId });

  let inst = await EjercicioInstancia.findOne({
    estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId,
  });
  if (!inst) {
    inst = await EjercicioInstancia.create({
      estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId,
      estado: "en_progreso", startedAt: new Date(),
      respuestas: { planIntervencion: {}, sesiones: [], completado: false },
    });
  }
  return { ok: true, ejercicio, modInst, inst };
}

function detalleConfig(det) {
  if (!det) return { herramientas: {}, praxisNivel: "nivel_1", modeloIntervencion: "", contextoSesion: "exploracion_clinica" };
  return {
    herramientas: det.herramientas || {},
    praxisNivel: det.praxisNivel || "nivel_1",
    modeloIntervencion: det.modeloIntervencion || "",
    contextoSesion: det.contextoSesion || "exploracion_clinica",
    pruebasConfig: det.pruebasConfig || {},
  };
}

/* ───────────────── endpoints ───────────────── */

/**
 * GET /estudiante/materias/:materiaId/multisesion/:ejercicioId
 * Estado completo: config (herramientas) + plan + sesiones.
 */
exports.obtenerEstado = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId) || !mongoose.Types.ObjectId.isValid(materiaId))
      return res.status(400).json({ message: "IDs inválidos." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const det = await EjercicioMultiSesion.findOne({ ejercicio: ejercicioId }).lean();
    const respuestas = normalizeRespuestas(r.inst.respuestas);

    return res.json({
      ejercicio: { _id: r.ejercicio._id, titulo: r.ejercicio.titulo, tipoEjercicio: r.ejercicio.tipoEjercicio },
      config: detalleConfig(det),
      instanciaId: r.inst._id,
      planIntervencion: respuestas.planIntervencion,
      sesiones: respuestas.sesiones,
      completado: respuestas.completado,
    });
  } catch (e) {
    console.error("❌ multisesion obtenerEstado:", e);
    return res.status(500).json({ message: e?.message || "Error al obtener el estado." });
  }
};

/**
 * POST /estudiante/materias/:materiaId/multisesion/:ejercicioId/sesion
 * Crea una nueva sesión (vacía). Devuelve la sesión creada.
 */
exports.crearSesion = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;
    const { titulo } = req.body || {};
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const respuestas = normalizeRespuestas(r.inst.respuestas);
    if (respuestas.completado) return res.status(409).json({ message: "El ejercicio ya está completado." });

    const orden = respuestas.sesiones.length + 1;
    const sesion = {
      _id: newId(),
      orden,
      titulo: (titulo && String(titulo).trim()) || `Sesión ${orden}`,
      transcripcion: "",
      expediente: emptyExpediente(),
      analisisIA: null,
      evaluacionHerramientas: null,
      analisisPlan: null,
      estado: "en_progreso",
      createdAt: new Date(),
    };
    respuestas.sesiones.push(sesion);

    r.inst.respuestas = respuestas;
    r.inst.markModified("respuestas");
    await r.inst.save();

    return res.status(201).json({ sesion, sesiones: respuestas.sesiones });
  } catch (e) {
    console.error("❌ multisesion crearSesion:", e);
    return res.status(500).json({ message: e?.message || "Error al crear la sesión." });
  }
};

/**
 * DELETE /estudiante/materias/:materiaId/multisesion/:ejercicioId/sesion/:sesionId
 * Borra una sesión y re-numera el resto.
 */
exports.eliminarSesion = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId, sesionId } = req.params;
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const respuestas = normalizeRespuestas(r.inst.respuestas);
    if (respuestas.completado) return res.status(409).json({ message: "El ejercicio ya está completado." });

    const antes = respuestas.sesiones.length;
    respuestas.sesiones = respuestas.sesiones.filter((s) => String(s._id) !== String(sesionId));
    if (respuestas.sesiones.length === antes)
      return res.status(404).json({ message: "Sesión no encontrada." });

    // re-numerar
    respuestas.sesiones = respuestas.sesiones.map((s, i) => ({ ...s, orden: i + 1 }));

    r.inst.respuestas = respuestas;
    r.inst.markModified("respuestas");
    await r.inst.save();

    return res.json({ ok: true, sesiones: respuestas.sesiones });
  } catch (e) {
    console.error("❌ multisesion eliminarSesion:", e);
    return res.status(500).json({ message: e?.message || "Error al eliminar la sesión." });
  }
};

/**
 * PUT /estudiante/materias/:materiaId/multisesion/:ejercicioId/sesion/:sesionId
 * Guarda datos de una sesión: transcripcion, expediente (parcial),
 * y opcionalmente análisis (analisisIA, evaluacionHerramientas, analisisPlan).
 */
exports.guardarSesion = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId, sesionId } = req.params;
    const { titulo, transcripcion, expediente, analisisIA, evaluacionHerramientas, analisisPlan, estado } = req.body || {};
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const respuestas = normalizeRespuestas(r.inst.respuestas);
    if (respuestas.completado) return res.status(409).json({ message: "El ejercicio ya está completado." });

    const idx = respuestas.sesiones.findIndex((s) => String(s._id) === String(sesionId));
    if (idx < 0) return res.status(404).json({ message: "Sesión no encontrada." });

    const ses = { ...respuestas.sesiones[idx] };
    if (titulo !== undefined)                 ses.titulo = String(titulo).trim() || ses.titulo;
    if (transcripcion !== undefined)          ses.transcripcion = String(transcripcion || "");
    if (expediente && typeof expediente === "object")
      ses.expediente = { ...(ses.expediente || {}), ...expediente };
    if (analisisIA !== undefined)             ses.analisisIA = analisisIA;
    if (evaluacionHerramientas !== undefined) ses.evaluacionHerramientas = evaluacionHerramientas;
    if (analisisPlan !== undefined)           ses.analisisPlan = analisisPlan;
    if (estado !== undefined)                 ses.estado = String(estado);
    ses.updatedAt = new Date();

    respuestas.sesiones[idx] = ses;
    r.inst.respuestas = respuestas;
    r.inst.markModified("respuestas");
    await r.inst.save();

    return res.json({ ok: true, sesion: ses });
  } catch (e) {
    console.error("❌ multisesion guardarSesion:", e);
    return res.status(500).json({ message: e?.message || "Error al guardar la sesión." });
  }
};

/**
 * PUT /estudiante/materias/:materiaId/multisesion/:ejercicioId/plan
 * Guarda el plan de intervención COMPARTIDO (editable desde cualquier sesión).
 */
exports.guardarPlan = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;
    const { planIntervencion } = req.body || {};
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const respuestas = normalizeRespuestas(r.inst.respuestas);
    if (respuestas.completado) return res.status(409).json({ message: "El ejercicio ya está completado." });

    respuestas.planIntervencion = planIntervencion && typeof planIntervencion === "object" ? planIntervencion : {};
    r.inst.respuestas = respuestas;
    r.inst.markModified("respuestas");
    await r.inst.save();

    return res.json({ ok: true, planIntervencion: respuestas.planIntervencion });
  } catch (e) {
    console.error("❌ multisesion guardarPlan:", e);
    return res.status(500).json({ message: e?.message || "Error al guardar el plan." });
  }
};

/**
 * POST /estudiante/materias/:materiaId/multisesion/:ejercicioId/completar
 * Marca el ejercicio como completado (lo decide el estudiante) y avanza el módulo.
 */
exports.completar = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const r = await resolverInstancia({ estudianteId, materiaId, ejercicioId });
    if (!r.ok) return res.status(r.code).json({ message: r.message });

    const respuestas = normalizeRespuestas(r.inst.respuestas);
    respuestas.completado = true;

    r.inst.respuestas = respuestas;
    r.inst.markModified("respuestas");
    r.inst.estado = "completado";
    r.inst.completedAt = new Date();
    await r.inst.save();

    // Desbloquear el siguiente ejercicio del módulo (orden por createdAt)
    try {
      const lista = await Ejercicio.find({ modulo: r.ejercicio.modulo._id })
        .select("_id createdAt").sort({ createdAt: 1 }).lean();
      const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
      const next = lista[idx + 1];
      if (next) {
        const nextInst = await EjercicioInstancia.findOne({
          estudiante: estudianteId, moduloInstancia: r.modInst._id, ejercicio: next._id,
        });
        if (!nextInst) {
          await EjercicioInstancia.create({
            estudiante: estudianteId, moduloInstancia: r.modInst._id, ejercicio: next._id, estado: "pendiente",
          });
        } else if (String(nextInst.estado).toLowerCase() === "bloqueado") {
          nextInst.estado = "pendiente";
          await nextInst.save();
        }
      }
    } catch (e) {
      console.warn("⚠️ multisesion: no se pudo desbloquear el siguiente ejercicio:", e?.message);
    }

    return res.json({ ok: true, completado: true });
  } catch (e) {
    console.error("❌ multisesion completar:", e);
    return res.status(500).json({ message: e?.message || "Error al completar el ejercicio." });
  }
};
