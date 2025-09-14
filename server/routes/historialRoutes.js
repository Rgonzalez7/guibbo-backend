const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Session = require('../models/session');
const Prueba = require('../models/Prueba');

router.get('/resumen', verifyToken, async (req, res) => {
  try {
    // Sesiones del usuario (ojo: userId)
    const sesionesRecientes = await Session.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id fecha hora tipo resumen resultado createdAt')
      .lean();

    // Pruebas del usuario (ahora Prueba tiene usuarioId)
    const pruebasRecientes = await Prueba.find({ usuarioId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id pacienteNombre testNombre estado createdAt')
      .lean();

    res.json({ ok: true, sesionesRecientes, pruebasRecientes });
  } catch (err) {
    console.error('[GET /api/historial/resumen] Error:', err);
    res.status(500).json({ ok: false, message: 'Error obteniendo resumen' });
  }
});

module.exports = router;