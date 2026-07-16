const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const estudianteMateriaController = require("../controllers/estudianteMateriaController");
const multiSesionController = require("../controllers/multiSesionController");

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
  "/materias/:materiaId/modulos/:moduloId/entrelazados",
  estudianteMateriaController.obtenerEntrelazadosModulo
);

router.post("/ejercicios/:ejercicioId/analisis-ia", estudianteMateriaController.guardarAnalisisIAEjercicio);

router.get("/instancias/:instanciaId/resultado", estudianteMateriaController.obtenerResultadoPorInstanciaId);

// ✅ NUEVO — Obtener caso aleatorio para ejercicio de Informe Clínico
router.post(
  "/ejercicios/:ejercicioId/informe-clinico/obtener-caso",
  estudianteMateriaController.obtenerCasoInformeClinoco
);

/* ===== Multi Sesión (runtime del estudiante) ===== */
router.get(   "/materias/:materiaId/multisesion/:ejercicioId",                     multiSesionController.obtenerEstado);
router.post(  "/materias/:materiaId/multisesion/:ejercicioId/sesion",             multiSesionController.crearSesion);
router.put(   "/materias/:materiaId/multisesion/:ejercicioId/sesion/:sesionId",   multiSesionController.guardarSesion);
router.delete("/materias/:materiaId/multisesion/:ejercicioId/sesion/:sesionId",   multiSesionController.eliminarSesion);
router.put(   "/materias/:materiaId/multisesion/:ejercicioId/plan",               multiSesionController.guardarPlan);
router.post(  "/materias/:materiaId/multisesion/:ejercicioId/completar",          multiSesionController.completar);

module.exports = router;
