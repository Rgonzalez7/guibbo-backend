const mongoose = require('mongoose');

const sesionIntervencionSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  objetivos: { type: String, default: '' },
  duracion: { type: String, default: '' },
  estructura: { type: String, default: '' },
  materiales: { type: String, default: '' },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SesionIntervencion', sesionIntervencionSchema);