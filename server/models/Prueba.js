// models/Prueba.js
const mongoose = require('mongoose');

const InterpretacionSchema = new mongoose.Schema({
  texto: { type: String, default: '' },
  metodoMedicion: { type: String, default: '' },
  diccionario: {
    nombre: String,
    tipoEvaluacion: String,
    guiaAplicacion: String,
    descripcion: String
  },
  actualizadoEn: { type: Date }
}, { _id: false });

const PruebaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: false },
  testId: { type: String, required: true },
  estado: { type: String, enum: ['en_progreso', 'guardada', 'finalizada'], required: true },
  roomId: { type: String, default: null },
  respuestas: { type: Object, default: {} },
  pacienteNombre: { type: String },
  testNombre: { type: String },
  interpretacion: { type: InterpretacionSchema, default: () => ({}) },
  shareToken: { type: String, index: true },
  shareExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Prueba', PruebaSchema);