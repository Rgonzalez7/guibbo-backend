// server/controllers/moduloController.js
const mongoose = require('mongoose');
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
  TIPOS_MODULO,
  TIPOS_EJERCICIO,
} = require('../models/modulo');

const fs = require('fs');
const path = require('path');

/* ===========================
   HELPERS GENERALES (BOOLEANS)
   =========================== */

// ⚠️ Evita bug clásico: !!"false" => true
function toBool(v) {
  return v === true || v === 'true' || v === 1 || v === '1';
}

/* ===========================
   HELPERS PERMISOS
   =========================== */
   function isSuperAdmin(req) {
    // Ajusta a cómo guardas el rol en tu user
    // (esto cubre la mayoría de variantes típicas)
    const u = req.user || {};
    return (
      u.role === 'super' ||
      u.rol === 'super' ||
      u.tipo === 'super' ||
      u.isSuper === true ||
      u.esSuper === true ||
      u.superAdmin === true
    );
  }

/* ===========================
   HELPERS EVALUACIONES IA (GRABAR VOZ)
   =========================== */

function normalizeEvaluacionesIA(ev = {}) {
  const inEv = ev && typeof ev === 'object' ? ev : {};
  return {
    rapport: toBool(inEv.rapport),
    preguntasAbiertas: toBool(inEv.preguntasAbiertas),
    encuadre: toBool(inEv.encuadre),
    alianzaTerapeutica: toBool(inEv.alianzaTerapeutica),
    parafrasis: toBool(inEv.parafrasis),
    reflejo: toBool(inEv.reflejo),
    clarificacion: toBool(inEv.clarificacion),
    chisteTerapeutico: toBool(inEv.chisteTerapeutico),
    sarcasmoTerapeutico: toBool(inEv.sarcasmoTerapeutico),
    empatia: toBool(inEv.empatia),
    revelacion: toBool(inEv.revelacion),
    metafora: toBool(inEv.metafora),
    resumen: toBool(inEv.resumen),
    practicarConsignasPruebas: toBool(inEv.practicarConsignasPruebas),
  };
}

/* ===========================
   HELPERS ROLE PLAY (BOOLEANS + DEFAULTS)
   =========================== */

const toBoolRole = (v) => v === true || v === 'true' || v === 1 || v === '1';

// ✅ Evaluaciones base SIEMPRE activas en role playing
const ROLEPLAY_EVALS_BASE = {
  rapport: true,
  preguntasAbiertas: true,
  encuadre: true,
  alianzaTerapeutica: true,
};

// ✅ Evaluaciones opcionales (todas apagadas por defecto)
const ROLEPLAY_EVALS_OPTIONAL_DEFAULTS = {
  // generales
  parafrasis: false,
  reflejo: false,
  clarificacion: false,
  chisteTerapeutico: false,
  sarcasmoTerapeutico: false,
  empatia: false,
  revelacion: false,
  metafora: false,
  resumen: false,
  practicarConsignasPruebas: false,
  palabrasClave: false,

  // logoterapia
  logoterapiaProposito: false,
  logoterapiaSentido: false,

  // TCC
  tccReestructuracion: false,
  tccIdeasIrracionales: false,
  tccABC: false,

  // Psicoanálisis
  psicoLapsus: false,
  psicoDefensas: false,

  // Humanismo
  humanismo: false,

  // otros
  entrevistaTrabajo: false,
  protocolosMEP: false,
};

// ✅ Normaliza evaluaciones RolePlay (base siempre true)
// - Si viene un "partial" desde frontend, actualiza solo las keys presentes.
// - El resto se conserva desde "current" y/o defaults.
// - Base siempre true.
function normalizeEvaluacionesRolePlay(ev = {}, current = null) {
  const prev = current && typeof current === 'object' ? current : {};
  const inEv = ev && typeof ev === 'object' ? ev : {};

  const next = {
    ...ROLEPLAY_EVALS_OPTIONAL_DEFAULTS,
    ...prev,
  };

  Object.keys(ROLEPLAY_EVALS_OPTIONAL_DEFAULTS).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(inEv, k)) {
      next[k] = toBoolRole(inEv[k]);
    }
  });

  return { ...next, ...ROLEPLAY_EVALS_BASE };
}

// ✅ Defaults “oficiales” de herramientas RolePlay (UI actual)
const DEFAULT_HERRAMIENTAS_ROLEPLAY = {
  manejoExpediente: false,
  ficha: false,
  hc: false,
  examen: false,
  convergencia: false,
  hipotesis: false,
  diagnostico: false,
  pruebas: false,
  interpretacion: false,
  recomendaciones: false,
  anexos: false,
  plan: false,
};

