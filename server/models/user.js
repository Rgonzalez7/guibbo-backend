// server/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    /**
     * Nombre visible en el dashboard ("Buenos días, Tayron")
     * Lo usamos como nombre completo (nombres + apellidos)
     */
    nombre: {
      type: String,
      trim: true,
      default: '',
    },

    // Nombres (ej. "Ana María")
    nombres: {
      type: String,
      trim: true,
      default: '',
    },

    // Apellidos (ej. "Morales Jiménez")
    apellidos: {
      type: String,
      trim: true,
      default: '',
    },

    // Matrícula del estudiante (opcional para otros roles)
    matricula: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    foto: {
      type: String,
      default: '',
    },

    rol: {
      type: String,
      enum: ['estudiante', 'profesor', 'director', 'super'],
      default: 'estudiante',
      required: true,
    },

    universidad: {
      type: String,
      trim: true,
      default: '',
    },

    carrera: {
      type: String,
      trim: true,
      default: '',
    },

    pais: {
      type: String,
      trim: true,
      default: '',
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);