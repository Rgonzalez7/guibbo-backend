// server/controllers/sandboxController.js
//
// Endpoints exclusivos del "sandbox" del súper usuario para probar ejercicios
// sin necesidad de crear alumnos / materias / módulos / instancias.
//
// No persiste nada y no consume cupos. La IA de análisis se reutiliza vía los
// controladores de IA existentes (con el flag esTutorial).

const CASOS_INFORME_CLINICO = require("../data/casosInformeClinico");
const { Ejercicio } = require("../models/modulo");

// Mapa: clave del sandbox -> strings de tipoEjercicio en la BD
const TIPO_MAP = {
  roleplay: ["Role playing persona", "Role Playing IA"],
  grabar_voz: ["Grabar voz"],
  informe_clinico: ["Informe clínico"],
};

/**
 * GET /api/super/sandbox/ejercicios?tipo=roleplay|grabar_voz|informe_clinico
 * Lista TODOS los ejercicios del tipo indicado que existan en la BD (global),
 * con el contexto de submódulo/módulo para mostrarlos. No filtra por universidad.
 */
exports.listarEjerciciosPorTipo = async (req, res) => {
  try {
    const tipo = String(req.query.tipo || "").trim();
    const tipos = TIPO_MAP[tipo];
    if (!tipos) {
      return res.status(400).json({ message: "Tipo inválido. Usa: roleplay, grabar_voz o informe_clinico." });
    }

    const ejercicios = await Ejercicio.find({ tipoEjercicio: { $in: tipos } })
      .sort({ createdAt: -1, _id: -1 })
      .populate({ path: "submodulo", populate: { path: "modulo" } })
      .lean();

    const items = (ejercicios || []).map((e) => ({
      _id: e._id,
      titulo: e.titulo,
      tipoEjercicio: e.tipoEjercicio,
      tiempo: e.tiempo || 0,
      submoduloTitulo: e?.submodulo?.titulo || "",
      moduloTitulo: e?.submodulo?.modulo?.titulo || "",
    }));

    return res.json({ tipo, total: items.length, ejercicios: items });
  } catch (err) {
    console.error("❌ sandbox listarEjerciciosPorTipo error:", err);
    return res.status(500).json({ message: err?.message || "Error al listar ejercicios." });
  }
};

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
