const mongoose = require('mongoose');

const consentimientoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  nombreFirmante: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  firma: {
    type: String, // base64
    required: true
  },
  fecha: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Consentimiento', consentimientoSchema);