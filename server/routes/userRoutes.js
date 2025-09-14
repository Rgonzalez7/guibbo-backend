const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { actualizarFotoPerfil } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/foto', verifyToken, upload.single('foto'), actualizarFotoPerfil);

module.exports = router;