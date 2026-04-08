const mongoose = require("mongoose");

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
  PRAXIS_NIVELES,
  MODELOS_INTERVENCION,
  CONTEXTOS_GV,
  ESCENARIOS_GV,
  NIVELES_GV,
  TIPOS_ENTRENAMIENTO,
  ESCENARIOS_POR_CONTEXTO,
  INTERVENCIONES_POR_NIVEL,
} = require("../models/modulo");

const Universidad = require("../models/university");
const Usuario     = require("../models/user");

/* =========================================================
   Helpers
========================================================= */
function getUniversidadIdFromUser(user) {
  if (!user) return null;
  return user.universidad || user.universidadId || null;
}

function stripDiacritics(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getEnumTipoModuloEjercicio() {
  const ev = Ejercicio?.schema?.path("tipoModulo")?.enumValues;
  return Array.isArray(ev) ? ev : [];
}

function normalizarTipoModulo(crudo) {
  if (!crudo) return null;
  const allowed = getEnumTipoModuloEjercicio();
  if (!allowed.length) return null;
  const raw = String(crudo).trim();
  if (!raw) return null;
  if (allowed.includes(raw)) return raw;
  const rawLower   = raw.toLowerCase();
  const rawNoTilde = stripDiacritics(rawLower);
  for (const v of allowed) {
    const vLower = String(v).toLowerCase();
    if (vLower === rawLower) return v;
    if (stripDiacritics(vLower) === rawNoTilde) return v;
  }
  return null;
}

function normalizeTipoConsentimiento(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "adulto") return "adulto";
  if (v === "niño" || v === "nino") return "niño";
  if (v.includes("mayor") || v.includes("adult")) return "adulto";
  if (v.includes("menor") || v.includes("niñ") || v.includes("nin")) return "niño";
  return "";
}

function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

const DEFAULT_HERRAMIENTAS_ROLEPLAY = {
  manejoExpediente: false, ficha: false, hc: false, examen: false,
  convergencia: false, hipotesis: false, diagnostico: false, pruebas: false,
  interpretacion: false, recomendaciones: false, anexos: false, plan: false,
};

function normalizeHerramientasRolePlay(h = {}) {
  const inH = h && typeof h === "object" ? h : {};
  const out = { ...DEFAULT_HERRAMIENTAS_ROLEPLAY };
  Object.keys(DEFAULT_HERRAMIENTAS_ROLEPLAY).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(inH, k)) out[k] = toBool(inH[k]);
  });
  return out;
}

const DEFAULT_HERRAMIENTAS_INFORME = {
  ficha: false, hc: false, examen: false, convergencia: false,
  hipotesis: false, diagnostico: false, pruebas: false,
  interpretacion: false, recomendaciones: false, anexos: false, plan: false,
};

function normalizeHerramientasInforme(h = {}) {
  const inH = h && typeof h === "object" ? h : {};
  const out = { ...DEFAULT_HERRAMIENTAS_INFORME };
  Object.keys(DEFAULT_HERRAMIENTAS_INFORME).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(inH, k)) out[k] = toBool(inH[k]);
  });
  return out;
}

function normalizePruebasConfigRolePlay(pruebasConfig) {
  if (!pruebasConfig || typeof pruebasConfig !== "object") return { modo: "student_choice", prueba: "" };
  const modo = pruebasConfig.modo === "fixed" || pruebasConfig.modo === "student_choice"
    ? pruebasConfig.modo : "student_choice";
  const prueba = pruebasConfig.prueba ? String(pruebasConfig.prueba) : "";
  return modo === "student_choice" ? { modo, prueba: "" } : { modo, prueba };
}

function normalizePraxisNivel(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return "nivel_1";
  if (PRAXIS_NIVELES.includes(v)) return v;
  if (v.includes("1") || v.includes("inicial") || v === "i")     return "nivel_1";
  if (v.includes("2") || v.includes("intermedio") || v === "ii") return "nivel_2";
  if (v.includes("3") || v.includes("avanzad") || v === "iii")   return "nivel_3";
  return "nivel_1";
}

function normalizeModeloIntervencion(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";
  const exact = MODELOS_INTERVENCION.find((x) => x === v);
  if (exact) return exact;
  const vLower = stripDiacritics(v.toLowerCase());
  for (const item of MODELOS_INTERVENCION) {
    if (stripDiacritics(String(item).toLowerCase()) === vLower) return item;
  }
  if (vLower === "tcc" || vLower.includes("cognitivo conductual")) return "Terapia Cognitivo-Conductual (TCC)";
  if (vLower.includes("psicoanal"))              return "Psicoanálisis";
  if (vLower.includes("logoterapia"))            return "Logoterapia";
  if (vLower.includes("centrada en la persona")) return "Terapia Centrada en la Persona";
  if (vLower.includes("gestalt"))                return "Gestalt";
  if (vLower.includes("humanista"))              return "Humanista-Existencial";
  if (vLower.includes("fap"))                    return "Terapia Analítico-Funcional (FAP)";
  if (vLower.includes("sistem"))                 return "Sistémica";
  if (vLower === "act" || vLower.includes("aceptacion y compromiso")) return "Aceptación y Compromiso (ACT)";
  if (vLower === "dbt" || vLower.includes("dialectica conductual"))   return "Dialéctica Conductual (DBT)";
  if (vLower.includes("mindfulness"))            return "Mindfulness / Mindfulness-based";
  return "";
}

function isRolePlayTipo(tipo) {
  return tipo === "Role playing persona" || tipo === "Role playing Aula" || tipo === "Role Playing IA";
}

function normalizeContextoSesion(raw) {
  const valid = ["exploracion_clinica","intervencion_terapeutica","aplicacion_pruebas_psicometricas","devolucion_resultados"];
  const v = String(raw || "exploracion_clinica");
  return valid.includes(v) ? v : "exploracion_clinica";
}

