// server/controllers/adminModuloController.js
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
  PRAXIS_NIVELES,
  MODELOS_INTERVENCION,
} = require("../models/modulo");

const Universidad = require('../models/university');
const Usuario = require('../models/user');

/**
 * Helper básico: lee el campo universidad del user
 */
function getUniversidadIdFromUser(user) {
  if (!user) return null;
  return user.universidad || user.universidadId || null;
}

function stripDiacritics(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getEnumTipoModuloEjercicio() {
  const ev = Ejercicio?.schema?.path("tipoModulo")?.enumValues;
  return Array.isArray(ev) ? ev : [];
}

/**
 * Normaliza tipoModulo a un valor permitido por el enum REAL de Ejercicio.tipoModulo
 * - case-insensitive
 * - ignora tildes/diacríticos
 */
function normalizarTipoModulo(tipoModuloCrudo) {
  if (!tipoModuloCrudo) return null;

  const allowed = getEnumTipoModuloEjercicio();
  if (!allowed.length) return null;

  const raw = String(tipoModuloCrudo).trim();
  if (!raw) return null;

  // match exacto
  if (allowed.includes(raw)) return raw;

  const rawLower = raw.toLowerCase();
  const rawNoTilde = stripDiacritics(rawLower);

  // map por lower + sin tildes
  for (const v of allowed) {
    const vLower = String(v).toLowerCase();
    if (vLower === rawLower) return v;

    const vNoTilde = stripDiacritics(vLower);
    if (vNoTilde === rawNoTilde) return v;
  }

  return null;
}

function normalizeTipoConsentimiento(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return "";

  // si el front ya manda uno permitido, lo respetamos
  if (v === "adulto") return "adulto";
  if (v === "niño" || v === "nino") return "niño";

  const isMayor =
    v === "mayor" ||
    v === "adult" ||
    v === "adulto" ||
    v === "mayor de edad" ||
    v === "mayor_de_edad" ||
    v.includes("mayor") ||
    v.includes("adult");

  const isMenor =
    v === "menor" ||
    v === "niño" ||
    v === "nino" ||
    v === "menor de edad" ||
    v === "menor_de_edad" ||
    v.includes("menor") ||
    v.includes("niñ") ||
    v.includes("nin");

  if (isMayor) return "adulto";
  if (isMenor) return "niño";

  return "";
}

// =====================
// ✅ Helpers booleans + normalizadores RolePlay PRAXIS
// =====================
function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

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

function normalizeHerramientasRolePlay(h = {}) {
  const inH = h && typeof h === "object" ? h : {};
  const out = { ...DEFAULT_HERRAMIENTAS_ROLEPLAY };

  Object.keys(DEFAULT_HERRAMIENTAS_ROLEPLAY).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(inH, k)) {
      out[k] = toBool(inH[k]);
    }
  });

  return out;
}

function normalizePruebasConfigRolePlay(pruebasConfig) {
  if (!pruebasConfig || typeof pruebasConfig !== "object") {
    return { modo: "student_choice", prueba: "" };
  }

  const modo =
    pruebasConfig.modo === "fixed" || pruebasConfig.modo === "student_choice"
      ? pruebasConfig.modo
      : "student_choice";

  const prueba = pruebasConfig.prueba ? String(pruebasConfig.prueba) : "";

  if (modo === "student_choice") {
    return { modo, prueba: "" };
  }

  return { modo, prueba };
}

function normalizePraxisNivel(raw) {
  const v = String(raw || "").trim().toLowerCase();

  if (!v) return "nivel_1";

  if (PRAXIS_NIVELES.includes(v)) return v;

  if (
    v === "nivel 1" ||
    v === "nivel_i" ||
    v === "nivel i" ||
    v === "i" ||
    v === "1" ||
    v === "formacion inicial" ||
    v === "formación inicial" ||
    v === "inicio"
  ) {
    return "nivel_1";
  }

  if (
    v === "nivel 2" ||
    v === "nivel_ii" ||
    v === "nivel ii" ||
    v === "ii" ||
    v === "2" ||
    v === "desarrollo intermedio" ||
    v === "intermedio"
  ) {
    return "nivel_2";
  }

  if (
    v === "nivel 3" ||
    v === "nivel_iii" ||
    v === "nivel iii" ||
    v === "iii" ||
    v === "3" ||
    v === "formacion avanzada" ||
    v === "formación avanzada" ||
    v === "avanzado"
  ) {
    return "nivel_3";
  }

  return "nivel_1";
}

function normalizeModeloIntervencion(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";

  const exact = MODELOS_INTERVENCION.find((x) => x === v);
  if (exact) return exact;

  const vLower = stripDiacritics(v.toLowerCase());

  for (const item of MODELOS_INTERVENCION) {
    const itemNorm = stripDiacritics(String(item).toLowerCase());
    if (itemNorm === vLower) return item;
  }

  // aliases comunes
  if (vLower === "tcc" || vLower.includes("cognitivo conductual")) {
    return "Terapia Cognitivo-Conductual (TCC)";
  }

  if (vLower.includes("psicoanal")) {
    return "Psicoanálisis";
  }

  if (vLower.includes("logoterapia")) {
    return "Logoterapia";
  }

  if (vLower.includes("centrada en la persona")) {
    return "Terapia Centrada en la Persona";
  }

  if (vLower.includes("gestalt")) {
    return "Gestalt";
  }

  if (vLower.includes("humanista")) {
    return "Humanista-Existencial";
  }

  if (vLower.includes("fap")) {
    return "Terapia Analítico-Funcional (FAP)";
  }

  if (vLower.includes("sistem")) {
    return "Sistémica";
  }

  if (vLower === "act" || vLower.includes("aceptacion y compromiso")) {
    return "Aceptación y Compromiso (ACT)";
  }

  if (vLower === "dbt" || vLower.includes("dialectica conductual")) {
    return "Dialéctica Conductual (DBT)";
  }

  if (vLower.includes("mindfulness")) {
    return "Mindfulness / Mindfulness-based";
  }

  return "";
}

