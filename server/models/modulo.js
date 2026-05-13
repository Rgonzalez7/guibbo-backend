const mongoose = require("mongoose");
const { Schema } = mongoose;

const TIPOS_MODULO = [
  "Role playing persona real",
  "Role playing IA",
];

const TIPOS_EJERCICIO = [
  "Role playing persona",
  "Role Playing IA",
  "Grabar voz",
  "Informe clínico",
];

const PRAXIS_NIVELES = ["nivel_1", "nivel_2", "nivel_3"];

const MODELOS_INTERVENCION = [
  "Terapia Cognitivo-Conductual (TCC)",
  "Psicoanálisis",
  "Logoterapia",
  "Terapia Centrada en la Persona",
  "Gestalt",
  "Humanista-Existencial",
  "Terapia Analítico-Funcional (FAP)",
  "Sistémica",
  "Aceptación y Compromiso (ACT)",
  "Dialéctica Conductual (DBT)",
  "Mindfulness / Mindfulness-based",
];

const CONTEXTOS_SESION_ENUM = [
  "exploracion_clinica",
  "intervencion_terapeutica",
  "aplicacion_pruebas_psicometricas",
  "devolucion_resultados",
];

const CONTEXTOS_GV  = ["clinico", "educativo", "laboral"];
const ESCENARIOS_GV = [
  "exploracion", "intervencion", "devolucion", "aplicacion_pruebas",
  "exploracion_estudiante", "intervencion_estudiante", "comunicacion_padres",
  "entrevista_laboral", "feedback", "manejo_conflictos", "burnout", "acoso_laboral",
];

// ✅ Incluye los valores nuevos del frontend (basico/intermedio/avanzado)
const NIVELES_GV = ["nivel_1", "nivel_2", "nivel_3", "basico", "intermedio", "avanzado"];

const TIPOS_ENTRENAMIENTO = ["habilidad_especifica", "discriminacion_clinica", "mixto"];

const ESCENARIOS_POR_CONTEXTO = {
  clinico:   ["exploracion", "intervencion", "devolucion", "aplicacion_pruebas"],
  educativo: ["exploracion_estudiante", "intervencion_estudiante", "comunicacion_padres"],
  laboral:   ["entrevista_laboral", "feedback", "manejo_conflictos", "burnout", "acoso_laboral"],
};

const INTERVENCIONES_POR_NIVEL = {
  nivel_1: [
    "pregunta_abierta","clarificacion","reflejo_simple","validacion_basica",
    "validacion_emocional","escucha_activa","contencion_basica","redireccion_suave",
    "presencia","mensaje_directo",
  ],
  nivel_2: [
    "exploracion_dirigida","resumen_parcial","psicoeducacion_breve","reencuadre_simple",
    "normalizacion","focalizacion","establecimiento_limites","orientacion",
    "manejo_conducta","feedback_constructivo","mediacion_basica","organizacion_pensamiento",
    "reduccion_ansiedad",
  ],
  nivel_3: [
    "reencuadre_complejo","confrontacion_suave","interpretacion","desarrollo_insight",
    "integracion_emocional","plan_intervencion","analisis_funcional_basico",
    "identificacion_patrones","hipotesis_inicial_suave","intervencion_conductual",
    "negociacion","deteccion_incongruencias","derivacion","plan_proteccion",
  ],
};

function defaultHerramientasRolePlay() {
  return {
    manejoExpediente: false, ficha: false, hc: false, examen: false,
    convergencia: false, hipotesis: false, diagnostico: false, pruebas: false,
    interpretacion: false, recomendaciones: false, anexos: false, plan: false,
  };
}

