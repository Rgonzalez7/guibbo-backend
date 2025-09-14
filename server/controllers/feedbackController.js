const Session = require('../models/session');
const Expediente = require('../models/expediente');

const generarRetroalimentacion = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    const expediente = await Expediente.findOne({ sessionId });

    if (!session || !expediente) {
      return res.status(404).json({ message: 'Sesión o expediente no encontrados.' });
    }

    // Simulación de análisis (IA futura)
    const retroalimentacion = {
      fortalezas: [
        "Uso adecuado de técnicas cognitivo-conductuales.",
        "Buena empatía durante la sesión."
      ],
      areasDeMejora: [
        "Evitar preguntas cerradas repetitivas.",
        "Fortalecer el uso del silencio terapéutico."
      ],
      posiblesErrores: [
        "No se ofreció una recapitulación final.",
        "Faltó validar una emoción clave expresada por el paciente."
      ]
    };

    session.retroalimentacion = retroalimentacion;
    await session.save();

    res.json({
      sessionId,
      feedback: retroalimentacion
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al generar retroalimentación.', error: error.message });
  }
};

const obtenerRetroalimentacion = async (req, res) => {
    try {
      const { sessionId } = req.params;
  
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
      }
  
      if (!session.retroalimentacion) {
        return res.status(404).json({ message: 'Aún no hay retroalimentación generada para esta sesión.' });
      }
  
      res.json({
        sessionId,
        feedback: session.retroalimentacion
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener la retroalimentación.',
        error: error.message
      });
    }
  };
  

  module.exports = {
    generarRetroalimentacion,
    obtenerRetroalimentacion
  };
  
