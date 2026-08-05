// server/routes/tiendaRoutes.js
// =========================================================
// Tienda compartida por director, profesor y estudiante.
// Cada rol ve únicamente los productos dirigidos a él.
// =========================================================
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const tiendaController = require("../controllers/tiendaController");

router.use(verifyToken, requireRole("director", "profesor", "estudiante"));

/* ========== Catálogo y compra ========== */
router.get("/catalogo", tiendaController.catalogo);
router.post("/comprar", tiendaController.comprar);

/* ========== Historial y permisos ========== */
router.get("/mis-compras", tiendaController.misCompras);
router.get("/mis-permisos", tiendaController.misPermisos);
router.get("/mis-vencimientos", tiendaController.misVencimientos);

/* ========== Prácticas (solo estudiante) ========== */
router.get("/mis-practicas", requireRole("estudiante"), tiendaController.misPracticas);
router.post("/practicas/:id/iniciar", requireRole("estudiante"), tiendaController.iniciarPractica);
router.post("/practicas/:id/finalizar", requireRole("estudiante"), tiendaController.finalizarPractica);

module.exports = router;
