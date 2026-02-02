// server/controllers/testsController.js
const testsRegistry = require("../services/testsRegistry");
const { randomUUID, randomBytes } = require("crypto");
const Prueba = require("../models/Prueba");
const Test = require("../models/Test");

/**
 * ✅ POST /api/tests/:testId/seguimiento/crear
 * Crea una instancia tipo "Prueba" para seguimiento en vivo desde un test
 * Para UNIVERSIDADES: pacienteId puede ser opcional
 */
exports.crearSeguimiento = async (req, res) => {
    try {
      const { testId } = req.params;
      const { pacienteId = null, pacienteNombre = "Paciente (Universidad)" } = req.body || {};
  
      if (!testId) {
        return res.status(400).json({ ok: false, message: "Falta testId" });
      }
  
      const test = await Test.findOne({ id: testId }).lean();
      if (!test) return res.status(404).json({ ok: false, message: "Test no encontrado" });
  
      const userId = req.user?.id || req.user?._id; // ✅ FIX
      if (!userId) {
        return res.status(401).json({ ok: false, message: "No autenticado (sin userId)" });
      }
  
      const shareToken = randomBytes(24).toString("hex");
      const shareExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
      const prueba = await Prueba.create({
        usuarioId: userId, // ✅ FIX
  
        pacienteId: pacienteId || undefined,
        testId: test.id,
  
        estado: "en_progreso",
        roomId: `room_${randomUUID()}`,
        respuestas: {},
  
        pacienteNombre: pacienteId ? (pacienteNombre || "Paciente") : pacienteNombre,
        testNombre: test.nombre,
  
        shareToken,
        shareExpiresAt,
      });
  
      return res.json({ ok: true, prueba: prueba.toObject() });
    } catch (err) {
      console.warn("[testsController.crearSeguimiento] Error REAL:", err?.message || err);
      return res.status(500).json({ ok: false, message: "Error creando seguimiento" });
    }
  };

/**
 * ✅ GET /api/tests/seguimiento/:pruebaId (privado)
 * Devuelve instancia + test
 */
exports.detalleSeguimiento = async (req, res) => {
  try {
    const { pruebaId } = req.params;

    const prueba = await Prueba.findById(pruebaId).lean();
    if (!prueba) return res.status(404).json({ ok: false, message: "Seguimiento no encontrado" });

    // seguridad: dueño
    const userId = req.user?.id || req.user?._id;

    if (String(prueba.usuarioId) !== String(userId)) {
    return res.status(403).json({ ok: false, message: "No autorizado" });
    }

    const test = await Test.findOne({ id: prueba.testId }).lean();
    return res.json({ ok: true, prueba: { ...prueba, test } });
  } catch (err) {
    console.warn("[testsController.detalleSeguimiento] Error:", err);
    return res.status(500).json({ ok: false, message: "Error obteniendo seguimiento" });
  }
};

/**
 * ✅ POST /api/tests/seguimiento/:pruebaId/rotar-share (privado)
 */
exports.rotarShareSeguimiento = async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { horas = 24, revocar = false } = req.body || {};

    const prueba = await Prueba.findById(pruebaId);
    if (!prueba) return res.status(404).json({ ok: false, message: "Seguimiento no encontrado" });

    const userId = req.user?.id || req.user?._id;
    if (String(prueba.usuarioId) !== String(userId)) {
    return res.status(403).json({ ok: false, message: "No autorizado" });
    }

    if (revocar) {
      prueba.shareToken = undefined;
      prueba.shareExpiresAt = undefined;
    } else {
      prueba.shareToken = randomBytes(24).toString("hex");
      prueba.shareExpiresAt = new Date(Date.now() + Number(horas) * 60 * 60 * 1000);
    }

    await prueba.save();
    return res.json({ ok: true, shareToken: prueba.shareToken, shareExpiresAt: prueba.shareExpiresAt });
  } catch (err) {
    console.error("[testsController.rotarShareSeguimiento] Error:", err);
    return res.status(500).json({ ok: false, message: "Error rotando token" });
  }
};

// helper share
function isShareValid(prueba, token) {
  if (!token) return false;
  if (!prueba?.shareToken) return false;
  if (String(prueba.shareToken) !== String(token)) return false;
  if (prueba.shareExpiresAt && new Date(prueba.shareExpiresAt) < new Date()) return false;
  return true;
}

