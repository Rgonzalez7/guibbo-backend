// server/controllers/estudianteMateriaController.js
const mongoose = require("mongoose");
const Materia = require("../models/materia");

const {
  Modulo,
  Submodulo,
  Ejercicio,
  EjercicioGrabarVoz,
  EjercicioInterpretacionFrases,
  EjercicioRolePlay,
  EjercicioCriteriosDx,
  EjercicioPruebas,
  EjercicioInterpretacionProyectiva,
} = require("../models/modulo");

const ModuloInstancia = require("../models/moduloInstancia");
const SubmoduloInstancia = require("../models/submoduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");

/* =========================================================
   Helpers
   ========================================================= */

function oid(v) {
  try {
    return new mongoose.Types.ObjectId(String(v));
  } catch {
    return null;
  }
}

function isRolePlayTipo(tipo) {
  return ["Role playing persona", "Role playing Aula", "Role Playing IA"].includes(tipo);
}

/**
 * Merge simple (sin arrays) para no borrar llaves existentes.
 * Si quieres reemplazar todo el objeto, usa replace=true.
 */
function deepMergeNoArrays(target = {}, source = {}) {
  const out = { ...(target || {}) };
  const src = source || {};
  for (const k of Object.keys(src)) {
    const sv = src[k];
    const tv = out[k];
    const isObj =
      sv && typeof sv === "object" && !Array.isArray(sv) && !(sv instanceof Date);
    const isObjT =
      tv && typeof tv === "object" && !Array.isArray(tv) && !(tv instanceof Date);

    if (isObj && isObjT) out[k] = deepMergeNoArrays(tv, sv);
    else out[k] = sv; // reemplaza (incluye arrays)
  }
  return out;
}

async function obtenerDetalleEjercicioPorTipo(ejercicio) {
  if (!ejercicio?._id) return null;

  const tipo = ejercicio.tipoEjercicio;

  if (tipo === "Grabar voz") {
    return await EjercicioGrabarVoz.findOne({ ejercicio: ejercicio._id })
      .select("caso evaluaciones transcripcionRespuesta analisisRespuesta")
      .lean();
  }

  if (tipo === "Interpretación de frases incompletas") {
    return await EjercicioInterpretacionFrases.findOne({ ejercicio: ejercicio._id }).lean();
  }

  if (isRolePlayTipo(tipo)) {
    return await EjercicioRolePlay.findOne({ ejercicio: ejercicio._id }).lean();
  }

  if (tipo === "Criterios de diagnostico") {
    return await EjercicioCriteriosDx.findOne({ ejercicio: ejercicio._id }).lean();
  }

  if (tipo === "Aplicación de pruebas") {
    return await EjercicioPruebas.findOne({ ejercicio: ejercicio._id }).lean();
  }

  if (tipo === "Pruebas psicometricas") {
    return await EjercicioInterpretacionProyectiva.findOne({ ejercicio: ejercicio._id }).lean();
  }

  return null;
}

function normEstadoInstancia(raw) {
  const e = String(raw || "").toLowerCase().trim();
  if (e === "completado") return "completado";
  if (e === "en_progreso") return "en_progreso";
  if (e === "pendiente") return "pendiente";
  return "bloqueado";
}

async function asegurarModuloInstancia({ estudianteId, materiaId, moduloId }) {
  let modInst = await ModuloInstancia.findOne({
    estudiante: estudianteId,
    materia: materiaId,
    modulo: moduloId,
  });

  if (!modInst) {
    modInst = await ModuloInstancia.create({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: moduloId,
      estado: "en_progreso",
      progreso: 0,
    });
  } else {
    const st = String(modInst.estado || "").toLowerCase();
    if (st !== "completado" && st !== "en_progreso") {
      modInst.estado = "en_progreso";
      await modInst.save();
    }
  }

  return modInst;
}

/**
 * ✅ Inicializa instancias del submódulo si NO existen:
 * - submódulo puede iniciar: pendiente/bloqueado
 * - primer ejercicio puede iniciar: pendiente/bloqueado
 * - el resto de ejercicios: bloqueado
 *
 * También corrige casos viejos donde todo quedó bloqueado por error.
 */
async function asegurarEstadosSubmodulo({
  estudianteId,
  materiaId,
  moduloId,
  submoduloId,

  // ✅ FLAGS NUEVOS
  submoduloPendiente = false,
  primerEjercicioPendiente = false,
}) {
  const modInst = await asegurarModuloInstancia({ estudianteId, materiaId, moduloId });

  // ===== asegurar SubmoduloInstancia =====
  let subInst = await SubmoduloInstancia.findOne({
    estudiante: estudianteId,
    materia: materiaId,
    submodulo: submoduloId,
  });

  if (!subInst) {
    subInst = await SubmoduloInstancia.create({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: moduloId,
      submodulo: submoduloId,
      estado: submoduloPendiente ? "pendiente" : "bloqueado",
    });
  } else {
    const st = normEstadoInstancia(subInst.estado);
    if (submoduloPendiente && st === "bloqueado") {
      subInst.estado = "pendiente";
      await subInst.save();
    }
  }

  // ===== ejercicios del submódulo (orden real) =====
  const ejercicios = await Ejercicio.find({ submodulo: submoduloId })
    .select("_id createdAt")
    .sort({ createdAt: 1 })
    .lean();

  if (!ejercicios.length) return { modInst, subInst };

  const ejIds = ejercicios.map((e) => e._id);

  // ===== instancias existentes =====
  const existentes = await EjercicioInstancia.find({
    estudiante: estudianteId,
    moduloInstancia: modInst._id,
    ejercicio: { $in: ejIds },
  })
    .select("ejercicio estado")
    .lean();

  if (existentes.length > 0) {
    if (primerEjercicioPendiente) {
      const estados = existentes.map((x) => normEstadoInstancia(x.estado));
      const allLocked = estados.every((s) => s === "bloqueado");

      if (allLocked) {
        const firstEjId = ejIds[0];
        await EjercicioInstancia.findOneAndUpdate(
          { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: firstEjId },
          { $set: { estado: "pendiente" } },
          { upsert: true }
        );
      }
    }

    return { modInst, subInst };
  }

  // ===== crear todas en bulk =====
  const ops = [];
  for (let i = 0; i < ejIds.length; i++) {
    const estadoInicial =
      i === 0 ? (primerEjercicioPendiente ? "pendiente" : "bloqueado") : "bloqueado";

    ops.push({
      updateOne: {
        filter: {
          estudiante: estudianteId,
          moduloInstancia: modInst._id,
          ejercicio: ejIds[i],
        },
        update: {
          $setOnInsert: {
            estudiante: estudianteId,
            moduloInstancia: modInst._id,
            ejercicio: ejIds[i],
            estado: estadoInicial,
          },
        },
        upsert: true,
      },
    });
  }

  await EjercicioInstancia.bulkWrite(ops);

  return { modInst, subInst };
}

/**
 * ✅ Cuando un ejercicio se completa:
 * - set ejercicio actual: completado
 * - desbloquea siguiente: pendiente
 * - si era el último: submoduloInstancia = completado
 */
