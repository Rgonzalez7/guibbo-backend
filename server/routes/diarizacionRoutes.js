const express = require('express');
const router = express.Router();
const { diarizarTextoIA } = require('../controllers/diarizacionController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/diarizar', verifyToken, diarizarTextoIA);

module.exports = router;