const express = require('express');
const router = express.Router();
const {
  obtenerDiagnosticoFinal,
  guardarDiagnosticoFinal
} = require('../controllers/diagnosticoFinalController');

const verifyToken = require('../middlewares/verifyToken');

router.get('/:pacienteId', verifyToken, obtenerDiagnosticoFinal);
router.post('/:pacienteId', verifyToken, guardarDiagnosticoFinal);

module.exports = router;