async function completarEjercicioYAvanzar({ estudianteId, materiaId, ejercicioId }) {
  const ejercicio = await Ejercicio.findById(ejercicioId)
    .populate({
      path: "submodulo",
      populate: { path: "modulo" },
    })
    .lean();

  if (!ejercicio?._id) {
    return { ok: false, code: 404, message: "Ejercicio no encontrado." };
  }

  const submoduloId = ejercicio.submodulo?._id;
  const moduloId = ejercicio.submodulo?.modulo?._id;

  if (!submoduloId || !moduloId) {
    return { ok: false, code: 404, message: "No se encontró el contexto del ejercicio." };
  }

  const { modInst } = await asegurarEstadosSubmodulo({
    estudianteId,
    materiaId,
    moduloId,
    submoduloId,
  });

  // traer orden de ejercicios
  const lista = await Ejercicio.find({ submodulo: submoduloId })
    .select("_id createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
  if (idx < 0)
    return { ok: false, code: 404, message: "Ejercicio no pertenece al submódulo." };

  // marcar actual completado
  await EjercicioInstancia.findOneAndUpdate(
    { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId },
    { $set: { estado: "completado" } },
    { upsert: true, new: true }
  );

  const next = lista[idx + 1] || null;

  if (next) {
    const nextInst = await EjercicioInstancia.findOne({
      estudiante: estudianteId,
      moduloInstancia: modInst._id,
      ejercicio: next._id,
    });

    if (!nextInst) {
      await EjercicioInstancia.create({
        estudiante: estudianteId,
        moduloInstancia: modInst._id,
        ejercicio: next._id,
        estado: "pendiente",
      });
    } else {
      const st = normEstadoInstancia(nextInst.estado);
      if (st === "bloqueado") {
        nextInst.estado = "pendiente";
        await nextInst.save();
      }
    }

    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
      { $set: { estado: "en_progreso", modulo: moduloId } },
      { upsert: true }
    );

    return { ok: true, moduloId, submoduloId, nextEjercicioId: next._id };
  }

  await SubmoduloInstancia.findOneAndUpdate(
    { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
    { $set: { estado: "completado", modulo: moduloId } },
    { upsert: true }
  );

  const listaSubs = await Submodulo.find({ modulo: moduloId })
    .select("_id createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const subIdx = listaSubs.findIndex((x) => String(x._id) === String(submoduloId));
  const nextSub = subIdx >= 0 ? listaSubs[subIdx + 1] || null : null;

  if (nextSub) {
    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: nextSub._id },
      { $setOnInsert: { estado: "pendiente", modulo: moduloId } },
      { upsert: true }
    );

    await asegurarEstadosSubmodulo({
      estudianteId,
      materiaId,
      moduloId,
      submoduloId: nextSub._id,
      submoduloPendiente: true,
      primerEjercicioPendiente: true,
    });

    return {
      ok: true,
      moduloId,
      submoduloId,
      nextEjercicioId: null,
      submoduloCompletado: true,
      nextSubmoduloId: nextSub._id,
    };
  }

  return {
    ok: true,
    moduloId,
    submoduloId,
    nextEjercicioId: null,
    submoduloCompletado: true,
  };
}

async function getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId }) {
  const ejercicio = await Ejercicio.findById(ejercicioId)
    .populate({
      path: "submodulo",
      populate: { path: "modulo" },
    })
    .lean();

  if (!ejercicio?._id) return { ok: false, code: 404, message: "Ejercicio no encontrado." };

  const submoduloId = ejercicio.submodulo?._id;
  const moduloId = ejercicio.submodulo?.modulo?._id;

  if (!submoduloId || !moduloId) {
    return { ok: false, code: 404, message: "Contexto del ejercicio no encontrado." };
  }

  const { modInst } = await asegurarEstadosSubmodulo({
    estudianteId,
    materiaId,
    moduloId,
    submoduloId,
  });

  return { ok: true, ejercicio, submoduloId, moduloId, modInst };
}

function nowDate() {
  return new Date();
}

function acumularTiempoSiCorriendo(inst, now = nowDate()) {
  if (!inst?.startedAt) return 0;

  const start = new Date(inst.startedAt);
  const end = new Date(now);

  const diffMs = end.getTime() - start.getTime();
  const segundos = Math.max(0, Math.round(diffMs / 1000));

  inst.tiempoAcumuladoSeg = Number(inst.tiempoAcumuladoSeg || 0) + segundos;

  if (segundos > 0) {
    inst.sesiones = Array.isArray(inst.sesiones) ? inst.sesiones : [];
    inst.sesiones.push({
      startedAt: start,
      endedAt: end,
      segundos,
    });
  }

  inst.startedAt = null;
  return segundos;
}

function marcarInicioSiNoExiste(inst, now = nowDate()) {
  if (!inst.startedAt) inst.startedAt = now;
}

function clampNum(n, min = 0, max = Infinity) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function normRecState(v) {
  const s = String(v || "").toLowerCase().trim();
  if (s === "recording") return "recording";
  if (s === "stopped") return "stopped";
  return "idle";
}

function normalizeRuntimeScope(incoming = {}, current = {}) {
  const inObj = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current && typeof current === "object" ? current : {};

  const next = { ...curObj };

  const inRec = normRecState(inObj.recState);
  if (inRec) next.recState = inRec;

  if (Object.prototype.hasOwnProperty.call(inObj, "startedAt")) {
    const v = inObj.startedAt;
    if (!v) next.startedAt = null;
    else {
      const d = new Date(v);
      next.startedAt = Number.isNaN(d.getTime()) ? null : d;
    }
  }

  if (Object.prototype.hasOwnProperty.call(inObj, "accumulated")) {
    const inAcc = clampNum(inObj.accumulated, 0, 60 * 60);
    const curAcc = clampNum(curObj.accumulated, 0, 60 * 60);
    next.accumulated = Math.max(curAcc, inAcc);
  } else {
    next.accumulated = clampNum(curObj.accumulated, 0, 60 * 60);
  }

  if (curObj.resetUsed === true) next.resetUsed = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetUsed"))
    next.resetUsed = Boolean(inObj.resetUsed);
  else next.resetUsed = Boolean(curObj.resetUsed);

  if (curObj.resetAutoLocked === true) next.resetAutoLocked = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetAutoLocked"))
    next.resetAutoLocked = Boolean(inObj.resetAutoLocked);
  else next.resetAutoLocked = Boolean(curObj.resetAutoLocked);

  next.updatedAt = Date.now();
  return next;
}

function normalizeRoleplayRuntime(incoming = {}, current = {}) {
  const inObj = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current && typeof current === "object" ? current : {};

  return {
    sesion: normalizeRuntimeScope(inObj.sesion || {}, curObj.sesion || {}),
    pruebas: normalizeRuntimeScope(inObj.pruebas || {}, curObj.pruebas || {}),
  };
}

function get(obj, path) {
  try {
    return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
  } catch {
    return undefined;
  }
}

