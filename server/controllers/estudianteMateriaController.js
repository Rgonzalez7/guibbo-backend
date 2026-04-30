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
  EjercicioInformeClinico,
} = require("../models/modulo");

const ModuloInstancia    = require("../models/moduloInstancia");
const SubmoduloInstancia = require("../models/submoduloInstancia");
const EjercicioInstancia = require("../models/ejercicioInstancia");
const Usuario            = require("../models/user");

/* =========================================================
   Helpers
========================================================= */
function oid(v) {
  try { return new mongoose.Types.ObjectId(String(v)); } catch { return null; }
}

function isRolePlayTipo(tipo) {
  return ["Role playing persona", "Role Playing IA"].includes(tipo);
}

function deepMergeNoArrays(target = {}, source = {}) {
  const out = { ...(target || {}) };
  const src = source || {};
  for (const k of Object.keys(src)) {
    const sv = src[k];
    const tv = out[k];
    const isObj  = sv && typeof sv === "object" && !Array.isArray(sv) && !(sv instanceof Date);
    const isObjT = tv && typeof tv === "object" && !Array.isArray(tv) && !(tv instanceof Date);
    if (isObj && isObjT) out[k] = deepMergeNoArrays(tv, sv);
    else out[k] = sv;
  }
  return out;
}

async function obtenerDetalleEjercicioPorTipo(ejercicio) {
  if (!ejercicio?._id) return null;
  const tipo = ejercicio.tipoEjercicio;

  if (tipo === "Grabar voz")
    return await EjercicioGrabarVoz.findOne({ ejercicio: ejercicio._id }).lean();
  if (tipo === "Interpretación de frases incompletas")
    return await EjercicioInterpretacionFrases.findOne({ ejercicio: ejercicio._id }).lean();
  if (isRolePlayTipo(tipo))
    return await EjercicioRolePlay.findOne({ ejercicio: ejercicio._id }).lean();
  if (tipo === "Criterios de diagnostico")
    return await EjercicioCriteriosDx.findOne({ ejercicio: ejercicio._id }).lean();
  if (tipo === "Aplicación de pruebas")
    return await EjercicioPruebas.findOne({ ejercicio: ejercicio._id }).lean();
  if (tipo === "Pruebas psicometricas")
    return await EjercicioInterpretacionProyectiva.findOne({ ejercicio: ejercicio._id }).lean();
  if (tipo === "Informe clínico")
    return await EjercicioInformeClinico.findOne({ ejercicio: ejercicio._id }).lean(); // ✅ NUEVO

  return null;
}

function normEstadoInstancia(raw) {
  const e = String(raw || "").toLowerCase().trim();
  if (e === "completado")  return "completado";
  if (e === "en_progreso") return "en_progreso";
  if (e === "pendiente")   return "pendiente";
  return "bloqueado";
}

async function asegurarModuloInstancia({ estudianteId, materiaId, moduloId }) {
  let modInst = await ModuloInstancia.findOne({
    estudiante: estudianteId, materia: materiaId, modulo: moduloId,
  });
  if (!modInst) {
    modInst = await ModuloInstancia.create({
      estudiante: estudianteId, materia: materiaId, modulo: moduloId,
      estado: "en_progreso", progreso: 0,
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

async function asegurarEstadosSubmodulo({
  estudianteId, materiaId, moduloId, submoduloId,
  submoduloPendiente = false, primerEjercicioPendiente = false,
}) {
  const modInst = await asegurarModuloInstancia({ estudianteId, materiaId, moduloId });

  let subInst = await SubmoduloInstancia.findOne({
    estudiante: estudianteId, materia: materiaId, submodulo: submoduloId,
  });
  if (!subInst) {
    subInst = await SubmoduloInstancia.create({
      estudiante: estudianteId, materia: materiaId, modulo: moduloId, submodulo: submoduloId,
      estado: submoduloPendiente ? "pendiente" : "bloqueado",
    });
  } else {
    const st = normEstadoInstancia(subInst.estado);
    if (submoduloPendiente && st === "bloqueado") {
      subInst.estado = "pendiente";
      await subInst.save();
    }
  }

  const ejercicios = await Ejercicio.find({ submodulo: submoduloId })
    .select("_id createdAt").sort({ createdAt: 1 }).lean();
  if (!ejercicios.length) return { modInst, subInst };

  const ejIds = ejercicios.map((e) => e._id);
  const existentes = await EjercicioInstancia.find({
    estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: { $in: ejIds },
  }).select("ejercicio estado").lean();

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

  const ops = [];
  for (let i = 0; i < ejIds.length; i++) {
    const estadoInicial = i === 0 ? (primerEjercicioPendiente ? "pendiente" : "bloqueado") : "bloqueado";
    ops.push({
      updateOne: {
        filter: { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejIds[i] },
        update: { $setOnInsert: { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejIds[i], estado: estadoInicial } },
        upsert: true,
      },
    });
  }
  await EjercicioInstancia.bulkWrite(ops);
  return { modInst, subInst };
}

async function completarEjercicioYAvanzar({ estudianteId, materiaId, ejercicioId }) {
  const ejercicio = await Ejercicio.findById(ejercicioId)
    .populate({ path: "submodulo", populate: { path: "modulo" } }).lean();
  if (!ejercicio?._id) return { ok: false, code: 404, message: "Ejercicio no encontrado." };

  const submoduloId = ejercicio.submodulo?._id;
  const moduloId    = ejercicio.submodulo?.modulo?._id;
  if (!submoduloId || !moduloId) return { ok: false, code: 404, message: "No se encontró el contexto del ejercicio." };

  const { modInst } = await asegurarEstadosSubmodulo({ estudianteId, materiaId, moduloId, submoduloId });

  const lista = await Ejercicio.find({ submodulo: submoduloId })
    .select("_id createdAt").sort({ createdAt: 1 }).lean();
  const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
  if (idx < 0) return { ok: false, code: 404, message: "Ejercicio no pertenece al submódulo." };

  await EjercicioInstancia.findOneAndUpdate(
    { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId },
    { $set: { estado: "completado" } },
    { upsert: true, new: true }
  );

  const next = lista[idx + 1] || null;
  if (next) {
    const nextInst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: next._id,
    });
    if (!nextInst) {
      await EjercicioInstancia.create({
        estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: next._id, estado: "pendiente",
      });
    } else {
      const st = normEstadoInstancia(nextInst.estado);
      if (st === "bloqueado") { nextInst.estado = "pendiente"; await nextInst.save(); }
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
    .select("_id createdAt").sort({ createdAt: 1 }).lean();
  const subIdx = listaSubs.findIndex((x) => String(x._id) === String(submoduloId));
  const nextSub = subIdx >= 0 ? listaSubs[subIdx + 1] || null : null;

  if (nextSub) {
    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: nextSub._id },
      { $setOnInsert: { estado: "pendiente", modulo: moduloId } },
      { upsert: true }
    );
    await asegurarEstadosSubmodulo({
      estudianteId, materiaId, moduloId, submoduloId: nextSub._id,
      submoduloPendiente: true, primerEjercicioPendiente: true,
    });
    return { ok: true, moduloId, submoduloId, nextEjercicioId: null, submoduloCompletado: true, nextSubmoduloId: nextSub._id };
  }

  return { ok: true, moduloId, submoduloId, nextEjercicioId: null, submoduloCompletado: true };
}

async function getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId }) {
  const ejercicio = await Ejercicio.findById(ejercicioId)
    .populate({ path: "submodulo", populate: { path: "modulo" } }).lean();
  if (!ejercicio?._id) return { ok: false, code: 404, message: "Ejercicio no encontrado." };

  const submoduloId = ejercicio.submodulo?._id;
  const moduloId    = ejercicio.submodulo?.modulo?._id;
  if (!submoduloId || !moduloId) return { ok: false, code: 404, message: "Contexto del ejercicio no encontrado." };

  const { modInst } = await asegurarEstadosSubmodulo({ estudianteId, materiaId, moduloId, submoduloId });
  return { ok: true, ejercicio, submoduloId, moduloId, modInst };
}

