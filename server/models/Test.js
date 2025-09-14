const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },      // ej: 'escala-bdi-ii'
  nombre: { type: String, required: true },                 // ej: 'Inventario de Depresión de Beck (BDI-II)'
  tipo: { type: String, enum: ['escala', 'proyectiva', 'dibujo'], required: true },
  version: { type: Number, default: 1 },
  pdfUrl: { type: String },                                 // opcional
  configuracion: { type: Object, required: true }           // items/consignas/etc
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);