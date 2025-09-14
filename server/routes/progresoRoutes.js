const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken'); // ✅ IMPORTAR BIEN

const {
  obtenerProgresoDelEstudiante,
  generarPDFProgreso,
  obtenerSesionesPorMes
} = require('../controllers/progresoController');

router.get('/resumen', verifyToken, obtenerProgresoDelEstudiante);
router.get('/pdf', verifyToken, generarPDFProgreso);
router.get('/grafico', verifyToken, obtenerSesionesPorMes);

module.exports = router;