function normalizeHerramientasRolePlay(h = {}, current = null) {
  const prev = current && typeof current === 'object' ? current : {};
  const inH = h && typeof h === 'object' ? h : {};

  const next = {
    ...DEFAULT_HERRAMIENTAS_ROLEPLAY,
    ...prev,
  };

  Object.keys(DEFAULT_HERRAMIENTAS_ROLEPLAY).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(inH, k)) {
      next[k] = toBoolRole(inH[k]);
    }
  });

  return next;
}

function normalizeTipoRole(inputTipoRole, inputTipoEjercicio) {
  const tr = String(inputTipoRole ?? "").trim().toLowerCase();
  const te = String(inputTipoEjercicio ?? "").trim().toLowerCase();

  // Si mandan tipoRole bien
  if (tr === "real") return "real";
  if (tr === "simulada") return "simulada";

  // Si mandan cosas como "IA", "role playing ia", etc.
  if (tr.includes("ia") || tr.includes("simulad")) return "simulada";
  if (tr.includes("persona") || tr.includes("real")) return "real";

  // Fallback: inferir desde tipoEjercicio
  if (te.includes("role") && te.includes("ia")) return "simulada";
  if (te.includes("role") && (te.includes("persona") || te.includes("aula"))) return "real";

  // Default final
  return "real";
}

/* ===========================
   MÓDULOS
   =========================== */

exports.listarModulos = async (req, res) => {
  try {
    const modulos = await Modulo.find().sort({ createdAt: -1 });
    // ✅ Ya no devolvemos tiposModulo (campo eliminado)
    res.json({ modulos });
  } catch (err) {
    console.error('❌ Error listando módulos:', err);
    res.status(500).json({ message: 'Error al obtener módulos', error: err.message });
  }
};

exports.crearModulo = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;

    // ✅ Ya no se valida ni se guarda tipoModulo
    if (!titulo || !descripcion || !String(descripcion).trim()) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.',
      });
    }

    const modulo = await Modulo.create({
      titulo: String(titulo).trim(),
      descripcion: String(descripcion).trim(),
    });

    res.status(201).json({ message: 'Módulo creado correctamente', modulo });
  } catch (err) {
    console.error('❌ Error creando módulo:', err);
    res.status(500).json({ message: 'Error al crear módulo', error: err.message });
  }
};


exports.obtenerModulo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });

    const submodulos = await Submodulo.find({ modulo: id }).sort({ createdAt: -1 });
    res.json({ modulo, submodulos });
  } catch (err) {
    console.error('❌ Error obteniendo módulo:', err);
    res.status(500).json({ message: 'Error al obtener módulo', error: err.message });
  }
};

exports.actualizarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, activo } = req.body;
    // ✅ tipoModulo ya no se acepta ni se actualiza

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });

    if (titulo !== undefined) modulo.titulo = String(titulo);
    if (descripcion !== undefined) modulo.descripcion = String(descripcion);
    if (activo !== undefined) modulo.activo = toBool(activo);

    await modulo.save();
    res.json({ message: 'Módulo actualizado correctamente', modulo });
  } catch (err) {
    console.error('❌ Error actualizando módulo:', err);
    res.status(500).json({ message: 'Error al actualizar módulo', error: err.message });
  }
};

exports.eliminarModulo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });

    const submodulos = await Submodulo.find({ modulo: id }).select('_id');
    const subIds = submodulos.map((s) => s._id);

    const ejercicios = await Ejercicio.find({ submodulo: { $in: subIds } }).select('_id');
    const ejIds = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({ ejercicio: { $in: ejIds } });

    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.deleteMany({ modulo: id });
    await Modulo.findByIdAndDelete(id);

    res.json({ message: 'Módulo eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando módulo:', err);
    res.status(500).json({ message: 'Error al eliminar módulo', error: err.message });
  }
};

/* ===========================
   SUBMÓDULOS
   =========================== */

exports.listarSubmodulosPorModulo = async (req, res) => {
  try {
    const { moduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduloId)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });

    const submodulos = await Submodulo.find({ modulo: moduloId }).sort({ createdAt: -1 });
    res.json({ modulo, submodulos });
  } catch (err) {
    console.error('❌ Error listando submódulos:', err);
    res.status(500).json({ message: 'Error al obtener submódulos', error: err.message });
  }
};

