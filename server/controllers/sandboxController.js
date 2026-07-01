// server/controllers/sandboxController.js
//
// Endpoints exclusivos del "sandbox" del súper usuario para probar ejercicios
// sin necesidad de crear alumnos / materias / módulos / instancias.
//
// No persiste nada y no consume cupos. La IA de análisis se reutiliza vía los
// controladores de IA existentes (con el flag esTutorial).

const CASOS_INFORME_CLINICO = require("../data/casosInformeClinico");

/**
 * POST /api/super/sandbox/informe-clinico/caso
 * Devuelve un caso clínico del banco (aleatorio por defecto).
 * Body opcional: { indice }  -> fuerza un caso específico.
 * No requiere instancia ni trackea casos usados.
 */
exports.casoInformeClinico = async (req, res) => {
  try {
    const casos = Array.isArray(CASOS_INFORME_CLINICO) ? CASOS_INFORME_CLINICO : [];
    if (!casos.length) {
      return res.status(404).json({ message: "No hay casos disponibles en el banco." });
    }

    const { indice } = req.body || {};
    let idx;
    if (indice != null && Number.isInteger(Number(indice))) {
      idx = Math.max(0, Math.min(casos.length - 1, Number(indice)));
    } else {
      idx = Math.floor(Math.random() * casos.length);
    }

    return res.json({ caso: casos[idx], indice: idx, total: casos.length, esNuevo: true });
  } catch (err) {
    console.error("❌ sandbox casoInformeClinico error:", err);
    return res.status(500).json({ message: err?.message || "Error al obtener el caso." });
  }
};
