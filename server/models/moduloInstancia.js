const mongoose = require('mongoose');

const moduloInstanciaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    materia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Materia',
      required: true,
      index: true,
    },
    modulo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Modulo',
      required: true,
    },

    estado: {
      type: String,
      enum: ['pendiente', 'en_progreso', 'completado'],
      default: 'pendiente',
    },

    progreso: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    fechaAsignacion: {
      type: Date,
      default: Date.now,
    },
    fechaInicio: Date,
    fechaFinalizacion: Date,
  },
  { timestamps: true }
);

// Un estudiante solo puede tener UNA instancia de ese módulo en esa materia
moduloInstanciaSchema.index(
  { estudiante: 1, materia: 1, modulo: 1 },
  { unique: true }
);

module.exports = mongoose.model('ModuloInstancia', moduloInstanciaSchema);