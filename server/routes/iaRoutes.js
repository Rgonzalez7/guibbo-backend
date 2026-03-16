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

// ✅ Una sola declaración con los tres métodos
const {
  obtenerPerfilTerapeutico,
  generarPerfilTerapeutico,
  generarPerfilUltimoEjercicio,
} = require("../controllers/perfilTerapeuticoController");

// Consejo diario
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// Legacy
router.post("/roleplay/analyze", verifyToken, analizarRolePlayIA);

// PRAXIS-TH
router.post("/roleplay/praxis", verifyToken, analizarPraxis);

// Herramientas clínicas
router.post("/roleplay/herramientas", verifyToken, analizarHerramientas);

// Depuración manual
router.post("/roleplay/transcripcion/depurar", verifyToken, depurarTranscripcionRolePlay);
router.post("/roleplay/transcripcion/depurar/aplicar", verifyToken, aplicarDepuracionTranscripcionRolePlay);
router.post("/roleplay/transcripcion/depuracion/undo", verifyToken, deshacerDepuracionTranscripcionRolePlay);

// Perfil terapéutico
router.get("/perfil-terapeutico", verifyToken, obtenerPerfilTerapeutico);
router.post("/perfil-terapeutico/generar", verifyToken, generarPerfilTerapeutico);
router.post("/perfil-terapeutico/generar-ultimo", verifyToken, generarPerfilUltimoEjercicio);

module.exports = router;
