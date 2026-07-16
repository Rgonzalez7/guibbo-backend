const express = require("express");
const router  = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const adminModuloController   = require("../controllers/adminModuloController");
const adminProfesorController = require("../controllers/adminProfesorController");
const adminAlumnoController   = require("../controllers/adminAlumnoController");
const adminMateriaController  = require("../controllers/adminMateriaController");
const importController        = require("../controllers/importController");

router.use(verifyToken);

/* ===========================
   MÓDULOS
   =========================== */
router.get(    "/modulos",     requireRole("director","profesor"), adminModuloController.listarModulosAdmin);
router.post(   "/modulos",     requireRole("director","profesor"), adminModuloController.crearModuloAdmin);
router.get(    "/modulos/:id", requireRole("director","profesor"), adminModuloController.obtenerModuloAdmin);
router.put(    "/modulos/:id", requireRole("director","profesor"), adminModuloController.actualizarModuloAdmin);
router.delete( "/modulos/:id", requireRole("director","profesor"), adminModuloController.eliminarModuloAdmin);

/* ===========================
   SUBMÓDULOS
   =========================== */

/* ===========================
   EJERCICIOS — genérico
   =========================== */
router.get(  "/modulos/:moduloId/ejercicios", requireRole("director","profesor"), adminModuloController.listarEjerciciosAdmin);
router.post( "/modulos/:moduloId/ejercicios", requireRole("director","profesor"), adminModuloController.crearEjercicioAdmin);

/* ===========================
   EJERCICIOS — crear por tipo
   =========================== */
router.post( "/modulos/:moduloId/ejercicios/grabar-voz",         requireRole("director","profesor"), adminModuloController.crearEjercicioGrabarVozAdmin);
router.post( "/ejercicios/grabar-voz/generar-casos",                   requireRole("director","profesor"), adminModuloController.generarCasosGrabarVoz);
router.post( "/modulos/:moduloId/ejercicios/interp-frases",      requireRole("director","profesor"), adminModuloController.crearEjercicioInterpretacionFrasesAdmin);
router.post( "/modulos/:moduloId/ejercicios/role-play",          requireRole("director","profesor"), adminModuloController.crearEjercicioRolePlayAdmin);
router.post( "/modulos/:moduloId/ejercicios/criterios-dx",       requireRole("director","profesor"), adminModuloController.crearEjercicioCriteriosDxAdmin);
router.post( "/modulos/:moduloId/ejercicios/pruebas",            requireRole("director","profesor"), adminModuloController.crearEjercicioPruebasAdmin);
router.post( "/modulos/:moduloId/ejercicios/interp-proyectivas", requireRole("director","profesor"), adminModuloController.crearEjercicioInterpretacionProyectivasAdmin);
router.post( "/modulos/:moduloId/ejercicios/multi-sesion",      requireRole("director","profesor"), adminModuloController.crearEjercicioMultiSesionAdmin);
router.post( "/modulos/:moduloId/ejercicios/informe-clinico",    requireRole("director","profesor"), adminModuloController.crearEjercicioInformeClinicoAdmin);

/* ===========================
   EJERCICIOS — obtener / eliminar
   =========================== */
router.get(    "/ejercicios/:id", requireRole("director","profesor"), adminModuloController.obtenerEjercicioAdmin);
router.delete( "/ejercicios/:id", requireRole("director","profesor"), adminModuloController.eliminarEjercicioAdmin);

/* ===========================
   EJERCICIOS — actualizar por tipo
   =========================== */
