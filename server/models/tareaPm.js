// server/models/tareaPm.js
// =========================================================
// Tareas del panel de control de proyecto (súper usuario).
//
// Es una herramienta interna de seguimiento del desarrollo, no
// parte del producto: no hay asignación entre usuarios ni permisos
// por tarea, porque quien la usa es siempre el mismo súper usuario.
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ESTADOS = ["sin_empezar", "en_proceso", "en_qa", "terminada"];
const PRIORIDADES = ["baja", "media", "alta"];

const AdjuntoSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    nombre: { type: String, default: "", trim: true },
  },
  { _id: false }
);

/* Cada movimiento de estado queda registrado: sin esto no hay forma
   de saber cuándo entró algo a QA ni cuánto llevaba en proceso. */
const MovimientoSchema = new Schema(
  {
    de: { type: String, enum: ESTADOS, default: null },
    a: { type: String, enum: ESTADOS, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TareaPmSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 200 },
    descripcion: { type: String, default: "", trim: true, maxlength: 5000 },

    /* Ruta dentro del sistema: dashboard (estudiante / profesor / admin…)
       y la sección concreta de ese dashboard. Los valores los define el
       frontend en constants/pmSecciones.js; aquí se guardan tal cual para
       no tener que tocar la base cada vez que se añade una pantalla. */
    dashboard: { type: String, default: "", trim: true, index: true },
    seccion: { type: String, default: "", trim: true, index: true },

    estado: { type: String, enum: ESTADOS, default: "sin_empezar", index: true },
    prioridad: { type: String, enum: PRIORIDADES, default: "media" },

    adjuntos: { type: [AdjuntoSchema], default: [] },
    historial: { type: [MovimientoSchema], default: [] },

    /* Orden manual dentro de su columna. Se guarda con saltos de 1000
       para poder insertar entre dos tarjetas sin renumerar todas. */
    orden: { type: Number, default: 0 },

    completadaEn: { type: Date, default: null },

    creadaPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    creadaPorNombre: { type: String, default: "" },
  },
  { timestamps: true }
);

TareaPmSchema.index({ estado: 1, orden: 1, updatedAt: -1 });

module.exports = mongoose.model("TareaPm", TareaPmSchema);
module.exports.ESTADOS = ESTADOS;
module.exports.PRIORIDADES = PRIORIDADES;