// ===== Módulo =====
// ✅ Se eliminó el campo tipoModulo del schema
const moduloSchema = new Schema(
  {
    titulo:      { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, required: true },
    esGlobal:    { type: Boolean, default: true, index: true },
    universidad: { type: Schema.Types.ObjectId, default: null, index: true },
    creadoPor:   { type: Schema.Types.ObjectId, default: null },
    activo:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ===== Submódulo =====
const submoduloSchema = new Schema(
  {
    modulo:      { type: Schema.Types.ObjectId, ref: "Modulo", required: true },
    titulo:      { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },
    reintento:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ===== Ejercicio genérico =====
// ⚠️ Mantengo tipoModulo aquí porque tu código en ejercicios todavía lo referencia
// (con fallback desde submodulo.modulo?.tipoModulo, que ahora será undefined).
// Si quieres quitarlo también, avísame.
const ejercicioSchema = new Schema(
  {
    submodulo:     { type: Schema.Types.ObjectId, ref: "Submodulo", required: true },
    tipoEjercicio: { type: String, enum: TIPOS_EJERCICIO, required: true },
    tipoModulo:    { type: String, enum: TIPOS_MODULO },
    titulo:        { type: String, required: true, trim: true },
    tiempo:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Sub-schema para casos GV ─────────────────────────────
const casoGVSchema = new Schema(
  {
    texto:  { type: String, trim: true, default: "" },
    tiempo: { type: Number, default: 0.25 },
    orden:  { type: Number, default: 0 },
  },
  { _id: true }
);

// ── Grabar Voz ───────────────────────────────────────────
const ejercicioGrabarVozSchema = new Schema(
  {
    ejercicio: { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    casos: {
      type: [casoGVSchema],
      default: [],
      validate: {
        validator: function (arr) { return arr.length <= 20; },
        message: "El ejercicio no puede tener más de 20 casos.",
      },
    },
    contexto:          { type: String, enum: CONTEXTOS_GV, default: "clinico" },
    escenario:         { type: String, enum: ESCENARIOS_GV, default: "exploracion" },
    nivel:             { type: String, enum: NIVELES_GV, default: "nivel_1" },
    tipoEntrenamiento: { type: String, enum: TIPOS_ENTRENAMIENTO, default: "habilidad_especifica" },
    intervenciones:    { type: [String], default: [] },

    // ✅ Nuevos campos para habilidades manuales y modelo terapéutico
    habilidades:    { type: [String], default: [] },
    habilidadesTCC: { type: [String], default: [] },
    modeloTerapia:  { type: String, default: "", trim: true },

    caso:               { type: String, trim: true, default: "" },
    praxisNivel:        { type: String, enum: PRAXIS_NIVELES, default: "nivel_1" },
    modeloIntervencion: { type: String, enum: ["", ...MODELOS_INTERVENCION], default: "", trim: true },
    contextoSesion:     { type: String, enum: ["", ...CONTEXTOS_SESION_ENUM], default: "exploracion_clinica", trim: true },
    evaluaciones:            { type: Schema.Types.Mixed, default: null },
    transcripcionRespuesta:  { type: String, default: "" },
    analisisRespuesta:       { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Interpretación de frases incompletas ─────────────────
const ejercicioInterpretacionFrasesSchema = new Schema(
  {
    ejercicio:        { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    edad:             { type: Number },
    ocupacion:        { type: String, trim: true },
    motivo:           { type: String, trim: true },
    historiaPersonal: { type: String, trim: true },
    tipoTest:         { type: String, enum: ["adulto", "niño"], default: "adulto" },
    respuestasFrases: [{ type: String, trim: true, default: "" }],
    notas:            { type: String, trim: true },
    intentos:         { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ── Role Playing ─────────────────────────────────────────
const ejercicioRolePlaySchema = new Schema(
  {
    ejercicio:          { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    tipoRole:           { type: String, enum: ["real", "simulada"], default: "real" },
    trastorno:          { type: String, trim: true, default: "" },
    consentimiento:     { type: Boolean, default: false },
    tipoConsentimiento: { type: String, enum: ["adulto", "niño", ""], default: "" },
    praxisNivel:        { type: String, enum: PRAXIS_NIVELES, default: "nivel_1", index: true },
    modeloIntervencion: { type: String, enum: ["", ...MODELOS_INTERVENCION], default: "", trim: true },
    contextoSesion:     { type: String, enum: ["", ...CONTEXTOS_SESION_ENUM], default: "exploracion_clinica", trim: true },
    herramientas: {
      manejoExpediente: { type: Boolean, default: false },
      ficha:            { type: Boolean, default: false },
      hc:               { type: Boolean, default: false },
      examen:           { type: Boolean, default: false },
      convergencia:     { type: Boolean, default: false },
      hipotesis:        { type: Boolean, default: false },
      diagnostico:      { type: Boolean, default: false },
      pruebas:          { type: Boolean, default: false },
      interpretacion:   { type: Boolean, default: false },
      recomendaciones:  { type: Boolean, default: false },
      anexos:           { type: Boolean, default: false },
      plan:             { type: Boolean, default: false },
    },
    pruebasConfig: { type: Schema.Types.Mixed, default: {} },
    evaluaciones:  { type: Schema.Types.Mixed, default: null, select: false },
    casosUsados: { type: [String], default: [] },
  },
  { timestamps: true }
);

ejercicioRolePlaySchema.pre("validate", function (next) {
  if (!this.herramientas || typeof this.herramientas !== "object") {
    this.herramientas = defaultHerramientasRolePlay();
  }
  if (!this.praxisNivel)                           this.praxisNivel = "nivel_1";
  if (typeof this.modeloIntervencion !== "string") this.modeloIntervencion = "";
  if (!this.contextoSesion)                        this.contextoSesion = "exploracion_clinica";
  next();
});

// ── Criterios de diagnóstico ─────────────────────────────
const ejercicioCriteriosDxSchema = new Schema(
  {
    ejercicio: { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    caso:      { type: String, required: true, trim: true },
    criterios: { type: String, trim: true },
    intentos:  { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ── Pruebas ──────────────────────────────────────────────
const ejercicioPruebasSchema = new Schema(
  {
    ejercicio:     { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    pruebasConfig: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ── Interpretación proyectiva ─────────────────────────────
const ejercicioInterpretacionProyectivaSchema = new Schema(
  {
    ejercicio: { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },
    imagen:    { type: String, trim: true },
    historia:  { type: String, trim: true },
    intentos:  { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ===== Informe Clínico =====
const ejercicioInformeClinicoSchema = new Schema(
  {
    ejercicio: { type: Schema.Types.ObjectId, ref: "Ejercicio", required: true, unique: true },

    trastorno:          { type: String, trim: true, default: "" },
    contextoSesion:     { type: String, enum: ["", ...CONTEXTOS_SESION_ENUM], default: "exploracion_clinica" },
    modeloIntervencion: { type: String, enum: ["", ...MODELOS_INTERVENCION], default: "", trim: true },
    praxisNivel:        { type: String, enum: PRAXIS_NIVELES, default: "nivel_1" },

    transcripcionIA:         { type: String, default: "" },
    transcripcionGeneradaAt: { type: Date, default: null },

    herramientas: {
      ficha:           { type: Boolean, default: false },
      hc:              { type: Boolean, default: false },
      examen:          { type: Boolean, default: false },
      convergencia:    { type: Boolean, default: false },
      hipotesis:       { type: Boolean, default: false },
      diagnostico:     { type: Boolean, default: false },
      pruebas:         { type: Boolean, default: false },
      interpretacion:  { type: Boolean, default: false },
      recomendaciones: { type: Boolean, default: false },
      anexos:          { type: Boolean, default: false },
      plan:            { type: Boolean, default: false },
    },

    pruebasConfig: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ── Modelos ───────────────────────────────────────────────
const Modulo                            = mongoose.model("Modulo",                            moduloSchema);
const Submodulo                         = mongoose.model("Submodulo",                         submoduloSchema);
const Ejercicio                         = mongoose.model("Ejercicio",                         ejercicioSchema);
const EjercicioGrabarVoz                = mongoose.model("EjercicioGrabarVoz",                ejercicioGrabarVozSchema);
const EjercicioInterpretacionFrases     = mongoose.model("EjercicioInterpretacionFrases",     ejercicioInterpretacionFrasesSchema);
const EjercicioRolePlay                 = mongoose.model("EjercicioRolePlay",                 ejercicioRolePlaySchema);
const EjercicioCriteriosDx              = mongoose.model("EjercicioCriteriosDx",              ejercicioCriteriosDxSchema);
const EjercicioPruebas                  = mongoose.model("EjercicioPruebas",                  ejercicioPruebasSchema);
const EjercicioInterpretacionProyectiva = mongoose.model("EjercicioInterpretacionProyectiva", ejercicioInterpretacionProyectivaSchema);
const EjercicioInformeClinico           = mongoose.model("EjercicioInformeClinico",           ejercicioInformeClinicoSchema);

module.exports = {
  Modulo,
  Submodulo,
  Ejercicio,
  EjercicioGrabarVoz,
  casoGVSchema,
  EjercicioInterpretacionFrases,
  EjercicioRolePlay,
  EjercicioCriteriosDx,
  EjercicioPruebas,
  EjercicioInterpretacionProyectiva,
  EjercicioInformeClinico,
  TIPOS_MODULO,
  TIPOS_EJERCICIO,
  PRAXIS_NIVELES,
  MODELOS_INTERVENCION,
  CONTEXTOS_SESION_ENUM,
  CONTEXTOS_GV,
  ESCENARIOS_GV,
  NIVELES_GV,
  TIPOS_ENTRENAMIENTO,
  ESCENARIOS_POR_CONTEXTO,
  INTERVENCIONES_POR_NIVEL,
};
