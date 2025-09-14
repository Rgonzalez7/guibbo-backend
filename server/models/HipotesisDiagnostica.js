const mongoose = require('mongoose');

const hipotesisDiagnosticaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenido: { type: String, default: '' },
  fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HipotesisDiagnostica', hipotesisDiagnosticaSchema);