function normalizeEvaluacionesIA(ev = {}) {
  return {
    rapport: toBool(ev.rapport), preguntasAbiertas: toBool(ev.preguntasAbiertas),
    encuadre: toBool(ev.encuadre), alianzaTerapeutica: toBool(ev.alianzaTerapeutica),
    parafrasis: toBool(ev.parafrasis), reflejo: toBool(ev.reflejo),
    clarificacion: toBool(ev.clarificacion), chisteTerapeutico: toBool(ev.chisteTerapeutico),
    sarcasmoTerapeutico: toBool(ev.sarcasmoTerapeutico), empatia: toBool(ev.empatia),
    revelacion: toBool(ev.revelacion), metafora: toBool(ev.metafora),
    resumen: toBool(ev.resumen), practicarConsignasPruebas: toBool(ev.practicarConsignasPruebas),
  };
}

function calcularIntervenciones(contexto, escenario, nivel) {
  const base = INTERVENCIONES_POR_NIVEL[nivel] || INTERVENCIONES_POR_NIVEL["nivel_1"];
  const filtros = {
    clinico: {
      exploracion:        ["pregunta_abierta","clarificacion","reflejo_simple","escucha_activa","validacion_basica","exploracion_dirigida","resumen_parcial","focalizacion"],
      intervencion:       ["reencuadre_simple","reencuadre_complejo","confrontacion_suave","interpretacion","desarrollo_insight","integracion_emocional","plan_intervencion","analisis_funcional_basico"],
      devolucion:         ["resumen_parcial","psicoeducacion_breve","normalizacion","mensaje_directo","organizacion_pensamiento","derivacion"],
      aplicacion_pruebas: ["presencia","establecimiento_limites","orientacion","manejo_conducta","reduccion_ansiedad"],
    },
    educativo: {
      exploracion_estudiante:  ["pregunta_abierta","escucha_activa","validacion_basica","clarificacion","reflejo_simple","exploracion_dirigida"],
      intervencion_estudiante: ["psicoeducacion_breve","normalizacion","reencuadre_simple","manejo_conducta","orientacion","redireccion_suave"],
      comunicacion_padres:     ["mensaje_directo","psicoeducacion_breve","feedback_constructivo","normalizacion","orientacion"],
    },
    laboral: {
      entrevista_laboral: ["pregunta_abierta","escucha_activa","clarificacion","exploracion_dirigida","resumen_parcial","focalizacion"],
      feedback:           ["feedback_constructivo","mensaje_directo","normalizacion","reencuadre_simple","establecimiento_limites"],
      manejo_conflictos:  ["mediacion_basica","negociacion","establecimiento_limites","redireccion_suave","validacion_emocional"],
      burnout:            ["validacion_emocional","contencion_basica","psicoeducacion_breve","normalizacion","reduccion_ansiedad","plan_intervencion"],
      acoso_laboral:      ["contencion_basica","establecimiento_limites","plan_proteccion","derivacion","validacion_emocional","mensaje_directo"],
    },
  };
  const especificas = filtros[contexto]?.[escenario] || [];
  const resultado = base.filter((i) => especificas.includes(i));
  if (resultado.length < 4) {
    for (const i of base) {
      if (!resultado.includes(i)) resultado.push(i);
      if (resultado.length >= 6) break;
    }
  }
  return resultado;
}

function normalizeCasosGV(casosRaw) {
  const arr = Array.isArray(casosRaw) ? casosRaw : [];
  return arr.slice(0, 20)
    .map((c, idx) => {
      const texto  = String(c?.texto || c?.text || c?.caso || "").trim();
      const tiempo = Number(c?.tiempo ?? 0.25);
      return {
        _id:    c?._id || undefined,
        texto,
        tiempo: Number.isFinite(tiempo) && tiempo > 0 ? tiempo : 0.25,
        orden:  Number.isFinite(Number(c?.orden)) ? Number(c.orden) : idx,
      };
    })
    .filter((c) => c.texto.length > 0);
}

function normalizeGrabarVozFields(body) {
  const contexto          = CONTEXTOS_GV.includes(body?.contexto) ? body.contexto : "clinico";
  const escenariosValidos = ESCENARIOS_POR_CONTEXTO[contexto] || [];
  const escenario         = escenariosValidos.includes(body?.escenario) ? body.escenario : escenariosValidos[0] || "exploracion";
  const nivel             = NIVELES_GV.includes(body?.nivel) ? body.nivel : "nivel_1";
  const tipoEntrenamiento = TIPOS_ENTRENAMIENTO.includes(body?.tipoEntrenamiento) ? body.tipoEntrenamiento : "habilidad_especifica";
  const intervenciones    = calcularIntervenciones(contexto, escenario, nivel);
  const casos             = normalizeCasosGV(body?.casos);
  const habilidades    = Array.isArray(body?.habilidades)    ? body.habilidades    : [];
  const habilidadesTCC = Array.isArray(body?.habilidadesTCC) ? body.habilidadesTCC : [];
  const modeloTerapia  = typeof body?.modeloTerapia === "string" ? body.modeloTerapia : "";

  return { contexto, escenario, nivel, tipoEntrenamiento, intervenciones, casos, habilidades, habilidadesTCC, modeloTerapia };
}