function nowDate() { return new Date(); }

function acumularTiempoSiCorriendo(inst, now = nowDate()) {
  if (!inst?.startedAt) return 0;
  const start = new Date(inst.startedAt);
  const end   = new Date(now);
  const diffMs   = end.getTime() - start.getTime();
  const segundos = Math.max(0, Math.round(diffMs / 1000));
  inst.tiempoAcumuladoSeg = Number(inst.tiempoAcumuladoSeg || 0) + segundos;
  if (segundos > 0) {
    inst.sesiones = Array.isArray(inst.sesiones) ? inst.sesiones : [];
    inst.sesiones.push({ startedAt: start, endedAt: end, segundos });
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
  if (s === "stopped")   return "stopped";
  return "idle";
}

function normalizeRuntimeScope(incoming = {}, current = {}) {
  const inObj  = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current  && typeof current  === "object" ? current  : {};
  const next = { ...curObj };

  const inRec = normRecState(inObj.recState);
  if (inRec) next.recState = inRec;

  if (Object.prototype.hasOwnProperty.call(inObj, "startedAt")) {
    const v = inObj.startedAt;
    if (!v) next.startedAt = null;
    else { const d = new Date(v); next.startedAt = Number.isNaN(d.getTime()) ? null : d; }
  }

  if (Object.prototype.hasOwnProperty.call(inObj, "accumulated")) {
    const inAcc  = clampNum(inObj.accumulated, 0, 60 * 60);
    const curAcc = clampNum(curObj.accumulated, 0, 60 * 60);
    next.accumulated = Math.max(curAcc, inAcc);
  } else {
    next.accumulated = clampNum(curObj.accumulated, 0, 60 * 60);
  }

  if (curObj.resetUsed === true) next.resetUsed = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetUsed")) next.resetUsed = Boolean(inObj.resetUsed);
  else next.resetUsed = Boolean(curObj.resetUsed);

  if (curObj.resetAutoLocked === true) next.resetAutoLocked = true;
  else if (Object.prototype.hasOwnProperty.call(inObj, "resetAutoLocked")) next.resetAutoLocked = Boolean(inObj.resetAutoLocked);
  else next.resetAutoLocked = Boolean(curObj.resetAutoLocked);

  next.updatedAt = Date.now();
  return next;
}

function normalizeRoleplayRuntime(incoming = {}, current = {}) {
  const inObj  = incoming && typeof incoming === "object" ? incoming : {};
  const curObj = current  && typeof current  === "object" ? current  : {};
  return {
    sesion:  normalizeRuntimeScope(inObj.sesion  || {}, curObj.sesion  || {}),
    pruebas: normalizeRuntimeScope(inObj.pruebas || {}, curObj.pruebas || {}),
  };
}

function get(obj, path) {
  try { return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj); }
  catch { return undefined; }
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
  respuestas.rolePlaying = respuestas.rolePlaying && typeof respuestas.rolePlaying === "object"
    ? respuestas.rolePlaying : {};
  respuestas.rolePlaying.runtime = safeRuntime;
  if (respuestas.rolePlaying.payload && typeof respuestas.rolePlaying.payload === "object") {
    respuestas.rolePlaying.payload.rolePlaying = respuestas.rolePlaying.payload.rolePlaying &&
      typeof respuestas.rolePlaying.payload.rolePlaying === "object"
        ? respuestas.rolePlaying.payload.rolePlaying : {};
    respuestas.rolePlaying.payload.rolePlaying.runtime = safeRuntime;
  }
  if (respuestas.rolePlaying.sessionData && typeof respuestas.rolePlaying.sessionData === "object") {
    respuestas.rolePlaying.sessionData.rolePlaying = respuestas.rolePlaying.sessionData.rolePlaying &&
      typeof respuestas.rolePlaying.sessionData.rolePlaying === "object"
        ? respuestas.rolePlaying.sessionData.rolePlaying : {};
    respuestas.rolePlaying.sessionData.rolePlaying.runtime = safeRuntime;
  }
  if (respuestas.rolePlaying.data && typeof respuestas.rolePlaying.data === "object") {
    respuestas.rolePlaying.data.rolePlaying = respuestas.rolePlaying.data.rolePlaying &&
      typeof respuestas.rolePlaying.data.rolePlaying === "object"
        ? respuestas.rolePlaying.data.rolePlaying : {};
    respuestas.rolePlaying.data.rolePlaying.runtime = safeRuntime;
  }
  return respuestas;
}

