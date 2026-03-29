const mongoose = require("mongoose");
const { Schema } = mongoose;

/*
// --- Enums base (podemos reutilizarlos en otros modelos) ---
const TIPOS_MODULO = [
  'Apa7ma',
  'Entrevista clínica',
  'Preguntas abiertas',
  'Role playing persona real',
  'Técnicas de psicoterapia',
  'Trastornos de personalidad',
  'Role playing habilidades básica del terapeuta',
  'Pruebas psicometricas',
  'Pruebas psicometricas proyectivas',
  'Evaluación psicológica con paciente real',
  'Evaluación psicológica e intervención',
  'Laboratorio de simulación IA Trastornos de personalidad',
  'Laboratorio de simulación IA Anormal I',
  'Laboratorio de simulación IA Anormal II',
]; */

const TIPOS_MODULO = [
  "Role playing persona real",
  "Role playing IA",
];

/*
const TIPOS_EJERCICIO = [
  'Apa7ma template',
  'Apa7ma redacción',
  'Grabar voz',
  'Consentimiento informado',
  'Ficha Técnica',
  'Historial Clínico',
  'Criterios de diagnostico',
  'Role playing persona',
  'Role playing Aula',
  'Role Playing IA',
  'Laboratorio de simulación',
  'Aplicación de pruebas',
  'Pruebas psicometricas',
  'Interpretación de frases incompletas',
];
*/

const TIPOS_EJERCICIO = [
  "Role playing persona",
  "Role Playing IA",
  "Grabar voz",
];

/* =========================================================
   ✅ NUEVOS ENUMS PRAXIS-TH
========================================================= */
const PRAXIS_NIVELES = [
  "nivel_1",
  "nivel_2",
  "nivel_3",
];

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

    // Después de MODELOS_INTERVENCION, agrega:
const CONTEXTOS_SESION_ENUM = [
  "exploracion_clinica",
  "intervencion_terapeutica",
  "aplicacion_pruebas_psicometricas",
  "devolucion_resultados",
];

// ── Enums para ejericio de grabrar voz ──────────────────────────────────────────
const CONTEXTOS_GV  = ["clinico", "educativo", "laboral"];
const ESCENARIOS_GV = [
  // clínico
  "exploracion", "intervencion", "devolucion", "aplicacion_pruebas",
  // educativo
  "exploracion_estudiante", "intervencion_estudiante", "comunicacion_padres",
  // laboral
  "entrevista_laboral", "feedback", "manejo_conflictos", "burnout", "acoso_laboral",
];
const NIVELES_GV         = ["nivel_1", "nivel_2", "nivel_3"];
const TIPOS_ENTRENAMIENTO = ["habilidad_especifica", "discriminacion_clinica", "mixto"];

// Mapa de escenarios válidos por contexto
const ESCENARIOS_POR_CONTEXTO = {
  clinico:    ["exploracion", "intervencion", "devolucion", "aplicacion_pruebas"],
  educativo:  ["exploracion_estudiante", "intervencion_estudiante", "comunicacion_padres"],
  laboral:    ["entrevista_laboral", "feedback", "manejo_conflictos", "burnout", "acoso_laboral"],
};

// Mapa de intervenciones por nivel (autofill)
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