function extractRoleplayRuntime(respuestas) {
  return (
    get(respuestas, "rolePlaying.runtime") ||
    get(respuestas, "rolePlaying.payload.rolePlaying.runtime") ||
    get(respuestas, "rolePlaying.sessionData.rolePlaying.runtime") ||
    get(respuestas, "rolePlaying.data.rolePlaying.runtime") ||
    null
  );
}

function mirrorRoleplayRuntime(respuestas, safeRuntime) {
  if (!respuestas || typeof respuestas !== "object") return respuestas;

  respuestas.rolePlaying =
    respuestas.rolePlaying && typeof respuestas.rolePlaying === "object" ? respuestas.rolePlaying : {};

  respuestas.rolePlaying.runtime = safeRuntime;

  if (respuestas.rolePlaying.payload && typeof respuestas.rolePlaying.payload === "object") {
    respuestas.rolePlaying.payload.rolePlaying =
      respuestas.rolePlaying.payload.rolePlaying &&
      typeof respuestas.rolePlaying.payload.rolePlaying === "object"
        ? respuestas.rolePlaying.payload.rolePlaying
        : {};
    respuestas.rolePlaying.payload.rolePlaying.runtime = safeRuntime;
  }

  if (respuestas.rolePlaying.sessionData && typeof respuestas.rolePlaying.sessionData === "object") {
    respuestas.rolePlaying.sessionData.rolePlaying =
      respuestas.rolePlaying.sessionData.rolePlaying &&
      typeof respuestas.rolePlaying.sessionData.rolePlaying === "object"
        ? respuestas.rolePlaying.sessionData.rolePlaying
        : {};
    respuestas.rolePlaying.sessionData.rolePlaying.runtime = safeRuntime;
  }

  if (respuestas.rolePlaying.data && typeof respuestas.rolePlaying.data === "object") {
    respuestas.rolePlaying.data.rolePlaying =
      respuestas.rolePlaying.data.rolePlaying &&
      typeof respuestas.rolePlaying.data.rolePlaying === "object"
        ? respuestas.rolePlaying.data.rolePlaying
        : {};
    respuestas.rolePlaying.data.rolePlaying.runtime = safeRuntime;
  }

  return respuestas;
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function makeLocalId() {
  return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * ✅ Normaliza pruebas a formato nuevo:
 * - Si ya viene rolePlaying.pruebas[] => OK
 * - Si viene formato viejo (pruebaTestId, pruebasRespuestas, pruebaTranscripcion, etc.)
 *   lo convierte a pruebas[0] para compatibilidad.
 */
function normalizeRoleplayPruebas(respuestas = {}) {
  if (!respuestas || typeof respuestas !== "object") return respuestas;

  const rp =
    respuestas.rolePlaying && typeof respuestas.rolePlaying === "object"
      ? respuestas.rolePlaying
      : {};

  // ya es nuevo
  if (Array.isArray(rp.pruebas)) return respuestas;

  // detectar formato viejo (tu FE actual)
  const oldTestId =
    respuestas?.pruebaTestId ||
    rp?.pruebaTestId ||
    rp?.payload?.pruebaTestId ||
    "";

  const oldAll = respuestas?.pruebasRespuestas || rp?.pruebasRespuestas || {};
  const oldResp = oldTestId ? (oldAll?.[oldTestId] || {}) : {};

  const oldNombre = respuestas?.pruebaNombre || rp?.pruebaNombre || "";
  const oldCategoria = respuestas?.pruebaCategoria || rp?.pruebaCategoria || "";
  const oldPaciente = respuestas?.pruebaPacienteNombre || rp?.pruebaPacienteNombre || "Paciente";

  const oldTrans = respuestas?.pruebaTranscripcion || rp?.pruebaTranscripcion || "";
  const oldInterim = respuestas?.pruebaTranscripcionInterim || rp?.pruebaTranscripcionInterim || "";

  const oldDiarStatus = respuestas?.pruebaDiarizacionStatus || rp?.pruebaDiarizacionStatus || "idle";
  const oldDiarError = respuestas?.pruebaDiarizacionError || rp?.pruebaDiarizacionError || "";
  const oldDiarTurnos = ensureArray(respuestas?.pruebaDiarizacionTurnos || rp?.pruebaDiarizacionTurnos);

  // si no hay nada viejo, crea lista vacía
  const pruebas = oldTestId
    ? [
        {
          id: makeLocalId(),
          testId: String(oldTestId),
          nombre: String(oldNombre || ""),
          categoria: String(oldCategoria || ""),
          pacienteNombre: String(oldPaciente || "Paciente"),
          respuestas: oldResp && typeof oldResp === "object" ? oldResp : {},
          transcripcion: String(oldTrans || ""),
          transcripcionInterim: String(oldInterim || ""),
          diarizacionStatus: String(oldDiarStatus || "idle"),
          diarizacionError: String(oldDiarError || ""),
          diarizacionTurnos: oldDiarTurnos,
        },
      ]
    : [];

  // set nuevo
  const next = { ...respuestas };
  next.rolePlaying =
    next.rolePlaying && typeof next.rolePlaying === "object" ? next.rolePlaying : {};
  next.rolePlaying.pruebas = pruebas;

  // opcional: limpiar campos viejos para no duplicar (yo recomiendo SÍ limpiarlos)
  delete next.pruebaTestId;
  delete next.pruebasRespuestas;
  delete next.pruebaNombre;
  delete next.pruebaCategoria;
  delete next.pruebaPacienteNombre;
  delete next.pruebaTranscripcion;
  delete next.pruebaTranscripcionInterim;
  delete next.pruebaDiarizacionStatus;
  delete next.pruebaDiarizacionError;
  delete next.pruebaDiarizacionTurnos;

  if (next.rolePlaying) {
    delete next.rolePlaying.pruebaTestId;
    delete next.rolePlaying.pruebasRespuestas;
    delete next.rolePlaying.pruebaNombre;
    delete next.rolePlaying.pruebaCategoria;
    delete next.rolePlaying.pruebaPacienteNombre;
    delete next.rolePlaying.pruebaTranscripcion;
    delete next.rolePlaying.pruebaTranscripcionInterim;
    delete next.rolePlaying.pruebaDiarizacionStatus;
    delete next.rolePlaying.pruebaDiarizacionError;
    delete next.rolePlaying.pruebaDiarizacionTurnos;
  }

  return next;
}

/* =========================================================
   GET /estudiante/materias
   Lista materias donde el estudiante está inscrito
   ========================================================= */
exports.listarMisMaterias = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;

    if (!estudianteId) {
      return res.status(401).json({ message: "No autenticado." });
    }

    const materias = await Materia.find({
      estudiantes: estudianteId,
      estado: "activo",
    })
      .select(
        "nombre codigo grupo periodoAcademico profesorNombre profesorEmail aula semestre creditos horario estado createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ materias });
  } catch (err) {
    console.error("❌ Error listando materias (estudiante):", err);
    return res.status(500).json({
      message: "Error al listar materias del estudiante.",
      error: err.message,
    });
  }
};

/* =========================================================
   GET /estudiante/materias/:id/contenido
   ========================================================= */
exports.obtenerContenidoMateria = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const materiaId = req.params.id;

    if (!estudianteId) {
      return res.status(401).json({ message: "No autenticado." });
    }

    if (!mongoose.Types.ObjectId.isValid(materiaId)) {
      return res.status(400).json({ message: "ID de materia inválido." });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      estudiantes: estudianteId,
    })
      .select(
        "nombre codigo grupo periodoAcademico profesorNombre profesorEmail universidad modulosGlobales modulosLocales modulosLabels"
      )
      .lean();

    if (!materia) {
      return res.status(404).json({
        message: "Materia no encontrada o no estás inscrito.",
      });
    }

    const modulosIds = [
      ...(materia.modulosGlobales || []),
      ...(materia.modulosLocales || []),
    ].map(String);

    if (!modulosIds.length) {
      return res.json({
        materia,
        modulos: [],
      });
    }

    const modulos = await Modulo.find({
      _id: { $in: modulosIds },
      activo: true,
    })
      .select("titulo descripcion tipoModulo esGlobal universidad activo createdAt")
      .lean();

    const modulosMap = new Map(modulos.map((m) => [String(m._id), m]));
    const modulosOrdenados = modulosIds.map((id) => modulosMap.get(String(id))).filter(Boolean);

    const modulosObjIds = modulosOrdenados.map((m) => m._id);

    const submodulos = await Submodulo.find({
      modulo: { $in: modulosObjIds },
    })
      .select("modulo titulo descripcion reintento createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const subIds = submodulos.map((s) => s._id);

    const ejercicios = await Ejercicio.find({
      submodulo: { $in: subIds },
    })
      .select("submodulo tipoEjercicio tipoModulo titulo tiempo createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const grabarIds = ejercicios.filter((e) => e.tipoEjercicio === "Grabar voz").map((e) => e._id);

    let grabarMap = new Map();
    if (grabarIds.length) {
      const grabarDetalles = await EjercicioGrabarVoz.find({
        ejercicio: { $in: grabarIds },
      })
        .select("ejercicio caso evaluaciones")
        .lean();

      grabarMap = new Map(grabarDetalles.map((d) => [String(d.ejercicio), d]));
    }

    const roleIds = ejercicios.filter((e) => isRolePlayTipo(e.tipoEjercicio)).map((e) => e._id);

    let roleMap = new Map();
    if (roleIds.length) {
      const roleDetalles = await EjercicioRolePlay.find({
        ejercicio: { $in: roleIds },
      }).lean();

      roleMap = new Map(roleDetalles.map((d) => [String(d.ejercicio), d]));
    }

    /* =========================================================
      ✅ INICIALIZACIÓN POR MÓDULO
    ========================================================= */
    const subsByModuloInit = new Map();
    for (const s of submodulos) {
      const key = String(s.modulo);
      if (!subsByModuloInit.has(key)) subsByModuloInit.set(key, []);
      subsByModuloInit.get(key).push(s);
    }

    for (const [modKey, subs] of subsByModuloInit.entries()) {
      for (let i = 0; i < subs.length; i++) {
        const s = subs[i];
        const esPrimerSubmodulo = i === 0;

        await asegurarEstadosSubmodulo({
          estudianteId,
          materiaId,
          moduloId: s.modulo,
          submoduloId: s._id,
          submoduloPendiente: esPrimerSubmodulo,
          primerEjercicioPendiente: esPrimerSubmodulo,
        });
      }
    }

    // ===== instancias (reales) =====
    let ejercicioInstMap = new Map();
    let moduloInstMap = new Map();

    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: { $in: modulosObjIds },
    })
      .select("_id modulo estado progreso updatedAt createdAt")
      .lean();

    moduloInstMap = new Map(modInst.map((x) => [String(x.modulo), x]));

    const modInstIds = modInst.map((x) => x._id);

    if (modInstIds.length) {
      const ejInst = await EjercicioInstancia.find({
        estudiante: estudianteId,
        moduloInstancia: { $in: modInstIds },
        ejercicio: { $in: ejercicios.map((e) => e._id) },
      })
        .select(
          "ejercicio estado calificacion feedback intentosUsados updatedAt createdAt startedAt tiempoAcumuladoSeg completedAt"
        )
        .lean();

      ejercicioInstMap = new Map(ejInst.map((x) => [String(x.ejercicio), x]));
    }

    const subByModulo = new Map();
    submodulos.forEach((s) => {
      const key = String(s.modulo);
      if (!subByModulo.has(key)) subByModulo.set(key, []);
      subByModulo.get(key).push(s);
    });

    const ejBySub = new Map();
    ejercicios.forEach((e) => {
      const key = String(e.submodulo);
      if (!ejBySub.has(key)) ejBySub.set(key, []);
      ejBySub.get(key).push(e);
    });

    const modulosTree = modulosOrdenados.map((m) => {
      const modKey = String(m._id);
      const modInstItem = moduloInstMap.get(modKey) || null;

      const subs = (subByModulo.get(modKey) || []).map((s) => {
        const subKey = String(s._id);

        const ejs = (ejBySub.get(subKey) || []).map((e) => {
          const inst = ejercicioInstMap.get(String(e._id)) || null;

          let merged = { ...e };

          const gv = grabarMap.get(String(e._id));
          if (gv) merged = { ...merged, caso: gv.caso, evaluaciones: gv.evaluaciones };

          const rp = roleMap.get(String(e._id));
          if (rp) merged = { ...merged, rolePlaying: rp };

          return { ...merged, instancia: inst };
        });

        return { ...s, ejercicios: ejs };
      });

      return { ...m, instancia: modInstItem, submodulos: subs };
    });

    return res.json({ materia, modulos: modulosTree });
  } catch (err) {
    console.error("❌ Error obteniendo contenido materia (estudiante):", err);
    return res.status(500).json({
      message: "Error al obtener contenido de la materia.",
      error: err.message,
    });
  }
};

