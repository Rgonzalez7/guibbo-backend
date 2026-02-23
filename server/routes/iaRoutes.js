// server/routes/iaRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { generarConsejoDiario } = require("../controllers/consejoDiarioController");

const {
  analizarRolePlayIA,
  depurarTranscripcionRolePlay,
  aplicarDepuracionTranscripcionRolePlay,
} = require("../controllers/iaRolePlayController");

// ✅ Consejo diario
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// ✅ Análisis REAL para RolePlaying (dinámico)
router.post("/roleplay/analyze", verifyToken, analizarRolePlayIA);

/* =========================================================
   ✅ NEW: Depuración de transcripción (RolePlay)
   POST /api/ia/roleplay/transcripcion/depurar
   Body:
   {
     ejercicioId,
     instanciaId, moduloInstanciaId,
     data?: { transcripcion: "..." },
     replace?: true,
     model?: "..."
   }
========================================================= */
router.post(
  "/roleplay/transcripcion/depurar",
  verifyToken,
  depurarTranscripcionRolePlay
);

/* =========================================================
   ✅ NEW: Aplicar depuración (decisiones del usuario)
   POST /api/ia/roleplay/transcripcion/depurar/aplicar
   Body:
   {
     ejercicioId,
     instanciaId, moduloInstanciaId,
     decisions: {
       speakerOverrides?: { [turnId]: "estudiante"|"paciente"|"unknown" },
       resolvedIssues?: { [issueId]: { action:"keep|remove|merge" } }
     },
     setActive?: true
   }
========================================================= */
router.post(
  "/roleplay/transcripcion/depurar/aplicar",
  verifyToken,
  aplicarDepuracionTranscripcionRolePlay
);

module.exports = router;