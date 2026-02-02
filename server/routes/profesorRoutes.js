// server/routes/profesorRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

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
   Rutas generales profesor
   ========================= */

router.get("/materias", verifyToken, listarMateriasProfesor);

router.get(
  "/rendimiento-general",
  verifyToken,
  obtenerRendimientoGeneralProfesor
);

router.get(
  "/estadisticas-curso/:cursoId",
  verifyToken,
  obtenerEstadisticasCursoProfesor
);

/* =========================
   Evaluación de prácticas
   ========================= */

// Módulos del curso
router.get(
  "/evaluacion/curso/:cursoId/modulos",
  verifyToken,
  listarModulosCursoProfesor
);

// Entregas por módulo
router.get(
  "/evaluacion/curso/:cursoId/modulo/:moduloId/entregas",
  verifyToken,
  listarEntregasModuloProfesor
);

// Detalle completo de evaluación por estudiante
router.get(
  "/evaluacion/curso/:cursoId/modulo/:moduloId/estudiante/:estudianteId/detalle",
  verifyToken,
  obtenerDetalleEvaluacionProfesor
);

// Guardar feedback del profesor
router.post(
  "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/feedback",
  verifyToken,
  guardarFeedbackEjercicioProfesor
);

// Marcar ejercicio como rehacer (en_progreso)
router.post(
  "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/rehacer",
  verifyToken,
  marcarRehacerEjercicioProfesor
);

router.post(
    "/evaluacion/ejercicio-instancia/:ejercicioInstanciaId/calificacion-final",
    verifyToken,
    guardarCalificacionFinalEjercicioProfesor
  );

module.exports = router;