function isRolePlayTipo(tipoEjercicio) {
  return (
    tipoEjercicio === 'Role playing persona' ||
    tipoEjercicio === 'Role playing Aula' ||
    tipoEjercicio === 'Role Playing IA'
  );
}


function normalizeEvaluacionesIA(ev = {}) {
  return {
    rapport: toBool(ev.rapport),
    preguntasAbiertas: toBool(ev.preguntasAbiertas),
    encuadre: toBool(ev.encuadre),
    alianzaTerapeutica: toBool(ev.alianzaTerapeutica),
    parafrasis: toBool(ev.parafrasis),
    reflejo: toBool(ev.reflejo),
    clarificacion: toBool(ev.clarificacion),
    chisteTerapeutico: toBool(ev.chisteTerapeutico),
    sarcasmoTerapeutico: toBool(ev.sarcasmoTerapeutico),
    empatia: toBool(ev.empatia),
    revelacion: toBool(ev.revelacion),
    metafora: toBool(ev.metafora),
    resumen: toBool(ev.resumen),
    practicarConsignasPruebas: toBool(ev.practicarConsignasPruebas),
  };
}

/* =========================================================
   ✅ WRAPPERS para endpoints específicos (lo que usa tu front)
   ========================================================= */

// --- CREATE por tipo (POST /submodulos/:id/ejercicios/<tipo>) ---
exports.crearEjercicioGrabarVozAdmin = async (req, res) => {
  try {
    req.body = { ...(req.body || {}), tipoEjercicio: 'Grabar voz' };
    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioGrabarVozAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

exports.crearEjercicioInterpretacionFrasesAdmin = async (req, res) => {
  try {
    req.body = {
      ...(req.body || {}),
      tipoEjercicio: 'Interpretación de frases incompletas',
    };
    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioInterpretacionFrasesAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

exports.crearEjercicioRolePlayAdmin = async (req, res) => {
  try {
    const incoming = String(req.body?.tipoEjercicio || '').trim();

    // Si el front ya manda uno válido, respétalo.
    // Si no manda nada, usa IA como default.
    const tipo =
      incoming === 'Role playing persona' || incoming === 'Role Playing IA'
        ? incoming
        : 'Role Playing IA';

    req.body = { ...(req.body || {}), tipoEjercicio: tipo };

    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioRolePlayAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

exports.crearEjercicioCriteriosDxAdmin = async (req, res) => {
  try {
    // OJO: tu switch usa exactamente 'Criterios de diagnostico'
    req.body = { ...(req.body || {}), tipoEjercicio: 'Criterios de diagnostico' };
    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioCriteriosDxAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

exports.crearEjercicioPruebasAdmin = async (req, res) => {
  try {
    // OJO: tu switch usa exactamente 'Aplicación de pruebas'
    req.body = { ...(req.body || {}), tipoEjercicio: 'Aplicación de pruebas' };
    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioPruebasAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

exports.crearEjercicioInterpretacionProyectivasAdmin = async (req, res) => {
  try {
    // OJO: tu switch usa exactamente 'Pruebas psicometricas'
    req.body = { ...(req.body || {}), tipoEjercicio: 'Pruebas psicometricas' };
    return exports.crearEjercicioAdmin(req, res);
  } catch (err) {
    console.error('❌ Error wrapper crearEjercicioInterpretacionProyectivasAdmin:', err);
    return res.status(500).json({ message: 'Error creando ejercicio (wrapper)', error: err.message });
  }
};

// --- UPDATE por tipo (PUT /ejercicios/<tipo>/:id) ---
// Como ya tienes la lógica completa en actualizarEjercicioAdmin,
// aquí simplemente delegamos.

exports.actualizarEjercicioGrabarVozAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

exports.actualizarEjercicioInterpretacionFrasesAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

exports.actualizarEjercicioRolePlayAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

exports.actualizarEjercicioCriteriosDxAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

exports.actualizarEjercicioPruebasAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

exports.actualizarEjercicioInterpretacionProyectivasAdmin = async (req, res) => {
  return exports.actualizarEjercicioAdmin(req, res);
};

/* ===========================
   LISTAR MÓDULOS VISIBLES PARA EL ADMIN
   =========================== */

exports.listarModulosAdmin = async (req, res) => {
  try {
    const adminId = req.user && req.user._id;

    if (!adminId) {
      return res
        .status(401)
        .json({ message: 'No se encontró el usuario autenticado.' });
    }

    // Buscamos al admin en BD (por si el req.user está incompleto)
    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = getUniversidadIdFromUser(admin);

    // Caso 1: si viene populado como objeto { _id: ... }
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso 2: si es string no-ObjectId (ej. "Universidad Adventista...")
    // intentamos mapearlo a un registro real de Universidad
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();

      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        console.warn(
          '[listarModulosAdmin] universidad en admin es string y no coincide con ninguna Universidad:',
          universidadId
        );
        // para evitar Cast a ObjectId inválido, anulamos
        universidadId = null;
      }
    }

    // 1) Módulos globales (del súper usuario)
    const modulosGlobales = await Modulo.find({ esGlobal: true })
      .sort({ createdAt: -1 })
      .lean();

    // 2) Módulos locales de la universidad (solo si tenemos ObjectId válido)
    let modulosLocales = [];
    if (universidadId && mongoose.Types.ObjectId.isValid(universidadId)) {
      modulosLocales = await Modulo.find({ universidad: universidadId })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Marcamos origen para el front
    const modulosMarcados = [
      ...modulosGlobales.map((m) => ({ ...m, esGlobal: true })),
      ...modulosLocales.map((m) => ({ ...m, esGlobal: false })),
    ];

    return res.json({ modulos: modulosMarcados });
  } catch (err) {
    console.error('❌ Error al obtener módulos para el admin:', err);
    return res.status(500).json({
      message: 'Error al obtener módulos para el admin',
      error: err.message,
    });
  }
};

/* ===========================
   CREAR MÓDULO LOCAL (ADMIN)
   =========================== */

exports.crearModuloAdmin = async (req, res) => {
  try {
    let universidadId = getUniversidadIdFromUser(req.user);
    const creadorId = req.user && req.user._id;

    // Caso objeto: { _id: ... }
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso string con nombre de universidad → lo mapeamos al _id de University
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();

      if (uniDoc && uniDoc._id) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    // Para crear módulo, exigimos que la universidad sea un ObjectId válido
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede crear un módulo.',
      });
    }

    let { titulo, descripcion, tipoModulo } = req.body;

    if (!titulo || !tipoModulo || !descripcion || !descripcion.trim()) {
      return res.status(400).json({
        message: 'Título, tipo de módulo y descripción son obligatorios.',
      });
    }

    // Normalizamos tipoModulo para que coincida con el enum
    const tipoNormalizado = normalizarTipoModulo(tipoModulo);
    if (!tipoNormalizado) {
      return res.status(400).json({
        message: `El tipo de módulo '${tipoModulo}' no es válido.`,
      });
    }

    const modulo = await Modulo.create({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipoModulo: tipoNormalizado,
      esGlobal: false, // 👈 módulo local
      universidad: universidadId,
      creadoPor: creadorId || null,
      activo: true,
    });

    return res.status(201).json({
      message: 'Módulo creado correctamente (admin)',
      modulo,
    });
  } catch (err) {
    console.error('❌ Error creando módulo (admin):', err);
    return res.status(500).json({
      message: 'Error al crear módulo (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   OBTENER MÓDULO (ADMIN)
   =========================== */

exports.obtenerModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de módulo inválido.',
      });
    }

    // 1) Buscamos el módulo primero
    const modulo = await Modulo.findById(id);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    // 2) Si es GLOBAL, se puede ver SIEMPRE (sin validar universidad)
    if (modulo.esGlobal) {
      const submodulos = await Submodulo.find({ modulo: id }).sort({
        createdAt: -1,
      });
      return res.json({ modulo, submodulos });
    }

    // 3) Si es LOCAL, necesitamos universidad válida del admin
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    // Caso objeto: { _id: ... }
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso string con nombre de universidad
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede obtener el módulo.',
      });
    }

    // Verificamos que el módulo local realmente sea de esa universidad
    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para ver este módulo.',
      });
    }

    const submodulos = await Submodulo.find({ modulo: id }).sort({
      createdAt: -1,
    });

    res.json({ modulo, submodulos });
  } catch (err) {
    console.error('❌ Error obteniendo módulo (admin):', err);
    res.status(500).json({
      message: 'Error al obtener módulo (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   ACTUALIZAR MÓDULO LOCAL (ADMIN)
   =========================== */

exports.actualizarModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let universidadId = getUniversidadIdFromUser(req.user);
    let { titulo, descripcion, tipoModulo, activo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de módulo inválido.',
      });
    }

    // Caso objeto: { _id: ... }
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso string con nombre de universidad → mapeamos a University
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc && uniDoc._id) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede actualizar el módulo.',
      });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    // El admin SOLO puede editar módulos locales de su universidad
    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'Este módulo es global (del súper usuario) y no puede ser editado por el admin.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para editar este módulo.',
      });
    }

    if (titulo !== undefined) modulo.titulo = titulo;
    if (descripcion !== undefined) modulo.descripcion = descripcion;

    if (tipoModulo !== undefined && tipoModulo !== null && tipoModulo !== '') {
      const tipoNormalizado = normalizarTipoModulo(tipoModulo);
      if (!tipoNormalizado) {
        return res.status(400).json({
          message: `El tipo de módulo '${tipoModulo}' no es válido.`,
        });
      }
      modulo.tipoModulo = tipoNormalizado;
    }

    if (activo !== undefined) modulo.activo = !!activo;

    await modulo.save();

    return res.json({
      message: 'Módulo actualizado correctamente (admin)',
      modulo,
    });
  } catch (err) {
    console.error('❌ Error actualizando módulo (admin):', err);
    return res.status(500).json({
      message: 'Error al actualizar módulo (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   ELIMINAR MÓDULO LOCAL (ADMIN)
   =========================== */

exports.eliminarModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let universidadId = getUniversidadIdFromUser(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de módulo inválido.',
      });
    }

    // Caso objeto: { _id: ... }
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso string con nombre de universidad → mapeamos a University
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc && uniDoc._id) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede eliminar el módulo.',
      });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    // Solo puede borrar módulos locales de su universidad
    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'Este módulo es global (del súper usuario) y no puede ser eliminado por el admin.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para eliminar este módulo.',
      });
    }

    // Borrado en cascada simple: submódulos y ejercicios asociados
    const submodulos = await Submodulo.find({ modulo: id }).select('_id');
    const subIds = submodulos.map((s) => s._id);

    const ejercicios = await Ejercicio.find({
      submodulo: { $in: subIds },
    }).select('_id');
    const ejIds = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({
      ejercicio: { $in: ejIds },
    });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({
      ejercicio: { $in: ejIds },
    });

    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.deleteMany({ modulo: id });
    await Modulo.findByIdAndDelete(id);

    return res.json({ message: 'Módulo eliminado correctamente (admin)' });
  } catch (err) {
    console.error('❌ Error eliminando módulo (admin):', err);
    return res.status(500).json({
      message: 'Error al eliminar módulo (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   SUBMÓDULOS (ADMIN)
   =========================== */

exports.listarSubmodulosAdmin = async (req, res) => {
  try {
    const { moduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduloId)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado.' });
    }

    // Si el módulo es GLOBAL: se puede leer siempre, sin validar universidad
    if (modulo.esGlobal) {
      const submodulos = await Submodulo.find({ modulo: moduloId }).sort({
        createdAt: -1,
      });
      return res.json({ modulo, submodulos });
    }

    // Si es LOCAL: validar que el admin pertenezca a esa universidad
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    // Caso objeto
    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    // Caso string con nombre de universidad → mapear
    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se pueden obtener los submódulos.',
      });
    }

    // Verificar que el módulo pertenece a la universidad del admin
    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para ver los submódulos de este módulo.',
      });
    }

    const submodulos = await Submodulo.find({ modulo: moduloId }).sort({
      createdAt: -1,
    });

    return res.json({ modulo, submodulos });
  } catch (err) {
    console.error('❌ Error listando submódulos (admin):', err);
    return res.status(500).json({
      message: 'Error al obtener submódulos (admin)',
      error: err.message,
    });
  }
};