/* =========================================================
   ✅ 1) GET /estudiante/materias/:materiaId/ejercicios/:ejercicioId
   buscarEjercicioEnMateria (FIX REAL)
   - ✅ SIEMPRE crea/asegura EjercicioInstancia y devuelve ctx.ejercicioInstanciaId
   ========================================================= */
exports.buscarEjercicioEnMateria = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    if (!mongoose.Types.ObjectId.isValid(materiaId)) {
      return res.status(400).json({ message: "ID de materia inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
      return res.status(400).json({ message: "ID de ejercicio inválido." });
    }

    const materia = await Materia.findOne({
      _id: materiaId,
      estudiantes: estudianteId,
    })
      .select("nombre codigo grupo periodoAcademico universidad modulosGlobales modulosLocales")
      .lean();

    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada o no estás inscrito." });
    }

    const ejercicio = await Ejercicio.findById(ejercicioId)
      .populate({ path: "submodulo", populate: { path: "modulo" } })
      .lean();

    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });

    const submodulo = ejercicio.submodulo || null;
    const modulo = submodulo?.modulo || null;

    if (!modulo?._id) {
      return res.status(404).json({ message: "No se encontró el módulo del ejercicio." });
    }

    const modulosIds = [
      ...(materia.modulosGlobales || []),
      ...(materia.modulosLocales || []),
    ].map(String);

    if (!modulosIds.includes(String(modulo._id))) {
      return res.status(404).json({ message: "El ejercicio no pertenece a esta materia." });
    }

    const detalle = await obtenerDetalleEjercicioPorTipo(ejercicio);

    const tipo = ejercicio.tipoEjercicio;
    let ejercicioMerged = { ...ejercicio };

    if (tipo === "Grabar voz" && detalle) {
      ejercicioMerged = { ...ejercicioMerged, caso: detalle.caso, evaluaciones: detalle.evaluaciones };
    }

    if (isRolePlayTipo(tipo) && detalle) {
      ejercicioMerged = { ...ejercicioMerged, rolePlaying: detalle };
    }

    // ✅ Contexto + ModuloInstancia
    const ctxBase = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctxBase.ok) return res.status(ctxBase.code || 400).json({ message: ctxBase.message });

    // ✅ FIX: asegurar que SIEMPRE exista la EjercicioInstancia (aunque solo esté entrando a ver)
    const inst = await EjercicioInstancia.findOneAndUpdate(
      {
        estudiante: estudianteId,
        moduloInstancia: ctxBase.modInst._id,
        ejercicio: ejercicioId,
      },
      {
        $setOnInsert: {
          estudiante: estudianteId,
          moduloInstancia: ctxBase.modInst._id,
          ejercicio: ejercicioId,
          estado: "pendiente", // 👈 NO arrancamos timer aquí
          startedAt: null,
        },
      },
      { upsert: true, new: true }
    )
      .select("_id estado startedAt tiempoAcumuladoSeg completedAt updatedAt createdAt analisisIA")
      .lean();

    // ✅ ctx canónico para FE
    const ctx = {
      materiaId: String(materiaId),
      moduloId: String(modulo._id),
      submoduloId: String(submodulo?._id || ""),
      ejercicioId: String(ejercicioId),
      moduloInstanciaId: String(ctxBase.modInst._id),
      ejercicioInstanciaId: String(inst._id), // 🔥 EL FIX
    };

    return res.json({
      materia,
      modulo,
      submodulo,
      ejercicio: ejercicioMerged,
      detalle,

      // compat
      ejercicioInstancia: inst || null,
      instancia: inst || null,
      instanciaId: inst?._id || null,
      moduloInstanciaId: ctxBase.modInst?._id || null,

      // ✅ NUEVO: lo que el FE debe usar
      ctx,
    });
  } catch (err) {
    console.error("❌ Error buscarEjercicioEnMateria:", err);
    return res.status(500).json({
      message: "Error al obtener el ejercicio de la materia.",
      error: err.message,
    });
  }
};