/* =========================================================
   Generar casos Grabar Voz — casos fijos del pool
========================================================= */
exports.generarCasosGrabarVoz = async (req, res) => {
  try {
    const {
      contexto, escenario, nivel, tipoEntrenamiento,
      habilidades, habilidadesTCC,
      submoduloId, // el frontend debe enviarlo para rastrear casos usados
    } = req.body || {};

    if (!contexto || !escenario || !nivel) {
      return res.status(400).json({ message: "contexto, escenario y nivel son obligatorios." });
    }

    const { getCasos } = require("../data/casosMicroIntervenciones");

    // Determinar habilidad principal
    const habilidadesBase   = Array.isArray(habilidades)    ? habilidades    : [];
    const habilidadesTCCArr = Array.isArray(habilidadesTCC) ? habilidadesTCC : [];
    const todasHabilidades  = [...habilidadesBase, ...habilidadesTCCArr];
    const habilidadPrincipal = todasHabilidades[0] || "";

    if (!habilidadPrincipal) {
      return res.status(400).json({ message: "Selecciona al menos una habilidad para generar casos." });
    }

    // Normalizar nombre de habilidad al formato de la clave del pool
    const habilidadNorm = habilidadPrincipal
      .toLowerCase()
      .replace(/\s+/g, "_")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Nivel del pool — mapear "basico/intermedio/avanzado" a la clave
    const nivelMap = { basico: "basico", intermedio: "intermedio", avanzado: "avanzado" };
    const nivelPool = nivelMap[nivel] || "basico";

    const pool = getCasos(contexto, escenario, nivelPool, habilidadNorm);

    if (!pool.length) {
      return res.status(404).json({
        message: `No hay casos disponibles para: ${contexto} / ${escenario} / ${nivelPool} / ${habilidadNorm}.`,
      });
    }

    // Recuperar qué casos ya usó este submódulo
    let casosUsados = [];
    if (submoduloId && mongoose.Types.ObjectId.isValid(submoduloId)) {
      const registros = await EjercicioGrabarVoz.find({
        ejercicio: {
          $in: await Ejercicio.find({ submodulo: submoduloId }).distinct("_id"),
        },
      }).select("casosUsados").lean();

      casosUsados = registros.flatMap((r) => r.casosUsados || []);
    }

    // Separar disponibles de ya usados
    const disponibles = pool.filter((c) => !casosUsados.includes(c));
    const yaUsados    = pool.filter((c) =>  casosUsados.includes(c));

    // Combinar: primero los disponibles, luego los ya usados (menos recientes primero)
    const ordenados = [...disponibles, ...yaUsados];

    const resultado = ordenados.slice(0, 3);

    return res.json({ casos: resultado });
  } catch (err) {
    console.error("❌ Error generando casos Grabar Voz:", err);
    return res.status(500).json({ message: "Error al obtener casos.", error: err.message });
  }
};



/* =========================================================
   Wrappers CREATE por tipo
========================================================= */
exports.crearEjercicioGrabarVozAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Grabar voz" };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioInterpretacionFrasesAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Interpretación de frases incompletas" };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioRolePlayAdmin = async (req, res) => {
  const incoming = String(req.body?.tipoEjercicio || "").trim();
  const tipo = incoming === "Role playing persona" || incoming === "Role Playing IA" ? incoming : "Role Playing IA";
  req.body = { ...(req.body || {}), tipoEjercicio: tipo };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioCriteriosDxAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Criterios de diagnostico" };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioPruebasAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Aplicación de pruebas" };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioInterpretacionProyectivasAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Pruebas psicometricas" };
  return exports.crearEjercicioAdmin(req, res);
};
exports.crearEjercicioInformeClinicoAdmin = async (req, res) => {
  req.body = { ...(req.body || {}), tipoEjercicio: "Informe clínico" };
  return exports.crearEjercicioAdmin(req, res);
};

/* =========================================================
   Wrappers UPDATE por tipo
========================================================= */
exports.actualizarEjercicioGrabarVozAdmin            = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioInterpretacionFrasesAdmin = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioRolePlayAdmin             = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioCriteriosDxAdmin          = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioPruebasAdmin              = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioInterpretacionProyectivasAdmin = (req, res) => exports.actualizarEjercicioAdmin(req, res);
exports.actualizarEjercicioInformeClinicoAdmin       = (req, res) => exports.actualizarEjercicioAdmin(req, res);

/* =========================================================
   LISTAR MÓDULOS
========================================================= */
exports.listarModulosAdmin = async (req, res) => {
  try {
    const adminId = req.user && req.user._id;
    if (!adminId) return res.status(401).json({ message: "No se encontró el usuario autenticado." });

    const admin = await Usuario.findById(adminId).lean();
    if (!admin) return res.status(404).json({ message: "Admin no encontrado." });

    let universidadId = getUniversidadIdFromUser(admin);
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }

    const modulosGlobales = await Modulo.find({ esGlobal: true }).sort({ createdAt: -1 }).lean();
    let modulosLocales = [];
    if (universidadId && mongoose.Types.ObjectId.isValid(universidadId)) {
      modulosLocales = await Modulo.find({ universidad: universidadId }).sort({ createdAt: -1 }).lean();
    }

    return res.json({
      modulos: [
        ...modulosGlobales.map((m) => ({ ...m, esGlobal: true })),
        ...modulosLocales.map((m) => ({ ...m, esGlobal: false })),
      ],
    });
  } catch (err) {
    console.error("❌ Error al obtener módulos para el admin:", err);
    return res.status(500).json({ message: "Error al obtener módulos para el admin", error: err.message });
  }
};

