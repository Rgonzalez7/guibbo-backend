// server/models/licencia.js
// =========================================================
// Una licencia es el DERECHO DE USO sobre módulos y/o sobre el
// servicio de creación de módulos.
//
// Titular:
//   - "institucion": la universidad (control del súper usuario)
//   - "usuario":     un director, profesor o estudiante puntual
//
// El acceso real se calcula siempre desde aquí: si no hay licencia
// vigente y pagada, no hay acceso.
// =========================================================
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TITULARES = ["institucion", "usuario"];
const ESTADOS_PAGO = ["pendiente", "pagado", "vencido", "cancelado"];

const movimientoSchema = new Schema(
  {
    accion: { type: String, trim: true, default: "" },
    detalle: { type: String, trim: true, default: "" },
    hechoPor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    hechoPorNombre: { type: String, trim: true, default: "" },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false }
);

const licenciaSchema = new Schema(
  {
    titular: { type: String, enum: TITULARES, required: true, index: true },

    // Titular institución (la universidad se identifica por NOMBRE,
    // igual que en User.universidad y Materia.universidad)
    universidad: { type: String, trim: true, default: "", index: true },
    universidadRef: { type: Schema.Types.ObjectId, ref: "University", default: null },

    // Titular usuario
    usuario: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    usuarioRol: { type: String, trim: true, default: "" },

    // Qué se compró
    producto: { type: Schema.Types.ObjectId, ref: "Producto", default: null },
    productoNombre: { type: String, trim: true, default: "" },
    productoTipo: { type: String, trim: true, default: "" },

    // Contenido efectivo de la licencia (copiado del producto al emitirla,
    // para que un cambio posterior del catálogo no altere lo ya vendido)
    modulos: [{ type: Schema.Types.ObjectId, ref: "Modulo" }],
    tiposEjercicio: [{ type: String, trim: true }],
    limiteModulos: { type: Number, default: 0, min: 0 },

    // Estado comercial
    estadoPago: { type: String, enum: ESTADOS_PAGO, default: "pendiente", index: true },
    monto: { type: Number, default: 0, min: 0 },
    moneda: { type: String, default: "CRC", trim: true },

    // Vigencia
    inicia: { type: Date, default: Date.now },
    expira: { type: Date, default: null }, // null = sin vencimiento

    // Cupos (para licencias institucionales que se reparten)
    cuposTotal: { type: Number, default: 0, min: 0 }, // 0 = ilimitado
    cuposUsados: { type: Number, default: 0, min: 0 },

    // Uso único (módulos comprados por estudiantes)
    soloEvaluacionIA: { type: Boolean, default: false },
    intentosPermitidos: { type: Number, default: 0, min: 0 }, // 0 = ilimitado
    intentosUsados: { type: Number, default: 0, min: 0 },

    activo: { type: Boolean, default: true, index: true },
    notas: { type: String, trim: true, default: "" },

    orden: { type: Schema.Types.ObjectId, ref: "Orden", default: null },

    historial: { type: [movimientoSchema], default: [] },
  },
  { timestamps: true }
);

/** ¿La licencia está vigente HOY y pagada? */
licenciaSchema.methods.estaVigente = function () {
  if (!this.activo) return false;
  if (this.estadoPago !== "pagado") return false;

  const ahora = new Date();
  if (this.inicia && ahora < this.inicia) return false;
  if (this.expira && ahora > this.expira) return false;

  return true;
};

licenciaSchema.methods.diasRestantes = function () {
  if (!this.expira) return null;
  const ms = new Date(this.expira).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

licenciaSchema.statics.TITULARES = TITULARES;
licenciaSchema.statics.ESTADOS_PAGO = ESTADOS_PAGO;

licenciaSchema.index({ universidad: 1, activo: 1, estadoPago: 1 });
licenciaSchema.index({ usuario: 1, activo: 1, estadoPago: 1 });

module.exports = mongoose.model("Licencia", licenciaSchema);
