// server/models/producto.js
// =========================================================
// Catálogo de venta. Un producto puede ser:
//  - "modulo":   un módulo suelto creado por el súper usuario
//  - "paquete":  varios módulos vendidos juntos
//  - "creacion": el servicio de creación de módulos, limitado a
//                ciertos tipos de ejercicio
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TIPOS_PRODUCTO = ["modulo", "paquete", "creacion"];

// A quién se le puede vender
const AUDIENCIAS = ["institucion", "director", "profesor", "estudiante"];

const TIPOS_EJERCICIO = [
  "Role playing persona",
  "Role Playing IA",
  "Grabar voz",
  "Informe clínico",
  "Multi Sesion",
];

const productoSchema = new Schema(
  {
    tipo: { type: String, enum: TIPOS_PRODUCTO, required: true, index: true },

    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },

    // Módulos incluidos (tipo "modulo" → 1; tipo "paquete" → varios)
    modulos: [{ type: Schema.Types.ObjectId, ref: "Modulo" }],

    // Solo para tipo "creacion": qué tipos de ejercicio habilita crear
    tiposEjercicio: [{ type: String, enum: TIPOS_EJERCICIO }],

    // Solo para tipo "creacion": cuántos módulos puede crear (0 = sin límite)
    limiteModulos: { type: Number, default: 0, min: 0 },

    precio: { type: Number, required: true, min: 0 },
    moneda: { type: String, default: "CRC", trim: true },

    // Vigencia que otorga la licencia al comprarse (0 = sin vencimiento)
    vigenciaDias: { type: Number, default: 365, min: 0 },

    audiencias: {
      type: [String],
      enum: AUDIENCIAS,
      default: ["institucion"],
      index: true,
    },

    // Para módulos comprados por estudiantes: un solo intento y sin profesor
    soloEvaluacionIA: { type: Boolean, default: false },
    intentosPermitidos: { type: Number, default: 1, min: 1 },

    destacado: { type: Boolean, default: false },
    activo: { type: Boolean, default: true, index: true },

    creadoPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

productoSchema.statics.TIPOS_PRODUCTO = TIPOS_PRODUCTO;
productoSchema.statics.AUDIENCIAS = AUDIENCIAS;
productoSchema.statics.TIPOS_EJERCICIO = TIPOS_EJERCICIO;

module.exports = mongoose.model("Producto", productoSchema);
