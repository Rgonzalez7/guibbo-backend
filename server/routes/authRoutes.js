// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  recuperar,
  primerCambio,
  resetPassword,
  cambiarPassword,
} = require("../controllers/authController");

const verifyToken = require("../middlewares/verifyToken");

router.post("/register", register);
router.post("/login", login);

// recuperación por correo
router.post("/recuperar", recuperar);

// primer cambio (password genérica)
router.post("/primer-cambio", primerCambio);

// reset por token del email
router.post("/reset-password", resetPassword);

// 🔒 Cambio de contraseña con la sesión ya iniciada
router.put("/cambiar-password", verifyToken, cambiarPassword);

module.exports = router;