/* =========================================================
   GET /estudiante/dashboard
   (sin cambios)
   ========================================================= */
exports.dashboardResumen = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;

    if (!estudianteId) {
      return res.status(401).json({ message: "No autenticado." });
    }

    const materias = await Materia.find({
      estudiantes: estudianteId,
      estado: "activo",
    })
      .select("nombre horario profesorNombre modulosGlobales modulosLocales")
      .sort({ createdAt: -1 })
      .lean();

    if (!materias.length) {
      return res.json({
        user: {
          nombre: req.user?.nombre || "Estudiante",
          rol: req.user?.rol || "estudiante",
          avatarUrl: req.user?.foto || "",
          premiumClinicaAbierta: Boolean(req.user?.premiumClinicaAbierta),
        },
        metrics: { simulacionesActivas: 0, horasSemana: 0, progresoGeneralPct: 0 },
        horarioHoy: [],
        modulosEvaluados: [],
        consejo: {
          titulo: "Consejo de Estudio Diario",
          texto:
            "Recuerda practicar mindfulness entre sesiones. Tomarte 5 minutos para respirar profundamente puede ayudarte a mantenerte centrada y presente para tus pacientes.",
          ctaLabel: "Aprende más",
          ctaUrl: "",
        },
      });
    }

    const modulosIdsAll = [];
    for (const mat of materias) {
      const ids = [...(mat.modulosGlobales || []), ...(mat.modulosLocales || [])].map(String);
      modulosIdsAll.push(...ids);
    }
    const modulosIdsUnique = [...new Set(modulosIdsAll)];

    if (!modulosIdsUnique.length) {
      return res.json({
        user: {
          nombre: req.user?.nombre || "Estudiante",
          rol: req.user?.rol || "estudiante",
          avatarUrl: req.user?.foto || "",
          premiumClinicaAbierta: Boolean(req.user?.premiumClinicaAbierta),
        },
        metrics: { simulacionesActivas: 0, horasSemana: 0, progresoGeneralPct: 0 },
        horarioHoy: [],
        modulosEvaluados: [],
        consejo: {
          titulo: "Consejo de Estudio Diario",
          texto:
            "Recuerda practicar mindfulness entre sesiones. Tomarte 5 minutos para respirar profundamente puede ayudarte a mantenerte centrada y presente para tus pacientes.",
          ctaLabel: "Aprende más",
          ctaUrl: "",
        },
      });
    }

    const modulos = await Modulo.find({
      _id: { $in: modulosIdsUnique },
      activo: true,
    })
      .select("_id titulo tipoModulo")
      .lean();

    const modulosObjIds = modulos.map((m) => m._id);

    const submodulos = await Submodulo.find({
      modulo: { $in: modulosObjIds },
    })
      .select("_id modulo titulo")
      .lean();

    const subIds = submodulos.map((s) => s._id);

    const ejercicios = await Ejercicio.find({
      submodulo: { $in: subIds },
    })
      .select("_id submodulo titulo tiempo tipoEjercicio")
      .lean();

    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId,
      modulo: { $in: modulosObjIds },
    })
      .select("_id modulo materia estado progreso updatedAt createdAt")
      .lean();

    const modInstIds = modInst.map((x) => x._id);

    let ejInst = [];
    if (modInstIds.length) {
      ejInst = await EjercicioInstancia.find({
        estudiante: estudianteId,
        moduloInstancia: { $in: modInstIds },
        ejercicio: { $in: ejercicios.map((e) => e._id) },
      })
        .select("ejercicio moduloInstancia estado calificacion updatedAt createdAt")
        .lean();
    }

    const ejInstMap = new Map(ejInst.map((x) => [String(x.ejercicio), x]));

    const totalEj = ejercicios.length;

    let evaluados = 0;
    let respondidos = 0;

    for (const e of ejercicios) {
      const inst = ejInstMap.get(String(e._id));
      const st = String(inst?.estado || "").toLowerCase();
      if (st === "evaluado") evaluados += 1;
      if (st === "respondido") respondidos += 1;
    }

    const progresoGeneralPct = totalEj > 0 ? Math.round((evaluados / totalEj) * 100) : 0;

    const simulacionesActivas = modInst.filter(
      (m) => String(m.estado).toLowerCase() === "en_progreso"
    ).length;

    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    let minutosSemana = 0;
    for (const e of ejercicios) {
      const inst = ejInstMap.get(String(e._id));
      if (!inst) continue;
      const touchedAt = inst.updatedAt ? new Date(inst.updatedAt) : null;
      if (touchedAt && touchedAt >= startOfWeek) {
        minutosSemana += Number(e?.tiempo) || 0;
      }
    }
    const horasSemana = Math.round((minutosSemana / 60) * 10) / 10;

    const modulosEvaluados = [];

    const modInstById = new Map(modInst.map((x) => [String(x._id), x]));
    const modTitle = new Map(modulos.map((m) => [String(m._id), m.titulo]));
    const materiaName = new Map(materias.map((m) => [String(m._id), m.nombre]));

    const evaluadosConNota = ejInst
      .filter((x) => String(x.estado).toLowerCase() === "evaluado" && x.calificacion != null)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const seenModulo = new Set();

    for (const inst of evaluadosConNota) {
      const mi = modInstById.get(String(inst.moduloInstancia));
      if (!mi) continue;

      const moduloId = String(mi.modulo);
      if (seenModulo.has(moduloId)) continue;
      seenModulo.add(moduloId);

      modulosEvaluados.push({
        _id: moduloId,
        titulo: modTitle.get(moduloId) || "Módulo",
        materia: materiaName.get(String(mi.materia)) || "",
        score: inst.calificacion,
        fecha: inst.updatedAt || inst.createdAt,
      });

      if (modulosEvaluados.length >= 6) break;
    }

    const horarioHoy = [];

    return res.json({
      user: {
        nombre: req.user?.nombre || "Estudiante",
        rol: req.user?.rol || "estudiante",
        avatarUrl: req.user?.foto || "",
        premiumClinicaAbierta: Boolean(req.user?.premiumClinicaAbierta),
      },
      metrics: { simulacionesActivas, horasSemana, progresoGeneralPct },
      horarioHoy,
      modulosEvaluados,
      consejo: {
        titulo: "Consejo de Estudio Diario",
        texto:
          "Recuerda practicar mindfulness entre sesiones. Tomarte 5 minutos para respirar profundamente puede ayudarte a mantenerte centrada y presente para tus pacientes.",
        ctaLabel: "Aprende más",
        ctaUrl: "",
      },
    });
  } catch (err) {
    console.error("❌ Error dashboard estudiante:", err);
    return res.status(500).json({
      message: "Error al obtener el dashboard del estudiante.",
      error: err.message,
    });
  }
};

