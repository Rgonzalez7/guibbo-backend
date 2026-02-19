// server/models/ejercicioInstancia.js
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

    // ✅ NUEVOS ESTADOS reales de flujo
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

    // ✅ Guarda el análisis COMPLETO (JSON)
    analisisIA: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ✅ Auditoría
    analisisGeneradoAt: {
      type: Date,
      default: null,
    },

    // ✅ para distinguir si fue IA real o mock (útil en MVP)
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
       ✅ TIEMPO REAL DE PRÁCTICA (NUEVO)
       ========================================================= */

    // Marca cuando el estudiante inició la sesión actual (si está en progreso)
    startedAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Total acumulado de práctica en segundos (suma de todas las sesiones)
    tiempoAcumuladoSeg: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Auditoría opcional (si quieres ver entradas/salidas)
    sesiones: [
      {
        startedAt: { type: Date, required: true },
        endedAt: { type: Date, required: true },
        segundos: { type: Number, required: true, min: 0 },
      },
    ],

    // Marca final (opcional) al completar
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