/* =========================================================
   CREAR MÓDULO
========================================================= */
exports.crearModuloAdmin = async (req, res) => {
  try {
    let universidadId = getUniversidadIdFromUser(req.user);
    const creadorId   = req.user && req.user._id;

    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc?._id || null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }

    const { titulo, descripcion, tipoModulo } = req.body;
    if (!titulo || !tipoModulo || !descripcion?.trim()) {
      return res.status(400).json({ message: "Título, tipo de módulo y descripción son obligatorios." });
    }

    const tipoNormalizado = normalizarTipoModulo(tipoModulo);
    if (!tipoNormalizado) return res.status(400).json({ message: `El tipo de módulo '${tipoModulo}' no es válido.` });

    const modulo = await Modulo.create({
      titulo: titulo.trim(), descripcion: descripcion.trim(),
      tipoModulo: tipoNormalizado, esGlobal: false,
      universidad: universidadId, creadoPor: creadorId || null, activo: true,
    });

    return res.status(201).json({ message: "Módulo creado correctamente (admin)", modulo });
  } catch (err) {
    console.error("❌ Error creando módulo (admin):", err);
    return res.status(500).json({ message: "Error al crear módulo (admin)", error: err.message });
  }
};

/* =========================================================
   OBTENER MÓDULO
========================================================= */
exports.obtenerModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de módulo inválido." });

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado" });

    if (modulo.esGlobal) {
      const submodulos = await Submodulo.find({ modulo: id }).sort({ createdAt: -1 });
      return res.json({ modulo, submodulos });
    }

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para ver este módulo." });
    }

    const submodulos = await Submodulo.find({ modulo: id }).sort({ createdAt: -1 });
    return res.json({ modulo, submodulos });
  } catch (err) {
    console.error("❌ Error obteniendo módulo (admin):", err);
    return res.status(500).json({ message: "Error al obtener módulo (admin)", error: err.message });
  }
};

/* =========================================================
   ACTUALIZAR MÓDULO
========================================================= */
exports.actualizarModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de módulo inválido." });

    let universidadId = getUniversidadIdFromUser(req.user);
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc?._id || null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado" });
    if (modulo.esGlobal) return res.status(403).json({ message: "Este módulo es global y no puede ser editado por el admin." });
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para editar este módulo." });
    }

    const { titulo, descripcion, tipoModulo, activo } = req.body;
    if (titulo      !== undefined) modulo.titulo      = titulo;
    if (descripcion !== undefined) modulo.descripcion = descripcion;
    if (tipoModulo) {
      const norm = normalizarTipoModulo(tipoModulo);
      if (!norm) return res.status(400).json({ message: `El tipo de módulo '${tipoModulo}' no es válido.` });
      modulo.tipoModulo = norm;
    }
    if (activo !== undefined) modulo.activo = !!activo;
    await modulo.save();

    return res.json({ message: "Módulo actualizado correctamente (admin)", modulo });
  } catch (err) {
    console.error("❌ Error actualizando módulo (admin):", err);
    return res.status(500).json({ message: "Error al actualizar módulo (admin)", error: err.message });
  }
};

/* =========================================================
   ELIMINAR MÓDULO
========================================================= */
exports.eliminarModuloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de módulo inválido." });

    let universidadId = getUniversidadIdFromUser(req.user);
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc?._id || null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }

    const modulo = await Modulo.findById(id);
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado" });
    if (modulo.esGlobal) return res.status(403).json({ message: "Este módulo es global y no puede ser eliminado por el admin." });
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para eliminar este módulo." });
    }

    const submodulos = await Submodulo.find({ modulo: id }).select("_id");
    const subIds     = submodulos.map((s) => s._id);
    const ejercicios = await Ejercicio.find({ submodulo: { $in: subIds } }).select("_id");
    const ejIds      = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInformeClinico.deleteMany({ ejercicio: { $in: ejIds } });
    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.deleteMany({ modulo: id });
    await Modulo.findByIdAndDelete(id);

    return res.json({ message: "Módulo eliminado correctamente (admin)" });
  } catch (err) {
    console.error("❌ Error eliminando módulo (admin):", err);
    return res.status(500).json({ message: "Error al eliminar módulo (admin)", error: err.message });
  }
};

/* =========================================================
   SUBMÓDULOS
========================================================= */
exports.listarSubmodulosAdmin = async (req, res) => {
  try {
    const { moduloId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduloId)) return res.status(400).json({ message: "ID de módulo inválido." });

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado." });

    if (modulo.esGlobal) {
      const submodulos = await Submodulo.find({ modulo: moduloId }).sort({ createdAt: -1 });
      return res.json({ modulo, submodulos });
    }

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para ver los submódulos de este módulo." });
    }

    const submodulos = await Submodulo.find({ modulo: moduloId }).sort({ createdAt: -1 });
    return res.json({ modulo, submodulos });
  } catch (err) {
    console.error("❌ Error listando submódulos (admin):", err);
    return res.status(500).json({ message: "Error al obtener submódulos (admin)", error: err.message });
  }
};

exports.crearSubmoduloAdmin = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { titulo, descripcion, reintento } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduloId)) return res.status(400).json({ message: "ID de módulo inválido." });
    if (!titulo?.trim()) return res.status(400).json({ message: "El título del submódulo es obligatorio." });

    const modulo = await Modulo.findById(moduloId);
    if (!modulo) return res.status(404).json({ message: "Módulo no encontrado." });
    if (modulo.esGlobal) return res.status(403).json({ message: "No se pueden crear submódulos en un módulo global." });

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para crear submódulos en este módulo." });
    }

    const submodulo = await Submodulo.create({
      modulo: moduloId, titulo: titulo.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      reintento: typeof reintento === "number" ? reintento : reintento ? Number(reintento) : 0,
    });

    return res.status(201).json({ message: "Submódulo creado correctamente (admin)", submodulo });
  } catch (err) {
    console.error("❌ Error creando submódulo (admin):", err);
    return res.status(500).json({ message: "Error al crear submódulo (admin)", error: err.message });
  }
};

exports.obtenerSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de submódulo inválido." });

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado." });

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) return res.status(500).json({ message: "El submódulo no tiene un módulo asociado válido." });
    if (modulo.esGlobal) return res.json({ modulo, submodulo });

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para ver este submódulo." });
    }

    return res.json({ modulo, submodulo });
  } catch (err) {
    console.error("❌ Error obteniendo submódulo (admin):", err);
    return res.status(500).json({ message: "Error al obtener submódulo (admin)", error: err.message });
  }
};

