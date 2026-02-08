// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  recuperar,
  primerCambio,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// recuperación por correo
router.post("/recuperar", recuperar);

// primer cambio (password genérica)
router.post("/primer-cambio", primerCambio);

// reset por token del email
router.post("/reset-password", resetPassword);

module.exports = router;