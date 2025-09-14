const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  guardarCuadroConvergencia,
  obtenerCuadroConvergencia
} = require('../controllers/cuadroConvergenciaController');

router.post('/:pacienteId', verifyToken, guardarCuadroConvergencia);
router.get('/:pacienteId', verifyToken, obtenerCuadroConvergencia);

module.exports = router;