exports.actualizarSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, reintento } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de submódulo inválido." });

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado" });

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) return res.status(500).json({ message: "El submódulo no tiene un módulo asociado válido." });
    if (modulo.esGlobal) return res.status(403).json({ message: "Este submódulo pertenece a un módulo global y no puede ser editado." });

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para editar este submódulo." });
    }

    if (titulo      !== undefined) submodulo.titulo      = titulo;
    if (descripcion !== undefined) submodulo.descripcion = descripcion;
    if (reintento   !== undefined) submodulo.reintento   = typeof reintento === "number" ? reintento : Number(reintento) || 0;
    await submodulo.save();

    return res.json({ message: "Submódulo actualizado correctamente (admin)", submodulo });
  } catch (err) {
    console.error("❌ Error actualizando submódulo (admin):", err);
    return res.status(500).json({ message: "Error al actualizar submódulo (admin)", error: err.message });
  }
};

exports.eliminarSubmoduloAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de submódulo inválido." });

    const submodulo = await Submodulo.findById(id);
    if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado" });

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) return res.status(500).json({ message: "El submódulo no tiene un módulo asociado válido." });
    if (modulo.esGlobal) return res.status(403).json({ message: "Este submódulo pertenece a un módulo global y no puede ser eliminado." });

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para eliminar este submódulo." });
    }

    const ejercicios = await Ejercicio.find({ submodulo: id }).select("_id");
    const ejIds      = ejercicios.map((e) => e._id);

    await EjercicioGrabarVoz.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionFrases.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioRolePlay.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioCriteriosDx.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioPruebas.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInterpretacionProyectiva.deleteMany({ ejercicio: { $in: ejIds } });
    await EjercicioInformeClinico.deleteMany({ ejercicio: { $in: ejIds } });
    await Ejercicio.deleteMany({ _id: { $in: ejIds } });
    await Submodulo.findByIdAndDelete(id);

    return res.json({ message: "Submódulo eliminado correctamente (admin)" });
  } catch (err) {
    console.error("❌ Error eliminando submódulo (admin):", err);
    return res.status(500).json({ message: "Error al eliminar submódulo (admin)", error: err.message });
  }
};

/* =========================================================
   LISTAR EJERCICIOS
========================================================= */
exports.listarEjerciciosAdmin = async (req, res) => {
  try {
    const { submoduloId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submoduloId)) return res.status(400).json({ message: "ID de submódulo inválido." });

    const submodulo = await Submodulo.findById(submoduloId);
    if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado." });

    const modulo = await Modulo.findById(submodulo.modulo);
    if (!modulo) return res.status(404).json({ message: "Módulo padre no encontrado." });

    if (modulo.esGlobal) {
      const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).sort({ createdAt: -1 });
      return res.json({ modulo, submodulo, ejercicios });
    }

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId)) {
      return res.status(400).json({ message: "El usuario admin no tiene una universidad válida asociada." });
    }
    if (!modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para ver los ejercicios de este submódulo." });
    }

    const ejercicios = await Ejercicio.find({ submodulo: submoduloId }).sort({ createdAt: -1 });
    return res.json({ modulo, submodulo, ejercicios });
  } catch (err) {
    console.error("❌ Error listando ejercicios (admin):", err);
    return res.status(500).json({ message: "Error al listar ejercicios (admin)", error: err.message });
  }
};

