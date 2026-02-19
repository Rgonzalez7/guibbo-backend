// server/models/submoduloInstancia.js
const mongoose = require("mongoose");

const submoduloInstanciaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    materia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true,
      index: true,
    },

    modulo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Modulo",
      required: true,
      index: true,
    },

    submodulo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submodulo",
      required: true,
      index: true,
    },

    estado: {
      type: String,
      enum: ["bloqueado", "pendiente", "en_progreso", "completado"],
      default: "pendiente",
      index: true,
    },
  },
  { timestamps: true }
);

submoduloInstanciaSchema.index(
  { estudiante: 1, materia: 1, submodulo: 1 },
  { unique: true }
);

module.exports = mongoose.model("SubmoduloInstancia", submoduloInstanciaSchema);