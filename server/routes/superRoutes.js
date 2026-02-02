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

/* ----- Módulos ----- */
router.get('/modulos', moduloController.listarModulos);
router.post('/modulos', moduloController.crearModulo);
router.get('/modulos/:id', moduloController.obtenerModulo);
router.put('/modulos/:id', moduloController.actualizarModulo);
router.delete('/modulos/:id', moduloController.eliminarModulo);

/* ----- Submódulos ----- */
router.get(
  '/modulos/:moduloId/submodulos',
  moduloController.listarSubmodulosPorModulo
);
router.post(
  '/modulos/:moduloId/submodulos',
  moduloController.crearSubmodulo
);
router.put('/submodulos/:id', moduloController.actualizarSubmodulo);
router.delete('/submodulos/:id', moduloController.eliminarSubmodulo);

/* ----- Ejercicios (lista por submódulo) ----- */
router.get(
  '/submodulos/:submoduloId/ejercicios',
  moduloController.listarEjerciciosPorSubmodulo
);

/* ----- Ejercicio tipo "Grabar voz" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/grabar-voz',
  moduloController.crearEjercicioGrabarVoz
);
router.put(
  '/ejercicios/grabar-voz/:id',
  moduloController.actualizarEjercicioGrabarVoz
);

/* ----- Ejercicio tipo "Interpretación de frases incompletas" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/interpretacion-frases',
  moduloController.crearEjercicioInterpretacionFrases
);
router.put(
  '/ejercicios/interpretacion-frases/:id',
  moduloController.actualizarEjercicioInterpretacionFrases
);

/* ----- Ejercicio tipo "Role playing" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/role-play',
  moduloController.crearEjercicioRolePlay
);
router.put(
  '/ejercicios/role-play/:id',
  moduloController.actualizarEjercicioRolePlay
);

/* ----- Ejercicio tipo "Criterios de diagnóstico" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/criterios-dx',
  moduloController.crearEjercicioCriteriosDx
);
router.put(
  '/ejercicios/criterios-dx/:id',
  moduloController.actualizarEjercicioCriteriosDx
);

/* ----- Ejercicio tipo "Pruebas" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/pruebas',
  moduloController.crearEjercicioPruebas
);
router.put(
  '/ejercicios/pruebas/:id',
  moduloController.actualizarEjercicioPruebas
);

/* ----- Ejercicio tipo "Interpretación proyectivas" ----- */
router.post(
  '/submodulos/:submoduloId/ejercicios/interpretacion-proyectivas',
  moduloController.crearEjercicioInterpretacionProyectivas
);
router.put(
  '/ejercicios/interpretacion-proyectivas/:id',
  moduloController.actualizarEjercicioInterpretacionProyectivas
);

/* ----- Ejercicio (genérico: obtener / eliminar) ----- */
router.get('/ejercicios/:id', moduloController.obtenerEjercicio);
router.delete('/ejercicios/:id', moduloController.eliminarEjercicio);

module.exports = router;