// server/routes/superRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');
const superController = require('../controllers/superController');
const moduloController = require('../controllers/moduloController');
const adminModuloController = require('../controllers/adminModuloController');
const sandboxController = require('../controllers/sandboxController');

// Middleware base: todas estas rutas requieren token + rol super
router.use(verifyToken, requireRole('super'));

/* ========== CONFIGURACIÓN MULTER PARA PROYECTIVAS ========== */

const proyectivasStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../uploads/proyectivas');

    // Nos aseguramos de que la carpeta exista
    fs.mkdirSync(dest, { recursive: true });

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  },
});

const proyectivasUpload = multer({
  storage: proyectivasStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen.'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/super/uploads/proyectivas
 * (porque este router está montado en /api/super)
 * Sube una imagen y devuelve la URL pública relativa.
 */
router.post(
  '/uploads/proyectivas', // 👈 OJO: ya no tiene '/super' delante
  proyectivasUpload.single('imagen'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ninguna imagen.' });
    }

    // URL pública relativa (el servidor sirve /uploads en index.js)
    const url = `/uploads/proyectivas/${req.file.filename}`;

    res.status(201).json({
      message: 'Imagen subida correctamente',
      url,
    });
  }
);

/* ===== Universidades ===== */
router.post('/universidades', superController.crearUniversidad);
router.get('/universidades', superController.listarUniversidades);
router.get('/universidades/:id', superController.obtenerUniversidad);
router.put('/universidades/:id', superController.actualizarUniversidad);
router.delete('/universidades/:id', superController.eliminarUniversidad);

/* ===== Usuarios por rol (crear) ===== */
router.post('/usuarios/admin', superController.crearAdminCarrera);
router.post('/usuarios/profesor', superController.crearProfesor);
router.post('/usuarios/estudiante', superController.crearEstudiante);

/* ===== Usuarios por rol (listar) – VAN ANTES de /usuarios/:id ===== */
router.get('/usuarios/admins', superController.listarAdminsCarrera);
router.get('/usuarios/profesores', superController.listarProfesores);
router.get('/usuarios/estudiantes', superController.listarEstudiantes);

/* ===== Usuarios (get / update / delete genérico por id) ===== */
router.get('/usuarios/:id', superController.obtenerUsuario);
router.put('/usuarios/:id', superController.actualizarUsuario);
router.delete('/usuarios/:id', superController.eliminarUsuario);

/* ===== Resumen para el dashboard principal ===== */
router.get('/resumen-dashboard', superController.resumenDashboard);

/* ===== SANDBOX (probar ejercicios sin alumnos/materias/módulos) ===== */
router.get('/sandbox/ejercicios', sandboxController.listarEjerciciosPorTipo);
router.post('/sandbox/informe-clinico/caso', sandboxController.casoInformeClinico);

/* ----- Módulos ----- */
router.get('/modulos', moduloController.listarModulos);
router.post('/modulos', moduloController.crearModulo);
router.get('/modulos/:id', moduloController.obtenerModulo);
router.put('/modulos/:id', moduloController.actualizarModulo);
router.delete('/modulos/:id', moduloController.eliminarModulo);

/* ----- Submódulos ----- */
/* ----- Ejercicios (lista por módulo) ----- */
router.get(
  '/modulos/:moduloId/ejercicios',
  moduloController.listarEjerciciosPorModulo
);

/* ============================================================
   CREAR / ACTUALIZAR EJERCICIOS
   Se usan los handlers de adminModuloController porque son los
   que soportan el esquema actual (casos[], contexto, habilidades,
   herramientas, etc.). Los de moduloController quedaron legacy.
   ============================================================ */

/* ----- Ejercicio tipo "Grabar voz" (Micro-Praxis) ----- */
router.post(
  '/ejercicios/grabar-voz/generar-casos',
  adminModuloController.generarCasosGrabarVoz
);
router.post(
  '/modulos/:moduloId/ejercicios/grabar-voz',
  adminModuloController.crearEjercicioGrabarVozAdmin
);
router.put(
  '/ejercicios/grabar-voz/:id',
  adminModuloController.actualizarEjercicioGrabarVozAdmin
);

/* ----- Ejercicio tipo "Role playing" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/role-play',
  adminModuloController.crearEjercicioRolePlayAdmin
);
router.put(
  '/ejercicios/role-play/:id',
  adminModuloController.actualizarEjercicioRolePlayAdmin
);

/* ----- Ejercicio tipo "Informe clínico" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/informe-clinico',
  adminModuloController.crearEjercicioInformeClinicoAdmin
);
router.put(
  '/ejercicios/informe-clinico/:id',
  adminModuloController.actualizarEjercicioInformeClinicoAdmin
);

/* ----- Ejercicio tipo "Interpretación de frases incompletas" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/interpretacion-frases',
  adminModuloController.crearEjercicioInterpretacionFrasesAdmin
);
router.put(
  '/ejercicios/interpretacion-frases/:id',
  adminModuloController.actualizarEjercicioInterpretacionFrasesAdmin
);

/* ----- Ejercicio tipo "Criterios de diagnóstico" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/criterios-dx',
  adminModuloController.crearEjercicioCriteriosDxAdmin
);
router.put(
  '/ejercicios/criterios-dx/:id',
  adminModuloController.actualizarEjercicioCriteriosDxAdmin
);

/* ----- Ejercicio tipo "Pruebas" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/pruebas',
  adminModuloController.crearEjercicioPruebasAdmin
);
router.put(
  '/ejercicios/pruebas/:id',
  adminModuloController.actualizarEjercicioPruebasAdmin
);

/* ----- Ejercicio tipo "Interpretación proyectivas" ----- */
router.post(
  '/modulos/:moduloId/ejercicios/interpretacion-proyectivas',
  adminModuloController.crearEjercicioInterpretacionProyectivasAdmin
);
router.put(
  '/ejercicios/interpretacion-proyectivas/:id',
  adminModuloController.actualizarEjercicioInterpretacionProyectivasAdmin
);

/* ----- Ejercicio (genérico: obtener / eliminar) ----- */
router.get('/ejercicios/:id', moduloController.obtenerEjercicio);
router.delete('/ejercicios/:id', moduloController.eliminarEjercicio);

module.exports = router;