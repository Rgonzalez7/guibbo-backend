// server/controllers/ProfesorEvaluacionController.js
const mongoose = require("mongoose");
const Materia = require("../models/materia");
const User = require("../models/user");
const { Modulo, Submodulo, Ejercicio } = require("../models/modulo");
const EjercicioInstancia = require("../models/ejercicioInstancia");
const ModuloInstancia = require("../models/moduloInstancia");

function asId(v) {
  try {
    return new mongoose.Types.ObjectId(String(v));
  } catch {
    return null;
  }
}

/* =========================================================
   LISTAR MÓDULOS DEL CURSO (PROFESOR)
   GET /profesor/evaluacion/curso/:cursoId/modulos
   ========================================================= */
exports.listarModulosCursoProfesor = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidCurso = asId(cursoId);
    if (!oidCurso) return res.status(400).json({ message: "cursoId inválido" });

    const materia = await Materia.findById(oidCurso).lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a este curso." });
    }

    const idsGlobales = Array.isArray(materia.modulosGlobales)
      ? materia.modulosGlobales.map(String)
      : [];
    const idsLocales = Array.isArray(materia.modulosLocales)
      ? materia.modulosLocales.map(String)
      : [];

    const moduloIds = [...new Set([...idsGlobales, ...idsLocales])];

    if (moduloIds.length === 0) {
      return res.json({
        curso: {
          id: String(materia._id),
          materia: materia.nombre || "Curso",
          grupo: materia.grupo || "—",
          nrc: materia.codigo || "—",
          periodo: materia.periodoAcademico || "—",
        },
        modulos: [],
      });
    }

    const modulosDb = await Modulo.find({ _id: { $in: moduloIds } })
      .select("titulo descripcion esGlobal")
      .lean();

    const modulos = (modulosDb || []).map((m) => ({
      id: String(m._id),
      nombre: m.titulo || "—",
      descripcion: m.descripcion || "—",
      esGlobal: !!m.esGlobal,
    }));

    return res.json({
      curso: {
        id: String(materia._id),
        materia: materia.nombre || "Curso",
        grupo: materia.grupo || "—",
        nrc: materia.codigo || "—",
        periodo: materia.periodoAcademico || "—",
      },
      modulos,
    });
  } catch (err) {
    console.error("[listarModulosCursoProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   LISTAR ENTREGAS DEL MÓDULO (ALUMNOS)
   GET /profesor/evaluacion/curso/:cursoId/modulo/:moduloId/entregas
   ========================================================= */
exports.listarEntregasModuloProfesor = async (req, res) => {
  try {
    const { cursoId, moduloId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidCurso = asId(cursoId);
    const oidModulo = asId(moduloId);
    if (!oidCurso) return res.status(400).json({ message: "cursoId inválido" });
    if (!oidModulo) return res.status(400).json({ message: "moduloId inválido" });

    const materia = await Materia.findById(oidCurso).lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a este curso." });
    }

    const modulo = await Modulo.findById(oidModulo).select("titulo").lean();
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado" });

    // ✅ Fuente real: estudiantes asignados al módulo
    const modInst = await ModuloInstancia.find({
      materia: oidCurso,
      modulo: oidModulo,
    })
      .select("estudiante estado fechaInicio fechaFinalizacion updatedAt createdAt")
      .lean();

    const estudianteIds = (modInst || []).map((x) => x.estudiante);

    if (!estudianteIds.length) {
      return res.json({
        curso: {
          id: String(materia._id),
          materia: materia.nombre || "Curso",
          grupo: materia.grupo || "—",
          nrc: materia.codigo || "—",
          periodo: materia.periodoAcademico || "—",
        },
        modulo: { id: String(modulo._id), nombre: modulo.titulo || "Módulo" },
        alumnos: [],
        debug: {
          moduloInstancias: 0,
          hint:
            "No hay ModuloInstancia para este curso+modulo. Revisá que al asignar módulos estés creando ModuloInstancia.",
        },
      });
    }

    const alumnosDb = await User.find({ _id: { $in: estudianteIds } })
      .select("nombre email")
      .lean();

    const estadoModuloPorEst = new Map();
    const ultimaModuloPorEst = new Map();

    for (const mi of modInst) {
      const sid = String(mi.estudiante);
      estadoModuloPorEst.set(sid, mi.estado || "pendiente");

      const d = mi.fechaFinalizacion || mi.fechaInicio || mi.updatedAt || mi.createdAt || null;
      if (d) {
        const dt = new Date(d);
        const prev = ultimaModuloPorEst.get(sid);
        if (!prev || dt > prev) ultimaModuloPorEst.set(sid, dt);
      }
    }

    // (Opcional) Calificación/Intentos/Última desde EjercicioInstancia
    const submodulos = await Submodulo.find({ modulo: oidModulo }).select("_id").lean();
    const subIds = submodulos.map((s) => s._id);

    const ejercicios = subIds.length
      ? await Ejercicio.find({ submodulo: { $in: subIds } }).select("_id").lean()
      : [];
    const ejercicioIds = ejercicios.map((e) => e._id);

    let instancias = [];
    if (ejercicioIds.length) {
      instancias = await EjercicioInstancia.find({
        estudiante: { $in: estudianteIds },
        ejercicio: { $in: ejercicioIds },
      })
        .select("estudiante calificacion calificacionFinal intentosUsados updatedAt completedAt createdAt")
        .lean();
    }

    const aggMap = new Map(); // estudianteId -> { califs:[], califsFinal:[], intentos, ultima }
    for (const it of instancias) {
      const sid = String(it.estudiante);
      if (!aggMap.has(sid))
        aggMap.set(sid, { califs: [], califsFinal: [], intentos: 0, ultima: null });

      const agg = aggMap.get(sid);

      if (Number.isFinite(it.calificacion)) agg.califs.push(it.calificacion);
      if (Number.isFinite(it.calificacionFinal)) agg.califsFinal.push(it.calificacionFinal);

      agg.intentos += Number.isFinite(it.intentosUsados) ? it.intentosUsados : 0;

      const d = it.completedAt || it.updatedAt || it.createdAt || null;
      if (d) {
        const dt = new Date(d);
        if (!agg.ultima || dt > agg.ultima) agg.ultima = dt;
      }
    }

    const alumnos = (alumnosDb || []).map((u) => {
      const sid = String(u._id);
      const estado = estadoModuloPorEst.get(sid) || "pendiente";

      const agg = aggMap.get(sid);

      // ✅ Prioridad: calificacionFinal (si existe), si no, calificacion
      let calificacion = null;
      if (agg?.califsFinal?.length) {
        const sum = agg.califsFinal.reduce((a, b) => a + b, 0);
        calificacion = Math.round((sum / agg.califsFinal.length) * 10) / 10;
      } else if (agg?.califs?.length) {
        const sum = agg.califs.reduce((a, b) => a + b, 0);
        calificacion = Math.round((sum / agg.califs.length) * 10) / 10;
      }

      const ultimaDate = agg?.ultima || ultimaModuloPorEst.get(sid) || null;
      const ultima = ultimaDate ? ultimaDate.toISOString().slice(0, 10) : "—";

      return {
        id: sid,
        nombre: u.nombre || "—",
        correo: u.email || "—",
        estado,
        calificacion,
        intentos: agg?.intentos || 0,
        ultima,
      };
    });

    return res.json({
      curso: {
        id: String(materia._id),
        materia: materia.nombre || "Curso",
        grupo: materia.grupo || "—",
        nrc: materia.codigo || "—",
        periodo: materia.periodoAcademico || "—",
      },
      modulo: { id: String(modulo._id), nombre: modulo.titulo || "Módulo" },
      alumnos,
      debug: {
        moduloInstancias: modInst.length,
        ejercicios: ejercicioIds.length,
        ejercicioInstancias: instancias.length,
      },
    });
  } catch (err) {
    console.error("[listarEntregasModuloProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   DETALLE DE EVALUACIÓN (SUBMÓDULOS + EJERCICIOS + INSTANCIA)
   GET /profesor/evaluacion/curso/:cursoId/modulo/:moduloId/estudiante/:estudianteId/detalle
   ========================================================= */
exports.obtenerDetalleEvaluacionProfesor = async (req, res) => {
  try {
    const { cursoId, moduloId, estudianteId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidCurso = asId(cursoId);
    const oidModulo = asId(moduloId);
    const oidEst = asId(estudianteId);

    if (!oidCurso) return res.status(400).json({ message: "cursoId inválido" });
    if (!oidModulo) return res.status(400).json({ message: "moduloId inválido" });
    if (!oidEst) return res.status(400).json({ message: "estudianteId inválido" });

    const materia = await Materia.findById(oidCurso).lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a este curso." });
    }

    const modulo = await Modulo.findById(oidModulo).select("titulo").lean();
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado" });

    const est = await User.findById(oidEst).select("nombre email").lean();
    if (!est) return res.status(404).json({ message: "Estudiante no encontrado" });

    const modInst = await ModuloInstancia.findOne({
      estudiante: oidEst,
      materia: oidCurso,
      modulo: oidModulo,
    })
      .select("_id estado progreso fechaAsignacion fechaInicio fechaFinalizacion createdAt updatedAt")
      .lean();

    if (!modInst?._id) {
      return res.json({
        curso: {
          id: String(materia._id),
          materia: materia.nombre || "Curso",
          grupo: materia.grupo || "—",
          nrc: materia.codigo || "—",
          periodo: materia.periodoAcademico || "—",
        },
        modulo: { id: String(modulo._id), nombre: modulo.titulo || "Módulo" },
        estudiante: { id: String(est._id), nombre: est.nombre || "—", correo: est.email || "—" },
        submodulos: [],
        debug: { hint: "No existe ModuloInstancia para este estudiante en este curso+modulo." },
      });
    }

    const submods = await Submodulo.find({ modulo: oidModulo })
      .select("_id titulo orden")
      .sort({ orden: 1, createdAt: 1 })
      .lean();

    const subIds = submods.map((s) => s._id);

    const ejercicios = subIds.length
      ? await Ejercicio.find({ submodulo: { $in: subIds } })
          .select("_id titulo tipoEjercicio submodulo orden")
          .sort({ orden: 1, createdAt: 1 })
          .lean()
      : [];

    const ejercicioIds = ejercicios.map((e) => e._id);

    const instancias = ejercicioIds.length
      ? await EjercicioInstancia.find({
          moduloInstancia: modInst._id,
          ejercicio: { $in: ejercicioIds },
          estudiante: oidEst,
        })
          .select(
            "_id ejercicio estado respuestas calificacion calificacionFinal evaluacionInformeScores feedback analisisIA analisisGeneradoAt analisisFuente intentosUsados startedAt tiempoAcumuladoSeg completedAt createdAt updatedAt"
          )
          .lean()
      : [];

    const instMap = new Map();
    for (const i of instancias) instMap.set(String(i.ejercicio), i);

    const ejerciciosPorSub = new Map();
    for (const e of ejercicios) {
      const sid = String(e.submodulo);
      if (!ejerciciosPorSub.has(sid)) ejerciciosPorSub.set(sid, []);
      const inst = instMap.get(String(e._id)) || null;

      ejerciciosPorSub.get(sid).push({
        id: String(e._id),
        titulo: e.titulo || "Ejercicio",
        tipoEjercicio: e.tipoEjercicio || "—",
        instancia: inst
          ? {
              id: String(inst._id),
              estado: inst.estado,
              respuestas: inst.respuestas || {},
              calificacion: inst.calificacion ?? null,
              calificacionFinal: inst.calificacionFinal ?? null,
              evaluacionInformeScores: inst.evaluacionInformeScores ?? null,
              feedback: inst.feedback || "",
              analisisIA: inst.analisisIA ?? null,
              analisisGeneradoAt: inst.analisisGeneradoAt ?? null,
              analisisFuente: inst.analisisFuente || "unknown",
              intentosUsados: inst.intentosUsados ?? 0,
              startedAt: inst.startedAt ?? null,
              tiempoAcumuladoSeg: inst.tiempoAcumuladoSeg ?? 0,
              completedAt: inst.completedAt ?? null,
              createdAt: inst.createdAt,
              updatedAt: inst.updatedAt,
            }
          : {
              id: null,
              estado: "pendiente",
              respuestas: {},
              calificacion: null,
              calificacionFinal: null,
              evaluacionInformeScores: null,
              feedback: "",
              analisisIA: null,
              analisisGeneradoAt: null,
              analisisFuente: "unknown",
              intentosUsados: 0,
              startedAt: null,
              tiempoAcumuladoSeg: 0,
              completedAt: null,
              createdAt: null,
              updatedAt: null,
            },
      });
    }

    const submodulosOut = (submods || []).map((s) => ({
      id: String(s._id),
      nombre: s.titulo || "Submódulo",
      ejercicios: ejerciciosPorSub.get(String(s._id)) || [],
    }));

    return res.json({
      curso: {
        id: String(materia._id),
        materia: materia.nombre || "Curso",
        grupo: materia.grupo || "—",
        nrc: materia.codigo || "—",
        periodo: materia.periodoAcademico || "—",
      },
      modulo: { id: String(modulo._id), nombre: modulo.titulo || "Módulo" },
      estudiante: {
        id: String(est._id),
        nombre: est.nombre || "—",
        correo: est.email || "—",
      },
      submodulos: submodulosOut,
      debug: {
        moduloInstanciaId: String(modInst._id),
        submodulos: submods.length,
        ejercicios: ejercicios.length,
        ejercicioInstancias: instancias.length,
      },
    });
  } catch (err) {
    console.error("[obtenerDetalleEvaluacionProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   ✅ CAMBIO: GUARDAR SOLO COMENTARIO (feedback)
   POST /profesor/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/feedback
   Body: { feedback: string }
   - Ya NO guardamos nota
   - Solo se guarda en EjercicioInstancia.feedback
   ========================================================= */
exports.guardarFeedbackEjercicioProfesor = async (req, res) => {
  try {
    const { ejercicioInstanciaId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidEI = asId(ejercicioInstanciaId);
    if (!oidEI) return res.status(400).json({ message: "ejercicioInstanciaId inválido" });

    const { feedback } = req.body || {};
    const nextFb = typeof feedback === "string" ? feedback : "";

    const inst = await EjercicioInstancia.findById(oidEI).lean();
    if (!inst) return res.status(404).json({ message: "EjercicioInstancia no encontrada" });

    // validar acceso: el profesor debe ser dueño de la materia del moduloInstancia
    const mi = await ModuloInstancia.findById(inst.moduloInstancia).select("materia").lean();
    if (!mi?.materia) return res.status(400).json({ message: "ModuloInstancia inválida" });

    const materia = await Materia.findById(mi.materia).select("profesor").lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a esta evaluación." });
    }

    const updated = await EjercicioInstancia.findByIdAndUpdate(
      oidEI,
      { $set: { feedback: nextFb } },
      { new: true }
    ).select("_id feedback updatedAt");

    return res.json({
      ok: true,
      instancia: {
        id: String(updated._id),
        feedback: updated.feedback || "",
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("[guardarFeedbackEjercicioProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   MARCAR PARA REHACER (volver a en_progreso)
   POST /profesor/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/rehacer
   ========================================================= */
exports.marcarRehacerEjercicioProfesor = async (req, res) => {
  try {
    const { ejercicioInstanciaId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidEI = asId(ejercicioInstanciaId);
    if (!oidEI) return res.status(400).json({ message: "ejercicioInstanciaId inválido" });

    const inst = await EjercicioInstancia.findById(oidEI).lean();
    if (!inst) return res.status(404).json({ message: "EjercicioInstancia no encontrada" });

    const mi = await ModuloInstancia.findById(inst.moduloInstancia).select("materia").lean();
    if (!mi?.materia) return res.status(400).json({ message: "ModuloInstancia inválida" });

    const materia = await Materia.findById(mi.materia).select("profesor").lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a esta evaluación." });
    }

    const updated = await EjercicioInstancia.findByIdAndUpdate(
      oidEI,
      {
        $set: {
          estado: "en_progreso",
          completedAt: null,
          startedAt: null,
        },
      },
      { new: true }
    ).select("_id estado completedAt updatedAt");

    return res.json({
      ok: true,
      instancia: {
        id: String(updated._id),
        estado: updated.estado,
        completedAt: updated.completedAt ?? null,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("[marcarRehacerEjercicioProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   GUARDAR CALIFICACIÓN FINAL (promedio 0-100) + SCORES
   POST /profesor/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/calificacion-final
   Body: { calificacionFinal: number|null, evaluacionInformeScores: object|null }
   ========================================================= */
exports.guardarCalificacionFinalEjercicioProfesor = async (req, res) => {
  try {
    const { ejercicioInstanciaId } = req.params;
    const profesorId = req.user?.id || req.user?._id;

    const oidEI = asId(ejercicioInstanciaId);
    if (!oidEI) return res.status(400).json({ message: "ejercicioInstanciaId inválido" });

    const { calificacionFinal, evaluacionInformeScores } = req.body || {};

    const inst = await EjercicioInstancia.findById(oidEI).lean();
    if (!inst) return res.status(404).json({ message: "EjercicioInstancia no encontrada" });

    const mi = await ModuloInstancia.findById(inst.moduloInstancia).select("materia").lean();
    if (!mi?.materia) return res.status(400).json({ message: "ModuloInstancia inválida" });

    const materia = await Materia.findById(mi.materia).select("profesor").lean();
    if (!materia) return res.status(404).json({ message: "Curso no encontrado" });

    if (String(materia.profesor) !== String(profesorId)) {
      return res.status(403).json({ message: "No tenés acceso a esta evaluación." });
    }

    const nextFinal = Number.isFinite(Number(calificacionFinal)) ? Number(calificacionFinal) : null;
    const nextScores =
      evaluacionInformeScores && typeof evaluacionInformeScores === "object"
        ? evaluacionInformeScores
        : null;

    const updated = await EjercicioInstancia.findByIdAndUpdate(
      oidEI,
      {
        $set: {
          calificacionFinal: nextFinal,
          evaluacionInformeScores: nextScores,
        },
      },
      { new: true }
    ).select("_id calificacionFinal evaluacionInformeScores updatedAt");

    return res.json({
      ok: true,
      instancia: {
        id: String(updated._id),
        calificacionFinal: updated.calificacionFinal ?? null,
        evaluacionInformeScores: updated.evaluacionInformeScores ?? null,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("[guardarCalificacionFinalEjercicioProfesor] error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};