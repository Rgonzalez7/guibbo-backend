// controllers/cuadroConvergenciaController.js

const CuadroConvergencia = require('../models/CuadroConvergencia');

exports.guardarCuadroConvergencia = async (req, res) => {
  try {
    const pacienteId = req.params.pacienteId;
    const { datos } = req.body;

    if (!pacienteId || !Array.isArray(datos)) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    const existente = await CuadroConvergencia.findOneAndUpdate(
      { pacienteId },
      { filas: datos, usuarioId: req.user.id, fechaActualizacion: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Cuadro actualizado', cuadro: existente });
  } catch (err) {
    console.error('[guardarCuadroConvergencia]', err);
    res.status(500).json({ message: 'Error al guardar cuadro de convergencia' });
  }
};

exports.obtenerCuadroConvergencia = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const cuadro = await CuadroConvergencia.findOne({ pacienteId });

    res.json(cuadro?.filas || []);
  } catch (err) {
    console.error('[obtenerCuadroConvergencia]', err);
    res.status(500).json({ message: 'Error al obtener cuadro de convergencia' });
  }
};