exports.crearSubmoduloAdmin = async (req, res) => {
  try {
    const { moduloId } = req.params;
    let { titulo, descripcion, reintento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduloId)) {
      return res.status(400).json({ message: 'ID de módulo inválido.' });
    }

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        message: 'El título del submódulo es obligatorio.',
      });
    }

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo no encontrado.' });
    }

    // Solo se pueden crear submódulos en módulos LOCALES
    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'No se pueden crear submódulos en un módulo global (del súper usuario).',
      });
    }

    // Validar universidad del admin
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede crear el submódulo.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para crear submódulos en este módulo.',
      });
    }

    const submodulo = await Submodulo.create({
      modulo: moduloId,
      titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : '',
      reintento:
        typeof reintento === 'number'
          ? reintento
          : reintento
          ? Number(reintento)
          : 0,
    });

    return res.status(201).json({
      message: 'Submódulo creado correctamente (admin)',
      submodulo,
    });
  } catch (err) {
    console.error('❌ Error creando submódulo (admin):', err);
    return res.status(500).json({
      message: 'Error al crear submódulo (admin)',
      error: err.message,
    });
  }
};

exports.obtenerSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de submódulo inválido.',
      });
    }

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) {
      return res.status(404).json({ message: 'Submódulo no encontrado.' });
    }

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) {
      return res.status(500).json({
        message: 'El submódulo no tiene un módulo asociado válido.',
      });
    }

    // Si el módulo es GLOBAL, se puede ver siempre (solo lectura)
    if (modulo.esGlobal) {
      return res.json({ modulo, submodulo });
    }

    // Si es LOCAL, validar universidad
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede obtener el submódulo.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para ver este submódulo.',
      });
    }

    return res.json({ modulo, submodulo });
  } catch (err) {
    console.error('❌ Error obteniendo submódulo (admin):', err);
    return res.status(500).json({
      message: 'Error al obtener submódulo (admin)',
      error: err.message,
    });
  }
};

