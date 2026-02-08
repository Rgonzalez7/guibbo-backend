// server/routes/estudianteRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const estudianteMateriaController = require("../controllers/estudianteMateriaController");

// ✅ Todas estas rutas son SOLO para estudiante
router.use(verifyToken, requireRole("estudiante"));

router.get("/dashboard", estudianteMateriaController.dashboardResumen);
router.get("/materias", estudianteMateriaController.listarMisMaterias);
router.get("/materias/:id/contenido", estudianteMateriaController.obtenerContenidoMateria);

// ✅ flujo de estado
router.post("/ejercicios/:ejercicioId/abrir", estudianteMateriaController.abrirEjercicio);
router.post("/ejercicios/:ejercicioId/finalizar", estudianteMateriaController.finalizarEjercicio);

// ✅ PERSISTENCIA (draft + resultados)
router.get("/ejercicios/:ejercicioId/borrador", estudianteMateriaController.obtenerBorradorEjercicio);
router.post("/ejercicios/:ejercicioId/borrador", estudianteMateriaController.guardarBorradorEjercicio);

// ✅ vista evaluación/resultado (para cuando el estudiante ya NO entra al ejercicio)
router.get("/ejercicios/:ejercicioId/resultado", estudianteMateriaController.obtenerResultadoEjercicio);

router.get(
  "/materias/:materiaId/submodulos/:submoduloId/entrelazados",
  estudianteMateriaController.obtenerEntrelazadosSubmodulo
);

router.post(
  "/ejercicios/:ejercicioId/analisis-ia",
  estudianteMateriaController.guardarAnalisisIAEjercicio
);

module.exports = router;