exports.crearSubmodulo = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { titulo, descripcion, reintento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduloId)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) return res.status(404).json({ message: 'Módulo no encontrado' });

    if (!titulo) {
      return res.status(400).json({ message: 'El título del submódulo es obligatorio.' });
    }

    const submodulo = await Submodulo.create({
      modulo: moduloId,
      titulo: String(titulo),
      descripcion: descripcion || '',
      reintento:
        typeof reintento === 'number'
          ? reintento
          : reintento !== undefined && reintento !== null && String(reintento).trim() !== ''
          ? Number(reintento)
          : 0,
    });

    res.status(201).json({ message: 'Submódulo creado correctamente', submodulo });
  } catch (err) {
    console.error('❌ Error creando submódulo:', err);
    res.status(500).json({ message: 'Error al crear submódulo', error: err.message });
  }
};

exports.actualizarSubmodulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, reintento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    if (titulo !== undefined) submodulo.titulo = String(titulo);
    if (descripcion !== undefined) submodulo.descripcion = String(descripcion);
    if (reintento !== undefined)
      submodulo.reintento = typeof reintento === 'number' ? reintento : Number(reintento) || 0;

    await submodulo.save();
    res.json({ message: 'Submódulo actualizado correctamente', submodulo });
  } catch (err) {
    console.error('❌ Error actualizando submódulo:', err);
    res.status(500).json({ message: 'Error al actualizar submódulo', error: err.message });
  }
};

exports.eliminarSubmodulo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const ejercicios = await Ejercicio.find({ submodulo: id }).select('_id');
    const ejIds = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({ ejercicio: { $in: ejIds } });

    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.findByIdAndDelete(id);

    res.json({ message: 'Submódulo eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando submódulo:', err);
    res.status(500).json({ message: 'Error al eliminar submódulo', error: err.message });
  }
};

/* ===========================
   EJERCICIOS (lista por submódulo)
   =========================== */

