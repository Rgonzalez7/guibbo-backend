const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const {
    generarRetroalimentacion,
    obtenerRetroalimentacion
  } = require('../controllers/feedbackController');
  

// Ruta protegida
router.get('/sesion/:sessionId', verifyToken, generarRetroalimentacion);
router.get('/consultar/:sessionId', verifyToken, obtenerRetroalimentacion);

module.exports = router;
