const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true, default: "" },
    nombres: { type: String, trim: true, default: "" },
    apellidos: { type: String, trim: true, default: "" },
    matricula: { type: String, trim: true, default: "" },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    debeCambiarPassword: { type: Boolean, default: false },

    foto: { type: String, default: "" },

    rol: {
      type: String,
      enum: ["estudiante", "profesor", "director", "super"],
      default: "estudiante",
      required: true,
    },

    universidad: { type: String, trim: true, default: "" },
    carrera:     { type: String, trim: true, default: "" },
    pais:        { type: String, trim: true, default: "" },

    activo: { type: Boolean, default: true },


    casosInformeClinicoUsados: {
      type: [Number],
      default: [],
    },

    flagsTutoriales: {
      tourGrabarVozVisto: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);