/**
 * ✅ GET /api/tests/seguimiento/publica/:pruebaId?share=...
 */
exports.getSeguimientoPublico = async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { share } = req.query;

    const prueba = await Prueba.findById(pruebaId).lean();
    if (!prueba) return res.status(404).json({ ok: false, message: "Seguimiento no encontrado" });

    if (!isShareValid(prueba, share)) {
      return res.status(401).json({ ok: false, message: "Link inválido o expirado" });
    }

    const test = await Test.findOne({ id: prueba.testId }).lean();
    return res.json({ ok: true, prueba: { ...prueba, test } });
  } catch (err) {
    console.warn("[testsController.getSeguimientoPublico] Error:", err);
    return res.status(500).json({ ok: false, message: "Error obteniendo seguimiento público" });
  }
};

/**
 * ✅ POST /api/tests/seguimiento/publica/:pruebaId/parcial?share=...
 */
exports.postSeguimientoParcial = async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { share } = req.query;
    const { key, valor } = req.body || {};

    if (!share) return res.status(401).json({ ok: false, message: "Falta share token" });
    if (!key) return res.status(400).json({ ok: false, message: "Falta key" });

    const prueba = await Prueba.findById(pruebaId);
    if (!prueba) return res.status(404).json({ ok: false, message: "Seguimiento no encontrado" });

    if (!isShareValid(prueba, share)) {
      return res.status(401).json({ ok: false, message: "Link inválido o expirado" });
    }

    prueba.respuestas = prueba.respuestas || {};
    prueba.respuestas[key] = valor;
    await prueba.save();

    // ✅ SOCKET EMIT
    const io = req.app.get("io");
    if (io && prueba.roomId) {
    io.to(prueba.roomId).emit("respuesta-parcial", {
        pruebaId: String(prueba._id),
        key,
        valor,
    });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[testsController.postSeguimientoParcial] Error:", err);
    return res.status(500).json({ ok: false, message: "Error guardando parcial" });
  }
};

/**
 * ✅ POST /api/tests/seguimiento/publica/:pruebaId/finalizar?share=...
 */
exports.postSeguimientoFinalizar = async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { share } = req.query;
    const { respuestas } = req.body || {};

    if (!share) return res.status(401).json({ ok: false, message: "Falta share token" });

    const prueba = await Prueba.findById(pruebaId);
    if (!prueba) return res.status(404).json({ ok: false, message: "Seguimiento no encontrado" });

    if (!isShareValid(prueba, share)) {
      return res.status(401).json({ ok: false, message: "Link inválido o expirado" });
    }

    if (respuestas && typeof respuestas === "object") {
      prueba.respuestas = { ...(prueba.respuestas || {}), ...respuestas };
    }

    prueba.estado = "guardada"; // o 'finalizada'
    await prueba.save();

    const io = req.app.get("io");
    if (io && prueba.roomId) {
    io.to(prueba.roomId).emit("prueba-finalizada", {
        pruebaId: String(prueba._id),
    });
    }

    return res.json({ ok: true, prueba });
  } catch (err) {
    console.error("[testsController.postSeguimientoFinalizar] Error:", err);
    return res.status(500).json({ ok: false, message: "Error al finalizar" });
  }
};

exports.catalogo = (req, res) => {
    try {
      const flat = testsRegistry.getFlat();
      const catalog = testsRegistry.getCatalog();
      const debug = testsRegistry.getDebug(); // ✅
  
      res.json({
        loadedAt: new Date().toISOString(),
        flat,
        catalog,
        debug, // ✅
      });
    } catch (e) {
      console.error("❌ [testsController.catalogo]", e);
      res.status(500).json({ message: "Error cargando catálogo" });
    }
  };

exports.detalle = (req, res) => {
  try {
    const id = req.params.id;
    const test = testsRegistry.getTestById(id);
    if (!test) return res.status(404).json({ message: "Test no encontrado" });
    res.json(test);
  } catch (e) {
    console.error("❌ [testsController.detalle]", e);
    res.status(500).json({ message: "Error obteniendo test" });
  }
};

exports.reload = (req, res) => {
  try {
    testsRegistry.ensureLoaded({ force: true });
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ [testsController.reload]", e);
    res.status(500).json({ message: "Error recargando catálogo" });
  }
};