/* =========================================================
   ✅ 2) POST /estudiante/ejercicios/:ejercicioId/abrir
   abrirEjercicio (FIX: devuelve ctx.ejercicioInstanciaId)
   ========================================================= */
exports.abrirEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const { materiaId } = req.body;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
      return res.status(400).json({ message: "ID de ejercicio inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(materiaId)) {
      return res.status(400).json({ message: "materiaId inválido." });
    }

    const ejercicio = await Ejercicio.findById(ejercicioId)
      .populate({ path: "submodulo", populate: { path: "modulo" } })
      .lean();

    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });

    const submoduloId = ejercicio.submodulo?._id;
    const moduloId = ejercicio.submodulo?.modulo?._id;

    if (!submoduloId || !moduloId) {
      return res.status(404).json({ message: "Contexto del ejercicio no encontrado." });
    }

    const { modInst } = await asegurarEstadosSubmodulo({
      estudianteId,
      materiaId,
      moduloId,
      submoduloId,
    });

    const lista = await Ejercicio.find({ submodulo: submoduloId })
      .select("_id createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
    if (idx < 0) return res.status(404).json({ message: "Ejercicio no pertenece al submódulo." });

    if (idx > 0) {
      const prevId = lista[idx - 1]?._id;
      const prevInst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: modInst._id,
        ejercicio: prevId,
      }).select("estado");

      if (normEstadoInstancia(prevInst?.estado) !== "completado") {
        await EjercicioInstancia.findOneAndUpdate(
          { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId },
          { $set: { estado: "bloqueado" } },
          { upsert: true }
        );
        return res.status(403).json({ message: "Ejercicio bloqueado." });
      }
    }

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId,
      moduloInstancia: modInst._id,
      ejercicio: ejercicioId,
    });

    if (inst && normEstadoInstancia(inst.estado) === "completado") {
      return res.status(409).json({
        message: "Este ejercicio ya fue completado. Accede al resultado.",
        code: "EJERCICIO_COMPLETADO",
        redirectUrl: `/estudiante/ejercicio/${ejercicioId}/resultado?materiaId=${materiaId}`,
      });
    }

    const now = nowDate();

    if (!inst) {
      inst = await EjercicioInstancia.create({
        estudiante: estudianteId,
        moduloInstancia: modInst._id,
        ejercicio: ejercicioId,
        estado: "en_progreso",
        startedAt: now,
      });
    } else {
      const st = normEstadoInstancia(inst.estado);

      if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
      if (st === "pendiente") inst.estado = "en_progreso";

      if (inst.estado === "en_progreso") {
        marcarInicioSiNoExiste(inst, now);
      }

      await inst.save();
    }

    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
      { $set: { estado: "en_progreso", modulo: moduloId } },
      { upsert: true }
    );

    // ✅ RESPUESTA: incluye ctx con ejercicioInstanciaId
    return res.json({
      ok: true,
      instanciaId: String(inst._id),
      moduloInstanciaId: String(modInst._id),
      ctx: {
        materiaId: String(materiaId),
        moduloId: String(moduloId),
        submoduloId: String(submoduloId),
        ejercicioId: String(ejercicioId),
        moduloInstanciaId: String(modInst._id),
        ejercicioInstanciaId: String(inst._id), // 🔥 EL FIX
      },
      ejercicioInstancia: {
        _id: inst._id,
        estado: inst.estado,
        startedAt: inst.startedAt || null,
        tiempoAcumuladoSeg: inst.tiempoAcumuladoSeg || 0,
        updatedAt: inst.updatedAt || null,
        createdAt: inst.createdAt || null,
      },
    });
  } catch (err) {
    console.error("❌ Error abrirEjercicio:", err);
    return res.status(500).json({ message: "Error al abrir ejercicio.", error: err.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/finalizar
   ✅ ACTUALIZADO: normaliza multi-pruebas antes de guardar
   ========================================================= */
   exports.finalizarEjercicio = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { ejercicioId } = req.params;
      const { materiaId, respuestas, calificacion, feedback, replace = false } = req.body || {};
  
      if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "materiaId inválido." });
      }
  
      const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      const now = nowDate();
  
      // ✅ Normaliza respuestas entrantes (multi-pruebas)
      let incomingRespuestas = respuestas || {};
      incomingRespuestas = normalizeRoleplayPruebas(incomingRespuestas);
  
      let inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      });
  
      if (!inst) {
        inst = await EjercicioInstancia.create({
          estudiante: estudianteId,
          moduloInstancia: ctx.modInst._id,
          ejercicio: ejercicioId,
          estado: "en_progreso",
          startedAt: now,
          respuestas: incomingRespuestas,
          calificacion: calificacion ?? null,
          feedback: feedback || "",
        });
      } else {
        const st = normEstadoInstancia(inst.estado);
        if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
        if (st === "completado") return res.status(409).json({ message: "Ejercicio ya completado." });
  
        if (st === "pendiente") inst.estado = "en_progreso";
  
        if (inst.estado === "en_progreso") {
          marcarInicioSiNoExiste(inst, now);
        }
  
        // ✅ Normaliza también lo previo antes de merge (por compat viejo->nuevo)
        const prevResp = normalizeRoleplayPruebas(inst.respuestas || {});
        const nextMerged = replace ? incomingRespuestas : deepMergeNoArrays(prevResp, incomingRespuestas);
  
        // ✅ runtime sigue funcionando igual
        const prevRuntime = extractRoleplayRuntime(prevResp) || {};
        const incomingRuntime = extractRoleplayRuntime(nextMerged);
  
        if (incomingRuntime) {
          const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, prevRuntime);
          mirrorRoleplayRuntime(nextMerged, safeRuntime);
        }
  
        inst.respuestas = nextMerged;
  
        if (calificacion !== undefined) inst.calificacion = calificacion;
        if (feedback !== undefined) inst.feedback = feedback;
      }
  
      acumularTiempoSiCorriendo(inst, now);
      inst.estado = "completado";
      inst.completedAt = now;
      await inst.save();
  
      const result = await completarEjercicioYAvanzar({
        estudianteId,
        materiaId,
        ejercicioId,
      });
  
      if (!result.ok) {
        return res
          .status(result.code || 400)
          .json({ message: result.message || "No se pudo finalizar." });
      }
  
      return res.json(result);
    } catch (err) {
      console.error("❌ Error finalizarEjercicio:", err);
      return res.status(500).json({ message: "Error al finalizar ejercicio.", error: err.message });
    }
  };
  
  /* =========================================================
     ✅ 3) GET /estudiante/ejercicios/:ejercicioId/borrador?materiaId=...
     ✅ ACTUALIZADO: normaliza multi-pruebas al devolver (no muta DB)
     ========================================================= */
  exports.obtenerBorradorEjercicio = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { ejercicioId } = req.params;
      const materiaId = req.query?.materiaId;
  
      if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "materiaId inválido." });
      }
  
      const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      const inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      })
        .select(
          [
            "estado",
            "respuestas",
            "calificacion",
            "feedback",
            "intentosUsados",
            "updatedAt",
            "createdAt",
            "startedAt",
            "tiempoAcumuladoSeg",
            "completedAt",
            "analisisIA",
            "analisisGeneradoAt",
            "analisisFuente",
            "+analisisIA",
            "+analisisGeneradoAt",
            "+analisisFuente",
          ].join(" ")
        )
        .lean();
  
      let respuestas = inst?.respuestas || {};
      respuestas = normalizeRoleplayPruebas(respuestas);
  
      const runtime = extractRoleplayRuntime(respuestas);
  
      return res.json({
        ok: true,
        estado: inst?.estado || "bloqueado",
        respuestas,
        runtimeRoleplay: runtime,
        serverNow: new Date().toISOString(),
  
        calificacion: inst?.calificacion ?? null,
        calificacionFinal: inst?.calificacionFinal ?? null,
        evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,
  
        feedback: inst?.feedback || "",
  
        // ✅ nombres correctos
        analisisIA: inst?.analisisIA ?? null,
        analisisGeneradoAt: inst?.analisisGeneradoAt ?? null,
        analisisFuente: inst?.analisisFuente ?? "unknown",
  
        // ✅ compat
        analisisIAGeneradoAt: inst?.analisisGeneradoAt ?? null,
  
        intentosUsados: inst?.intentosUsados || 0,
        updatedAt: inst?.updatedAt || null,
        createdAt: inst?.createdAt || null,
      });
    } catch (err) {
      console.error("❌ Error obtenerBorradorEjercicio:", err);
      return res.status(500).json({
        message: "Error al obtener borrador del ejercicio.",
        error: err.message,
      });
    }
  };
  
  /* =========================================================
     POST /estudiante/ejercicios/:ejercicioId/borrador
     ✅ ACTUALIZADO: normaliza multi-pruebas + runtime seguro
     ========================================================= */
  exports.guardarBorradorEjercicio = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { ejercicioId } = req.params;
  
      const { materiaId, respuestas, replace = false } = req.body || {};
  
      if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "materiaId inválido." });
      }
  
      const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      const lista = await Ejercicio.find({ submodulo: ctx.submoduloId })
        .select("_id createdAt")
        .sort({ createdAt: 1 })
        .lean();
  
      const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
      if (idx < 0) return res.status(404).json({ message: "Ejercicio no pertenece al submódulo." });
  
      if (idx > 0) {
        const prevId = lista[idx - 1]?._id;
        const prevInst = await EjercicioInstancia.findOne({
          estudiante: estudianteId,
          moduloInstancia: ctx.modInst._id,
          ejercicio: prevId,
        }).select("estado");
  
        if (normEstadoInstancia(prevInst?.estado) !== "completado") {
          return res.status(403).json({ message: "Ejercicio bloqueado." });
        }
      }
  
      const now = nowDate();
  
      // ✅ Normaliza respuestas entrantes (multi-pruebas)
      let incomingRespuestas = respuestas || {};
      incomingRespuestas = normalizeRoleplayPruebas(incomingRespuestas);
  
      let inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      });
  
      if (!inst) {
        const payload = {
          estudiante: estudianteId,
          moduloInstancia: ctx.modInst._id,
          ejercicio: ejercicioId,
          estado: "en_progreso",
          startedAt: now,
          respuestas: incomingRespuestas,
        };
  
        // ✅ runtime
        const incomingRuntime = extractRoleplayRuntime(payload.respuestas);
        if (incomingRuntime) {
          const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, {});
          mirrorRoleplayRuntime(payload.respuestas, safeRuntime);
        }
  
        await EjercicioInstancia.create(payload);
        return res.json({ ok: true, created: true });
      }
  
      const st = normEstadoInstancia(inst.estado);
      if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
      if (st === "completado") return res.status(409).json({ message: "Ejercicio ya completado." });
  
      if (st === "pendiente") inst.estado = "en_progreso";
  
      if (inst.estado === "en_progreso") {
        marcarInicioSiNoExiste(inst, now);
      }
  
      // ✅ Normaliza previo y mergea
      const prevResp = normalizeRoleplayPruebas(inst.respuestas || {});
      let nextResp = replace ? incomingRespuestas : deepMergeNoArrays(prevResp, incomingRespuestas);
  
      // ✅ runtime robusto
      const prevRuntime = extractRoleplayRuntime(prevResp) || {};
      const incomingRuntime = extractRoleplayRuntime(nextResp);
  
      if (incomingRuntime) {
        const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, prevRuntime);
        mirrorRoleplayRuntime(nextResp, safeRuntime);
      }
  
      inst.respuestas = nextResp;
      await inst.save();
  
      return res.json({ ok: true, created: false });
    } catch (err) {
      console.error("❌ Error guardarBorradorEjercicio:", err);
      return res.status(500).json({
        message: "Error al guardar borrador del ejercicio.",
        error: err.message,
      });
    }
  };

