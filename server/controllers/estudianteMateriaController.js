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
    // si existe pero está "pendiente", lo ponemos en progreso al entrar
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
    // ✅ si este submódulo debe estar pendiente y por algún dato viejo quedó bloqueado, lo arreglamos
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

  // ✅ Si existen, NO reinicializamos, pero sí corregimos el caso viejo:
  // - si este submódulo debe tener su primer ejercicio pendiente y TODOS están bloqueados => desbloqueamos el primero
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
    const estadoInicial = i === 0
      ? (primerEjercicioPendiente ? "pendiente" : "bloqueado")
      : "bloqueado";

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
async function completarEjercicioYAvanzar({
  estudianteId,
  materiaId,
  ejercicioId,
}) {
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
  if (idx < 0) return { ok: false, code: 404, message: "Ejercicio no pertenece al submódulo." };

  // marcar actual completado
  await EjercicioInstancia.findOneAndUpdate(
    { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId },
    { $set: { estado: "completado" } },
    { upsert: true, new: true }
  );

  // siguiente
  const next = lista[idx + 1] || null;

  if (next) {
    // desbloquear next solo si está bloqueado
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

    // submódulo queda en progreso (si aún no)
    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
      { $set: { estado: "en_progreso", modulo: moduloId } },
      { upsert: true }
    );

    return { ok: true, moduloId, submoduloId, nextEjercicioId: next._id };
  }

  // si no hay next => último completado => submódulo completado