function ensureArray(v) { return Array.isArray(v) ? v : []; }
function makeLocalId() { return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`; }

function normalizeRoleplayPruebas(respuestas = {}) {
  if (!respuestas || typeof respuestas !== "object") return respuestas;
  const rp = respuestas.rolePlaying && typeof respuestas.rolePlaying === "object"
    ? respuestas.rolePlaying : {};
  if (Array.isArray(rp.pruebas)) return respuestas;

  const oldTestId   = respuestas?.pruebaTestId || rp?.pruebaTestId || rp?.payload?.pruebaTestId || "";
  const oldAll      = respuestas?.pruebasRespuestas || rp?.pruebasRespuestas || {};
  const oldResp     = oldTestId ? (oldAll?.[oldTestId] || {}) : {};
  const oldNombre   = respuestas?.pruebaNombre   || rp?.pruebaNombre   || "";
  const oldCategoria= respuestas?.pruebaCategoria|| rp?.pruebaCategoria|| "";
  const oldPaciente = respuestas?.pruebaPacienteNombre || rp?.pruebaPacienteNombre || "Paciente";
  const oldTrans    = respuestas?.pruebaTranscripcion || rp?.pruebaTranscripcion || "";
  const oldInterim  = respuestas?.pruebaTranscripcionInterim || rp?.pruebaTranscripcionInterim || "";
  const oldDiarStatus = respuestas?.pruebaDiarizacionStatus || rp?.pruebaDiarizacionStatus || "idle";
  const oldDiarError  = respuestas?.pruebaDiarizacionError  || rp?.pruebaDiarizacionError  || "";
  const oldDiarTurnos = ensureArray(respuestas?.pruebaDiarizacionTurnos || rp?.pruebaDiarizacionTurnos);

  const pruebas = oldTestId ? [{
    id: makeLocalId(), testId: String(oldTestId),
    nombre: String(oldNombre || ""), categoria: String(oldCategoria || ""),
    pacienteNombre: String(oldPaciente || "Paciente"),
    respuestas: oldResp && typeof oldResp === "object" ? oldResp : {},
    transcripcion: String(oldTrans || ""), transcripcionInterim: String(oldInterim || ""),
    diarizacionStatus: String(oldDiarStatus || "idle"), diarizacionError: String(oldDiarError || ""),
    diarizacionTurnos: oldDiarTurnos,
  }] : [];

  const next = { ...respuestas };
  next.rolePlaying = next.rolePlaying && typeof next.rolePlaying === "object" ? next.rolePlaying : {};
  next.rolePlaying.pruebas = pruebas;

  delete next.pruebaTestId; delete next.pruebasRespuestas; delete next.pruebaNombre;
  delete next.pruebaCategoria; delete next.pruebaPacienteNombre; delete next.pruebaTranscripcion;
  delete next.pruebaTranscripcionInterim; delete next.pruebaDiarizacionStatus;
  delete next.pruebaDiarizacionError; delete next.pruebaDiarizacionTurnos;

  if (next.rolePlaying) {
    delete next.rolePlaying.pruebaTestId; delete next.rolePlaying.pruebasRespuestas;
    delete next.rolePlaying.pruebaNombre; delete next.rolePlaying.pruebaCategoria;
    delete next.rolePlaying.pruebaPacienteNombre; delete next.rolePlaying.pruebaTranscripcion;
    delete next.rolePlaying.pruebaTranscripcionInterim; delete next.rolePlaying.pruebaDiarizacionStatus;
    delete next.rolePlaying.pruebaDiarizacionError; delete next.rolePlaying.pruebaDiarizacionTurnos;
  }

  return next;
}

/* =========================================================
   GET /estudiante/materias
========================================================= */
exports.listarMisMaterias = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const materias = await Materia.find({ estudiantes: estudianteId, estado: "activo" })
      .select("nombre codigo grupo periodoAcademico profesorNombre profesorEmail aula semestre creditos horario estado createdAt")
      .sort({ createdAt: -1 }).lean();

    return res.json({ materias });
  } catch (err) {
    console.error("❌ Error listando materias (estudiante):", err);
    return res.status(500).json({ message: "Error al listar materias del estudiante.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/materias/:id/contenido
========================================================= */
exports.obtenerContenidoMateria = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const materiaId    = req.params.id;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(materiaId)) return res.status(400).json({ message: "ID de materia inválido." });

    const materia = await Materia.findOne({ _id: materiaId, estudiantes: estudianteId })
      .select("nombre codigo grupo periodoAcademico profesorNombre profesorEmail universidad modulosGlobales modulosLocales modulosLabels")
      .lean();

    if (!materia) return res.status(404).json({ message: "Materia no encontrada o no estás inscrito." });

    const modulosIds = [
      ...(materia.modulosGlobales || []),
      ...(materia.modulosLocales  || []),
    ].map(String);

    if (!modulosIds.length) return res.json({ materia, modulos: [] });

    const modulos = await Modulo.find({ _id: { $in: modulosIds }, activo: true })
      .select("titulo descripcion tipoModulo esGlobal universidad activo createdAt").lean();

    const modulosMap      = new Map(modulos.map((m) => [String(m._id), m]));
    const modulosOrdenados= modulosIds.map((id) => modulosMap.get(String(id))).filter(Boolean);
    const modulosObjIds   = modulosOrdenados.map((m) => m._id);

    const submodulos = await Submodulo.find({ modulo: { $in: modulosObjIds } })
      .select("modulo titulo descripcion reintento createdAt").sort({ createdAt: 1 }).lean();

    const subIds    = submodulos.map((s) => s._id);
    const ejercicios= await Ejercicio.find({ submodulo: { $in: subIds } })
      .select("submodulo tipoEjercicio tipoModulo titulo tiempo createdAt").sort({ createdAt: 1 }).lean();

    // grabar voz
    const grabarIds = ejercicios.filter((e) => e.tipoEjercicio === "Grabar voz").map((e) => e._id);
    let grabarMap   = new Map();
    if (grabarIds.length) {
      const gd = await EjercicioGrabarVoz.find({ ejercicio: { $in: grabarIds } })
        .select("ejercicio caso evaluaciones").lean();
      grabarMap = new Map(gd.map((d) => [String(d.ejercicio), d]));
    }

    // role play
    const roleIds = ejercicios.filter((e) => isRolePlayTipo(e.tipoEjercicio)).map((e) => e._id);
    let roleMap   = new Map();
    if (roleIds.length) {
      const rd = await EjercicioRolePlay.find({ ejercicio: { $in: roleIds } }).lean();
      roleMap = new Map(rd.map((d) => [String(d.ejercicio), d]));
    }

    // inicialización por módulo
    const subsByModuloInit = new Map();
    for (const s of submodulos) {
      const key = String(s.modulo);
      if (!subsByModuloInit.has(key)) subsByModuloInit.set(key, []);
      subsByModuloInit.get(key).push(s);
    }
    for (const [, subs] of subsByModuloInit.entries()) {
      for (let i = 0; i < subs.length; i++) {
        const s = subs[i];
        await asegurarEstadosSubmodulo({
          estudianteId, materiaId, moduloId: s.modulo, submoduloId: s._id,
          submoduloPendiente: i === 0, primerEjercicioPendiente: i === 0,
        });
      }
    }

    // instancias
    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId, materia: materiaId, modulo: { $in: modulosObjIds },
    }).select("_id modulo estado progreso updatedAt createdAt").lean();

    const moduloInstMap = new Map(modInst.map((x) => [String(x.modulo), x]));
    const modInstIds    = modInst.map((x) => x._id);

    let ejercicioInstMap = new Map();
    if (modInstIds.length) {
      const ejInst = await EjercicioInstancia.find({
        estudiante: estudianteId,
        moduloInstancia: { $in: modInstIds },
        ejercicio: { $in: ejercicios.map((e) => e._id) },
      }).select("ejercicio estado calificacion feedback intentosUsados updatedAt createdAt startedAt tiempoAcumuladoSeg completedAt").lean();
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
      const modKey      = String(m._id);
      const modInstItem = moduloInstMap.get(modKey) || null;
      const subs        = (subByModulo.get(modKey) || []).map((s) => {
        const subKey = String(s._id);
        const ejs    = (ejBySub.get(subKey) || []).map((e) => {
          const inst   = ejercicioInstMap.get(String(e._id)) || null;
          let merged   = { ...e };
          const gv     = grabarMap.get(String(e._id));
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
    return res.status(500).json({ message: "Error al obtener contenido de la materia.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/materias/:materiaId/ejercicios/:ejercicioId
========================================================= */
exports.buscarEjercicioEnMateria = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, ejercicioId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))  return res.status(400).json({ message: "ID de materia inválido." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId))return res.status(400).json({ message: "ID de ejercicio inválido." });

    const materia = await Materia.findOne({ _id: materiaId, estudiantes: estudianteId })
      .select("nombre codigo grupo periodoAcademico universidad modulosGlobales modulosLocales").lean();
    if (!materia) return res.status(404).json({ message: "Materia no encontrada o no estás inscrito." });

    const ejercicio = await Ejercicio.findById(ejercicioId)
      .populate({ path: "submodulo", populate: { path: "modulo" } }).lean();
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });

    const submodulo = ejercicio.submodulo || null;
    const modulo    = submodulo?.modulo   || null;
    if (!modulo?._id) return res.status(404).json({ message: "No se encontró el módulo del ejercicio." });

    const modulosIds = [
      ...(materia.modulosGlobales || []),
      ...(materia.modulosLocales  || []),
    ].map(String);
    if (!modulosIds.includes(String(modulo._id))) {
      return res.status(404).json({ message: "El ejercicio no pertenece a esta materia." });
    }

    const detalle = await obtenerDetalleEjercicioPorTipo(ejercicio);
    const tipo    = ejercicio.tipoEjercicio;
    let ejercicioMerged = { ...ejercicio };

    if (tipo === "Grabar voz" && detalle) {
      ejercicioMerged = { ...ejercicioMerged, caso: detalle.caso || "", evaluaciones: detalle.evaluaciones || null, detalle };
    }
    if (isRolePlayTipo(tipo) && detalle) {
      ejercicioMerged = { ...ejercicioMerged, rolePlaying: detalle };
    }
    // ✅ Informe clínico — adjuntar detalle para que el FE sepa las herramientas configuradas
    if (tipo === "Informe clínico" && detalle) {
      ejercicioMerged = { ...ejercicioMerged, detalle };
    }

    const ctxBase = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctxBase.ok) return res.status(ctxBase.code || 400).json({ message: ctxBase.message });

    const inst = await EjercicioInstancia.findOneAndUpdate(
      { estudiante: estudianteId, moduloInstancia: ctxBase.modInst._id, ejercicio: ejercicioId },
      { $setOnInsert: { estudiante: estudianteId, moduloInstancia: ctxBase.modInst._id, ejercicio: ejercicioId, estado: "pendiente", startedAt: null } },
      { upsert: true, new: true }
    ).select("_id estado startedAt tiempoAcumuladoSeg completedAt updatedAt createdAt analisisIA").lean();

    const ctx = {
      materiaId:            String(materiaId),
      moduloId:             String(modulo._id),
      submoduloId:          String(submodulo?._id || ""),
      ejercicioId:          String(ejercicioId),
      moduloInstanciaId:    String(ctxBase.modInst._id),
      ejercicioInstanciaId: String(inst._id),
    };

    // ✅ NUEVO — flags de tutoriales del estudiante (para saltar tours ya vistos)
    const userFlags = await Usuario.findById(estudianteId)
      .select("flagsTutoriales")
      .lean();
    const tourYaVisto = Boolean(userFlags?.flagsTutoriales?.tourGrabarVozVisto);

    return res.json({
      materia, modulo, submodulo, ejercicio: ejercicioMerged, detalle,
      ejercicioInstancia: inst || null,
      instancia:          inst || null,
      instanciaId:        inst?._id || null,
      moduloInstanciaId:  ctxBase.modInst?._id || null,
      ctx,
      // ✅ NUEVO
      tourYaVisto,
    });
  } catch (err) {
    console.error("❌ Error buscarEjercicioEnMateria:", err);
    return res.status(500).json({ message: "Error al obtener el ejercicio de la materia.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/dashboard
========================================================= */
exports.dashboardResumen = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    const materias = await Materia.find({ estudiantes: estudianteId, estado: "activo" })
      .select("nombre horario profesorNombre modulosGlobales modulosLocales")
      .sort({ createdAt: -1 }).lean();

    const emptyResponse = {
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
        texto: "Recuerda practicar mindfulness entre sesiones. Tomarte 5 minutos para respirar profundamente puede ayudarte a mantenerte centrada y presente para tus pacientes.",
        ctaLabel: "Aprende más", ctaUrl: "",
      },
    };

    if (!materias.length) return res.json(emptyResponse);

    const modulosIdsAll = [];
    for (const mat of materias) {
      const ids = [...(mat.modulosGlobales || []), ...(mat.modulosLocales || [])].map(String);
      modulosIdsAll.push(...ids);
    }
    const modulosIdsUnique = [...new Set(modulosIdsAll)];
    if (!modulosIdsUnique.length) return res.json(emptyResponse);

    const modulos = await Modulo.find({ _id: { $in: modulosIdsUnique }, activo: true })
      .select("_id titulo tipoModulo").lean();
    const modulosObjIds = modulos.map((m) => m._id);

    const submodulos = await Submodulo.find({ modulo: { $in: modulosObjIds } })
      .select("_id modulo titulo").lean();
    const subIds = submodulos.map((s) => s._id);

    const ejercicios = await Ejercicio.find({ submodulo: { $in: subIds } })
      .select("_id submodulo titulo tiempo tipoEjercicio").lean();

    const modInst = await ModuloInstancia.find({
      estudiante: estudianteId, modulo: { $in: modulosObjIds },
    }).select("_id modulo materia estado progreso updatedAt createdAt").lean();

    const modInstIds = modInst.map((x) => x._id);
    let ejInst = [];
    if (modInstIds.length) {
      ejInst = await EjercicioInstancia.find({
        estudiante: estudianteId,
        moduloInstancia: { $in: modInstIds },
        ejercicio: { $in: ejercicios.map((e) => e._id) },
      }).select("ejercicio moduloInstancia estado calificacion updatedAt createdAt").lean();
    }

    const ejInstMap = new Map(ejInst.map((x) => [String(x.ejercicio), x]));
    const totalEj   = ejercicios.length;
    let evaluados   = 0;

    for (const e of ejercicios) {
      const inst = ejInstMap.get(String(e._id));
      const st   = String(inst?.estado || "").toLowerCase();
      if (st === "evaluado") evaluados += 1;
    }

    const progresoGeneralPct    = totalEj > 0 ? Math.round((evaluados / totalEj) * 100) : 0;
    const simulacionesActivas   = modInst.filter((m) => String(m.estado).toLowerCase() === "en_progreso").length;

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
      if (touchedAt && touchedAt >= startOfWeek) minutosSemana += Number(e?.tiempo) || 0;
    }
    const horasSemana = Math.round((minutosSemana / 60) * 10) / 10;

    const modInstById = new Map(modInst.map((x) => [String(x._id), x]));
    const modTitle    = new Map(modulos.map((m) => [String(m._id), m.titulo]));
    const materiaName = new Map(materias.map((m) => [String(m._id), m.nombre]));

    const evaluadosConNota = ejInst
      .filter((x) => String(x.estado).toLowerCase() === "evaluado" && x.calificacion != null)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const modulosEvaluados = [];
    const seenModulo = new Set();
    for (const inst of evaluadosConNota) {
      const mi = modInstById.get(String(inst.moduloInstancia));
      if (!mi) continue;
      const moduloId = String(mi.modulo);
      if (seenModulo.has(moduloId)) continue;
      seenModulo.add(moduloId);
      modulosEvaluados.push({
        _id: moduloId, titulo: modTitle.get(moduloId) || "Módulo",
        materia: materiaName.get(String(mi.materia)) || "",
        score: inst.calificacion, fecha: inst.updatedAt || inst.createdAt,
      });
      if (modulosEvaluados.length >= 6) break;
    }

    return res.json({
      user: {
        nombre: req.user?.nombre || "Estudiante", rol: req.user?.rol || "estudiante",
        avatarUrl: req.user?.foto || "", premiumClinicaAbierta: Boolean(req.user?.premiumClinicaAbierta),
      },
      metrics: { simulacionesActivas, horasSemana, progresoGeneralPct },
      horarioHoy: [],
      modulosEvaluados,
      consejo: {
        titulo: "Consejo de Estudio Diario",
        texto: "Recuerda practicar mindfulness entre sesiones. Tomarte 5 minutos para respirar profundamente puede ayudarte a mantenerte centrada y presente para tus pacientes.",
        ctaLabel: "Aprende más", ctaUrl: "",
      },
    });
  } catch (err) {
    console.error("❌ Error dashboard estudiante:", err);
    return res.status(500).json({ message: "Error al obtener el dashboard del estudiante.", error: err.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/abrir
========================================================= */
exports.abrirEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const { materiaId } = req.body;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });

    const ejercicio = await Ejercicio.findById(ejercicioId)
      .populate({ path: "submodulo", populate: { path: "modulo" } }).lean();
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });

    const submoduloId = ejercicio.submodulo?._id;
    const moduloId    = ejercicio.submodulo?.modulo?._id;
    if (!submoduloId || !moduloId) return res.status(404).json({ message: "Contexto del ejercicio no encontrado." });

    const { modInst } = await asegurarEstadosSubmodulo({ estudianteId, materiaId, moduloId, submoduloId });

    const lista = await Ejercicio.find({ submodulo: submoduloId })
      .select("_id createdAt").sort({ createdAt: 1 }).lean();
    const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
    if (idx < 0) return res.status(404).json({ message: "Ejercicio no pertenece al submódulo." });

    if (idx > 0) {
      const prevId   = lista[idx - 1]?._id;
      const prevInst = await EjercicioInstancia.findOne({
        estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: prevId,
      }).select("estado");
      if (normEstadoInstancia(prevInst?.estado) !== "completado") {
        await EjercicioInstancia.findOneAndUpdate(
          { estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId },
          { $set: { estado: "bloqueado" } }, { upsert: true }
        );
        return res.status(403).json({ message: "Ejercicio bloqueado." });
      }
    }

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId,
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
        estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: ejercicioId,
        estado: "en_progreso", startedAt: now,
      });
    } else {
      const st = normEstadoInstancia(inst.estado);
      if (st === "bloqueado") return res.status(403).json({ message: "Ejercicio bloqueado." });
      if (st === "pendiente") inst.estado = "en_progreso";
      if (inst.estado === "en_progreso") marcarInicioSiNoExiste(inst, now);
      await inst.save();
    }

    await SubmoduloInstancia.findOneAndUpdate(
      { estudiante: estudianteId, materia: materiaId, submodulo: submoduloId },
      { $set: { estado: "en_progreso", modulo: moduloId } },
      { upsert: true }
    );

    return res.json({
      ok: true,
      instanciaId:       String(inst._id),
      moduloInstanciaId: String(modInst._id),
      ctx: {
        materiaId:            String(materiaId),
        moduloId:             String(moduloId),
        submoduloId:          String(submoduloId),
        ejercicioId:          String(ejercicioId),
        moduloInstanciaId:    String(modInst._id),
        ejercicioInstanciaId: String(inst._id),
      },
      ejercicioInstancia: {
        _id: inst._id, estado: inst.estado, startedAt: inst.startedAt || null,
        tiempoAcumuladoSeg: inst.tiempoAcumuladoSeg || 0,
        updatedAt: inst.updatedAt || null, createdAt: inst.createdAt || null,
      },
    });
  } catch (err) {
    console.error("❌ Error abrirEjercicio:", err);
    return res.status(500).json({ message: "Error al abrir ejercicio.", error: err.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/finalizar
========================================================= */
exports.finalizarEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const { materiaId, respuestas, calificacion, feedback, replace = false } = req.body || {};

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const now = nowDate();
    let incomingRespuestas = normalizeRoleplayPruebas(respuestas || {});

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
    });

    if (!inst) {
      inst = await EjercicioInstancia.create({
        estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
        estado: "en_progreso", startedAt: now, respuestas: incomingRespuestas,
        calificacion: calificacion ?? null, feedback: feedback || "",
      });
    } else {
      const st = normEstadoInstancia(inst.estado);
      if (st === "bloqueado")  return res.status(403).json({ message: "Ejercicio bloqueado." });
      if (st === "completado") return res.status(409).json({ message: "Ejercicio ya completado." });
      if (st === "pendiente")  inst.estado = "en_progreso";
      if (inst.estado === "en_progreso") marcarInicioSiNoExiste(inst, now);

      const prevResp   = normalizeRoleplayPruebas(inst.respuestas || {});
      const nextMerged = replace ? incomingRespuestas : deepMergeNoArrays(prevResp, incomingRespuestas);
      const prevRuntime     = extractRoleplayRuntime(prevResp) || {};
      const incomingRuntime = extractRoleplayRuntime(nextMerged);
      if (incomingRuntime) {
        const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, prevRuntime);
        mirrorRoleplayRuntime(nextMerged, safeRuntime);
      }
      inst.respuestas = nextMerged;
      if (calificacion !== undefined) inst.calificacion = calificacion;
      if (feedback     !== undefined) inst.feedback     = feedback;
    }

    acumularTiempoSiCorriendo(inst, now);
    inst.estado      = "completado";
    inst.completedAt = now;
    await inst.save();

    const result = await completarEjercicioYAvanzar({ estudianteId, materiaId, ejercicioId });
    if (!result.ok) return res.status(result.code || 400).json({ message: result.message || "No se pudo finalizar." });

    return res.json(result);
  } catch (err) {
    console.error("❌ Error finalizarEjercicio:", err);
    return res.status(500).json({ message: "Error al finalizar ejercicio.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/ejercicios/:ejercicioId/borrador
========================================================= */
exports.obtenerBorradorEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const materiaId = req.query?.materiaId;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
    }).select([
      "estado","respuestas","calificacion","feedback","intentosUsados",
      "updatedAt","createdAt","startedAt","tiempoAcumuladoSeg","completedAt",
      "analisisIA","analisisGeneradoAt","analisisFuente",
      "+analisisIA","+analisisGeneradoAt","+analisisFuente",
    ].join(" ")).lean();

    let respuestas = normalizeRoleplayPruebas(inst?.respuestas || {});
    const runtime  = extractRoleplayRuntime(respuestas);

    return res.json({
      ok: true,
      estado:    inst?.estado || "bloqueado",
      respuestas,
      runtimeRoleplay: runtime,
      serverNow: new Date().toISOString(),
      calificacion:          inst?.calificacion          ?? null,
      calificacionFinal:     inst?.calificacionFinal     ?? null,
      evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,
      feedback:              inst?.feedback || "",
      analisisIA:            inst?.analisisIA            ?? null,
      analisisGeneradoAt:    inst?.analisisGeneradoAt    ?? null,
      analisisFuente:        inst?.analisisFuente        ?? "unknown",
      analisisIAGeneradoAt:  inst?.analisisGeneradoAt    ?? null,
      intentosUsados: inst?.intentosUsados || 0,
      updatedAt: inst?.updatedAt || null, createdAt: inst?.createdAt || null,
    });
  } catch (err) {
    console.error("❌ Error obtenerBorradorEjercicio:", err);
    return res.status(500).json({ message: "Error al obtener borrador del ejercicio.", error: err.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/borrador
========================================================= */
exports.guardarBorradorEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const {
      materiaId,
      respuestas,
      replace = false,
      // ✅ Flag para marcar que el estudiante ya vio el tour del ejemplo guiado
      markTourGrabarVozVisto,
    } = req.body || {};

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });

    // ✅ NUEVO — Procesar el flag de tour ANTES de cualquier validación del ejercicio.
    // Esto es independiente del borrador: el flag puede llegar solo, sin respuestas
    // ni materiaId, y debe persistirse igual.
    if (markTourGrabarVozVisto === true) {
      try {
        await Usuario.updateOne(
          { _id: estudianteId },
          { $set: { "flagsTutoriales.tourGrabarVozVisto": true } }
        );
      } catch (e) {
        console.warn("⚠️ No se pudo marcar tourGrabarVozVisto:", e?.message);
      }

      // Si la llamada SOLO trae el flag (sin respuestas y sin materiaId válido),
      // retornamos aquí. No hay borrador que guardar.
      const soloFlag =
        respuestas == null &&
        (!materiaId || !mongoose.Types.ObjectId.isValid(materiaId));
      if (soloFlag) {
        return res.json({ ok: true, tourMarked: true });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const lista = await Ejercicio.find({ submodulo: ctx.submoduloId })
      .select("_id createdAt").sort({ createdAt: 1 }).lean();
    const idx = lista.findIndex((x) => String(x._id) === String(ejercicioId));
    if (idx < 0) return res.status(404).json({ message: "Ejercicio no pertenece al submódulo." });

    if (idx > 0) {
      const prevId   = lista[idx - 1]?._id;
      const prevInst = await EjercicioInstancia.findOne({
        estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: prevId,
      }).select("estado");
      if (normEstadoInstancia(prevInst?.estado) !== "completado") {
        return res.status(403).json({ message: "Ejercicio bloqueado." });
      }
    }

    const now = nowDate();
    let incomingRespuestas = normalizeRoleplayPruebas(respuestas || {});

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
    });

    if (!inst) {
      const payload = {
        estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
        estado: "en_progreso", startedAt: now, respuestas: incomingRespuestas,
      };
      const incomingRuntime = extractRoleplayRuntime(payload.respuestas);
      if (incomingRuntime) {
        const safeRuntime = normalizeRoleplayRuntime(incomingRuntime, {});
        mirrorRoleplayRuntime(payload.respuestas, safeRuntime);
      }
      await EjercicioInstancia.create(payload);
      return res.json({ ok: true, created: true });
    }

    const st = normEstadoInstancia(inst.estado);
    if (st === "bloqueado")  return res.status(403).json({ message: "Ejercicio bloqueado." });
    if (st === "completado") return res.status(409).json({ message: "Ejercicio ya completado." });
    if (st === "pendiente")  inst.estado = "en_progreso";
    if (inst.estado === "en_progreso") marcarInicioSiNoExiste(inst, now);

    const prevResp    = normalizeRoleplayPruebas(inst.respuestas || {});
    let nextResp      = replace ? incomingRespuestas : deepMergeNoArrays(prevResp, incomingRespuestas);
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
    return res.status(500).json({ message: "Error al guardar borrador del ejercicio.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/ejercicios/:ejercicioId/resultado
========================================================= */
exports.obtenerResultadoEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const materiaId = req.query?.materiaId;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
    }).lean();

    if (!inst) return res.status(404).json({ message: "No existe instancia para este ejercicio." });

    // ── Enriquecer con el ejercicio y su detalle ──
    const ejercicio = await Ejercicio.findById(ejercicioId)
      .populate({ path: "submodulo", populate: { path: "modulo" } })
      .lean();

    const detalle = ejercicio ? await obtenerDetalleEjercicioPorTipo(ejercicio) : null;

    let ejercicioMerged = ejercicio ? { ...ejercicio } : null;
    if (ejercicioMerged && detalle) {
      const tipo = ejercicioMerged.tipoEjercicio;
      if (tipo === "Grabar voz") {
        ejercicioMerged = {
          ...ejercicioMerged,
          caso: detalle.caso || "",
          evaluaciones: detalle.evaluaciones || null,
          detalle,
        };
      } else if (isRolePlayTipo(tipo)) {
        ejercicioMerged = { ...ejercicioMerged, rolePlaying: detalle, detalle };
      } else {
        ejercicioMerged = { ...ejercicioMerged, detalle };
      }
    }

    return res.json({
      ok: true,
      estado:    inst?.estado || "bloqueado",
      respuestas: inst?.respuestas || {},
      calificacion:            inst?.calificacion            ?? null,
      calificacionFinal:       inst?.calificacionFinal       ?? null,
      evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,
      feedback:                inst?.feedback || "",
      analisisIA:              inst?.analisisIA              ?? null,
      analisisGeneradoAt:      inst?.analisisGeneradoAt      ?? null,
      analisisFuente:          inst?.analisisFuente          ?? "unknown",
      analisisIAGeneradoAt:    inst?.analisisGeneradoAt      ?? null,
      intentosUsados: inst?.intentosUsados || 0,
      updatedAt:   inst?.updatedAt   || null,
      createdAt:   inst?.createdAt   || null,
      completedAt: inst?.completedAt || null,
      // ── NUEVO ──
      ejercicio: ejercicioMerged,
      detalle,
      submodulo: ejercicio?.submodulo || null,
      modulo:    ejercicio?.submodulo?.modulo || null,
    });
  } catch (err) {
    console.error("❌ Error obtenerResultadoEjercicio:", err);
    return res.status(500).json({ message: "Error al obtener resultado del ejercicio.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/materias/:materiaId/submodulos/:submoduloId/entrelazados
========================================================= */
exports.obtenerEntrelazadosSubmodulo = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { materiaId, submoduloId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });
    if (!mongoose.Types.ObjectId.isValid(submoduloId)) return res.status(400).json({ message: "submoduloId inválido." });

    const sub = await Submodulo.findById(submoduloId).select("_id modulo").lean();
    if (!sub) return res.status(404).json({ message: "Submódulo no encontrado." });

    const moduloId = sub.modulo;
    if (!moduloId) return res.status(404).json({ message: "Submódulo sin módulo." });

    const modInst = await ModuloInstancia.findOne({
      estudiante: estudianteId, materia: materiaId, modulo: moduloId,
    }).select("_id").lean();

    if (!modInst?._id) return res.json({ entrelazados: {} });

    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).select("_id").lean();
    const ejIds      = ejercicios.map((e) => e._id);
    if (!ejIds.length) return res.json({ entrelazados: {} });

    const instancias = await EjercicioInstancia.find({
      estudiante: estudianteId, moduloInstancia: modInst._id, ejercicio: { $in: ejIds },
    }).select("ejercicio respuestas.rolePlaying.meta").lean();

    const entrelazados = {};
    for (const it of instancias) {
      const ejId = String(it.ejercicio);
      const meta = it?.respuestas?.rolePlaying?.meta;
      if (meta?.entrelazado === true) entrelazados[ejId] = true;
    }

    return res.json({ entrelazados });
  } catch (e) {
    console.error("❌ obtenerEntrelazadosSubmodulo error:", e);
    return res.status(500).json({ message: "Error obteniendo entrelazados", error: e.message });
  }
};

/* =========================================================
   POST /estudiante/ejercicios/:ejercicioId/analisis-ia
========================================================= */
exports.guardarAnalisisIAEjercicio = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { ejercicioId } = req.params;
    const { materiaId, analisisIA, fuente = "ai", replace = true } = req.body || {};

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) return res.status(400).json({ message: "ID de ejercicio inválido." });
    if (!mongoose.Types.ObjectId.isValid(materiaId))   return res.status(400).json({ message: "materiaId inválido." });
    if (!analisisIA || typeof analisisIA !== "object" || Array.isArray(analisisIA)) {
      return res.status(400).json({ message: "analisisIA es requerido y debe ser un objeto (JSON)." });
    }

    const ctx = await getContextForEjercicioInstancia({ estudianteId, materiaId, ejercicioId });
    if (!ctx.ok) return res.status(ctx.code || 400).json({ message: ctx.message });

    const now = nowDate();
    const allowed    = new Set(["ai","mock","unknown","legacy","manual","real"]);
    const fuenteSafe = allowed.has(String(fuente)) ? String(fuente) : "unknown";

    let inst = await EjercicioInstancia.findOne({
      estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
    });

    if (!inst) {
      inst = await EjercicioInstancia.create({
        estudiante: estudianteId, moduloInstancia: ctx.modInst._id, ejercicio: ejercicioId,
        estado: "en_progreso", startedAt: now,
        analisisIA, analisisGeneradoAt: now, analisisFuente: fuenteSafe,
      });
      return res.json({ ok: true, created: true, analisisGeneradoAt: inst.analisisGeneradoAt, analisisFuente: inst.analisisFuente });
    }

    if (replace) {
      inst.analisisIA = analisisIA;
    } else {
      const prev = inst.analisisIA && typeof inst.analisisIA === "object" ? inst.analisisIA : {};
      inst.analisisIA = deepMergeNoArrays(prev, analisisIA);
    }
    inst.analisisGeneradoAt = now;
    inst.analisisFuente     = fuenteSafe;
    await inst.save();

    return res.json({ ok: true, created: false, analisisGeneradoAt: inst.analisisGeneradoAt, analisisFuente: inst.analisisFuente });
  } catch (err) {
    console.error("❌ Error guardarAnalisisIAEjercicio:", err);
    return res.status(500).json({ message: "Error al guardar análisis IA.", error: err.message });
  }
};

/* =========================================================
   GET /estudiante/instancias/:instanciaId/resultado
========================================================= */
exports.obtenerResultadoPorInstanciaId = async (req, res) => {
  try {
    const estudianteId = req.user?.id || req.user?._id;
    const { instanciaId } = req.params;

    if (!estudianteId) return res.status(401).json({ message: "No autenticado." });
    if (!mongoose.Types.ObjectId.isValid(instanciaId)) return res.status(400).json({ message: "instanciaId inválido." });

    const inst = await EjercicioInstancia.findOne({ _id: instanciaId, estudiante: estudianteId }).lean();
    if (!inst) return res.status(404).json({ message: "Instancia no encontrada." });

    // ── Enriquecer con el ejercicio y su detalle ──
    const ejercicio = await Ejercicio.findById(inst.ejercicio)
      .populate({ path: "submodulo", populate: { path: "modulo" } })
      .lean();

    const detalle = ejercicio ? await obtenerDetalleEjercicioPorTipo(ejercicio) : null;

    let ejercicioMerged = ejercicio ? { ...ejercicio } : null;
    if (ejercicioMerged && detalle) {
      const tipo = ejercicioMerged.tipoEjercicio;
      if (tipo === "Grabar voz") {
        ejercicioMerged = {
          ...ejercicioMerged,
          caso: detalle.caso || "",
          evaluaciones: detalle.evaluaciones || null,
          detalle,
        };
      } else if (isRolePlayTipo(tipo)) {
        ejercicioMerged = { ...ejercicioMerged, rolePlaying: detalle, detalle };
      } else {
        ejercicioMerged = { ...ejercicioMerged, detalle };
      }
    }

    return res.json({
      ok: true,
      estado:    inst?.estado || "bloqueado",
      respuestas: inst?.respuestas || {},
      calificacion:            inst?.calificacion            ?? null,
      calificacionFinal:       inst?.calificacionFinal       ?? null,
      evaluacionInformeScores: inst?.evaluacionInformeScores ?? null,
      feedback:                inst?.feedback || "",
      analisisIA:              inst?.analisisIA              ?? null,
      analisisGeneradoAt:      inst?.analisisGeneradoAt      ?? null,
      analisisFuente:          inst?.analisisFuente          ?? "unknown",
      analisisIAGeneradoAt:    inst?.analisisGeneradoAt      ?? null,
      intentosUsados: inst?.intentosUsados || 0,
      updatedAt:   inst?.updatedAt   || null,
      createdAt:   inst?.createdAt   || null,
      completedAt: inst?.completedAt || null,
      // ── NUEVO ──
      ejercicio: ejercicioMerged,
      detalle,
      submodulo: ejercicio?.submodulo || null,
      modulo:    ejercicio?.submodulo?.modulo || null,
    });
  } catch (err) {
    console.error("❌ Error obtenerResultadoPorInstanciaId:", err);
    return res.status(500).json({ message: "Error al obtener resultado por instancia.", error: err.message });
  }
};

/* =========================================================
   ✅ NUEVO — POST /estudiante/ejercicios/:ejercicioId/informe-clinico/obtener-caso
   - Asigna un caso del banco sin repetir (global por estudiante)
   - Si ya tiene caso asignado en esta instancia, lo devuelve
   - Si ya usó todos, resetea y empieza de nuevo
========================================================= */
exports.obtenerCasoInformeClinoco = async (req, res) => {
  try {
    const estudianteId = req.user?._id || req.user?.id;
    const { ejercicioId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ejercicioId)) {
      return res.status(400).json({ message: "ID de ejercicio inválido." });
    }

    // 1. Verificar que el ejercicio existe y es de tipo "Informe clínico"
    const ejercicio = await Ejercicio.findById(ejercicioId).lean();
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });
    if (ejercicio.tipoEjercicio !== "Informe clínico") {
      return res.status(400).json({ message: "Este endpoint solo aplica para ejercicios de Informe clínico." });
    }

    // 2. Buscar la instancia del estudiante para este ejercicio
    const instancia = await EjercicioInstancia.findOne({
      estudiante: estudianteId,
      ejercicio:  ejercicioId,
    });
    if (!instancia) {
      return res.status(404).json({ message: "No se encontró una instancia activa para este ejercicio." });
    }

    const CASOS = require("../data/casosInformeClinico");

    // 3. Si ya tiene un caso asignado en esta instancia, devolverlo directamente
    const casoYaAsignado = instancia.respuestas?.casoInformeClinico;
    if (casoYaAsignado != null && casoYaAsignado.indice != null) {
      const casoData = CASOS[casoYaAsignado.indice];
      if (casoData) return res.json({ caso: casoData, esNuevo: false });
    }

    // 4. Buscar al estudiante para ver qué casos ya usó
    const estudiante = await Usuario.findById(estudianteId).lean();
    if (!estudiante) return res.status(404).json({ message: "Estudiante no encontrado." });

    const totalCasos = CASOS.length;
    let usados = Array.isArray(estudiante.casosInformeClinicoUsados)
      ? estudiante.casosInformeClinicoUsados : [];

    // 5. Si ya usó todos, resetear
    if (usados.length >= totalCasos) {
      usados = [];
      await Usuario.findByIdAndUpdate(estudianteId, {
        $set: { casosInformeClinicoUsados: [] },
      });
    }

    // 6. Calcular disponibles y elegir uno al azar
    const disponibles = CASOS
      .map((_, idx) => idx)
      .filter((idx) => !usados.includes(idx));

    const randomIdx   = disponibles[Math.floor(Math.random() * disponibles.length)];
    const casoElegido = CASOS[randomIdx];

    // 7. Guardar el índice usado en el usuario
    await Usuario.findByIdAndUpdate(estudianteId, {
      $addToSet: { casosInformeClinicoUsados: randomIdx },
    });

    // 8. Guardar el caso asignado en la instancia del ejercicio
    await EjercicioInstancia.findByIdAndUpdate(instancia._id, {
      $set: {
        "respuestas.casoInformeClinico": {
          indice:     randomIdx,
          titulo:     casoElegido.titulo,
          asignadoAt: new Date(),
        },
      },
    });

    return res.json({ caso: casoElegido, esNuevo: true });
  } catch (err) {
    console.error("❌ Error obteniendo caso informe clínico:", err);
    return res.status(500).json({ message: "Error al obtener el caso.", error: err.message });
  }
};
