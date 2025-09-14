const mongoose = require('mongoose');

const filaSchema = new mongoose.Schema({
  cognitivo: { type: String, default: '' },
  emocionalConductual: { type: String, default: '' },
  fisiologico: { type: String, default: '' }
}, { _id: false });

const cuadroConvergenciaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filas: [filaSchema],
  fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CuadroConvergencia', cuadroConvergenciaSchema);