/* =========================================================
   CREAR EJERCICIO
========================================================= */
exports.crearEjercicioAdmin = async (req, res) => {
  try {
    const { submoduloId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(submoduloId)) return res.status(400).json({ message: "ID de submódulo inválido." });

    const submodulo = await Submodulo.findById(submoduloId).populate("modulo");
    if (!submodulo) return res.status(404).json({ message: "Submódulo no encontrado" });

    const {
      titulo, tiempo, tipoEjercicio,
      tipoRole, trastorno, consentimiento, tipoConsentimiento,
      herramientas, praxisNivel, modeloIntervencion,
      pruebasConfig: pruebasConfigRolePlay,
      caso, criterios, intentos,
      pruebas, pruebasConfig: pruebasConfigPruebas,
      historia, imagen,
      edad, ocupacion, motivo, historiaPersonal, tipo, respuestasFrases, texto,
    } = req.body || {};

    if (!titulo || !String(titulo).trim()) return res.status(400).json({ message: "El título del ejercicio es obligatorio." });
    if (!tipoEjercicio)                    return res.status(400).json({ message: "tipoEjercicio es obligatorio." });

    const tipoModuloInferido = submodulo?.modulo?.tipoModulo;
    const tipoModuloSeguro   = normalizarTipoModulo(tipoModuloInferido);
    if (!tipoModuloSeguro) {
      return res.status(400).json({
        message: `tipoModulo inválido heredado del módulo: '${tipoModuloInferido}'.`,
        allowed: Ejercicio.schema.path("tipoModulo").enumValues || [],
      });
    }

    const ejercicio = await Ejercicio.create({
      submodulo: submoduloId, tipoEjercicio, tipoModulo: tipoModuloSeguro,
      titulo: String(titulo).trim(),
      tiempo: typeof tiempo === "number" ? tiempo : tiempo ? Number(tiempo) : 0,
    });

    let detalle = null;

    if (tipoEjercicio === "Grabar voz") {
      const gvFields = normalizeGrabarVozFields(req.body);
      if (!gvFields.casos.length) {
        await Ejercicio.findByIdAndDelete(ejercicio._id);
        return res.status(400).json({ message: "El ejercicio debe tener al menos un caso." });
      }
      detalle = await EjercicioGrabarVoz.create({
        ejercicio:          ejercicio._id,
        casos:              gvFields.casos,
        contexto:           gvFields.contexto,
        escenario:          gvFields.escenario,
        nivel:              gvFields.nivel,
        tipoEntrenamiento:  gvFields.tipoEntrenamiento,
        intervenciones:     gvFields.intervenciones,
        habilidades:        gvFields.habilidades,       
        habilidadesTCC:     gvFields.habilidadesTCC,    
        modeloTerapia:      gvFields.modeloTerapia,     
        caso:               gvFields.casos[0]?.texto || "",
        praxisNivel:        normalizePraxisNivel(req.body?.praxisNivel || gvFields.nivel),
        modeloIntervencion: normalizeModeloIntervencion(req.body?.modeloIntervencion || ""),
        contextoSesion:     normalizeContextoSesion(req.body?.contextoSesion),
      });


    } else if (tipoEjercicio === "Interpretación de frases incompletas") {
      detalle = await EjercicioInterpretacionFrases.create({
        ejercicio:          ejercicio._id,
        caso:               String(caso || ""),
        evaluaciones:       normalizeEvaluacionesIA(req.body?.evaluaciones || {}),
        praxisNivel:        normalizePraxisNivel(req.body?.praxisNivel || "nivel_1"),
        modeloIntervencion: normalizeModeloIntervencion(req.body?.modeloIntervencion || ""),
        contextoSesion:     normalizeContextoSesion(req.body?.contextoSesion),
      });

    } else if (isRolePlayTipo(tipoEjercicio)) {
      const consentimientoBool = toBool(consentimiento);
      const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);
      if (consentimientoBool && !tcNorm) {
        await Ejercicio.findByIdAndDelete(ejercicio._id);
        return res.status(400).json({ message: "tipoConsentimiento inválido." });
      }
      detalle = await EjercicioRolePlay.create({
        ejercicio:          ejercicio._id,
        tipoRole:           tipoRole === "simulada" ? "simulada" : "real",
        trastorno:          trastorno || "",
        consentimiento:     consentimientoBool,
        tipoConsentimiento: consentimientoBool ? tcNorm : "",
        praxisNivel:        normalizePraxisNivel(praxisNivel),
        modeloIntervencion: normalizeModeloIntervencion(modeloIntervencion),
        herramientas:       normalizeHerramientasRolePlay(herramientas || {}),
        pruebasConfig:      normalizePruebasConfigRolePlay(pruebasConfigRolePlay),
        evaluaciones:       null,
      });

    } else if (tipoEjercicio === "Criterios de diagnostico") {
      detalle = await EjercicioCriteriosDx.create({
        ejercicio: ejercicio._id, caso: caso || "", criterios: criterios || "",
        intentos: typeof intentos === "number" ? intentos : intentos ? Number(intentos) : 1,
      });

    } else if (tipoEjercicio === "Aplicación de pruebas") {
      const cfg = pruebasConfigPruebas && typeof pruebasConfigPruebas === "object"
        ? pruebasConfigPruebas : pruebas && typeof pruebas === "object" ? pruebas : {};
      detalle = await EjercicioPruebas.create({ ejercicio: ejercicio._id, pruebasConfig: cfg });

    } else if (tipoEjercicio === "Pruebas psicometricas") {
      detalle = await EjercicioInterpretacionProyectiva.create({
        ejercicio: ejercicio._id, imagen: imagen || "", historia: historia || "",
        intentos: typeof intentos === "number" ? intentos : intentos ? Number(intentos) : 1,
      });

    } else if (tipoEjercicio === "Informe clínico") {
      const herramientasNorm = normalizeHerramientasInforme(herramientas || {});
      if (!Object.values(herramientasNorm).some(Boolean)) {
        await Ejercicio.findByIdAndDelete(ejercicio._id);
        return res.status(400).json({ message: "El ejercicio debe tener al menos una herramienta seleccionada." });
      }
      detalle = await EjercicioInformeClinico.create({
        ejercicio:          ejercicio._id,
        trastorno:          String(trastorno || "").trim(),
        contextoSesion:     normalizeContextoSesion(req.body?.contextoSesion),
        modeloIntervencion: normalizeModeloIntervencion(modeloIntervencion || ""),
        praxisNivel:        normalizePraxisNivel(praxisNivel || "nivel_1"),
        herramientas:       herramientasNorm,
        pruebasConfig:      req.body?.pruebasConfig || {},
      });
    }

    return res.status(201).json({ message: "Ejercicio creado correctamente", ejercicio, detalle });
  } catch (err) {
    console.error("❌ Error creando ejercicio (admin):", err);
    return res.status(500).json({ message: "Error al crear ejercicio (admin)", error: err.message });
  }
};

