const mongoose = require("mongoose");

const ejercicioInstanciaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    moduloInstancia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModuloInstancia",
      required: true,
      index: true,
    },

    ejercicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
    },

    estado: {
      type: String,
      enum: ["bloqueado", "pendiente", "en_progreso", "completado"],
      default: "bloqueado",
      index: true,
    },

    respuestas: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    calificacion: {
      type: Number,
      default: null,
    },

    calificacionFinal: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    evaluacionInformeScores: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* =========================================================
       ANÁLISIS IA PRINCIPAL — evaluación Praxis-TH
       ========================================================= */
    analisisIA: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* =========================================================
       EVALUACIÓN DE HERRAMIENTAS
       coherencia/redacción de ficha, hc, examen, diagnóstico, etc.
       ========================================================= */
    evaluacionHerramientas: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* =========================================================
       ✅ PERFIL TERAPÉUTICO
       Generado por IA al finalizar cada ejercicio de role playing.
       Guarda los 6 estilos clínicos (0.0–1.0), resumen narrativo
       y metadata del análisis.
       Estructura:
       {
         perfilTerapeutico: { validante, directivo, colaborativo,
                              confrontativo, exploratorio, contenedor },
         resumenPerfil: string,
         meta: { perfilDominante, sesionesAnalizadas,
                 notaDelSupervisor, generadoAt }
       }
       ========================================================= */
    perfilTerapeutico: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Auditoría
    analisisGeneradoAt: {
      type: Date,
      default: null,
    },

    analisisFuente: {
      type: String,
      enum: ["ai", "mock", "unknown", "legacy", "manual", "real"],
      default: "ai",
    },

    intentosUsados: {
      type: Number,
      default: 0,
    },

    /* =========================================================
       TIEMPO REAL DE PRÁCTICA
       ========================================================= */
    startedAt: {
      type: Date,
      default: null,
      index: true,
    },

    tiempoAcumuladoSeg: {
      type: Number,
      default: 0,
      min: 0,
    },

    sesiones: [
      {
        startedAt: { type: Date, required: true },
        endedAt:   { type: Date, required: true },
        segundos:  { type: Number, required: true, min: 0 },
      },
    ],

    completedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

ejercicioInstanciaSchema.index(
  { estudiante: 1, moduloInstancia: 1, ejercicio: 1 },
  { unique: true }
);

module.exports = mongoose.model("EjercicioInstancia", ejercicioInstanciaSchema);
