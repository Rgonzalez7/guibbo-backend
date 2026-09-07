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
const promptIAController = require('../controllers/promptIAController');
const ventaInstitucionalController = require('../controllers/ventaInstitucionalController');
const pmController = require('../controllers/pmController');

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

/* ========== CONTROL DE PROYECTO (PM) ========== */

const pmStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // index.js sirve /uploads desde public/uploads: si se guarda en
    // ../uploads las imágenes se suben pero devuelven 404.
    const dest = path.join(__dirname, '../public/uploads/pm');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  },
});

const pmUpload = multer({
  storage: pmStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB: son capturas de pantalla
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen.'));
    }
    cb(null, true);
  },
});

router.post('/pm/uploads', pmUpload.array('imagenes', 10), (req, res) => {
  const archivos = Array.isArray(req.files) ? req.files : [];
  if (!archivos.length) {
    return res.status(400).json({ message: 'No se subió ninguna imagen.' });
  }
  res.status(201).json({
    message: 'Imágenes subidas correctamente',
    adjuntos: archivos.map((f) => ({
      url: `/uploads/pm/${f.filename}`,
      nombre: f.originalname,
    })),
  });
});

router.get('/pm/tablero', pmController.tablero);
router.get('/pm/resumen', pmController.resumen);
router.get('/pm/tareas', pmController.listar);
router.post('/pm/tareas', pmController.crear);
router.get('/pm/tareas/:id', pmController.obtener);
router.put('/pm/tareas/:id', pmController.actualizar);
router.patch('/pm/tareas/:id/estado', pmController.mover);
router.delete('/pm/tareas/:id', pmController.eliminar);

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
router.put('/modulos/:id/convertir-producto', moduloController.convertirEnProducto);
router.put('/modulos/:id/revertir-producto', moduloController.revertirConversion);
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
  '/modulos/:moduloId/ejercicios/multi-sesion',
  adminModuloController.crearEjercicioMultiSesionAdmin
);
router.put(
  '/ejercicios/multi-sesion/:id',
  adminModuloController.actualizarEjercicioMultiSesionAdmin
);

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

/* ========== PROMPTS DE IA ========== */
router.get('/prompts', promptIAController.listarPrompts);
router.get('/prompts/:clave', promptIAController.obtenerPrompt);
router.put('/prompts/:clave', promptIAController.actualizarPrompt);
router.post('/prompts/:clave/restaurar', promptIAController.restaurarPrompt);
router.post('/prompts/:clave/vista-previa', promptIAController.vistaPrevia);

/* ========== VENTA INSTITUCIONAL ========== */
// Catálogo de productos
router.get('/venta/productos', ventaInstitucionalController.listarProductos);
router.post('/venta/productos', ventaInstitucionalController.crearProducto);
router.put('/venta/productos/:id', ventaInstitucionalController.actualizarProducto);
router.delete('/venta/productos/:id', ventaInstitucionalController.eliminarProducto);
router.put('/venta/productos/:id/reactivar', ventaInstitucionalController.reactivarProducto);
router.delete('/venta/productos/:id/borrar', ventaInstitucionalController.borrarProducto);

// Módulos que se pueden incluir en un producto
router.get('/venta/modulos-vendibles', ventaInstitucionalController.modulosVendibles);

// Licencias
router.get('/venta/licencias', ventaInstitucionalController.listarLicencias);
router.post('/venta/licencias', ventaInstitucionalController.emitirLicencia);
router.put('/venta/licencias/:id', ventaInstitucionalController.actualizarLicencia);
router.put('/venta/licencias/:id/pago', ventaInstitucionalController.cambiarEstadoPago);
router.put('/venta/licencias/:id/vigencia', ventaInstitucionalController.extenderVigencia);
router.delete('/venta/licencias/:id', ventaInstitucionalController.revocarLicencia);
router.delete('/venta/licencias/:id/eliminar', ventaInstitucionalController.eliminarLicencia);
router.put('/venta/licencias/:id/reactivar', ventaInstitucionalController.reactivarLicencia);

// Control por universidad
router.get('/venta/universidades', ventaInstitucionalController.resumenUniversidades);

// Órdenes (incluye las compras hechas desde la tienda)
router.get('/venta/ordenes', ventaInstitucionalController.listarOrdenes);
router.delete('/venta/ordenes/:id', ventaInstitucionalController.eliminarOrden);

module.exports = router;
