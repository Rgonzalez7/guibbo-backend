const mongoose = require('mongoose');

const DiagnosticoFinalSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true,
    unique: true
  },
  contenido: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('DiagnosticoFinal', DiagnosticoFinalSchema);