await SubmoduloInstancia.findOneAndUpdate(
  { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
  { $set: { estado: "completado", modulo: moduloId } },
  { upsert: true }
);

// ✅ Desbloquear el siguiente submódulo del MISMO módulo (si existe)
const listaSubs = await Submodulo.find({ modulo: moduloId })
  .select("_id createdAt")
  .sort({ createdAt: 1 })
  .lean();

const subIdx = listaSubs.findIndex((x) => String(x._id) === String(submoduloId));
const nextSub = subIdx >= 0 ? (listaSubs[subIdx + 1] || null) : null;

if (nextSub) {
  // poner siguiente submódulo en pendiente (si estaba bloqueado)
  await SubmoduloInstancia.findOneAndUpdate(
    { estudiante: estudianteId, materia: materiaId, submodulo: nextSub._id },
    { $setOnInsert: { estado: "pendiente", modulo: moduloId } },
    { upsert: true }
  );

    // asegurar ejercicios del siguiente submódulo:
    // ✅ ahora su primer ejercicio debe quedar pendiente
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

  // asegura instancias base (no cambia estados si ya existen)
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

/**
 * Acumula tiempo en segundos desde startedAt hasta now.
 * - suma a tiempoAcumuladoSeg
 * - push a sesiones[]
 * - limpia startedAt
 */
function acumularTiempoSiCorriendo(inst, now = nowDate()) {
  if (!inst?.startedAt) return 0;

  const start = new Date(inst.startedAt);
  const end = new Date(now);

  const diffMs = end.getTime() - start.getTime();
  const segundos = Math.max(0, Math.round(diffMs / 1000));

  inst.tiempoAcumuladoSeg = Number(inst.tiempoAcumuladoSeg || 0) + segundos;

  // auditoría opcional (si existe el campo sesiones)
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

/**
 * Asegura que startedAt esté seteado cuando se entra en progreso.
 * No lo reinicia si ya existe (para evitar resetear el tiempo).
 */
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

/**
 * Regla segura:
 * - accumulated nunca baja (solo sube)
 * - resetUsed: solo puede pasar false -> true (nunca vuelve a false)
 * - resetAutoLocked: solo false -> true
 * - startedAt: si viene inválido, null
 */
function normalizeRuntimeScope(incoming = {}, current = {}) {
  const inObj = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current && typeof current === "object" ? current : {};

  const next = { ...curObj };

  // recState
  const inRec = normRecState(inObj.recState);
  if (inRec) next.recState = inRec;

  // startedAt
  // - si viene null => lo aceptamos
  // - si viene algo parseable => lo aceptamos
  // - si viene basura => null
  if (Object.prototype.hasOwnProperty.call(inObj, "startedAt")) {
    const v = inObj.startedAt;
    if (!v) next.startedAt = null;
    else {
      const d = new Date(v);
      next.startedAt = Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // accumulated (monótono)
  if (Object.prototype.hasOwnProperty.call(inObj, "accumulated")) {
    const inAcc = clampNum(inObj.accumulated, 0, 60 * 60); // 0..3600 (si tu máximo es 60min)
    const curAcc = clampNum(curObj.accumulated, 0, 60 * 60);
    next.accumulated = Math.max(curAcc, inAcc);
  } else {
    next.accumulated = clampNum(curObj.accumulated, 0, 60 * 60);
  }

  // resetUsed (solo false->true)
  if (curObj.resetUsed === true) next.resetUsed = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetUsed")) next.resetUsed = Boolean(inObj.resetUsed);
  else next.resetUsed = Boolean(curObj.resetUsed);

  // resetAutoLocked (solo false->true)
  if (curObj.resetAutoLocked === true) next.resetAutoLocked = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetAutoLocked")) next.resetAutoLocked = Boolean(inObj.resetAutoLocked);
  else next.resetAutoLocked = Boolean(curObj.resetAutoLocked);

  next.updatedAt = Date.now();
  return next;
}

/**
 * Normaliza runtime completo { sesion, pruebas }
 */
function normalizeRoleplayRuntime(incoming = {}, current = {}) {
  const inObj = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current && typeof current === "object" ? current : {};

  return {
    sesion: normalizeRuntimeScope(inObj.sesion || {}, curObj.sesion || {}),
    pruebas: normalizeRuntimeScope(inObj.pruebas || {}, curObj.pruebas || {}),
  };
}

/* =========================================================
   ✅ Helpers RUNTIME (PEGAR 1 VEZ arriba de los endpoints)
   ========================================================= */

   function getRoleplayRuntimeFromRespuestas(respuestas = {}) {
    const rp = respuestas?.rolePlaying;
  
    // 1) path canónico esperado
    const r1 = rp?.runtime;
    if (r1 && typeof r1 === "object") return r1;
  
    // 2) lo que tienes en BD (payload.rolePlaying.runtime)
    const r2 = rp?.payload?.rolePlaying?.runtime;
    if (r2 && typeof r2 === "object") return r2;
  
    // 3) otros duplicados comunes que veo en tu JSON
    const r3 = rp?.sessionData?.rolePlaying?.runtime;
    if (r3 && typeof r3 === "object") return r3;
  
    const r4 = rp?.data?.rolePlaying?.runtime;
    if (r4 && typeof r4 === "object") return r4;
  
    return null;
  }
  
  function setRoleplayRuntimeCanonical(respuestas = {}, runtimeFull) {
    if (!runtimeFull || typeof runtimeFull !== "object") return respuestas;
  
    const out = respuestas && typeof respuestas === "object" ? respuestas : {};
    const rp = out.rolePlaying && typeof out.rolePlaying === "object" ? out.rolePlaying : {};
    out.rolePlaying = rp;
  
    // ✅ CANÓNICO (para el backend)
    rp.runtime = runtimeFull;
  
    // ✅ si existen estos contenedores, mantenlos sincronizados para no romper tu UI actual
    if (rp.payload && typeof rp.payload === "object") {
      rp.payload.rolePlaying = rp.payload.rolePlaying && typeof rp.payload.rolePlaying === "object"
        ? rp.payload.rolePlaying
        : {};
      rp.payload.rolePlaying.runtime = runtimeFull;
    }
  
    if (rp.sessionData && typeof rp.sessionData === "object") {
      rp.sessionData.rolePlaying = rp.sessionData.rolePlaying && typeof rp.sessionData.rolePlaying === "object"
        ? rp.sessionData.rolePlaying
        : {};
      rp.sessionData.rolePlaying.runtime = runtimeFull;
    }
  
    if (rp.data && typeof rp.data === "object") {
      rp.data.rolePlaying = rp.data.rolePlaying && typeof rp.data.rolePlaying === "object"
        ? rp.data.rolePlaying
        : {};
      rp.data.rolePlaying.runtime = runtimeFull;
    }
  
    return out;
  }

  function get(obj, path) {
    try {
      return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
    } catch {
      return undefined;
    }
  }
  
  /**
   * ✅ Extrae runtime roleplay aunque venga en distintos shapes:
   * - respuestas.rolePlaying.runtime
   * - respuestas.rolePlaying.payload.rolePlaying.runtime   (TU BD REAL)
   * - respuestas.rolePlaying.sessionData.rolePlaying.runtime
   * - respuestas.rolePlaying.data.rolePlaying.runtime
   */
  function extractRoleplayRuntime(respuestas) {
    return (
      get(respuestas, "rolePlaying.runtime") ||
      get(respuestas, "rolePlaying.payload.rolePlaying.runtime") ||
      get(respuestas, "rolePlaying.sessionData.rolePlaying.runtime") ||
      get(respuestas, "rolePlaying.data.rolePlaying.runtime") ||
      null
    );
  }
  
  /**
   * ✅ Espejea el runtime normalizado a:
   * - respuestas.rolePlaying.runtime (canónico)
   * - y si existen payload/sessionData/data, también los actualiza para que el FE lo vea igual.
   */
  function mirrorRoleplayRuntime(respuestas, safeRuntime) {
    if (!respuestas || typeof respuestas !== "object") return respuestas;
  
    respuestas.rolePlaying = respuestas.rolePlaying && typeof respuestas.rolePlaying === "object"
      ? respuestas.rolePlaying
      : {};
  
    // canónico
    respuestas.rolePlaying.runtime = safeRuntime;
  
    // espejo (tu shape actual)
    if (respuestas.rolePlaying.payload && typeof respuestas.rolePlaying.payload === "object") {
      respuestas.rolePlaying.payload.rolePlaying =
        respuestas.rolePlaying.payload.rolePlaying && typeof respuestas.rolePlaying.payload.rolePlaying === "object"
          ? respuestas.rolePlaying.payload.rolePlaying
          : {};
      respuestas.rolePlaying.payload.rolePlaying.runtime = safeRuntime;
    }
  
    if (respuestas.rolePlaying.sessionData && typeof respuestas.rolePlaying.sessionData === "object") {
      respuestas.rolePlaying.sessionData.rolePlaying =
        respuestas.rolePlaying.sessionData.rolePlaying && typeof respuestas.rolePlaying.sessionData.rolePlaying === "object"
          ? respuestas.rolePlaying.sessionData.rolePlaying
          : {};
      respuestas.rolePlaying.sessionData.rolePlaying.runtime = safeRuntime;
    }
  
    if (respuestas.rolePlaying.data && typeof respuestas.rolePlaying.data === "object") {
      respuestas.rolePlaying.data.rolePlaying =
        respuestas.rolePlaying.data.rolePlaying && typeof respuestas.rolePlaying.data.rolePlaying === "object"
          ? respuestas.rolePlaying.data.rolePlaying
          : {};
      respuestas.rolePlaying.data.rolePlaying.runtime = safeRuntime;
    }
  
    return respuestas;
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
   Devuelve árbol: Materia -> Módulos -> Submódulos -> Ejercicios
   (y si existen instancias, agrega estado/progreso)
   ✅ AHORA: incluye detalles para:
      - Grabar voz (caso + evaluaciones)
      - RolePlay (rolePlaying: { consentimiento, tipoConsentimiento, herramientas, evaluaciones, ... })
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

    // 1) módulos
    const modulos = await Modulo.find({
      _id: { $in: modulosIds },
      activo: true,
    })
      .select("titulo descripcion tipoModulo esGlobal universidad activo createdAt")
      .lean();

    // respetar el orden de la materia
    const modulosMap = new Map(modulos.map((m) => [String(m._id), m]));
    const modulosOrdenados = modulosIds
      .map((id) => modulosMap.get(String(id)))
      .filter(Boolean);

    const modulosObjIds = modulosOrdenados.map((m) => m._id);

    // 2) submódulos
    const submodulos = await Submodulo.find({
      modulo: { $in: modulosObjIds },
    })
      .select("modulo titulo descripcion reintento createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const subIds = submodulos.map((s) => s._id);

    // 3) ejercicios (GENÉRICOS)
    const ejercicios = await Ejercicio.find({
      submodulo: { $in: subIds },
    })
      .select("submodulo tipoEjercicio tipoModulo titulo tiempo createdAt")
      .sort({ createdAt: 1 })
      .lean();

    // ✅ 3.1) DETALLES para "Grabar voz" (caso + evaluaciones)
    const grabarIds = ejercicios
      .filter((e) => e.tipoEjercicio === "Grabar voz")
      .map((e) => e._id);

    let grabarMap = new Map();
    if (grabarIds.length) {
      const grabarDetalles = await EjercicioGrabarVoz.find({
        ejercicio: { $in: grabarIds },
      })
        .select("ejercicio caso evaluaciones")
        .lean();

      grabarMap = new Map(grabarDetalles.map((d) => [String(d.ejercicio), d]));
    }

    // ✅ 3.2) DETALLES para RolePlay
    const roleIds = ejercicios
      .filter((e) => isRolePlayTipo(e.tipoEjercicio))
      .map((e) => e._id);

    let roleMap = new Map();
    if (roleIds.length) {
      const roleDetalles = await EjercicioRolePlay.find({
        ejercicio: { $in: roleIds },
      }).lean();

      roleMap = new Map(roleDetalles.map((d) => [String(d.ejercicio), d]));
    }

    /* =========================================================
    ✅ INICIALIZACIÓN POR MÓDULO:
    - Solo el primer submódulo del módulo: pendiente
    - Solo el primer ejercicio del primer submódulo: pendiente
    - Todo lo demás: bloqueado
  ========================================================= */

  const subsByModuloInit = new Map();
  for (const s of submodulos) {
    const key = String(s.modulo);
    if (!subsByModuloInit.has(key)) subsByModuloInit.set(key, []);
    subsByModuloInit.get(key).push(s);
  }

  // submodulos ya vienen ordenados por createdAt asc, así que el [0] es el primero real.
  for (const [modKey, subs] of subsByModuloInit.entries()) {
    for (let i = 0; i < subs.length; i++) {
      const s = subs[i];

      const esPrimerSubmodulo = i === 0;

      await asegurarEstadosSubmodulo({
        estudianteId,
        materiaId,
        moduloId: s.modulo,
        submoduloId: s._id,

        // ✅ regla: solo el primer submódulo inicia pendiente
        submoduloPendiente: esPrimerSubmodulo,

        // ✅ regla: solo el primer ejercicio del primer submódulo inicia pendiente
        primerEjercicioPendiente: esPrimerSubmodulo,
      });
    }
  }

    // ===== instancias (reales) =====
    let ejercicioInstMap = new Map();
    let moduloInstMap = new Map();

    // 1) instancias de módulo para esta materia + estos módulos
    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: { $in: modulosObjIds },
    })
      .select("_id modulo estado progreso updatedAt createdAt")
      .lean();

    moduloInstMap = new Map(modInst.map((x) => [String(x.modulo), x]));

    // 2) instancias de ejercicio: se relacionan por moduloInstancia (NO por materia)
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

    // ===== armar árbol =====
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

          // base
          let merged = { ...e };

          // merge grabar voz
          const gv = grabarMap.get(String(e._id));
          if (gv) {
            merged = { ...merged, caso: gv.caso, evaluaciones: gv.evaluaciones };
          }

          // merge role play
          const rp = roleMap.get(String(e._id));
          if (rp) {
            merged = { ...merged, rolePlaying: rp };
          }

          return {
            ...merged,
            instancia: inst,
          };
        });

        return { ...s, ejercicios: ejs };
      });

      return {
        ...m,
        instancia: modInstItem,
        submodulos: subs,
      };
    });

    return res.json({
      materia,
      modulos: modulosTree,
    });
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
   buscarEjercicioEnMateria (ACTUALIZADO)
   - Devuelve ctx completo + detalle por tipo
   - ✅ Ahora SIEMPRE incluye ejercicioInstancia / instanciaId / moduloInstanciaId
   ========================================================= */
   exports.buscarEjercicioEnMateria = async (req, res) => {
    try {
      const estudianteId = req.user?.id || req.user?._id;
      const { materiaId, ejercicioId } = req.params;
  
      if (!estudianteId) {
        return res.status(401).json({ message: "No autenticado." });
      }
  
      if (!mongoose.Types.ObjectId.isValid(materiaId)) {
        return res.status(400).json({ message: "ID de materia inválido." });
      }
      if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
  
      // 1) validar inscripción
      const materia = await Materia.findOne({
        _id: materiaId,
        estudiantes: estudianteId,
      })
        .select("nombre codigo grupo periodoAcademico universidad modulosGlobales modulosLocales")
        .lean();
  
      if (!materia) {
        return res.status(404).json({
          message: "Materia no encontrada o no estás inscrito.",
        });
      }
  
      // 2) traer ejercicio + submodulo + modulo
      const ejercicio = await Ejercicio.findById(ejercicioId)
        .populate({
          path: "submodulo",
          populate: { path: "modulo" },
        })
        .lean();
  
      if (!ejercicio) {
        return res.status(404).json({ message: "Ejercicio no encontrado." });
      }
  
      const submodulo = ejercicio.submodulo || null;
      const modulo = submodulo?.modulo || null;
  
      if (!modulo?._id) {
        return res.status(404).json({ message: "No se encontró el módulo del ejercicio." });
      }
  
      // 3) validar que el módulo pertenece a la materia
      const modulosIds = [
        ...(materia.modulosGlobales || []),
        ...(materia.modulosLocales || []),
      ].map(String);
  
      if (!modulosIds.includes(String(modulo._id))) {
        return res.status(404).json({
          message: "El ejercicio no pertenece a esta materia.",
        });
      }
  
      // 4) traer detalle según tipo
      const detalle = await obtenerDetalleEjercicioPorTipo(ejercicio);
  
      // ✅ Merge para normalizar consumo en frontend
      const tipo = ejercicio.tipoEjercicio;
      let ejercicioMerged = { ...ejercicio };
  
      // grabar voz => ejercicio.caso + ejercicio.evaluaciones
      if (tipo === "Grabar voz" && detalle) {
        ejercicioMerged = {
          ...ejercicioMerged,
          caso: detalle.caso,
          evaluaciones: detalle.evaluaciones,
        };
      }
  
      // role play => ejercicio.rolePlaying
      if (isRolePlayTipo(tipo) && detalle) {
        ejercicioMerged = {
          ...ejercicioMerged,
          rolePlaying: detalle,
        };
      }
  
      // ✅ 5) Obtener contexto + ModuloInstancia correcto
      const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
      if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });
  
      // ✅ 6) Traer la EjercicioInstancia real (para instanciaId estable)
      const inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      })
        .select("_id estado startedAt tiempoAcumuladoSeg completedAt updatedAt createdAt")
        .lean();
  
      return res.json({
        materia,
        modulo,
        submodulo,
        ejercicio: ejercicioMerged,
        detalle,
  
        // ✅ CLAVE para frontend (runtimeKey/draftKey estables)
        ejercicioInstancia: inst || null,
        instancia: inst || null, // compat
        instanciaId: inst?._id || null,
        moduloInstanciaId: ctx.modInst?._id || null,
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
   (tu código original intacto)
   ========================================================= */
exports.dashboardResumen = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;

    if (!estudianteId) {
      return res.status(401).json({ message: "No autenticado." });
    }

    // 1) Materias del estudiante
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
        metrics: {
          simulacionesActivas: 0,
          horasSemana: 0,
          progresoGeneralPct: 0,
        },
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

    // 2) IDs de módulos asignados (todas las materias)
    const modulosIdsAll = [];
    for (const mat of materias) {
      const ids = [
        ...(mat.modulosGlobales || []),
        ...(mat.modulosLocales || []),
      ].map(String);
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
        metrics: {
          simulacionesActivas: 0,
          horasSemana: 0,
          progresoGeneralPct: 0,
        },
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

    // 3) Traer módulos -> submódulos -> ejercicios (para totales/tiempos)
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

    // 4) Instancias de módulos del estudiante
    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId,
      modulo: { $in: modulosObjIds },
    })
      .select("_id modulo materia estado progreso updatedAt createdAt")
      .lean();

    const modInstIds = modInst.map((x) => x._id);

    // 5) Instancias de ejercicios
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

    // ====== MÉTRICAS ======
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

    // horasSemana proxy
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 domingo
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

    // módulosEvaluados
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
      metrics: {
        simulacionesActivas,
        horasSemana,
        progresoGeneralPct,
      },
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
   abrirEjercicio (ACTUALIZADO)
   - si está pendiente => pasa a en_progreso
   - si está bloqueado => 403
   - ✅ Ahora devuelve instanciaId + ejercicioInstancia
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
  
      // regla de desbloqueo por orden
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
  
      // instancia actual
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
  
      return res.json({ ok: true });
    } catch (err) {
      console.error("❌ Error abrirEjercicio:", err);
      return res.status(500).json({ message: "Error al abrir ejercicio.", error: err.message });
    }
  };
  