/* =========================================================
   ACTUALIZAR EJERCICIO
========================================================= */
exports.actualizarEjercicioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de ejercicio inválido." });

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado" });

    const {
      titulo, tiempo, tipoModulo, tipoEjercicio,
      tipoRole, trastorno, consentimiento, tipoConsentimiento,
      herramientas, praxisNivel, modeloIntervencion, contextoSesion, evaluaciones,
      pruebasConfig, caso, criterios, intentos, pruebas, historia, imagen,
      edad, ocupacion, motivo, historiaPersonal, tipo, respuestasFrases, texto,
    } = req.body || {};

    if (tipoEjercicio !== undefined && String(tipoEjercicio) !== String(ejercicio.tipoEjercicio)) {
      return res.status(400).json({ message: "No se permite cambiar tipoEjercicio una vez creado." });
    }

    if (titulo     !== undefined) ejercicio.titulo  = String(titulo);
    if (tiempo     !== undefined) ejercicio.tiempo  = typeof tiempo === "number" ? tiempo : Number(tiempo) || 0;
    if (tipoModulo !== undefined) {
      const norm = normalizarTipoModulo(tipoModulo);
      if (!norm) return res.status(400).json({ message: `tipoModulo inválido: ${tipoModulo}` });
      ejercicio.tipoModulo = norm;
    }
    await ejercicio.save();

    let detalle = null;

    if (ejercicio.tipoEjercicio === "Grabar voz") {
      detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id });
      if (!detalle) detalle = new EjercicioGrabarVoz({ ejercicio: id });
      const gvFields = normalizeGrabarVozFields(req.body);
      if (gvFields.casos.length > 0) { detalle.casos = gvFields.casos; detalle.caso = gvFields.casos[0]?.texto || ""; }
      detalle.contexto          = gvFields.contexto;
      detalle.escenario         = gvFields.escenario;
      detalle.nivel             = gvFields.nivel;
      detalle.tipoEntrenamiento = gvFields.tipoEntrenamiento;
      detalle.intervenciones    = gvFields.intervenciones;
      detalle.habilidades       = gvFields.habilidades;    
      detalle.habilidadesTCC    = gvFields.habilidadesTCC; 
      detalle.modeloTerapia     = gvFields.modeloTerapia;  
      if (praxisNivel        !== undefined) detalle.praxisNivel        = normalizePraxisNivel(praxisNivel);
      if (modeloIntervencion !== undefined) detalle.modeloIntervencion = normalizeModeloIntervencion(modeloIntervencion);
      if (contextoSesion     !== undefined) detalle.contextoSesion     = normalizeContextoSesion(contextoSesion);
      await detalle.save();


    } else if (ejercicio.tipoEjercicio === "Interpretación de frases incompletas") {
      detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id });
      if (!detalle) detalle = await EjercicioInterpretacionFrases.create({ ejercicio: id });
      if (edad             !== undefined) detalle.edad             = Number(edad);
      if (ocupacion        !== undefined) detalle.ocupacion        = ocupacion || "";
      if (motivo           !== undefined) detalle.motivo           = motivo || "";
      if (historiaPersonal !== undefined) detalle.historiaPersonal = historiaPersonal || "";
      if (tipo             !== undefined) detalle.tipoTest         = tipo || "adulto";
      if (Array.isArray(respuestasFrases)) detalle.respuestasFrases = respuestasFrases;
      if (texto            !== undefined) detalle.notas            = texto || "";
      if (intentos         !== undefined) detalle.intentos         = typeof intentos === "number" ? intentos : Number(intentos) || 1;
      await detalle.save();

    } else if (isRolePlayTipo(ejercicio.tipoEjercicio)) {
      detalle = await EjercicioRolePlay.findOne({ ejercicio: id });
      if (!detalle) detalle = await EjercicioRolePlay.create({ ejercicio: id });
      if (tipoRole  !== undefined) detalle.tipoRole  = tipoRole === "simulada" ? "simulada" : "real";
      if (trastorno !== undefined) detalle.trastorno = String(trastorno || "");
      if (consentimiento !== undefined) {
        const b = toBool(consentimiento);
        detalle.consentimiento = b;
        if (!b) {
          detalle.tipoConsentimiento = "";
        } else if (tipoConsentimiento !== undefined) {
          const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);
          if (!tcNorm) return res.status(400).json({ message: "tipoConsentimiento inválido." });
          detalle.tipoConsentimiento = tcNorm;
        }
      } else if (tipoConsentimiento !== undefined && detalle.consentimiento) {
        const tcNorm = normalizeTipoConsentimiento(tipoConsentimiento);
        if (!tcNorm) return res.status(400).json({ message: "tipoConsentimiento inválido." });
        detalle.tipoConsentimiento = tcNorm;
      }
      if (praxisNivel        !== undefined) detalle.praxisNivel        = normalizePraxisNivel(praxisNivel);
      if (modeloIntervencion !== undefined) detalle.modeloIntervencion = normalizeModeloIntervencion(modeloIntervencion);
      if (contextoSesion     !== undefined) detalle.contextoSesion     = normalizeContextoSesion(contextoSesion);
      if (herramientas !== undefined) {
        detalle.herramientas = normalizeHerramientasRolePlay(herramientas || {});
        if (typeof detalle.markModified === "function") detalle.markModified("herramientas");
      }
      if (pruebasConfig !== undefined) {
        detalle.pruebasConfig = normalizePruebasConfigRolePlay(pruebasConfig);
        if (typeof detalle.markModified === "function") detalle.markModified("pruebasConfig");
      }
      if (evaluaciones !== undefined) detalle.evaluaciones = null;
      await detalle.save();

    } else if (ejercicio.tipoEjercicio === "Criterios de diagnostico") {
      detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id });
      if (!detalle) detalle = await EjercicioCriteriosDx.create({ ejercicio: id });
      if (caso      !== undefined) detalle.caso      = caso || "";
      if (criterios !== undefined) detalle.criterios = criterios || "";
      if (intentos  !== undefined) detalle.intentos  = typeof intentos === "number" ? intentos : Number(intentos) || 1;
      await detalle.save();

    } else if (ejercicio.tipoEjercicio === "Aplicación de pruebas") {
      detalle = await EjercicioPruebas.findOne({ ejercicio: id });
      if (!detalle) detalle = await EjercicioPruebas.create({ ejercicio: id });
      const cfg = pruebasConfig && typeof pruebasConfig === "object"
        ? pruebasConfig : pruebas && typeof pruebas === "object" ? pruebas : {};
      detalle.pruebasConfig = cfg;
      await detalle.save();

    } else if (ejercicio.tipoEjercicio === "Pruebas psicometricas") {
      detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id });
      if (!detalle) detalle = await EjercicioInterpretacionProyectiva.create({ ejercicio: id });
      if (imagen   !== undefined) detalle.imagen   = imagen || "";
      if (historia !== undefined) detalle.historia = historia || "";
      if (intentos !== undefined) detalle.intentos = typeof intentos === "number" ? intentos : Number(intentos) || 1;
      await detalle.save();

    } else if (ejercicio.tipoEjercicio === "Informe clínico") {
      detalle = await EjercicioInformeClinico.findOne({ ejercicio: id });
      if (!detalle) detalle = new EjercicioInformeClinico({ ejercicio: id });
      if (trastorno          !== undefined) detalle.trastorno          = String(trastorno || "").trim();
      if (contextoSesion     !== undefined) detalle.contextoSesion     = normalizeContextoSesion(contextoSesion);
      if (modeloIntervencion !== undefined) detalle.modeloIntervencion = normalizeModeloIntervencion(modeloIntervencion);
      if (praxisNivel        !== undefined) detalle.praxisNivel        = normalizePraxisNivel(praxisNivel);
      if (herramientas !== undefined) {
        detalle.herramientas = normalizeHerramientasInforme(herramientas || {});
        if (typeof detalle.markModified === "function") detalle.markModified("herramientas");
      }
      if (pruebasConfig !== undefined) {
        detalle.pruebasConfig = pruebasConfig || {};
        if (typeof detalle.markModified === "function") detalle.markModified("pruebasConfig");
      }
      await detalle.save();
    }

    return res.json({ message: "Ejercicio actualizado correctamente", ejercicio, detalle });
  } catch (err) {
    console.error("❌ Error actualizando ejercicio (admin):", err);
    return res.status(500).json({ message: "Error al actualizar ejercicio (admin)", error: err.message });
  }
};

