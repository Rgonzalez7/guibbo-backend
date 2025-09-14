const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  crearPaciente,
  obtenerPacientes,
  obtenerPaciente,
  eliminarPaciente,
  obtenerDetallePaciente 
} = require('../controllers/pacienteController');

router.post('/', verifyToken, crearPaciente);
router.get('/', verifyToken, obtenerPacientes);

router.get('/buscar', verifyToken, async (req, res) => {
  try {
    const { nombre } = req.query;
    const q = {};
    if (nombre && nombre.trim().length >= 2) {
      q.nombreCompleto = { $regex: nombre.trim(), $options: 'i' };
    }
    const pacientes = await Paciente.find(q).select('_id nombreCompleto').limit(20).lean();
    res.json(pacientes);
  } catch (err) {
    console.error('Error buscando pacientes:', err);
    res.status(500).json({ message: 'Error buscando pacientes' });
  }
});

router.get('/:id', verifyToken, obtenerPaciente);
router.delete('/:id', verifyToken, eliminarPaciente);
router.get('/:id/detalle', verifyToken, obtenerDetallePaciente);




module.exports = router;