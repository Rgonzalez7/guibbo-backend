
const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombreCompleto: { type: String, required: true },
    fechaNacimiento: String,
    genero: String,
    estadoCivil: String,
    lugarResidencia: String,
    edad: String,
    ocupacion: String,
    periodoEvaluacion: String,
    motivoConsulta: String,
    instrumentos: [String],
    notas: String
  }, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);