/* =========================================================
   GET /estudiante/ejercicios/:ejercicioId/resultado?materiaId=...
   ✅ FIX: devolver analisisIA correctamente + compat
   ========================================================= */
   exports.obtenerResultadoEjercicio = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { ejercicioId } = req.params;
      const materiaId = req.query?.materiaId;
  
      if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "materiaId inválido." });
      }
  
      const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      const inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      }).lean();
  
      if (!inst) {
        return res.status(404).json({ message: "No existe instancia para este ejercicio." });
      }
  
      const analisisIA = inst?.analisisIA ?? null;
      const analisisGeneradoAt = inst?.analisisGeneradoAt ?? null;
      const analisisFuente = inst?.analisisFuente ?? "unknown";
  
      return res.json({
        ok: true,
        estado: inst?.estado || "bloqueado",
        respuestas: inst?.respuestas || {},
  
        // ✅ calificaciones / informe
        calificacion: inst?.calificacion ?? null,
        calificacionFinal: inst?.calificacionFinal ?? null,
        evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,
  
        feedback: inst?.feedback || "",
  
        // ✅ análisis IA (nombres correctos)
        analisisIA,
        analisisGeneradoAt,
        analisisFuente,
  
        // ✅ compat (por si alguna parte vieja lo usa)
        analisisIAGeneradoAt: analisisGeneradoAt,
  
        intentosUsados: inst?.intentosUsados || 0,
        updatedAt: inst?.updatedAt || null,
        createdAt: inst?.createdAt || null,
        completedAt: inst?.completedAt || null,
      });
    } catch (err) {
      console.error("❌ Error obtenerResultadoEjercicio:", err);
      return res.status(500).json({
        message: "Error al obtener resultado del ejercicio.",
        error: err.message,
      });
    }
  };