exports.listarEjerciciosPorSubmodulo = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).sort({ createdAt: -1 });

    res.json({
      submodulo,
      ejercicios,
      tiposEjercicio: TIPOS_EJERCICIO,
    });
  } catch (err) {
    console.error('❌ Error listando ejercicios:', err);
    res.status(500).json({ message: 'Error al obtener ejercicios', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: GRABAR VOZ
   =========================== */

exports.crearEjercicioGrabarVoz = async (req, res) => {
  try {
    const { submoduloId } = req.params;
    const { titulo, tiempo, caso, tipoModulo, evaluaciones } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    if (!titulo || !caso) {
      return res.status(400).json({ message: 'Título y caso son obligatorios para el ejercicio.' });
    }

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId,
      tipoEjercicio: 'Grabar voz',
      tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
      titulo: String(titulo).trim(),
      tiempo: typeof tiempo === 'number' ? tiempo : tiempo ? Number(tiempo) : 0,
    });

    const detalle = await EjercicioGrabarVoz.create({
      ejercicio: ejercicio._id,
      caso: caso || '',
      evaluaciones: normalizeEvaluacionesIA(evaluaciones || {}),
    });

    res.status(201).json({ message: 'Ejercicio de grabar voz creado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error creando ejercicio Grabar voz:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

exports.actualizarEjercicioGrabarVoz = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, tiempo, caso, evaluaciones } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    if (ejercicio.tipoEjercicio !== 'Grabar voz') {
      return res.status(400).json({ message: 'Este ejercicio no es del tipo "Grabar voz".' });
    }

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    if (tiempo !== undefined) ejercicio.tiempo = typeof tiempo === 'number' ? tiempo : Number(tiempo) || 0;
    await ejercicio.save();

    let detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id });

    if (!detalle) {
      detalle = await EjercicioGrabarVoz.create({
        ejercicio: id,
        caso: caso || '',
        evaluaciones: normalizeEvaluacionesIA(evaluaciones || {}),
      });
    } else {
      if (caso !== undefined) detalle.caso = caso;
      if (evaluaciones !== undefined) detalle.evaluaciones = normalizeEvaluacionesIA(evaluaciones || {});
      await detalle.save();
    }

    res.json({ message: 'Ejercicio de grabar voz actualizado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Grabar voz:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: INTERPRETACIÓN FRASES
   =========================== */

exports.crearEjercicioInterpretacionFrases = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const {
      titulo,
      tiempo,
      tipoModulo,
      edad,
      ocupacion,
      motivo,
      historiaPersonal,
      tipo,
      respuestasFrases,
      texto,
      intentos,
    } = req.body;

    if (!titulo) return res.status(400).json({ message: 'El título del ejercicio es obligatorio.' });

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId,
      tipoEjercicio: 'Interpretación de frases incompletas',
      tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
      titulo: String(titulo).trim(),
      tiempo: typeof tiempo === 'number' ? tiempo : tiempo ? Number(tiempo) : 0,
    });

    const detalle = await EjercicioInterpretacionFrases.create({
      ejercicio: ejercicio._id,
      edad: edad ? Number(edad) : undefined,
      ocupacion: ocupacion || '',
      motivo: motivo || '',
      historiaPersonal: historiaPersonal || '',
      tipoTest: tipo || 'adulto',
      respuestasFrases: Array.isArray(respuestasFrases) ? respuestasFrases : [],
      notas: texto || '',
      intentos: typeof intentos === 'number' ? intentos : intentos ? Number(intentos) : 1,
    });

    res.status(201).json({
      message: 'Ejercicio de interpretación de frases incompletas creado correctamente',
      ejercicio,
      detalle,
    });
  } catch (err) {
    console.error('❌ Error creando ejercicio Interpretación de frases:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

exports.actualizarEjercicioInterpretacionFrases = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    if (ejercicio.tipoEjercicio !== 'Interpretación de frases incompletas') {
      return res.status(400).json({
        message: 'Este ejercicio no es del tipo "Interpretación de frases incompletas".',
      });
    }

    const { titulo, tiempo, edad, ocupacion, motivo, historiaPersonal, tipo, respuestasFrases, texto, intentos } =
      req.body;

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    if (tiempo !== undefined) ejercicio.tiempo = typeof tiempo === 'number' ? tiempo : Number(tiempo) || 0;
    await ejercicio.save();

    let detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id });
    if (!detalle) detalle = await EjercicioInterpretacionFrases.create({ ejercicio: id });

    if (edad !== undefined) detalle.edad = Number(edad);
    if (ocupacion !== undefined) detalle.ocupacion = ocupacion;
    if (motivo !== undefined) detalle.motivo = motivo;
    if (historiaPersonal !== undefined) detalle.historiaPersonal = historiaPersonal;
    if (tipo !== undefined) detalle.tipoTest = tipo;
    if (texto !== undefined) detalle.notas = texto;
    if (intentos !== undefined) detalle.intentos = typeof intentos === 'number' ? intentos : Number(intentos) || 1;
    if (Array.isArray(respuestasFrases)) detalle.respuestasFrases = respuestasFrases;

    await detalle.save();

    res.json({
      message: 'Ejercicio de interpretación de frases incompletas actualizado correctamente',
      ejercicio,
      detalle,
    });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Interpretación de frases:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: ROLE PLAYING
   =========================== */

   exports.crearEjercicioRolePlay = async (req, res) => {
    try {
      const { submoduloId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
        return res.status(400).json({ message: 'ID de submódulo inválido.' });
      }
  
      const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
      if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });
  
      const {
        titulo,
        tiempo,
        tipoModulo,
        tipoRole,            // puede venir "real"/"simulada" o basura
        tipoEjercicio,       // 👈 a veces esto viene cuando usas crearEjercicioAdmin
        trastorno,
        consentimiento,
        tipoConsentimiento,
        herramientas,
        evaluaciones,
      } = req.body;
  
      if (!titulo) return res.status(400).json({ message: 'El título del ejercicio es obligatorio.' });
  
      // ✅ NORMALIZA
      const tipoRoleNorm = normalizeTipoRole(tipoRole, tipoEjercicio);
  
      // ✅ TIPO EJERCICIO CONSISTENTE EN BD
      const tipoEjercicioFinal =
        tipoRoleNorm === 'simulada'
          ? 'Role Playing IA'
          : 'Role playing persona';
  
      const ejercicio = await Ejercicio.create({
        submodulo: submoduloId,
        tipoEjercicio: tipoEjercicioFinal,
        tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
        titulo: String(titulo).trim(),
        tiempo: typeof tiempo === 'number' ? tiempo : tiempo ? Number(tiempo) : 0,
      });
  
      const detalle = await EjercicioRolePlay.create({
        ejercicio: ejercicio._id,
        tipoRole: tipoRoleNorm, // ✅ aquí también consistente
        trastorno: trastorno || '',
        consentimiento: toBoolRole(consentimiento),
        tipoConsentimiento: tipoConsentimiento || '',
        herramientas: normalizeHerramientasRolePlay(herramientas || {}),
        evaluaciones: normalizeEvaluacionesRolePlay(evaluaciones || {}, null),
      });
  
      res.status(201).json({ message: 'Ejercicio de role playing creado correctamente', ejercicio, detalle });
    } catch (err) {
      console.error('❌ Error creando ejercicio Role Play:', err);
      res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
    }
  };

