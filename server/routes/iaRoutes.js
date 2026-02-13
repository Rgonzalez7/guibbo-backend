// server/routes/iaRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { generarConsejoDiario } = require("../controllers/consejoDiarioController");

const {
  analizarRolePlayIA,
} = require("../controllers/iaRolePlayController");

// ✅ Consejo diario
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// ✅ Análisis REAL para RolePlaying (dinámico)
// Body esperado:
// {
//   ejercicioId,
//   tipo: "role_play",
//   evaluaciones: ["rapport","preguntasAbiertas",...],
//   herramientas: { ficha:true, hc:false, ... },
//   data: { ...sessionData },
//   enfoque?: "Terapia Cognitivo-Conductual (TCC)" // opcional
// }
router.post("/roleplay/analyze", verifyToken, analizarRolePlayIA);

module.exports = router;