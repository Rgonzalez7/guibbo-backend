const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const estudianteMateriaController = require("../controllers/estudianteMateriaController");

router.use(verifyToken, requireRole("estudiante"));

router.get("/dashboard", estudianteMateriaController.dashboardResumen);
router.get("/materias",   estudianteMateriaController.listarMisMaterias);
router.get("/materias/:id/contenido", estudianteMateriaController.obtenerContenidoMateria);

// Buscar ejercicio específico en materia (con detalle para GV)
router.get(
  "/materias/:materiaId/ejercicios/:ejercicioId",
  estudianteMateriaController.buscarEjercicioEnMateria
);

router.post("/ejercicios/:ejercicioId/abrir",     estudianteMateriaController.abrirEjercicio);
router.post("/ejercicios/:ejercicioId/finalizar", estudianteMateriaController.finalizarEjercicio);

router.get(  "/ejercicios/:ejercicioId/borrador", estudianteMateriaController.obtenerBorradorEjercicio);
router.post( "/ejercicios/:ejercicioId/borrador", estudianteMateriaController.guardarBorradorEjercicio);

router.get("/ejercicios/:ejercicioId/resultado", estudianteMateriaController.obtenerResultadoEjercicio);

router.get(
  "/materias/:materiaId/submodulos/:submoduloId/entrelazados",
  estudianteMateriaController.obtenerEntrelazadosSubmodulo
);

router.post("/ejercicios/:ejercicioId/analisis-ia", estudianteMateriaController.guardarAnalisisIAEjercicio);

router.get("/instancias/:instanciaId/resultado", estudianteMateriaController.obtenerResultadoPorInstanciaId);

// ✅ NUEVO — Obtener caso aleatorio para ejercicio de Informe Clínico
router.post(
  "/ejercicios/:ejercicioId/informe-clinico/obtener-caso",
  estudianteMateriaController.obtenerCasoInformeClinoco
);

module.exports = router;
