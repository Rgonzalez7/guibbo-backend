// server/routes/iaRoutes.js
const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const verifyToken = require("../middlewares/verifyToken");

const { generarConsejoDiario } = require("../controllers/consejoDiarioController");

// ✅ Consejo diario con IA (máx 3 por día - lo controla el controller)
router.post("/consejo-diario", verifyToken, generarConsejoDiario);

// ✅ (Opcional) protege también el análisis IA
router.post("/analizar/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { enfoque } = req.body;

    const sesion = await Session.findById(id);
    if (!sesion) return res.status(404).json({ message: "Sesión no encontrada" });

    const resultado = `
✅ Fortalezas:
• Presentación cálida y empática.
• Buena invitación a explorar el motivo de consulta.

🟡 Áreas de mejora:
• Usar más paráfrasis afectiva.
• Evitar repetir preguntas similares.

🧭 Nivel general: Intervención apropiada, con buena escucha inicial.

🌱 Sugerencia: “Gracias por confiar en mí. ¿Qué te gustaría trabajar hoy?”
`.trim();

    sesion.analisisIA = { enfoque, resultado, fechaAnalisis: new Date() };
    await sesion.save();

    res.json({ message: "Análisis generado", analisis: sesion.analisisIA });
  } catch (err) {
    console.error("❌ Error en análisis IA:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;