/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/finalizar
   - ✅ GUARDA respuestas/calificación/feedback
   - marca completado
   - desbloquea siguiente
   - si último => submódulo completado
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
  
      // ===== asegurar instancia + guardar payload FINAL =====
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
          startedAt: now, // ✅ si nunca se abrió formalmente, al menos empieza aquí
          respuestas: respuestas || {},
          calificacion: calificacion ?? null,
          feedback: feedback || "",
        });
      } else {
        const st = normEstadoInstancia(inst.estado);
        if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
        if (st === "completado") {
          return res.status(409).json({ message: "Ejercicio ya completado." });
        }
  
        // si estaba pendiente lo consideramos en progreso
        if (st === "pendiente") inst.estado = "en_progreso";
  
        // ✅ TIEMPO REAL: si llega a finalizar y nunca tuvo startedAt, lo ponemos ahora mismo
        if (inst.estado === "en_progreso") {
          marcarInicioSiNoExiste(inst, now);
        }
  
        const prevResp = inst.respuestas || {};
        inst.respuestas = replace ? (respuestas || {}) : deepMergeNoArrays(prevResp, respuestas || {});
  
        if (calificacion !== undefined) inst.calificacion = calificacion;
        if (feedback !== undefined) inst.feedback = feedback;
      }
  
      // ✅ TIEMPO REAL: acumula lo corrido y marca completado
      acumularTiempoSiCorriendo(inst, now);
      inst.estado = "completado";
      inst.completedAt = now;
      await inst.save();
  
      // ===== desbloquear siguiente / cerrar submódulo =====
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
   obtenerBorradorEjercicio (ACTUALIZADO)
   - Devuelve respuestas guardadas en EjercicioInstancia.respuestas
   - ✅ También devuelve runtime roleplay + serverNow
   - ✅ Ahora devuelve instanciaId explícito (y ejercicioInstancia mínimo)
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
      }).lean();
  
      const respuestas = inst?.respuestas || {};
      const runtime = extractRoleplayRuntime(respuestas); // ✅ FIX
  
      return res.json({
        ok: true,
        estado: inst?.estado || "bloqueado",
        respuestas,
        runtimeRoleplay: runtime, // ✅ ahora sí
        serverNow: new Date().toISOString(),
  
        calificacion: inst?.calificacion ?? null,
        feedback: inst?.feedback || "",
  
        analisisIA: inst?.analisisIA || null,
        analisisGeneradoAt: inst?.analisisGeneradoAt || null,
        analisisFuente: inst?.analisisFuente || "unknown",
  
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
   body: { materiaId, respuestas, replace?: boolean }
   - Guarda progreso (respuestas) sin finalizar.
   - Si estaba pendiente => pasa a en_progreso.
   - Si está bloqueado => 403.
   - ✅ Normaliza/persiste runtime roleplay (elapsed/remaining/resetUsed)
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
  
      // regla de desbloqueo por orden
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
  
      let inst = await EjercicioInstancia.findOne({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
      });
  
      // =========================
      // CREATE
      // =========================
      if (!inst) {
        const payload = {
          estudiante: estudianteId,
          moduloInstancia: ctx.modInst._id,
          ejercicio: ejercicioId,
          estado: "en_progreso",
          startedAt: now,
          respuestas: respuestas || {},
        };
  
        // ✅ FIX: runtime puede venir anidado
        const incomingRuntime = extractRoleplayRuntime(payload.respuestas);
  
        if (incomingRuntime) {
          const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, {});
          mirrorRoleplayRuntime(payload.respuestas, safeRuntime);
        }
  
        await EjercicioInstancia.create(payload);
        return res.json({ ok: true, created: true });
      }
  
      // =========================
      // UPDATE
      // =========================
      const st = normEstadoInstancia(inst.estado);
      if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
      if (st === "completado") return res.status(409).json({ message: "Ejercicio ya completado." });
  
      if (st === "pendiente") inst.estado = "en_progreso";
  
      if (inst.estado === "en_progreso") {
        marcarInicioSiNoExiste(inst, now);
      }
  
      const prevResp = inst.respuestas || {};
      const nextResp = replace ? (respuestas || {}) : deepMergeNoArrays(prevResp, respuestas || {});
  
      // ✅ FIX: runtime puede venir anidado en nextResp
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
   - Devuelve todo para la pantalla de evaluación (informe, nota, etc.)
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

    return res.json({
      ok: true,
      estado: inst?.estado || "bloqueado",
      respuestas: inst?.respuestas || {},
      calificacion: inst?.calificacion ?? null,
      feedback: inst?.feedback || "",
      analisisIA: inst?.analisisIA || null,
      analisisIAGeneradoAt: inst?.analisisIAGeneradoAt || null,
      analisisIAEnfoque: inst?.analisisIAEnfoque || "",
      intentosUsados: inst?.intentosUsados || 0,
      updatedAt: inst?.updatedAt || null,
      createdAt: inst?.createdAt || null,
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

    // 1) Submódulo -> moduloId (para encontrar ModuloInstancia correcto)
    const sub = await Submodulo.findById(submoduloId).select("_id modulo").lean();
    if (!sub) return res.status(404).json({ message: "Submódulo no encontrado." });

    const moduloId = sub.modulo;
    if (!moduloId) return res.status(404).json({ message: "Submódulo sin módulo." });

    // 2) ModuloInstancia del estudiante para ESA materia y ESE módulo
    const modInst = await ModuloInstancia.findOne({
      estudiante: estudianteId,
      materia: materiaId,
      modulo: moduloId,
    }).select("_id").lean();

    // Si no existe, no hay instancias => no hay entrelazados
    if (!modInst?._id) return res.json({ entrelazados: {} });

    // 3) Ejercicios del submódulo (orden real no importa para esto)
    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).select("_id").lean();
    const ejIds = ejercicios.map((e) => e._id);

    if (!ejIds.length) return res.json({ entrelazados: {} });

    // 4) Instancias del estudiante para esos ejercicios dentro de este moduloInstancia
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
   body: { materiaId, analisisIA, enfoque?, replace?: boolean }
   - Guarda análisis IA completo en EjercicioInstancia
   - NO cambia estado del ejercicio (puede estar en_progreso o completado)
   ========================================================= */
exports.guardarAnalisisIAEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;

    const { materiaId, analisisIA, fuente = "ai", replace = true } = req.body || {};

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
      return res.status(400).json({ message: "ID de ejercicio inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(materiaId)) {
      return res.status(400).json({ message: "materiaId inválido." });
    }

    if (!analisisIA || typeof analisisIA !== "object") {
      return res.status(400).json({
        message: "analisisIA es requerido y debe ser un objeto (JSON).",
      });
    }

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const now = nowDate();

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId,
      moduloInstancia: ctx.modInst._id,
      ejercicio: ejercicioId,
    });

    // Si no existe instancia, la creamos
    if (!inst) {
      inst = await EjercicioInstancia.create({
        estudiante: estudianteId,
        moduloInstancia: ctx.modInst._id,
        ejercicio: ejercicioId,
        estado: "en_progreso",
        startedAt: now,

        analisisIA,
        analisisGeneradoAt: now,
        analisisFuente: ["ai", "mock", "unknown"].includes(fuente) ? fuente : "unknown",
      });

      return res.json({ ok: true, created: true });
    }

    // Update análisis existente
    if (replace) {
      inst.analisisIA = analisisIA;
    } else {
      const prev = inst.analisisIA && typeof inst.analisisIA === "object" ? inst.analisisIA : {};
      inst.analisisIA = deepMergeNoArrays(prev, analisisIA);
    }

    inst.analisisGeneradoAt = now;
    inst.analisisFuente = ["ai", "mock", "unknown"].includes(fuente) ? fuente : "unknown";

    await inst.save();

    return res.json({ ok: true, created: false });
  } catch (err) {
    console.error("❌ Error guardarAnalisisIAEjercicio:", err);
    return res.status(500).json({
      message: "Error al guardar análisis IA.",
      error: err.message,
    });
  }
};