exports.obtenerEntrelazadosSubmodulo = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, submoduloId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(materiaId)) {
      return res.status(400).json({ message: "materiaId inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: "submoduloId inválido." });
    }

    const sub = await Submodulo.findById(submoduloId).select("_id modulo").lean();
    if (!sub) return res.status(404).json({ message: "Submódulo no encontrado." });

    const moduloId = sub.modulo;
    if (!moduloId) return res.status(404).json({ message: "Submódulo sin módulo." });

    const modInst = await ModuloInstancia.findOne({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: moduloId,
    })
      .select("_id")
      .lean();

    if (!modInst?._id) return res.json({ entrelazados: {} });

    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).select("_id").lean();
    const ejIds = ejercicios.map((e) => e._id);

    if (!ejIds.length) return res.json({ entrelazados: {} });

    const instancias = await EjercicioInstancia.find({
      estudiante: estudianteId,
      moduloInstancia: modInst._id,
      ejercicio: { $in: ejIds },
    })
      .select("ejercicio respuestas.rolePlaying.meta")
      .lean();

    const entrelazados = {};
    for (const it of instancias) {
      const ejId = String(it.ejercicio);
      const meta = it?.respuestas?.rolePlaying?.meta;
      if (meta?.entrelazado === true) {
        entrelazados[ejId] = true;
      }
    }

    return res.json({ entrelazados });
  } catch (e) {
    console.error("❌ obtenerEntrelazadosSubmodulo error:", e);
    return res.status(500).json({ message: "Error obteniendo entrelazados", error: e.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/analisis-ia
   ✅ FIX: fuente robusta + persistencia segura
   ========================================================= */
   exports.guardarAnalisisIAEjercicio = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { ejercicioId } = req.params;
  
      const {
        materiaId,
        analisisIA,
        fuente = "ai",
        replace = true,
      } = req.body || {};
  
      if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
  
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "materiaId inválido." });
      }
  
      if (!analisisIA || typeof analisisIA !== "object" || Array.isArray(analisisIA)) {
        return res.status(400).json({
          message: "analisisIA es requerido y debe ser un objeto (JSON).",
        });
      }
  
      const ctx = await getContextForEjercicioInstancia({
        estudianteId,
        materiaId,
        ejercicioId,
      });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      const now = nowDate();
  
      // ✅ fuente robusta (no se rompe aunque llegue basura)
      const allowed = new Set(["ai", "mock", "unknown", "legacy", "manual", "real"]);
      const fuenteSafe = allowed.has(String(fuente)) ? String(fuente) : "unknown";
  
      let inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      });
  
      if (!inst) {
        inst = await EjercicioInstancia.create({
          estudiante: estudianteId,
          moduloInstancia: ctx.modInst._id,
          ejercicio: ejercicioId,
  
          // no tocamos tu flujo: si no existe la instancia, la creamos en progreso
          estado: "en_progreso",
          startedAt: now,
  
          analisisIA,
          analisisGeneradoAt: now,
          analisisFuente: fuenteSafe,
        });
  
        return res.json({
          ok: true,
          created: true,
          analisisGeneradoAt: inst.analisisGeneradoAt,
          analisisFuente: inst.analisisFuente,
        });
      }
  
      // ✅ replace / merge
      if (replace) {
        inst.analisisIA = analisisIA;
      } else {
        const prev =
          inst.analisisIA && typeof inst.analisisIA === "object" ? inst.analisisIA : {};
        inst.analisisIA = deepMergeNoArrays(prev, analisisIA);
      }
  
      inst.analisisGeneradoAt = now;
      inst.analisisFuente = fuenteSafe;
  
      await inst.save();
  
      return res.json({
        ok: true,
        created: false,
        analisisGeneradoAt: inst.analisisGeneradoAt,
        analisisFuente: inst.analisisFuente,
      });
    } catch (err) {
      console.error("❌ Error guardarAnalisisIAEjercicio:", err);
      return res.status(500).json({
        message: "Error al guardar análisis IA.",
        error: err.message,
      });
    }
  };

  // GET /estudiante/instancias/:instanciaId/resultado
exports.obtenerResultadoPorInstanciaId = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { instanciaId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(instanciaId)) {
      return res.status(400).json({ message: "instanciaId inválido." });
    }

    // ✅ seguridad: la instancia debe ser del estudiante
    const inst = await EjercicioInstancia.findOne({
      _id: instanciaId,
      estudiante: estudianteId,
    }).lean();

    if (!inst) return res.status(404).json({ message: "Instancia no encontrada." });

    return res.json({
      ok: true,
      estado: inst?.estado || "bloqueado",
      respuestas: inst?.respuestas || {},

      calificacion: inst?.calificacion ?? null,
      calificacionFinal: inst?.calificacionFinal ?? null,
      evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,

      feedback: inst?.feedback || "",

      analisisIA: inst?.analisisIA ?? null,
      analisisGeneradoAt: inst?.analisisGeneradoAt ?? null,
      analisisFuente: inst?.analisisFuente ?? "unknown",

      analisisIAGeneradoAt: inst?.analisisGeneradoAt ?? null, // compat

      intentosUsados: inst?.intentosUsados || 0,
      updatedAt: inst?.updatedAt || null,
      createdAt: inst?.createdAt || null,
      completedAt: inst?.completedAt || null,
    });
  } catch (err) {
    console.error("❌ Error obtenerResultadoPorInstanciaId:", err);
    return res.status(500).json({
      message: "Error al obtener resultado por instancia.",
      error: err.message,
    });
  }
};