// server/models/orden.js
// =========================================================
// Registro de compra. Por ahora el pago es SIMULADO: el botón
// marca la orden como pagada sin pasarela. Cuando se conecte la
// pasarela real, solo cambia `metodoPago` y se llenan los campos
// de referencia externa; el resto del flujo queda igual.
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ESTADOS = ["pendiente", "pagada", "fallida", "cancelada", "reembolsada"];
const METODOS = ["simulado", "manual", "stripe", "paypal", "local"];

const itemSchema = new Schema(
  {
    producto: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    nombre: { type: String, trim: true, default: "" },
    tipo: { type: String, trim: true, default: "" },
    cantidad: { type: Number, default: 1, min: 1 },
    precioUnitario: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ordenSchema = new Schema(
  {
    // Quién compra
    comprador: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    compradorNombre: { type: String, trim: true, default: "" },
    compradorRol: { type: String, trim: true, default: "" },
    universidad: { type: String, trim: true, default: "", index: true },

    // "institucional" la crea el súper usuario; "tienda" la crea el propio usuario
    origen: { type: String, enum: ["institucional", "tienda"], default: "tienda", index: true },

    items: { type: [itemSchema], default: [] },

    total: { type: Number, default: 0, min: 0 },
    moneda: { type: String, default: "CRC", trim: true },

    estado: { type: String, enum: ESTADOS, default: "pendiente", index: true },
    metodoPago: { type: String, enum: METODOS, default: "simulado" },

    // Para cuando se conecte la pasarela real
    referenciaExterna: { type: String, trim: true, default: "" },
    pagadaEn: { type: Date, default: null },

    licencias: [{ type: Schema.Types.ObjectId, ref: "Licencia" }],

    notas: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

ordenSchema.statics.ESTADOS = ESTADOS;
ordenSchema.statics.METODOS = METODOS;

module.exports = mongoose.model("Orden", ordenSchema);