exports.actualizarSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let { titulo, descripcion, reintento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de submódulo inválido.',
      });
    }

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) {
      return res.status(404).json({ message: 'Submódulo no encontrado' });
    }

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) {
      return res.status(500).json({
        message: 'El submódulo no tiene un módulo asociado válido.',
      });
    }

    // Solo se pueden editar submódulos de módulos LOCALES
    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'Este submódulo pertenece a un módulo global y no puede ser editado por el admin.',
      });
    }

    // Validar universidad del admin
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede actualizar el submódulo.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para editar este submódulo.',
      });
    }

    if (titulo !== undefined) submodulo.titulo = titulo;
    if (descripcion !== undefined) submodulo.descripcion = descripcion;
    if (reintento !== undefined) {
      submodulo.reintento =
        typeof reintento === 'number'
          ? reintento
          : reintento
          ? Number(reintento)
          : 0;
    }

    await submodulo.save();

    return res.json({
      message: 'Submódulo actualizado correctamente (admin)',
      submodulo,
    });
  } catch (err) {
    console.error('❌ Error actualizando submódulo (admin):', err);
    return res.status(500).json({
      message: 'Error al actualizar submódulo (admin)',
      error: err.message,
    });
  }
};

exports.eliminarSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'ID de submódulo inválido.',
      });
    }

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) {
      return res.status(404).json({ message: 'Submódulo no encontrado' });
    }

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) {
      return res.status(500).json({
        message: 'El submódulo no tiene un módulo asociado válido.',
      });
    }

    // Solo se pueden borrar submódulos de módulos LOCALES
    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'Este submódulo pertenece a un módulo global y no puede ser eliminado por el admin.',
      });
    }

    // Validar universidad del admin
    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: 'No se encontró el usuario autenticado.',
      });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      if (uniDoc) {
        universidadId = uniDoc._id;
      } else {
        universidadId = null;
      }
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se puede eliminar el submódulo.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para eliminar este submódulo.',
      });
    }

    // Borrado en cascada de ejercicios de ese submódulo
    const ejercicios = await Ejercicio.find({ submodulo: id }).select('_id');
    const ejIds = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({
      ejercicio: { $in: ejIds },
    });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({
      ejercicio: { $in: ejIds },
    });

    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.findByIdAndDelete(id);

    return res.json({
      message: 'Submódulo eliminado correctamente (admin)',
    });
  } catch (err) {
    console.error('❌ Error eliminando submódulo (admin):', err);
    return res.status(500).json({
      message: 'Error al eliminar submódulo (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   LISTAR EJERCICIOS (ADMIN)
   =========================== */

exports.listarEjerciciosAdmin = async (req, res) => {
  try {
    const { submoduloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
      return res.status(400).json({ message: 'ID de submódulo inválido.' });
    }

    const submodulo = await Submodulo.findById(submoduloId);
    if (!submodulo) {
      return res.status(404).json({ message: 'Submódulo no encontrado.' });
    }

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) {
      return res.status(404).json({ message: 'Módulo padre no encontrado.' });
    }

    if (modulo.esGlobal) {
      const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).sort({
        createdAt: -1,
      });

      return res.json({ modulo, submodulo, ejercicios });
    }

    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res
        .status(401)
        .json({ message: 'No se encontró el usuario autenticado.' });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }

    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({
        message:
          'El usuario admin no tiene una universidad válida asociada. No se pueden obtener los ejercicios.',
      });
    }

    if (
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para ver los ejercicios de este submódulo.',
      });
    }

    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).sort({
      createdAt: -1,
    });

    return res.json({ modulo, submodulo, ejercicios });
  } catch (err) {
    console.error('❌ Error listando ejercicios (admin):', err);
    return res.status(500).json({
      message: 'Error al listar ejercicios (admin)',
      error: err.message,
    });
  }
};