exports.actualizarEjercicioRolePlay = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, tiempo, tipoRole, trastorno, consentimiento, tipoConsentimiento, herramientas, evaluaciones } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    if (!['Role playing persona', 'Role playing Aula', 'Role Playing IA'].includes(ejercicio.tipoEjercicio)) {
      return res.status(400).json({ message: 'Este ejercicio no es del tipo "Role playing".' });
    }

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    if (tiempo !== undefined) ejercicio.tiempo = typeof tiempo === 'number' ? tiempo : Number(tiempo) || 0;

    if (tipoRole !== undefined || req.body.tipoEjercicio !== undefined) {
      const tipoRoleNorm = normalizeTipoRole(tipoRole, req.body.tipoEjercicio);
    
      ejercicio.tipoEjercicio =
        tipoRoleNorm === 'simulada' ? 'Role Playing IA' : 'Role playing persona';
    
      // y en el detalle también
      detalle.tipoRole = tipoRoleNorm;
    }

    await ejercicio.save();

    let detalle = await EjercicioRolePlay.findOne({ ejercicio: id });
    if (!detalle) {
      detalle = await EjercicioRolePlay.create({
        ejercicio: id,
        tipoRole: 'real',
        trastorno: '',
        consentimiento: false,
        tipoConsentimiento: '',
        herramientas: { ...DEFAULT_HERRAMIENTAS_ROLEPLAY },
        evaluaciones: normalizeEvaluacionesRolePlay({}, null),
      });
    }

    if (tipoRole !== undefined) detalle.tipoRole = tipoRole;
    if (trastorno !== undefined) detalle.trastorno = trastorno;
    if (consentimiento !== undefined) detalle.consentimiento = toBoolRole(consentimiento);
    if (tipoConsentimiento !== undefined) detalle.tipoConsentimiento = tipoConsentimiento;

    // merge herramientas + normalizar (si no viene, conserva lo actual)
    const currentTools =
      detalle.herramientas && typeof detalle.herramientas.toObject === 'function'
        ? detalle.herramientas.toObject()
        : detalle.herramientas || {};

    if (herramientas !== undefined) {
      detalle.herramientas = normalizeHerramientasRolePlay(herramientas || {}, currentTools);
    } else {
      detalle.herramientas = normalizeHerramientasRolePlay({}, currentTools);
    }

    // ✅ merge evaluaciones + base always true
    const currentEvals =
      detalle.evaluaciones && typeof detalle.evaluaciones.toObject === 'function'
        ? detalle.evaluaciones.toObject()
        : detalle.evaluaciones || {};

    if (evaluaciones !== undefined) {
      detalle.evaluaciones = normalizeEvaluacionesRolePlay(evaluaciones || {}, currentEvals);
    } else {
      detalle.evaluaciones = normalizeEvaluacionesRolePlay({}, currentEvals);
    }

    await detalle.save();

    res.json({ message: 'Ejercicio de role playing actualizado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Role Play:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: CRITERIOS DIAGNÓSTICO
   =========================== */

exports.crearEjercicioCriteriosDx = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const { titulo, tiempo, tipoModulo, caso, criterios, intentos } = req.body;

    if (!titulo || !caso) return res.status(400).json({ message: 'Título y caso son obligatorios.' });

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId,
      tipoEjercicio: 'Criterios de diagnostico',
      tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
      titulo: String(titulo).trim(),
      tiempo: typeof tiempo === 'number' ? tiempo : tiempo ? Number(tiempo) : 0,
    });

    const detalle = await EjercicioCriteriosDx.create({
      ejercicio: ejercicio._id,
      caso: String(caso).trim(),
      criterios: criterios || '',
      intentos: typeof intentos === 'number' ? intentos : intentos ? Number(intentos) : 1,
    });

    res.status(201).json({ message: 'Ejercicio de criterios de diagnóstico creado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error creando ejercicio Criterios Dx:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

exports.actualizarEjercicioCriteriosDx = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, tiempo, caso, criterios, intentos } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    if (ejercicio.tipoEjercicio !== 'Criterios de diagnostico') {
      return res.status(400).json({ message: 'Este ejercicio no es del tipo "Criterios de diagnóstico".' });
    }

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    if (tiempo !== undefined) ejercicio.tiempo = typeof tiempo === 'number' ? tiempo : Number(tiempo) || 0;
    await ejercicio.save();

    let detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id });
    if (!detalle) detalle = await EjercicioCriteriosDx.create({ ejercicio: id, caso: '' });

    if (caso !== undefined) detalle.caso = caso;
    if (criterios !== undefined) detalle.criterios = criterios;
    if (intentos !== undefined) detalle.intentos = typeof intentos === 'number' ? intentos : Number(intentos) || 1;

    await detalle.save();

    res.json({ message: 'Ejercicio de criterios de diagnóstico actualizado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Criterios Dx:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: PRUEBAS
   =========================== */

exports.crearEjercicioPruebas = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const { titulo, tipoModulo, pruebas } = req.body;

    if (!titulo) return res.status(400).json({ message: 'El título del ejercicio es obligatorio.' });

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId,
      tipoEjercicio: 'Aplicación de pruebas',
      tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
      titulo: String(titulo).trim(),
      tiempo: 0,
    });

    const detalle = await EjercicioPruebas.create({
      ejercicio: ejercicio._id,
      pruebasConfig: pruebas || {},
    });

    res.status(201).json({ message: 'Ejercicio de pruebas creado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error creando ejercicio Pruebas:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

exports.actualizarEjercicioPruebas = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, pruebas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    if (ejercicio.tipoEjercicio !== 'Aplicación de pruebas') {
      return res.status(400).json({ message: 'Este ejercicio no es del tipo "Aplicación de pruebas".' });
    }

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    await ejercicio.save();

    let detalle = await EjercicioPruebas.findOne({ ejercicio: id });
    if (!detalle) detalle = await EjercicioPruebas.create({ ejercicio: id, pruebasConfig: {} });

    if (pruebas !== undefined) detalle.pruebasConfig = pruebas;
    await detalle.save();

    res.json({ message: 'Ejercicio de pruebas actualizado correctamente', ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Pruebas:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   EJERCICIO ESPECÍFICO: INTERPRETACIÓN PROYECTIVAS
   =========================== */

exports.crearEjercicioInterpretacionProyectivas = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId).populate('modulo');
    if (!submodulo) return res.status(404).json({ message: 'Submódulo no encontrado' });

    const { titulo, tiempo, tipoModulo, historia, intentos, imagen } = req.body;

    if (!titulo) return res.status(400).json({ message: 'El título del ejercicio es obligatorio.' });

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId,
      tipoEjercicio: 'Pruebas psicometricas',
      tipoModulo: tipoModulo || submodulo.modulo?.tipoModulo,
      titulo: String(titulo).trim(),
      tiempo: typeof tiempo === 'number' ? tiempo : tiempo ? Number(tiempo) : 0,
    });

    const detalle = await EjercicioInterpretacionProyectiva.create({
      ejercicio: ejercicio._id,
      imagen: imagen || '',
      historia: historia || '',
      intentos: typeof intentos === 'number' ? intentos : intentos ? Number(intentos) : 1,
    });

    res.status(201).json({
      message: 'Ejercicio de interpretación de historia proyectiva creado correctamente',
      ejercicio,
      detalle,
    });
  } catch (err) {
    console.error('❌ Error creando ejercicio Interpretación Proyectivas:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

exports.actualizarEjercicioInterpretacionProyectivas = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, tiempo, historia, intentos, imagen } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    if (ejercicio.tipoEjercicio !== 'Pruebas psicometricas') {
      return res.status(400).json({
        message: 'Este ejercicio no es del tipo "Interpretación de historia proyectiva".',
      });
    }

    if (titulo !== undefined) ejercicio.titulo = String(titulo);
    if (tiempo !== undefined) ejercicio.tiempo = typeof tiempo === 'number' ? tiempo : Number(tiempo) || 0;
    await ejercicio.save();

    let detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id });
    if (!detalle) detalle = await EjercicioInterpretacionProyectiva.create({ ejercicio: id });

    const imagenAnterior = detalle.imagen;

    if (historia !== undefined) detalle.historia = historia;
    if (imagen !== undefined) detalle.imagen = imagen;
    if (intentos !== undefined) detalle.intentos = typeof intentos === 'number' ? intentos : Number(intentos) || 1;

    await detalle.save();

    if (imagenAnterior && (imagen === '' || (imagen && imagen !== imagenAnterior))) {
      borrarArchivoSubido(imagenAnterior);
    }

    res.json({
      message: 'Ejercicio de interpretación de historia proyectiva actualizado correctamente',
      ejercicio,
      detalle,
    });
  } catch (err) {
    console.error('❌ Error actualizando ejercicio Interpretación Proyectivas:', err);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error: err.message });
  }
};