router.put( "/ejercicios/grabar-voz/:id",         requireRole("director","profesor"), adminModuloController.actualizarEjercicioGrabarVozAdmin);
router.put( "/ejercicios/interp-frases/:id",      requireRole("director","profesor"), adminModuloController.actualizarEjercicioInterpretacionFrasesAdmin);
router.put( "/ejercicios/role-play/:id",          requireRole("director","profesor"), adminModuloController.actualizarEjercicioRolePlayAdmin);
router.put( "/ejercicios/criterios-dx/:id",       requireRole("director","profesor"), adminModuloController.actualizarEjercicioCriteriosDxAdmin);
router.put( "/ejercicios/pruebas/:id",            requireRole("director","profesor"), adminModuloController.actualizarEjercicioPruebasAdmin);
router.put( "/ejercicios/interp-proyectivas/:id", requireRole("director","profesor"), adminModuloController.actualizarEjercicioInterpretacionProyectivasAdmin);
router.put( "/ejercicios/multi-sesion/:id",      requireRole("director","profesor"), adminModuloController.actualizarEjercicioMultiSesionAdmin);
router.put( "/ejercicios/informe-clinico/:id",    requireRole("director","profesor"), adminModuloController.actualizarEjercicioInformeClinicoAdmin);
router.put( "/ejercicios/:id",                    requireRole("director","profesor"), adminModuloController.actualizarEjercicioAdmin);

/* ===========================
   PROFESORES
   =========================== */
router.get(    "/profesores",     requireRole("director"), adminProfesorController.listarProfesoresAdmin);
router.post(   "/profesores",     requireRole("director"), adminProfesorController.crearProfesorAdmin);
router.get(    "/profesores/:id", requireRole("director"), adminProfesorController.obtenerProfesorAdmin);
router.put(    "/profesores/:id", requireRole("director"), adminProfesorController.actualizarProfesorAdmin);
router.delete( "/profesores/:id", requireRole("director"), adminProfesorController.eliminarProfesorAdmin);

/* ===========================
   ESTUDIANTES
   =========================== */
router.get(    "/estudiantes",     requireRole("director","profesor"), adminAlumnoController.listarEstudiantesAdmin);
router.post(   "/estudiantes",     requireRole("director"),            adminAlumnoController.crearEstudianteAdmin);
router.get(    "/estudiantes/:id", requireRole("director"),            adminAlumnoController.obtenerEstudianteAdmin);
router.put(    "/estudiantes/:id", requireRole("director"),            adminAlumnoController.actualizarEstudianteAdmin);
router.delete( "/estudiantes/:id", requireRole("director"),            adminAlumnoController.eliminarEstudianteAdmin);

/* ===========================
   MATERIAS
   =========================== */
router.post(   "/materias",                   requireRole("director"),            adminMateriaController.crearMateriaAdmin);
router.get(    "/materias",                   requireRole("director"),            adminMateriaController.listarMateriasAdmin);
router.get(    "/materias/:id",               requireRole("director","profesor"), adminMateriaController.obtenerMateriaAdmin);
router.put(    "/materias/:id",               requireRole("director"),            adminMateriaController.actualizarMateriaAdmin);
router.delete( "/materias/:id",               requireRole("director"),            adminMateriaController.eliminarMateriaAdmin);
router.post(   "/materias/:id/modulos",       requireRole("director","profesor"), adminMateriaController.asignarModulosMateriaAdmin);
router.post(   "/materias/:id/estudiantes",   requireRole("director","profesor"), adminMateriaController.agregarEstudiantesMateriaAdmin);
router.delete( "/materias/:id/estudiantes",   requireRole("director","profesor"), adminMateriaController.removerEstudiantesMateriaAdmin); // ✅ NUEVO
router.get(    "/materias/:id/estudiantes",   requireRole("director","profesor"), adminMateriaController.listarEstudiantesMateriaAdmin);

/* ===========================
   CSV
   =========================== */
router.post( "/import/materias",   requireRole("director"), importController.importarMaterias);
router.post( "/import/profesores", requireRole("director"), importController.importarProfesores);
router.post( "/import/alumnos",    requireRole("director"), importController.importarAlumnos);

/* ===========================
   CONTRASEÑAS
   =========================== */
router.post( "/estudiantes/:id/reset-password", requireRole("director"), adminAlumnoController.resetPasswordEstudianteAdmin);
router.post( "/profesores/:id/reset-password",  requireRole("director"), adminProfesorController.resetPasswordProfesorAdmin);

module.exports = router;