/* ===========================
   CREAR EJERCICIO (ADMIN, SOLO LOCAL)
   =========================== */

  exports.crearEjercicioAdmin = async (req, res) => {
    try {
      const { submoduloId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(submoduloId)) {
        return res.status(400).json({ message: "ID de submódulo inválido." });
      }
  
      const submodulo = await Submodulo.findById(submoduloId).populate("modulo");
      if (!submodulo)
        return res.status(404).json({ message: "Submódulo no encontrado" });
  
      const {
        titulo,
        tiempo,
        tipoModulo,
        tipoEjercicio,
  
        // RolePlay
        tipoRole,
        trastorno,
        consentimiento,
        tipoConsentimiento,
        herramientas,
        praxisNivel,
        modeloIntervencion,
        pruebasConfig: pruebasConfigRolePlay,
  
        // Grabar voz
        caso,
  
        // Criterios Dx
        criterios,
        intentos,
  
        // Pruebas
        pruebas,
        pruebasConfig: pruebasConfigPruebas, // ✅ Pruebas config (alias)
  
        // Proyectivas
        historia,
        imagen,
  
        // Interp frases
        edad,
        ocupacion,
        motivo,
        historiaPersonal,
        tipo,
        respuestasFrases,
        texto,
      } = req.body || {};
  
      if (!titulo || !String(titulo).trim()) {
        return res
          .status(400)
          .json({ message: "El título del ejercicio es obligatorio." });
      }
  
      if (!tipoEjercicio) {
        return res.status(400).json({ message: "tipoEjercicio es obligatorio." });
      }
  
      const tipoModuloInferido = submodulo?.modulo?.tipoModulo;
      const tipoModuloSeguro = normalizarTipoModulo(tipoModuloInferido);
      
      if (!tipoModuloSeguro) {
        return res.status(400).json({
          message: `tipoModulo inválido heredado del módulo: '${tipoModuloInferido}'.`,
          allowed: Ejercicio.schema.path("tipoModulo").enumValues || [],
        });
      }

      const ejercicio = await Ejercicio.create({
        submodulo: submoduloId,
        tipoEjercicio,
        tipoModulo: tipoModuloSeguro, // ✅ SIEMPRE desde el módulo
        titulo: String(titulo).trim(),
        tiempo: typeof tiempo === "number" ? tiempo : tiempo ? Number(tiempo) : 0,
      });
  
      let detalle = null;
  
      // ===== SWITCH DETALLE POR TIPO =====
      if (tipoEjercicio === "Grabar voz") {
        if (!caso || !String(caso).trim()) {
          return res.status(400).json({
            message: "El caso/enunciado es obligatorio para Grabar voz.",
          });
        }
  
        detalle = await EjercicioGrabarVoz.create({
          ejercicio: ejercicio._id,
          caso: String(caso),
          evaluaciones: normalizeEvaluacionesIA(req.body?.evaluaciones || {}),
        });
      } else if (tipoEjercicio === "Interpretación de frases incompletas") {
        detalle = await EjercicioInterpretacionFrases.create({
          ejercicio: ejercicio._id,
          edad: edad ? Number(edad) : undefined,
          ocupacion: ocupacion || "",
          motivo: motivo || "",
          historiaPersonal: historiaPersonal || "",
          tipoTest: tipo || "adulto",
          respuestasFrases: Array.isArray(respuestasFrases) ? respuestasFrases : [],
          notas: texto || "",
          intentos:
            typeof intentos === "number"
              ? intentos
              : intentos
              ? Number(intentos)
              : 1,
        });
      }
  
      // ✅ ROLEPLAY (IA / persona / aula)
      else if (isRolePlayTipo(tipoEjercicio)) {
        const consentimientoBool = toBool(consentimiento);
        const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);

        if (consentimientoBool && !tcNorm) {
          return res.status(400).json({
            message:
              "tipoConsentimiento inválido. Valores permitidos: " +
              (EjercicioRolePlay.schema.path("tipoConsentimiento").enumValues || []).join(", "),
          });
        }

        const praxisNivelNorm = normalizePraxisNivel(praxisNivel);
        const modeloIntervencionNorm = normalizeModeloIntervencion(modeloIntervencion);

        detalle = await EjercicioRolePlay.create({
          ejercicio: ejercicio._id,

          tipoRole: tipoRole === "simulada" ? "simulada" : "real",
          trastorno: trastorno || "",

          consentimiento: consentimientoBool,
          tipoConsentimiento: consentimientoBool ? tcNorm : "",

          praxisNivel: praxisNivelNorm,
          modeloIntervencion: modeloIntervencionNorm,

          herramientas: normalizeHerramientasRolePlay(herramientas || {}),
          pruebasConfig: normalizePruebasConfigRolePlay(pruebasConfigRolePlay),

          // compat legacy: lo dejamos null/nulo
          evaluaciones: null,
        });
      } else if (tipoEjercicio === "Criterios de diagnostico") {
        detalle = await EjercicioCriteriosDx.create({
          ejercicio: ejercicio._id,
          caso: caso || "",
          criterios: criterios || "",
          intentos:
            typeof intentos === "number"
              ? intentos
              : intentos
              ? Number(intentos)
              : 1,
        });
      } else if (tipoEjercicio === "Aplicación de pruebas") {
        // compat: pruebasConfig o pruebas
        const cfg =
          pruebasConfigPruebas && typeof pruebasConfigPruebas === "object"
            ? pruebasConfigPruebas
            : pruebas && typeof pruebas === "object"
            ? pruebas
            : {};
  
        detalle = await EjercicioPruebas.create({
          ejercicio: ejercicio._id,
          pruebasConfig: cfg,
        });
      } else if (tipoEjercicio === "Pruebas psicometricas") {
        detalle = await EjercicioInterpretacionProyectiva.create({
          ejercicio: ejercicio._id,
          imagen: imagen || "",
          historia: historia || "",
          intentos:
            typeof intentos === "number"
              ? intentos
              : intentos
              ? Number(intentos)
              : 1,
        });
      }
  
      return res.status(201).json({
        message: "Ejercicio creado correctamente",
        ejercicio,
        detalle,
      });
    } catch (err) {
      console.error("❌ Error creando ejercicio (admin):", err);
      return res.status(500).json({
        message: "Error al crear ejercicio (admin)",
        error: err.message,
      });
    }
  };
  
