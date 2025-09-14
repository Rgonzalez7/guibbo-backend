const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  guardarHipotesis,
  obtenerHipotesis
} = require('../controllers/hipotesisController');

router.post('/:pacienteId', verifyToken, guardarHipotesis);
router.get('/:pacienteId', verifyToken, obtenerHipotesis);

module.exports = router;