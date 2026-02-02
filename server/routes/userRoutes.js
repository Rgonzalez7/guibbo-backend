// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const verifyToken = require("../middlewares/verifyToken");
const {
  getPerfil,
  updatePerfil,
  actualizarFotoPerfil,
} = require("../controllers/userController");

// ===== Multer config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ===== Perfil =====
router.get("/perfil", verifyToken, getPerfil);
router.put("/perfil", verifyToken, updatePerfil);

// ===== Foto (match con frontend: PUT /usuarios/foto) =====
router.put("/foto", verifyToken, upload.single("foto"), actualizarFotoPerfil);

module.exports = router;