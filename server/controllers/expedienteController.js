const Expediente = require('../models/expediente');

const crearExpediente = async (req, res) => {
  try {
    const { sessionId, historialClinico, minuta, observaciones } = req.body;

    const nuevoExpediente = new Expediente({
      sessionId,
      historialClinico,
      minuta,
      observaciones,
      creadoPor: req.user.id
    });

    await nuevoExpediente.save();

    res.status(201).json({
      message: 'Expediente creado correctamente',
      expediente: nuevoExpediente
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear expediente',
      error: error.message
    });
  }
};

const obtenerExpedientePorSesion = async (req, res) => {
    try {
      const { sessionId } = req.params;
  
      const expediente = await Expediente.findOne({ sessionId }).populate('sessionId');
  
      if (!expediente) {
        return res.status(404).json({ message: 'No se encontró expediente para esta sesión.' });
      }
  
      res.json({ expediente });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener expediente.', error: error.message });
    }
  };

  const editarExpediente = async (req, res) => {
    try {
      const { id } = req.params;
      const { historialClinico, minuta, observaciones } = req.body;
  
      // Buscar expediente
      const expediente = await Expediente.findById(id);
  
      if (!expediente) {
        return res.status(404).json({ message: 'Expediente no encontrado.' });
      }
  
      // Verificar autor
      if (expediente.creadoPor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permiso para editar este expediente.' });
      }
  
      // Actualizar campos
      expediente.historialClinico = historialClinico || expediente.historialClinico;
      expediente.minuta = minuta || expediente.minuta;
      expediente.observaciones = observaciones || expediente.observaciones;
  
      await expediente.save();
  
      res.json({ message: 'Expediente actualizado correctamente.', expediente });
    } catch (error) {
      res.status(500).json({ message: 'Error al editar expediente.', error: error.message });
    }
  };

  const listarExpedientesDelUsuario = async (req, res) => {
    try {
      const expedientes = await Expediente.find({ creadoPor: req.user.id })
        .populate('sessionId') // Incluye info de la sesión
        .sort({ createdAt: -1 }); // Orden descendente
  
      res.json({ expedientes });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener los expedientes del usuario.',
        error: error.message
      });
    }
  };
  
  
  module.exports = {
    crearExpediente,
    obtenerExpedientePorSesion,
    editarExpediente,
    listarExpedientesDelUsuario
  };