/* =========================================================
   OBTENER EJERCICIO
========================================================= */
exports.obtenerEjercicioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de ejercicio inválido." });

    const ejercicio = await Ejercicio.findById(id).populate({ path: "submodulo", populate: { path: "modulo" } });
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado" });

    let detalle = null;
    if      (ejercicio.tipoEjercicio === "Grabar voz")                           detalle = await EjercicioGrabarVoz.findOne({ ejercicio: id }).lean();
    else if (ejercicio.tipoEjercicio === "Interpretación de frases incompletas") detalle = await EjercicioInterpretacionFrases.findOne({ ejercicio: id }).lean();
    else if (isRolePlayTipo(ejercicio.tipoEjercicio))                            detalle = await EjercicioRolePlay.findOne({ ejercicio: id }).lean();
    else if (ejercicio.tipoEjercicio === "Criterios de diagnostico")             detalle = await EjercicioCriteriosDx.findOne({ ejercicio: id }).lean();
    else if (ejercicio.tipoEjercicio === "Aplicación de pruebas")                detalle = await EjercicioPruebas.findOne({ ejercicio: id }).lean();
    else if (ejercicio.tipoEjercicio === "Pruebas psicometricas")                detalle = await EjercicioInterpretacionProyectiva.findOne({ ejercicio: id }).lean();
    else if (ejercicio.tipoEjercicio === "Informe clínico")                      detalle = await EjercicioInformeClinico.findOne({ ejercicio: id }).lean();

    return res.json({
      ejercicio, detalle,
      submodulo:     ejercicio.submodulo,
      modulo:        ejercicio.submodulo?.modulo || null,
      canEditGlobal: true,
    });
  } catch (err) {
    console.error("❌ Error obteniendo ejercicio (admin):", err);
    return res.status(500).json({ message: "Error al obtener ejercicio (admin)", error: err.message });
  }
};

/* =========================================================
   ELIMINAR EJERCICIO
========================================================= */
exports.eliminarEjercicioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de ejercicio inválido." });

    const ejercicio = await Ejercicio.findById(id);
    if (!ejercicio) return res.status(404).json({ message: "Ejercicio no encontrado." });

    const submodulo = await Submodulo.findById(ejercicio.submodulo);
    const modulo    = submodulo ? await Modulo.findById(submodulo.modulo) : null;
    if (!modulo) return res.status(404).json({ message: "Módulo padre no encontrado." });
    if (modulo.esGlobal) return res.status(403).json({ message: "Este módulo es global y no puede eliminarse desde el admin." });

    const adminId = req.user && req.user._id;
    const admin   = await Usuario.findById(adminId).lean();
    let universidadId = admin?.universidad || admin?.universidadId || null;
    if (universidadId && typeof universidadId === "object" && universidadId._id) universidadId = universidadId._id;
    if (universidadId && typeof universidadId === "string" && !mongoose.Types.ObjectId.isValid(universidadId)) {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc ? uniDoc._id : null;
    }
    if (!universidadId || !mongoose.Types.ObjectId.isValid(universidadId) ||
        !modulo.universidad || modulo.universidad.toString() !== universidadId.toString()) {
      return res.status(403).json({ message: "No tenés permisos para eliminar este ejercicio." });
    }

    await EjercicioGrabarVoz.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionFrases.deleteOne({ ejercicio: id });
    await EjercicioRolePlay.deleteOne({ ejercicio: id });
    await EjercicioCriteriosDx.deleteOne({ ejercicio: id });
    await EjercicioPruebas.deleteOne({ ejercicio: id });
    await EjercicioInterpretacionProyectiva.deleteOne({ ejercicio: id });
    await EjercicioInformeClinico.deleteOne({ ejercicio: id });
    await ejercicio.deleteOne();

    return res.json({ message: "Ejercicio eliminado correctamente (admin)" });
  } catch (err) {
    console.error("❌ Error eliminando ejercicio (admin):", err);
    return res.status(500).json({ message: "Error al eliminar ejercicio (admin)", error: err.message });
  }
};
