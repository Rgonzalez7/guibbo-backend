const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    codigo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    pais: {
      type: String,
      trim: true,
      default: '',
    },
    ciudad: {
      type: String,
      trim: true,
      default: '',
    },

    pago: {
      type: String,
      enum: ['activo', 'pendiente', 'inactivo'],
      default: 'pendiente',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('University', universitySchema);