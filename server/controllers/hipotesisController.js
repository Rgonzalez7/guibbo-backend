const HipotesisDiagnostica = require('../models/HipotesisDiagnostica');

exports.guardarHipotesis = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { contenido } = req.body;

    if (!contenido) {
      return res.status(400).json({ message: 'Contenido vacío' });
    }

    const actualizado = await HipotesisDiagnostica.findOneAndUpdate(
      { pacienteId },
      { contenido, usuarioId: req.user.id, fechaActualizacion: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Hipótesis guardada', hipotesis: actualizado });
  } catch (error) {
    console.error('[guardarHipotesis]', error);
    res.status(500).json({ message: 'Error al guardar hipótesis diagnóstica' });
  }
};

exports.obtenerHipotesis = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const hipotesis = await HipotesisDiagnostica.findOne({ pacienteId });

    res.status(200).json(hipotesis?.contenido || '');
  } catch (error) {
    console.error('[obtenerHipotesis]', error);
    res.status(500).json({ message: 'Error al obtener hipótesis diagnóstica' });
  }
};