/* ===========================
   OBTENER / ELIMINAR EJERCICIO
   =========================== */

exports.obtenerEjercicio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id).populate({
      path: 'submodulo',
      populate: { path: 'modulo' },
    });

    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    let detalle = null;

    if (ejercicio.tipoEjercicio === 'Grabar voz') {
      detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id });
      if (!detalle) detalle = { caso: '', evaluaciones: normalizeEvaluacionesIA({}) };
      else detalle.evaluaciones = normalizeEvaluacionesIA(detalle.evaluaciones || {});
    } else if (ejercicio.tipoEjercicio === 'Interpretación de frases incompletas') {
      detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id });
    } else if (['Role playing persona', 'Role playing Aula', 'Role Playing IA'].includes(ejercicio.tipoEjercicio)) {
      detalle = await EjercicioRolePlay.findOne({ ejercicio: id });

      if (!detalle) {
        detalle = {
          tipoRole: 'real',
          trastorno: '',
          consentimiento: false,
          tipoConsentimiento: '',
          herramientas: normalizeHerramientasRolePlay({}, {}),
          evaluaciones: normalizeEvaluacionesRolePlay({}, {}),
        };
      } else {
        const currentTools =
          detalle.herramientas && typeof detalle.herramientas.toObject === 'function'
            ? detalle.herramientas.toObject()
            : detalle.herramientas || {};
        detalle.herramientas = normalizeHerramientasRolePlay({}, currentTools);

        const currentEvals =
          detalle.evaluaciones && typeof detalle.evaluaciones.toObject === 'function'
            ? detalle.evaluaciones.toObject()
            : detalle.evaluaciones || {};
        detalle.evaluaciones = normalizeEvaluacionesRolePlay({}, currentEvals);
      }
    } else if (ejercicio.tipoEjercicio === 'Criterios de diagnostico') {
      detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id });
    } else if (ejercicio.tipoEjercicio === 'Aplicación de pruebas') {
      detalle = await EjercicioPruebas.findOne({ ejercicio: id });
    } else if (ejercicio.tipoEjercicio === 'Pruebas psicometricas') {
      detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id });
    }

    res.json({ ejercicio, detalle });
  } catch (err) {
    console.error('❌ Error obteniendo ejercicio:', err);
    res.status(500).json({ message: 'Error al obtener ejercicio', error: err.message });
  }
};

