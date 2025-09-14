const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// GET /api/tests?tipo=escala|proyectiva|dibujo
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    const q = tipo ? { tipo } : {};
    const tests = await Test.find(q).select('id nombre tipo version pdfUrl configuracion');
    res.json(tests);
  } catch (err) {
    console.error('Error listando tests:', err);
    res.status(500).json({ message: 'Error listando tests' });
  }
});

// GET /api/tests/:id
router.get('/:id', async (req, res) => {
  try {
    const t = await Test.findOne({ id: req.params.id });
    if (!t) return res.status(404).json({ message: 'Test no encontrado' });
    res.json(t);
  } catch (err) {
    console.error('Error obteniendo test:', err);
    res.status(500).json({ message: 'Error obteniendo test' });
  }
});

module.exports = router;