// server/routes/iaRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { generarConsejoDiario } = require("../controllers/consejoDiarioController");

const {
  analizarRolePlayIA,
  depurarTranscripcionRolePlay,
  aplicarDepuracionTranscripcionRolePlay,
  deshacerDepuracionTranscripcionRolePlay,
} = require("../controllers/iaRolePlayController");

// ✅ Consejo diario
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// ✅ Análisis REAL para RolePlaying (dinámico)
router.post("/roleplay/analyze", verifyToken, analizarRolePlayIA);

/* =========================================================
   ✅ NEW: Depuración de transcripción (RolePlay)
   POST /api/ia/roleplay/transcripcion/depurar
========================================================= */
router.post(
  "/roleplay/transcripcion/depurar",
  verifyToken,
  depurarTranscripcionRolePlay
);

/* =========================================================
   ✅ NEW: Aplicar depuración (decisiones del usuario)
   POST /api/ia/roleplay/transcripcion/depurar/aplicar
========================================================= */
router.post(
  "/roleplay/transcripcion/depurar/aplicar",
  verifyToken,
  aplicarDepuracionTranscripcionRolePlay
);

/* =========================================================
   ✅ NEW: Deshacer depuración (volver a raw / limpiar activeVersion)
   POST /api/ia/roleplay/transcripcion/depuracion/undo
========================================================= */
router.post(
  "/roleplay/transcripcion/depuracion/undo",
  verifyToken,
  deshacerDepuracionTranscripcionRolePlay
);

module.exports = router;