/* ===========================
  ACTUALIZAR EJERCICIO (ADMIN, SOLO LOCAL)
   =========================== */  
  
   exports.actualizarEjercicioAdmin = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de ejercicio inválido." });
      }
  
      const ejercicio = await Ejercicio.findById(id);
      if (!ejercicio)
        return res.status(404).json({ message: "Ejercicio no encontrado" });
  
      const {
        titulo,
        tiempo,
        tipoModulo,
        tipoEjercicio,
  
        // RolePlay
        tipoRole,
        trastorno,
        consentimiento,
        tipoConsentimiento,
        herramientas,
        praxisNivel,
        modeloIntervencion,
        contextoSesion,   // ✅
        evaluaciones,     // ✅ destructurado correctamente
  
        // unificado
        pruebasConfig,
  
        // Grabar voz
        caso,
  
        // Criterios Dx
        criterios,
        intentos,
  
        // Pruebas
        pruebas,
  
        // Proyectivas
        historia,
        imagen,
  
        // Interp frases
        edad,
        ocupacion,
        motivo,
        historiaPersonal,
        tipo,
        respuestasFrases,
        texto,
      } = req.body || {};
  
      // No permitir cambiar el tipo una vez creado
      if (
        tipoEjercicio !== undefined &&
        String(tipoEjercicio) !== String(ejercicio.tipoEjercicio)
      ) {
        return res.status(400).json({
          message: "No se permite cambiar tipoEjercicio una vez creado.",
        });
      }
  
      if (titulo !== undefined) ejercicio.titulo = String(titulo);
      if (tiempo !== undefined)
        ejercicio.tiempo =
          typeof tiempo === "number" ? tiempo : Number(tiempo) || 0;
  
      if (tipoModulo !== undefined) {
        const norm = normalizarTipoModulo(tipoModulo);
        if (!norm) {
          return res.status(400).json({ message: `tipoModulo inválido: ${tipoModulo}` });
        }
        ejercicio.tipoModulo = norm;
      }
  
      await ejercicio.save();
  
      let detalle = null;
  
      if (ejercicio.tipoEjercicio === "Grabar voz") {
        detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id });
        if (!detalle) detalle = await EjercicioGrabarVoz.create({ ejercicio: id });
  
        if (caso !== undefined) detalle.caso = String(caso || "");
        if (evaluaciones !== undefined) {
          detalle.evaluaciones = normalizeEvaluacionesIA(evaluaciones || {});
        }
        await detalle.save();
  
      } else if (ejercicio.tipoEjercicio === "Interpretación de frases incompletas") {
        detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id });
        if (!detalle)
          detalle = await EjercicioInterpretacionFrases.create({ ejercicio: id });
  
        if (edad !== undefined) detalle.edad = Number(edad);
        if (ocupacion !== undefined) detalle.ocupacion = ocupacion || "";
        if (motivo !== undefined) detalle.motivo = motivo || "";
        if (historiaPersonal !== undefined) detalle.historiaPersonal = historiaPersonal || "";
        if (tipo !== undefined) detalle.tipoTest = tipo || "adulto";
        if (Array.isArray(respuestasFrases)) detalle.respuestasFrases = respuestasFrases;
        if (texto !== undefined) detalle.notas = texto || "";
        if (intentos !== undefined)
          detalle.intentos =
            typeof intentos === "number" ? intentos : Number(intentos) || 1;
  
        await detalle.save();
  
      } else if (isRolePlayTipo(ejercicio.tipoEjercicio)) {
        detalle = await EjercicioRolePlay.findOne({ ejercicio: id });
        if (!detalle) {
          detalle = await EjercicioRolePlay.create({ ejercicio: id });
        }
  
        if (tipoRole !== undefined) {
          detalle.tipoRole = tipoRole === "simulada" ? "simulada" : "real";
        }
  
        if (trastorno !== undefined) {
          detalle.trastorno = String(trastorno || "");
        }
  
        if (consentimiento !== undefined) {
          const consentimientoBool = toBool(consentimiento);
          detalle.consentimiento = consentimientoBool;
  
          if (!consentimientoBool) {
            detalle.tipoConsentimiento = "";
          } else if (tipoConsentimiento !== undefined) {
            const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);
            if (!tcNorm) {
              return res.status(400).json({
                message:
                  "tipoConsentimiento inválido. Valores permitidos: " +
                  (EjercicioRolePlay.schema.path("tipoConsentimiento").enumValues || []).join(", "),
              });
            }
            detalle.tipoConsentimiento = tcNorm;
          }
        } else if (tipoConsentimiento !== undefined && detalle.consentimiento) {
          const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);
          if (!tcNorm) {
            return res.status(400).json({
              message:
                "tipoConsentimiento inválido. Valores permitidos: " +
                (EjercicioRolePlay.schema.path("tipoConsentimiento").enumValues || []).join(", "),
            });
          }
          detalle.tipoConsentimiento = tcNorm;
        }
  
        if (praxisNivel !== undefined) {
          detalle.praxisNivel = normalizePraxisNivel(praxisNivel);
        }
  
        if (modeloIntervencion !== undefined) {
          detalle.modeloIntervencion = normalizeModeloIntervencion(modeloIntervencion);
        }
  
        // ✅ contextoSesion
        if (contextoSesion !== undefined) {
          const validContextos = [
            "exploracion_clinica",
            "intervencion_terapeutica",
            "aplicacion_pruebas_psicometricas",
            "devolucion_resultados",
          ];
          detalle.contextoSesion = validContextos.includes(contextoSesion)
            ? contextoSesion
            : "exploracion_clinica";
        }
  
        if (herramientas !== undefined) {
          detalle.herramientas = normalizeHerramientasRolePlay(herramientas || {});
        }
  
        if (pruebasConfig !== undefined) {
          detalle.pruebasConfig = normalizePruebasConfigRolePlay(pruebasConfig);
        }
  
        // compat legacy
        if (evaluaciones !== undefined) {
          detalle.evaluaciones = null;
        }
  
        if (typeof detalle.markModified === "function") {
          detalle.markModified("herramientas");
          detalle.markModified("pruebasConfig");
        }
  
        await detalle.save();
  
      } else if (ejercicio.tipoEjercicio === "Criterios de diagnostico") {
        detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id });
        if (!detalle) detalle = await EjercicioCriteriosDx.create({ ejercicio: id });
  
        if (caso !== undefined) detalle.caso = caso || "";
        if (criterios !== undefined) detalle.criterios = criterios || "";
        if (intentos !== undefined)
          detalle.intentos =
            typeof intentos === "number" ? intentos : Number(intentos) || 1;
  
        await detalle.save();
  
      } else if (ejercicio.tipoEjercicio === "Aplicación de pruebas") {
        detalle = await EjercicioPruebas.findOne({ ejercicio: id });
        if (!detalle) detalle = await EjercicioPruebas.create({ ejercicio: id });
  
        const cfg =
          pruebasConfig && typeof pruebasConfig === "object"
            ? pruebasConfig
            : pruebas && typeof pruebas === "object"
            ? pruebas
            : {};
  
        detalle.pruebasConfig = cfg;
        await detalle.save();
  
      } else if (ejercicio.tipoEjercicio === "Pruebas psicometricas") {
        detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id });
        if (!detalle)
          detalle = await EjercicioInterpretacionProyectiva.create({ ejercicio: id });
  
        if (imagen !== undefined) detalle.imagen = imagen || "";
        if (historia !== undefined) detalle.historia = historia || "";
        if (intentos !== undefined)
          detalle.intentos =
            typeof intentos === "number" ? intentos : Number(intentos) || 1;
  
        await detalle.save();
      }
  
      return res.json({
        message: "Ejercicio actualizado correctamente",
        ejercicio,
        detalle,
      });
    } catch (err) {
      console.error("❌ Error actualizando ejercicio (admin):", err);
      return res.status(500).json({
        message: "Error al actualizar ejercicio (admin)",
        error: err.message,
      });
    }
  };
  