/* =========================================================
   Helpers
========================================================= */
function defaultHerramientasRolePlay() {
  return {
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
}

// ===== Módulo =====
const moduloSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, required: true },
    tipoModulo: {
      type: String,
      enum: TIPOS_MODULO,
      required: true,
    },

    // 👇 NUEVOS CAMPOS PARA DIFERENCIAR GLOBAL vs LOCAL
    esGlobal: {
      type: Boolean,
      default: true,
      index: true,
    },

    universidad: {
      type: Schema.Types.ObjectId,
      // ref: 'Universidad',
      default: null,
      index: true,
    },

    creadoPor: {
      type: Schema.Types.ObjectId,
      // ref: 'Usuario',
      default: null,
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ===== Submódulo =====
const submoduloSchema = new Schema(
  {
    modulo: {
      type: Schema.Types.ObjectId,
      ref: "Modulo",
      required: true,
    },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },

    // cantidad de reintentos permitidos (0 = ilimitado)
    reintento: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ===== Ejercicio genérico =====
const ejercicioSchema = new Schema(
  {
    submodulo: {
      type: Schema.Types.ObjectId,
      ref: "Submodulo",
      required: true,
    },
    tipoEjercicio: {
      type: String,
      enum: TIPOS_EJERCICIO,
      required: true,
    },
    tipoModulo: {
      type: String,
      enum: TIPOS_MODULO,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    // Tiempo sugerido (en minutos) para completar el ejercicio
    tiempo: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Grabar Voz =====
const ejercicioGrabarVozSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },

    contexto: {
      type: String,
      enum: CONTEXTOS_GV,
      default: "clinico",
    },
    escenario: {
      type: String,
      enum: ESCENARIOS_GV,
      default: "exploracion",
    },
    nivel: {
      type: String,
      enum: NIVELES_GV,
      default: "nivel_1",
    },
    tipoEntrenamiento: {
      type: String,
      enum: TIPOS_ENTRENAMIENTO,
      default: "habilidad_especifica",
    },
    // Intervenciones autofill (calculadas por sistema, guardadas para el prompt)
    intervenciones: {
      type: [String],
      default: [],
    },

    // Caso clínico (puede ser escrito por el profesor o generado por IA)
    caso: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Compat legacy (se mantienen) ────────────────────
    praxisNivel: {
      type: String,
      enum: PRAXIS_NIVELES,
      default: "nivel_1",
    },
    modeloIntervencion: {
      type: String,
      enum: ["", ...MODELOS_INTERVENCION],
      default: "",
      trim: true,
    },
    contextoSesion: {
      type: String,
      enum: ["", ...CONTEXTOS_SESION_ENUM],
      default: "exploracion_clinica",
      trim: true,
    },
    evaluaciones: {
      type: Schema.Types.Mixed,
      default: null,
    },
    transcripcionRespuesta: { type: String, default: "" },
    analisisRespuesta:      { type: String, default: "" },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Interpretación de frases incompletas =====
const ejercicioInterpretacionFrasesSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },

    edad: { type: Number },
    ocupacion: { type: String, trim: true },
    motivo: { type: String, trim: true },
    historiaPersonal: { type: String, trim: true },
    tipoTest: {
      type: String,
      enum: ["adulto", "niño"],
      default: "adulto",
    },

    respuestasFrases: [
      {
        type: String,
        trim: true,
        default: "",
      },
    ],

    notas: {
      type: String,
      trim: true,
    },

    intentos: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Role playing =====
const ejercicioRolePlaySchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },

    // real | simulada (IA / aula)
    tipoRole: {
      type: String,
      enum: ["real", "simulada"],
      default: "real",
    },

    trastorno: { type: String, trim: true, default: "" },

    // Consentimiento
    consentimiento: {
      type: Boolean,
      default: false,
    },
    tipoConsentimiento: {
      type: String,
      enum: ["adulto", "niño", ""],
      default: "",
    },

    /* =========================================================
       ✅ NUEVA CONFIGURACIÓN PRAXIS-TH
       ========================================================= */

    // Nivel base de evaluación Praxis-TH
    praxisNivel: {
      type: String,
      enum: PRAXIS_NIVELES,
      default: "nivel_1",
      index: true,
    },

    // Modelo de intervención opcional para ajustar la evaluación
    modeloIntervencion: {
      type: String,
      enum: ["", ...MODELOS_INTERVENCION],
      default: "",
      trim: true,
    },

    // ✅ Contexto de sesión para orientar la evaluación PRAXIS
    contextoSesion: {
      type: String,
      enum: ["", ...CONTEXTOS_SESION_ENUM],
      default: "exploracion_clinica",
      trim: true,
    },



    /* =========================================================
       ✅ Herramientas / partes del expediente
       Estas se mantienen porque serán evaluadas por
       coherencia y redacción según la transcripción.
       ========================================================= */
    herramientas: {
      manejoExpediente: { type: Boolean, default: false },
      ficha: { type: Boolean, default: false },
      hc: { type: Boolean, default: false },
      examen: { type: Boolean, default: false },
      convergencia: { type: Boolean, default: false },
      hipotesis: { type: Boolean, default: false },
      diagnostico: { type: Boolean, default: false },
      pruebas: { type: Boolean, default: false },
      interpretacion: { type: Boolean, default: false },
      recomendaciones: { type: Boolean, default: false },
      anexos: { type: Boolean, default: false },
      plan: { type: Boolean, default: false },
    },

    // ✅ Config de pruebas SOLO si herramientas.pruebas = true
    pruebasConfig: {
      type: Schema.Types.Mixed,
      default: {},
    },

    /* =========================================================
       ✅ COMPAT LEGACY
       Lo dejamos temporalmente para ejercicios viejos.
       Ya no será la fuente principal de evaluación.
       ========================================================= */
    evaluaciones: {
      type: Schema.Types.Mixed,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

/* =========================================================
   Hooks RolePlay
========================================================= */
ejercicioRolePlaySchema.pre("validate", function (next) {
  if (!this.herramientas || typeof this.herramientas !== "object") {
    this.herramientas = defaultHerramientasRolePlay();
  }

  if (!this.praxisNivel) {
    this.praxisNivel = "nivel_1";
  }

  if (typeof this.modeloIntervencion !== "string") {
    this.modeloIntervencion = "";
  }

  if (!this.contextoSesion) {
    this.contextoSesion = "exploracion_clinica";
  }
  

  next();
});

// ===== Ejercicio específico: Criterios de diagnóstico =====
const ejercicioCriteriosDxSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },
    caso: {
      type: String,
      required: true,
      trim: true,
    },
    criterios: {
      type: String,
      trim: true,
    },
    intentos: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Pruebas (configuración de tests) =====
const ejercicioPruebasSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },

    pruebasConfig: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Interpretación de proyectivas =====
const ejercicioInterpretacionProyectivaSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
      unique: true,
    },

    imagen: {
      type: String,
      trim: true,
    },
    historia: {
      type: String,
      trim: true,
    },
    intentos: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Exportar modelos + enums para reutilizar
const Modulo = mongoose.model("Modulo", moduloSchema);
const Submodulo = mongoose.model("Submodulo", submoduloSchema);
const Ejercicio = mongoose.model("Ejercicio", ejercicioSchema);
const EjercicioGrabarVoz = mongoose.model(
  "EjercicioGrabarVoz",
  ejercicioGrabarVozSchema
);
const EjercicioInterpretacionFrases = mongoose.model(
  "EjercicioInterpretacionFrases",
  ejercicioInterpretacionFrasesSchema
);
const EjercicioRolePlay = mongoose.model(
  "EjercicioRolePlay",
  ejercicioRolePlaySchema
);
const EjercicioCriteriosDx = mongoose.model(
  "EjercicioCriteriosDx",
  ejercicioCriteriosDxSchema
);
const EjercicioPruebas = mongoose.model(
  "EjercicioPruebas",
  ejercicioPruebasSchema
);
const EjercicioInterpretacionProyectiva = mongoose.model(
  "EjercicioInterpretacionProyectiva",
  ejercicioInterpretacionProyectivaSchema
);

module.exports = {
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