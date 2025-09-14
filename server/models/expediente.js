const mongoose = require('mongoose');

const expedienteSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  historialClinico: {
    type: String,
    required: true
  },
  minuta: {
    type: String,
    required: true
  },
  observaciones: {
    type: String
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expediente', expedienteSchema);
