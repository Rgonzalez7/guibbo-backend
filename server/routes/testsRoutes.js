// server/routes/testsRoutes.js
const express = require("express");
const router = express.Router();

const testsController = require("../controllers/testsController");
const verifyToken = require("../middlewares/verifyToken");

// ✅ DEBUG opcional (puedes dejarlo)
router.use((req, _res, next) => {
  console.log("✅ [testsRoutes] hit:", req.method, req.originalUrl);
  next();
});

// ✅ IMPORTANTE: primero rutas fijas (catálogo)
router.get("/catalog", testsController.catalogo);
router.post("/reload", testsController.reload);

/* =========================================================
   ✅ SEGUIMIENTO EN VIVO (Universidades) — cuelga de /api/tests
   ========================================================= */

// Crear una "instancia" (Prueba) para seguimiento en vivo desde un testId
// POST /api/tests/:testId/seguimiento/crear   (privada, requiere JWT)
router.post("/:testId/seguimiento/crear", verifyToken, testsController.crearSeguimiento);

// Detalle privado de la instancia (para el psicólogo)
// GET /api/tests/seguimiento/:pruebaId   (privada, requiere JWT)
router.get("/seguimiento/:pruebaId", verifyToken, testsController.detalleSeguimiento);

// Rotar/revocar link (privada, requiere JWT)
// POST /api/tests/seguimiento/:pruebaId/rotar-share
router.post("/seguimiento/:pruebaId/rotar-share", verifyToken, testsController.rotarShareSeguimiento);

// Pública: cargar instancia + test (paciente)
// GET /api/tests/seguimiento/publica/:pruebaId?share=...
router.get("/seguimiento/publica/:pruebaId", testsController.getSeguimientoPublico);

// Pública: guardar parcial
// POST /api/tests/seguimiento/publica/:pruebaId/parcial?share=...
router.post("/seguimiento/publica/:pruebaId/parcial", testsController.postSeguimientoParcial);

// Pública: finalizar
// POST /api/tests/seguimiento/publica/:pruebaId/finalizar?share=...
router.post("/seguimiento/publica/:pruebaId/finalizar", testsController.postSeguimientoFinalizar);

/* ===========================
   ✅ al final el comodín (detalle del test)
   =========================== */
router.get("/:id", testsController.detalle);

module.exports = router;