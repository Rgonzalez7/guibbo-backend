// controllers/sesionesIntervencionController.js

const SesionIntervencion = require('../models/SesionIntervencion'); 

exports.crearSesionIntervencion = async (req, res) => {
  try {
    const { pacienteId, objetivos, duracion, estructura, materiales } = req.body;

    if (!pacienteId) {
      return res.status(400).json({ message: 'Falta el ID del paciente.' });
    }

    const nuevaSesion = new SesionIntervencion({ 
      pacienteId,
      usuarioId: req.user.id,
      objetivos,
      duracion,
      estructura,
      materiales
    });

    await nuevaSesion.save();

    res.status(201).json({ message: 'Sesión de intervención guardada', sesion: nuevaSesion });
  } catch (error) {
    console.error('[crearSesionIntervencion]', error);
    res.status(500).json({ message: 'Error al guardar sesión de intervención.' });
  }
};

exports.obtenerSesionesPorPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const sesiones = await SesionIntervencion.find({ pacienteId }).sort({ fechaCreacion: 1 });

    res.json(sesiones);
  } catch (error) {
    console.error('[obtenerSesionesPorPaciente]', error);
    res.status(500).json({ message: 'Error al obtener sesiones de intervención.' });
  }
};

exports.eliminarSesion = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminada = await SesionIntervencion.findOneAndDelete({
      _id: id,
      usuarioId: req.user.id
    });

    if (!eliminada) {
      return res.status(404).json({ message: 'Sesión no encontrada o no autorizada.' });
    }

    res.json({ message: 'Sesión eliminada correctamente.' });
  } catch (error) {
    console.error('[eliminarSesion]', error);
    res.status(500).json({ message: 'Error al eliminar sesión.' });
  }
};