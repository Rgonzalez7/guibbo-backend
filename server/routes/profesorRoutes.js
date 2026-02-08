// server/routes/profesorRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

/* =========================
   Controllers
   ========================= */

// Materias / Dashboard profesor
const {
  listarMateriasProfesor,
  obtenerRendimientoGeneralProfesor,
  obtenerEstadisticasCursoProfesor,
} = require("../controllers/ProfesorMateriaController");

// Evaluación de módulos / ejercicios
const {
  listarModulosCursoProfesor,
  listarEntregasModuloProfesor,
  obtenerDetalleEvaluacionProfesor,
  guardarFeedbackEjercicioProfesor,
  marcarRehacerEjercicioProfesor,
  guardarCalificacionFinalEjercicioProfesor,
} = require("../controllers/ProfesorEvaluacionController");

/* =========================
   Middleware base
   ✅ profesor
   ========================= */
router.use(verifyToken, requireRole("profesor"));

/* =========================
   Rutas generales profesor
   ========================= */

router.get("/materias", listarMateriasProfesor);

router.get("/rendimiento-general", obtenerRendimientoGeneralProfesor);

router.get("/estadisticas-curso/:cursoId", obtenerEstadisticasCursoProfesor);

/* =========================
   Evaluación de prácticas
   ========================= */

// Módulos del curso
router.get(
  "/evaluacion/curso/:cursoId/modulos",
  listarModulosCursoProfesor
);

// Entregas por módulo
router.get(
  "/evaluacion/curso/:cursoId/modulo/:moduloId/entregas",
  listarEntregasModuloProfesor
);

// Detalle completo de evaluación por estudiante
router.get(
  "/evaluacion/curso/:cursoId/modulo/:moduloId/estudiante/:estudianteId/detalle",
  obtenerDetalleEvaluacionProfesor
);

// Guardar feedback del profesor
router.post(
  "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/feedback",
  guardarFeedbackEjercicioProfesor
);

// Marcar ejercicio como rehacer (en_progreso)
router.post(
  "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/rehacer",
  marcarRehacerEjercicioProfesor
);

// Guardar calificación final
router.post(
  "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/calificacion-final",
  guardarCalificacionFinalEjercicioProfesor
);

module.exports = router;