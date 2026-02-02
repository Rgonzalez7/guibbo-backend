// server/controllers/ProfesorMateriaController.js
const mongoose = require("mongoose");
const Materia = require("../models/materia");
const ModuloInstancia = require("../models/moduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");
const User = require("../models/user");
const { Modulo, Submodulo, Ejercicio } = require("../models/modulo");

function isObjectId(v) {
  return mongoose.Types.ObjectId.isValid(String(v));
}

const listarMateriasProfesor = async (req, res) => {
  try {
    const profesorId = req.user?.id || req.user?._id;

    if (!profesorId) return res.status(401).json({ message: "No autorizado" });

    const materias = await Materia.find({
      profesor: profesorId,
      estado: "activo",
    })
      .select("nombre grupo codigo periodoAcademico estudiantes universidad")
      .sort({ createdAt: -1 })
      .lean();

    const cursos = materias.map((m) => ({
      id: String(m._id),
      materia: m.nombre,
      grupo: m.grupo || "—",
      nrc: m.codigo || "—",
      periodo: m.periodoAcademico || "—",
      estudiantes: Array.isArray(m.estudiantes) ? m.estudiantes.length : 0,
      universidad: m.universidad,
    }));

    return res.json({ cursos });
  } catch (error) {
    console.error("[ProfesorMateriaController:listarMateriasProfesor]", error);
    return res.status(500).json({ message: "Error al obtener las materias del profesor" });
  }
};

const obtenerRendimientoGeneralProfesor = async (req, res) => {
  try {
    const profesorId = req.user?.id || req.user?._id;
    if (!profesorId) return res.status(401).json({ message: "No autorizado" });

    const materias = await Materia.find({ profesor: profesorId, estado: "activo" })
      .select("_id nombre")
      .lean();

    const materiaIds = materias.map((m) => m._id);

    if (!materiaIds.length) {
      return res.json({
        general: { promedio: null, promedioRedondeado: null, ejerciciosConsiderados: 0 },
        porMateria: [],
        porModulo: [],
        porSubmodulo: [],
        meta: { materias: 0, modulosConsiderados: 0, submodulosConsiderados: 0, ejerciciosConsiderados: 0 },
      });
    }

    const ejerciciosInstCol = EjercicioInstancia.collection.name;
    const ejerciciosCol = Ejercicio.collection.name;
    const submodulosCol = Submodulo.collection.name;
    const modulosCol = Modulo.collection.name;
    const materiasCol = Materia.collection.name;

    const rows = await ModuloInstancia.aggregate([
      { $match: { materia: { $in: materiaIds } } },

      {
        $lookup: {
          from: ejerciciosInstCol,
          let: { miId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$moduloInstancia", "$$miId"] } } },
            { $match: { calificacion: { $ne: null } } },
            { $project: { calificacion: 1, ejercicio: 1 } },
          ],
          as: "ejInst",
        },
      },
      { $unwind: { path: "$ejInst", preserveNullAndEmptyArrays: false } },

      {
        $lookup: {
          from: ejerciciosCol,
          localField: "ejInst.ejercicio",
          foreignField: "_id",
          as: "ejCat",
        },
      },
      { $unwind: { path: "$ejCat", preserveNullAndEmptyArrays: false } },

      {
        $lookup: {
          from: submodulosCol,
          localField: "ejCat.submodulo",
          foreignField: "_id",
          as: "sub",
        },
      },
      { $unwind: { path: "$sub", preserveNullAndEmptyArrays: false } },

      {
        $lookup: {
          from: modulosCol,
          localField: "sub.modulo",
          foreignField: "_id",
          as: "mod",
        },
      },
      { $unwind: { path: "$mod", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: materiasCol,
          localField: "materia",
          foreignField: "_id",
          as: "mat",
        },
      },
      { $unwind: { path: "$mat", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          materiaId: "$materia",
          materiaNombre: { $ifNull: ["$mat.nombre", "—"] },

          moduloId: "$sub.modulo",
          moduloNombre: { $ifNull: ["$mod.titulo", "—"] },

          submoduloId: "$ejCat.submodulo",
          submoduloNombre: { $ifNull: ["$sub.titulo", "—"] },

          calificacion: "$ejInst.calificacion",
        },
      },

      { $match: { calificacion: { $type: "number" } } },

      {
        $facet: {
          porSubmodulo: [
            {
              $group: {
                _id: { materiaId: "$materiaId", moduloId: "$moduloId", submoduloId: "$submoduloId" },
                materiaNombre: { $first: "$materiaNombre" },
                moduloNombre: { $first: "$moduloNombre" },
                submoduloNombre: { $first: "$submoduloNombre" },
                promedio: { $avg: "$calificacion" },
                ejercicios: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                materiaId: "$_id.materiaId",
                materiaNombre: 1,
                moduloId: "$_id.moduloId",
                moduloNombre: 1,
                submoduloId: "$_id.submoduloId",
                submoduloNombre: 1,
                promedio: 1,
                promedioRedondeado: { $round: ["$promedio", 0] },
                ejercicios: 1,
              },
            },
            { $sort: { materiaNombre: 1, moduloNombre: 1, submoduloNombre: 1 } },
          ],

          porModulo: [
            {
              $group: {
                _id: { materiaId: "$materiaId", moduloId: "$moduloId" },
                materiaNombre: { $first: "$materiaNombre" },
                moduloNombre: { $first: "$moduloNombre" },
                promedio: { $avg: "$calificacion" },
                ejercicios: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                materiaId: "$_id.materiaId",
                materiaNombre: 1,
                moduloId: "$_id.moduloId",
                moduloNombre: 1,
                promedio: 1,
                promedioRedondeado: { $round: ["$promedio", 0] },
                ejercicios: 1,
              },
            },
            { $sort: { materiaNombre: 1, moduloNombre: 1 } },
          ],

          porMateria: [
            {
              $group: {
                _id: { materiaId: "$materiaId" },
                materiaNombre: { $first: "$materiaNombre" },
                promedio: { $avg: "$calificacion" },
                ejercicios: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                materiaId: "$_id.materiaId",
                materiaNombre: 1,
                promedio: 1,
                promedioRedondeado: { $round: ["$promedio", 0] },
                ejercicios: 1,
              },
            },
            { $sort: { materiaNombre: 1 } },
          ],

          general: [
            {
              $group: { _id: null, promedio: { $avg: "$calificacion" }, ejerciciosConsiderados: { $sum: 1 } },
            },
            {
              $project: { _id: 0, promedio: 1, promedioRedondeado: { $round: ["$promedio", 0] }, ejerciciosConsiderados: 1 },
            },
          ],
        },
      },
    ]);

    const payload = rows?.[0] || {};
    const general = payload.general?.[0] || { promedio: null, promedioRedondeado: null, ejerciciosConsiderados: 0 };

    return res.json({
      general,
      porMateria: payload.porMateria || [],
      porModulo: payload.porModulo || [],
      porSubmodulo: payload.porSubmodulo || [],
      meta: {
        materias: materiaIds.length,
        modulosConsiderados: Array.isArray(payload.porModulo) ? payload.porModulo.length : 0,
        submodulosConsiderados: Array.isArray(payload.porSubmodulo) ? payload.porSubmodulo.length : 0,
        ejerciciosConsiderados: general.ejerciciosConsiderados || 0,
      },
    });
  } catch (error) {
    console.error("[ProfesorMateriaController:obtenerRendimientoGeneralProfesor]", error);
    return res.status(500).json({ message: "Error al obtener el rendimiento" });
  }
};

