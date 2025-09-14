const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { crearExpediente, obtenerExpedientePorSesion, editarExpediente, listarExpedientesDelUsuario } = require('../controllers/expedienteController');

router.post('/crear', verifyToken, crearExpediente);
router.get('/sesion/:sessionId', verifyToken, obtenerExpedientePorSesion);
router.get('/mios', verifyToken, listarExpedientesDelUsuario);
router.put('/editar/:id', verifyToken, editarExpediente);

module.exports = router;