/* ===========================
   OBTENER EJERCICIO (ADMIN)
   =========================== */

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
        detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id }).lean();
      } else if (ejercicio.tipoEjercicio === 'Interpretación de frases incompletas') {
        detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id }).lean();
      } else if (isRolePlayTipo(ejercicio.tipoEjercicio)) {
        detalle = await EjercicioRolePlay.findOne({ ejercicio: id }).lean();
      } else if (ejercicio.tipoEjercicio === 'Criterios de diagnostico') {
        detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id }).lean();
      } else if (ejercicio.tipoEjercicio === 'Aplicación de pruebas') {
        detalle = await EjercicioPruebas.findOne({ ejercicio: id }).lean();
      } else if (ejercicio.tipoEjercicio === 'Pruebas psicometricas') {
        detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id }).lean();
      }
  
      return res.json({
        ejercicio,
        detalle,
        submodulo: ejercicio.submodulo,
        modulo: ejercicio.submodulo?.modulo || null,
        canEditGlobal: true, // si vos ya lo calculás, dejá tu lógica
      });
    } catch (err) {
      console.error('❌ Error obteniendo ejercicio (admin):', err);
      return res.status(500).json({
        message: 'Error al obtener ejercicio (admin)',
        error: err.message,
      });
    }
  };

/* ===========================
   ELIMINAR EJERCICIO (ADMIN, SOLO LOCAL)
   =========================== */

