const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['real', 'simulada'],
    required: true
  },
  transcripcion: String,
  fecha: {
    type: Date,
    default: Date.now
  },
  retroalimentacion: {
    fortalezas: [String],
    areasDeMejora: [String],
    posiblesErrores: [String]
  },
  minuta: {
    descripcionProgreso: String,
    objetivos: String,
    sintomasPsicoticos: String,
    pensamientosSuicidas: Boolean,
    planAccion: String,
    proximaCita: String
  },
  fichaTecnica: {
    nombreCompleto: String,
    edad: String,
    fechaNacimiento: String,
    genero: String,
    estadoCivil: String,
    lugarResidencia: String,
    ocupacion: String,
    periodoEvaluacion: String,
    motivoConsulta: String,
    instrumentos: [String]
  },
  historialClinico: {
    datosPersonales: String,
    interesesPersonales: String,
    antecedentesPersonales: String,
    antecedentesPsicologicos: String,
    aspectosFamiliares: String,
    aspectosPsicologicosFamiliares: String,
    situacionesActuales: String,
    analisisResultados: String,
    sintesis: String,
    sintesisPruebas: String,
    recomendaciones: String
  },
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  analisisIA: {
    enfoque: String,
    resultado: mongoose.Schema.Types.Mixed,
    fechaAnalisis: Date
  },
  resaltadosTranscripcion: [
    {
      texto: String,
      seccion: String
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);