exports.eliminarEjercicio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });

    await EjercicioGrabarVoz.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionFrases.deleteOne({ ejercicio: id });
    await EjercicioRolePlay.deleteOne({ ejercicio: id });
    await EjercicioCriteriosDx.deleteOne({ ejercicio: id });
    await EjercicioPruebas.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionProyectiva.deleteOne({ ejercicio: id });

    await Ejercicio.findByIdAndDelete(id);

    res.json({ message: 'Ejercicio eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando ejercicio:', err);
    res.status(500).json({ message: 'Error al eliminar ejercicio', error: err.message });
  }
};

/* ===========================
   ADMIN (ENDPOINTS GENÉRICOS)
   =========================== */

   exports.listarEjerciciosAdmin = async (req, res) => {
    try {
      const { submoduloId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
        return res.status(400).json({ message: "ID de submódulo inválido." });
      }
  
      const submodulo = await Submodulo.findById(submoduloId).populate("modulo");
      if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado" });
  
      // ✅ Traer ejercicios como lean para poder “inyectar” fields
      const ejerciciosRaw = await Ejercicio.find({ submodulo: submoduloId })
        .sort({ createdAt: -1 })
        .lean();
  
      const ejIds = ejerciciosRaw.map((e) => e._id);
  
      // ✅ Traer detalles roleplay para saber si es real o simulada
      const roleDetails = await EjercicioRolePlay.find({ ejercicio: { $in: ejIds } })
        .select("ejercicio tipoRole")
        .lean();
  
      const roleMap = new Map(roleDetails.map((d) => [String(d.ejercicio), d.tipoRole]));
  
      // ✅ Inyectar tipoRole al ejercicio para que el frontend lo pinte bien
      const ejercicios = ejerciciosRaw.map((e) => ({
        ...e,
        tipoRole: roleMap.get(String(e._id)) || null, // "real" | "simulada" | null
      }));
  
      const modulo = submodulo.modulo || null;
      const canEditGlobal = isSuperAdmin(req);
  
      res.json({
        submodulo,
        modulo,
        ejercicios,
        tiposEjercicio: TIPOS_EJERCICIO,
        canEditGlobal,
      });
    } catch (err) {
      console.error("❌ Error listando ejercicios (admin):", err);
      res.status(500).json({ message: "Error al obtener ejercicios", error: err.message });
    }
  };

  exports.obtenerEjercicioAdmin = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de ejercicio inválido.' });
      }
  
      const ejercicio = await Ejercicio.findById(id).populate({
        path: 'submodulo',
        populate: { path: 'modulo' },
      });
  
      if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado' });
  
      let detalle = null;
  
      if (ejercicio.tipoEjercicio === 'Grabar voz') {
        detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id });
        if (!detalle) detalle = { caso: '', evaluaciones: normalizeEvaluacionesIA({}) };
        else detalle.evaluaciones = normalizeEvaluacionesIA(detalle.evaluaciones || {});
      } else if (ejercicio.tipoEjercicio === 'Interpretación de frases incompletas') {
        detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id });
      } else if (['Role playing persona', 'Role playing Aula', 'Role Playing IA'].includes(ejercicio.tipoEjercicio)) {
        detalle = await EjercicioRolePlay.findOne({ ejercicio: id });
  
        if (detalle) {
          const currentTools =
            detalle.herramientas && typeof detalle.herramientas.toObject === 'function'
              ? detalle.herramientas.toObject()
              : detalle.herramientas || {};
          detalle.herramientas = normalizeHerramientasRolePlay({}, currentTools);
  
          const currentEvals =
            detalle.evaluaciones && typeof detalle.evaluaciones.toObject === 'function'
              ? detalle.evaluaciones.toObject()
              : detalle.evaluaciones || {};
          detalle.evaluaciones = normalizeEvaluacionesRolePlay({}, currentEvals);
        }
      } else if (ejercicio.tipoEjercicio === 'Criterios de diagnostico') {
        detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id });
      } else if (ejercicio.tipoEjercicio === 'Aplicación de pruebas') {
        detalle = await EjercicioPruebas.findOne({ ejercicio: id });
      } else if (ejercicio.tipoEjercicio === 'Pruebas psicometricas') {
        detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id });
      }
  
      const modulo = ejercicio.submodulo?.modulo || null;
      const canEditGlobal = isSuperAdmin(req); // ✅
  
      res.json({
        ejercicio,
        detalle,
        modulo,
        canEditGlobal, // ✅
      });
    } catch (err) {
      console.error('❌ Error obteniendo ejercicio (admin):', err);
      res.status(500).json({ message: 'Error al obtener ejercicio', error: err.message });
    }
  };

