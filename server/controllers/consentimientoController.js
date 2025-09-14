const Consentimiento = require('../models/Consentimiento');

const guardarConsentimiento = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { texto, firma, fecha, nombreFirmante } = req.body;

    if (!texto || !firma || !fecha || !nombreFirmante) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Asegurarse que no se duplique
    const yaExiste = await Consentimiento.findOne({ pacienteId });
    if (yaExiste) {
      return res.status(400).json({ message: 'El consentimiento ya ha sido registrado.' });
    }

    const nuevo = new Consentimiento({
      pacienteId,
      texto,
      firma,
      fecha,
      nombreFirmante
    });

    await nuevo.save();
    res.status(201).json({ message: 'Consentimiento guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar consentimiento:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const obtenerConsentimiento = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const consentimiento = await Consentimiento.findOne({ pacienteId });

    if (!consentimiento) {
      return res.status(404).json({ message: 'No se encontró consentimiento' });
    }

    res.json(consentimiento);
  } catch (error) {
    console.error('Error al obtener consentimiento:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { guardarConsentimiento, obtenerConsentimiento };