/**
 * GET /api/profesor/estadisticas-curso/:cursoId
 * ✅ Soporta:
 * - cursoId = _id (ObjectId)
 * - cursoId = codigo (NRC) como string o number
 */
const obtenerEstadisticasCursoProfesor = async (req, res) => {
  try {
    const profesorId = req.user?.id || req.user?._id;
    const { cursoId } = req.params;

    if (!profesorId) return res.status(401).json({ message: "No autorizado" });
    if (!cursoId) return res.status(400).json({ message: "cursoId requerido" });

    const cursoIdStr = String(cursoId).trim();

    // ✅ Buscar por _id si parece ObjectId, si no por codigo (string/number)
    const materiaQuery = {
      profesor: profesorId,
      estado: "activo",
      ...(isObjectId(cursoIdStr)
        ? { _id: new mongoose.Types.ObjectId(cursoIdStr) }
        : {
            $or: [
              { codigo: cursoIdStr },
              { codigo: Number.isFinite(Number(cursoIdStr)) ? Number(cursoIdStr) : null },
            ].filter(Boolean),
          }),
    };

    const materia = await Materia.findOne(materiaQuery)
      .select("nombre grupo codigo periodoAcademico estudiantes modulosGlobales modulosLocales")
      .lean();

    if (!materia) {
      return res.status(404).json({
        message:
          "Curso no encontrado para este profesor (revisa si estás enviando NRC/código o el _id).",
        debug: {
          cursoIdRecibido: cursoIdStr,
          buscadoPor: isObjectId(cursoIdStr) ? "_id" : "codigo",
        },
      });
    }

    const estudiantesIds = Array.isArray(materia.estudiantes) ? materia.estudiantes : [];
    const estudiantesActivos = estudiantesIds.length;

    const modulosIds = [...(materia.modulosGlobales || []), ...(materia.modulosLocales || [])].map(String);
    const modulosHabilitados = modulosIds.length;

    const estudiantes = estudiantesActivos
      ? await User.find({ _id: { $in: estudiantesIds } }).select("_id nombre nombres apellidos email").lean()
      : [];

    const estudianteMap = new Map(
      estudiantes.map((u) => [
        String(u._id),
        {
          estudianteId: String(u._id),
          nombre: u?.nombre || [u?.nombres, u?.apellidos].filter(Boolean).join(" ") || "Estudiante",
          correo: u?.email || "",
        },
      ])
    );

    const modInst = estudiantesActivos
      ? await ModuloInstancia.find({ materia: materia._id, estudiante: { $in: estudiantesIds } })
          .select("_id estudiante modulo estado progreso updatedAt createdAt")
          .lean()
      : [];

    const modInstIds = modInst.map((m) => m._id);

    const ejInst = modInstIds.length
      ? await EjercicioInstancia.find({ moduloInstancia: { $in: modInstIds } })
          .select("moduloInstancia estado calificacion tiempoAcumuladoSeg updatedAt createdAt")
          .lean()
      : [];

    const modInstById = new Map(modInst.map((x) => [String(x._id), x]));

    const modulosStatsByEst = new Map();
    for (const mi of modInst) {
      const estId = String(mi.estudiante);
      if (!modulosStatsByEst.has(estId)) modulosStatsByEst.set(estId, { completed: 0, total: 0 });
      const obj = modulosStatsByEst.get(estId);

      obj.total += 1;
      const st = String(mi.estado || "").toLowerCase();
      const prog = Number(mi.progreso || 0);
      if (st === "completado" || prog >= 100) obj.completed += 1;
    }

    const perfByEst = new Map();
    let practicasEntregadas = 0;

    for (const ei of ejInst) {
      const mi = modInstById.get(String(ei.moduloInstancia));
      if (!mi) continue;

      const estId = String(mi.estudiante);
      if (!perfByEst.has(estId)) {
        perfByEst.set(estId, { tiempoSeg: 0, sum: 0, count: 0, ultima: null, practicas: 0 });
      }
      const p = perfByEst.get(estId);

      p.tiempoSeg += Number(ei.tiempoAcumuladoSeg || 0);

      if (typeof ei.calificacion === "number") {
        p.sum += ei.calificacion;
        p.count += 1;
      }

      const st = String(ei.estado || "").toLowerCase();
      if (st === "completado" && typeof ei.calificacion === "number") {
        p.practicas += 1;
        practicasEntregadas += 1;
      }

      const t = ei.updatedAt || ei.createdAt;
      if (t) {
        const dt = new Date(t);
        if (!p.ultima || dt > new Date(p.ultima)) p.ultima = dt;
      }
    }

    const alumnos = estudiantesIds.map((id) => {
      const estId = String(id);
      const base = estudianteMap.get(estId) || { estudianteId: estId, nombre: "Estudiante", correo: "" };

      const mods = modulosStatsByEst.get(estId) || { completed: 0, total: 0 };
      const modulosPct = mods.total > 0 ? Math.round((mods.completed / mods.total) * 100) : 0;

      const perf = perfByEst.get(estId) || { tiempoSeg: 0, sum: 0, count: 0, ultima: null };
      const notaIA = perf.count > 0 ? Math.round((perf.sum / perf.count) * 10) / 10 : null;

      return {
        ...base,
        modulosPct,
        tiempoSeg: perf.tiempoSeg || 0,
        notaIA,
        ultimaActividad: perf.ultima || null,
      };
    });

    const avanceGeneralPct =
      alumnos.length > 0
        ? Math.round(alumnos.reduce((acc, a) => acc + (Number(a.modulosPct) || 0), 0) / alumnos.length)
        : 0;

    return res.json({
      curso: {
        id: String(materia._id),
        materia: materia.nombre,
        grupo: materia.grupo || "—",
        nrc: materia.codigo || "—",
        periodo: materia.periodoAcademico || "—",
        estudiantesActivos,
        modulosHabilitados,
        practicasEntregadas,
        avanceGeneralPct,
      },
      alumnos,
    });
  } catch (error) {
    console.error("[ProfesorMateriaController:obtenerEstadisticasCursoProfesor]", error);
    return res.status(500).json({ message: "Error al obtener estadísticas del curso" });
  }
};

module.exports = {
  listarMateriasProfesor,
  obtenerRendimientoGeneralProfesor,
  obtenerEstadisticasCursoProfesor,
};