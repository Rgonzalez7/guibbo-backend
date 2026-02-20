// server/models/modulo.js
const mongoose = require('mongoose');
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
  'Role playing persona real',
  'Role playing IA',
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
  'Role playing persona',
  'Role Playing IA',
];

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
      default: true, // por defecto: módulos creados por el súper
      index: true,
    },
    // Si es un módulo local de una universidad concreta
    universidad: {
      type: Schema.Types.ObjectId,
      // ref: 'Universidad',
      default: null,
      index: true,
    },
    // Usuario que lo creó (súper o admin de carrera)
    creadoPor: {
      type: Schema.Types.ObjectId,
      // ref: 'Usuario',
      default: null,
    },

    activo: {
      type: Boolean,
      default: true, // el super lo crea activo
    },
  },
  { timestamps: true }
);

// ===== Submódulo =====
const submoduloSchema = new Schema(
  {
    modulo: {
      type: Schema.Types.ObjectId,
      ref: 'Modulo',
      required: true,
    },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
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
      ref: 'Submodulo',
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
      ref: 'Ejercicio',
      required: true,
      unique: true, // 1 a 1
    },

    caso: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },

    evaluaciones: {
      rapport: { type: Boolean, default: false },
      preguntasAbiertas: { type: Boolean, default: false },
      encuadre: { type: Boolean, default: false },
      alianzaTerapeutica: { type: Boolean, default: false },
      parafrasis: { type: Boolean, default: false },
      reflejo: { type: Boolean, default: false },
      clarificacion: { type: Boolean, default: false },
      chisteTerapeutico: { type: Boolean, default: false },
      sarcasmoTerapeutico: { type: Boolean, default: false },
      empatia: { type: Boolean, default: false },
      revelacion: { type: Boolean, default: false },
      metafora: { type: Boolean, default: false },
      resumen: { type: Boolean, default: false },
      practicarConsignasPruebas: { type: Boolean, default: false },
    },

    // (Opcional) si quieres guardar el resultado en este doc
    transcripcionRespuesta: {
      type: String,
      default: '',
    },
    analisisRespuesta: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Interpretación de frases incompletas =====
const ejercicioInterpretacionFrasesSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: 'Ejercicio',
      required: true,
      unique: true, // 1 a 1
    },
    // Campos del formulario
    edad: { type: Number },
    ocupacion: { type: String, trim: true },
    motivo: { type: String, trim: true },
    historiaPersonal: { type: String, trim: true },
    tipoTest: {
      type: String,
      enum: ['adulto', 'niño'],
      default: 'adulto',
    },
    // 60 respuestas a las frases incompletas
    respuestasFrases: [
      {
        type: String,
        trim: true,
        default: '',
      },
    ],
    // Notas generales de interpretación
    notas: {
      type: String,
      trim: true,
    },
    // Intentos permitidos para este ejercicio
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
      ref: 'Ejercicio',
      required: true,
      unique: true,
    },

    // real | simulada (IA / aula)
    tipoRole: {
      type: String,
      enum: ['real', 'simulada'],
      default: 'real',
    },

    trastorno: { type: String, trim: true, default: '' },

    // Consentimiento
    consentimiento: {
      type: Boolean,
      default: false,
    },
    tipoConsentimiento: {
      type: String,
      enum: ['adulto', 'niño', ''],
      default: '',
    },

    // ✅ Evaluaciones IA (base + opcionales)
    // Base SIEMPRE deberían quedar en true:
    // rapport, preguntasAbiertas, encuadre, alianzaTerapeutica
    evaluaciones: {
      rapport: { type: Boolean, default: true },
      preguntasAbiertas: { type: Boolean, default: true },
      encuadre: { type: Boolean, default: true },
      alianzaTerapeutica: { type: Boolean, default: true },

      // opcionales (por defecto apagadas)
      parafrasis: { type: Boolean, default: false },
      reflejo: { type: Boolean, default: false },
      clarificacion: { type: Boolean, default: false },
      chisteTerapeutico: { type: Boolean, default: false },
      sarcasmoTerapeutico: { type: Boolean, default: false },
      empatia: { type: Boolean, default: false },
      revelacion: { type: Boolean, default: false },
      metafora: { type: Boolean, default: false },
      resumen: { type: Boolean, default: false },
      practicarConsignasPruebas: { type: Boolean, default: false },

      // extra opcionales
      palabrasClave: { type: Boolean, default: false },

      // historia de vida (opcionales)
      infancia: { type: Boolean, default: false },
      actualidad: { type: Boolean, default: false },
      motivoConsulta: { type: Boolean, default: false },
      relacionPadres: { type: Boolean, default: false },
      relacionSentimental: { type: Boolean, default: false },
      antecedentesPsiquiatricos: { type: Boolean, default: false },
      sexualidad: { type: Boolean, default: false },
      nivelEducativo: { type: Boolean, default: false },
      situacionLaboral: { type: Boolean, default: false },
      vicios: { type: Boolean, default: false },
      creenciasReligiosas: { type: Boolean, default: false },
      anamnesis: { type: Boolean, default: false },
      antecedentesSociales: { type: Boolean, default: false },
      antecedentePatologico: { type: Boolean, default: false },

      // enfoques (opcionales)
      logoterapiaProposito: { type: Boolean, default: false },
      logoterapiaSentido: { type: Boolean, default: false },

      tccReestructuracion: { type: Boolean, default: false },
      tccIdeasIrracionales: { type: Boolean, default: false },
      tccABC: { type: Boolean, default: false },

      psicoLapsus: { type: Boolean, default: false },
      psicoDefensas: { type: Boolean, default: false },

      // otros (opcionales)
      entrevistaTrabajo: { type: Boolean, default: false },
      protocolosMEP: { type: Boolean, default: false },
    },

    // ✅ Partes/Herramientas (tu estructura actual)
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
    // Lo guardamos flexible para no pelear con cambios futuros
    pruebasConfig: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ===== Ejercicio específico: Criterios de diagnóstico =====
const ejercicioCriteriosDxSchema = new Schema(
  {
    ejercicio: {
      type: Schema.Types.ObjectId,
      ref: 'Ejercicio',
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
      ref: 'Ejercicio',
      required: true,
      unique: true,
    },
    // Guardamos el objeto tal cual viene del frontend:
    // { seleccion_multiple: { enabled, test }, fv: { ... }, ... }
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
      ref: 'Ejercicio',
      required: true,
      unique: true,
    },
    // Ruta o URL de la imagen proyectiva
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
const Modulo = mongoose.model('Modulo', moduloSchema);
const Submodulo = mongoose.model('Submodulo', submoduloSchema);
const Ejercicio = mongoose.model('Ejercicio', ejercicioSchema);
const EjercicioGrabarVoz = mongoose.model(
  'EjercicioGrabarVoz',
  ejercicioGrabarVozSchema
);
const EjercicioInterpretacionFrases = mongoose.model(
  'EjercicioInterpretacionFrases',
  ejercicioInterpretacionFrasesSchema
);
const EjercicioRolePlay = mongoose.model(
  'EjercicioRolePlay',
  ejercicioRolePlaySchema
);
const EjercicioCriteriosDx = mongoose.model(
  'EjercicioCriteriosDx',
  ejercicioCriteriosDxSchema
);
const EjercicioPruebas = mongoose.model(
  'EjercicioPruebas',
  ejercicioPruebasSchema
);
const EjercicioInterpretacionProyectiva = mongoose.model(
  'EjercicioInterpretacionProyectiva',
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
};