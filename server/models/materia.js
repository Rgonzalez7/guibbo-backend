// server/models/materia.js
const mongoose = require("mongoose");

const materiaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    codigo: {
      type: String,
      trim: true,
      default: "",
    },
    grupo: {
      type: String,
      trim: true,
      default: "",
    },
    periodoAcademico: {
      type: String,
      trim: true,
      default: "",
    },

    // Profesor responsable
    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profesorNombre: {
      type: String,
      trim: true,
      default: "",
    },
    profesorEmail: {
      type: String,
      trim: true,
      default: "",
    },

    // Universidad (mismo tipo que 'universidad' en User => String)
    universidad: {
      type: String,
      required: true,
      trim: true,
    },

    // Extras de la tabla (opcionales pero útiles)
    aula: {
      type: String,
      trim: true,
      default: "",
    },
    semestre: {
      type: String,
      trim: true,
      default: "",
    },
    creditos: {
      type: Number,
      default: 0,
    },
    horario: {
      type: String,
      trim: true,
      default: "",
    },

    // Estado
    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },

    // Estudiantes inscritos
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

     // Etiquetas legibles de los módulos asignados
    modulosLabels: [
        { 
            type: String, default: [] 
        }
    ],

    modulosGlobales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modulo",
      },
    ],
    modulosLocales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Modulo",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Materia", materiaSchema);