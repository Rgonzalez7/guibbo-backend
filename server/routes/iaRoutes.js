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

const { analizarPraxis } = require("../controllers/iaPraxisController");
const { analizarHerramientas } = require("../controllers/iaHerramientasController");

// ✅ Consejo diario
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// ✅ Legacy — mantiene ambas evaluaciones juntas (no eliminar)
router.post("/roleplay/analyze", verifyToken, analizarRolePlayIA);

// ✅ PRAXIS-TH — solo transcripción, se llama al terminar la sesión
router.post("/roleplay/praxis", verifyToken, analizarPraxis);

// ✅ HERRAMIENTAS — solo instrumentos clínicos, se llama al finalizar el ejercicio
router.post("/roleplay/herramientas", verifyToken, analizarHerramientas);

// ✅ Depuración de transcripción
router.post("/roleplay/transcripcion/depurar", verifyToken, depurarTranscripcionRolePlay);
router.post("/roleplay/transcripcion/depurar/aplicar", verifyToken, aplicarDepuracionTranscripcionRolePlay);
router.post("/roleplay/transcripcion/depuracion/undo", verifyToken, deshacerDepuracionTranscripcionRolePlay);

module.exports = router;
