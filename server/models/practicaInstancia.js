// server/models/practicaInstancia.js
// =========================================================
// Módulo comprado por un ESTUDIANTE para práctica libre.
//
// Reglas propias (distintas de ModuloInstancia):
//  - No depende de una materia ni de un profesor
//  - Evaluación únicamente por IA (sin revisión docente)
//  - Un solo intento: al finalizar, los resultados quedan
//    disponibles para siempre pero no se puede reiniciar
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const practicaInstanciaSchema = new Schema(
  {
    estudiante: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    modulo: { type: Schema.Types.ObjectId, ref: "Modulo", required: true, index: true },
    licencia: { type: Schema.Types.ObjectId, ref: "Licencia", required: true, index: true },

    // Materia personal de práctica (permite reutilizar el motor de ejercicios)
    materia: { type: Schema.Types.ObjectId, ref: "Materia", default: null },

    estado: {
      type: String,
      enum: ["pendiente", "en_progreso", "completado"],
      default: "pendiente",
      index: true,
    },

    progreso: { type: Number, default: 0, min: 0, max: 100 },

    // Al completarse queda en solo lectura
    bloqueado: { type: Boolean, default: false },

    fechaInicio: { type: Date, default: null },
    fechaFinalizacion: { type: Date, default: null },
  },
  { timestamps: true }
);

// Una práctica por módulo dentro de cada licencia comprada.
// (Un paquete con varios módulos genera una práctica por módulo.)
practicaInstanciaSchema.index(
  { estudiante: 1, licencia: 1, modulo: 1 },
  { unique: true }
);

module.exports = mongoose.model("PracticaInstancia", practicaInstanciaSchema);