exports.eliminarEjercicioAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de ejercicio inválido.' });
    }

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) {
      return res.status(404).json({ message: 'Ejercicio no encontrado.' });
    }

    const submodulo = await Submodulo.findById(ejercicio.submodulo);
    const modulo = await Modulo.findById(submodulo.modulo);

    if (!modulo) {
      return res.status(404).json({ message: 'Módulo padre no encontrado.' });
    }

    if (modulo.esGlobal) {
      return res.status(403).json({
        message:
          'Este módulo es global (del súper usuario) y no puede eliminarse desde el admin.',
      });
    }

    const adminId = req.user && req.user._id;
    if (!adminId) {
      return res
        .status(401)
        .json({ message: 'No se encontró el usuario autenticado.' });
    }

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado.' });
    }

    let universidadId = admin.universidad || admin.universidadId || null;

    if (universidadId && typeof universidadId === 'object' && universidadId._id) {
      universidadId = universidadId._id;
    }

    if (
      universidadId &&
      typeof universidadId === 'string' &&
      !mongoose.Types.ObjectId.isValid(universidadId)
    ) {
      const uniDoc = await Universidad.findOne({
        nombre: universidadId.trim(),
      }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }

    if (
      !universidadId ||
      !mongoose.Types.ObjectId.isValid(universidadId) ||
      !modulo.universidad ||
      modulo.universidad.toString() !== universidadId.toString()
    ) {
      return res.status(403).json({
        message: 'No tenés permisos para eliminar este ejercicio.',
      });
    }

    await EjercicioGrabarVoz.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionFrases.deleteOne({ ejercicio: id });
    await EjercicioRolePlay.deleteOne({ ejercicio: id });
    await EjercicioCriteriosDx.deleteOne({ ejercicio: id });
    await EjercicioPruebas.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionProyectiva.deleteOne({ ejercicio: id });

    await ejercicio.deleteOne();

    return res.json({
      message: 'Ejercicio eliminado correctamente (admin)',
    });
  } catch (err) {
    console.error('❌ Error eliminando ejercicio (admin):', err);
    return res.status(500).json({
      message: 'Error al eliminar ejercicio (admin)',
      error: err.message,
    });
  }
};