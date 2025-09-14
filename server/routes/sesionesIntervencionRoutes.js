// routes/sesionesIntervencionRoutes.js

const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  crearSesionIntervencion,
  obtenerSesionesPorPaciente,
  eliminarSesion
} = require('../controllers/sesionesIntervencionController');

router.post('/', verifyToken, crearSesionIntervencion);
router.get('/:pacienteId', verifyToken, obtenerSesionesPorPaciente);
router.delete('/eliminar/:id', verifyToken, eliminarSesion);

module.exports = router;