exports.crearEjercicioAdmin = async (req, res) => {
  try {
    const { tipoEjercicio } = req.body;

    if (!tipoEjercicio) {
      return res.status(400).json({ message: 'tipoEjercicio es obligatorio.' });
    }

    if (tipoEjercicio === 'Grabar voz') return exports.crearEjercicioGrabarVoz(req, res);
    if (tipoEjercicio === 'Interpretación de frases incompletas')
      return exports.crearEjercicioInterpretacionFrases(req, res);

    if (
      tipoEjercicio === 'Role playing persona' ||
      tipoEjercicio === 'Role Playing IA' ||
      tipoEjercicio === 'Role playing Aula'
    ) {
      return exports.crearEjercicioRolePlay(req, res);
    }

    if (tipoEjercicio === 'Criterios de diagnostico') return exports.crearEjercicioCriteriosDx(req, res);
    if (tipoEjercicio === 'Aplicación de pruebas') return exports.crearEjercicioPruebas(req, res);
    if (tipoEjercicio === 'Pruebas psicometricas') return exports.crearEjercicioInterpretacionProyectivas(req, res);

    return res.status(400).json({
      message: `tipoEjercicio no soportado en crearEjercicioAdmin: ${tipoEjercicio}`,
    });
  } catch (err) {
    console.error('❌ Error en crearEjercicioAdmin:', err);
    res.status(500).json({ message: 'Error al crear ejercicio', error: err.message });
  }
};

/* ===========================
   FILES
   =========================== */

function borrarArchivoSubido(urlPath) {
  try {
    if (!urlPath) return;

    let relative = urlPath;

    try {
      if (relative.startsWith('http://') || relative.startsWith('https://')) {
        const u = new URL(relative);
        relative = u.pathname;
      }
    } catch (e) {
      console.error('❌ Error parseando URL en borrarArchivoSubido:', e.message);
    }

    relative = relative.replace(/^\/api\/super\//, '/');
    relative = relative.replace(/^\/api\//, '/');

    if (relative.startsWith('/')) relative = relative.slice(1);

    const filePath = path.join(__dirname, '..', relative);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('❌ Error borrando archivo:', filePath, err.message);
      } else if (!err) {
        console.log('🗑️ Archivo proyectiva borrado:', filePath);
      } else {
        console.log('ℹ️ Archivo proyectiva no encontrado para borrar:', filePath);
      }
    });
  } catch (e) {
    console.error('❌ Error en borrarArchivoSubido:', e);
  }
}
