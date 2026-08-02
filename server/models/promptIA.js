// server/models/promptIA.js
// =========================================================
// Prompts de IA editables desde el panel de súper usuario.
// El texto vive en la BD; si no existe registro (o está
// inactivo) el sistema usa el texto por defecto del código.
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const VersionSchema = new Schema(
  {
    version: { type: Number, required: true },
    contenido: { type: String, required: true },
    nota: { type: String, default: "" },
    editadoPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    editadoPorNombre: { type: String, default: "" },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PromptIASchema = new Schema(
  {
    clave: { type: String, required: true, unique: true, index: true, trim: true },

    contenido: { type: String, required: true },

    activo: { type: Boolean, default: true },

    version: { type: Number, default: 1 },

    nota: { type: String, default: "" },

    actualizadoPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actualizadoPorNombre: { type: String, default: "" },

    historial: { type: [VersionSchema], default: [] },
  },
  { timestamps: true }
);

// Mantiene el historial acotado (últimas 30 versiones)
PromptIASchema.pre("save", function (next) {
  if (Array.isArray(this.historial) && this.historial.length > 30) {
    this.historial = this.historial.slice(-30);
  }
  next();
});

module.exports = mongoose.model("PromptIA", PromptIASchema);
