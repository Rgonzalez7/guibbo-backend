const express = require('express');
const router = express.Router();
const { guardarConsentimiento, obtenerConsentimiento } = require('../controllers/consentimientoController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/guardar/:pacienteId', verifyToken, guardarConsentimiento);
router.get('/obtener/:pacienteId', verifyToken, obtenerConsentimiento);

module.exports = router;