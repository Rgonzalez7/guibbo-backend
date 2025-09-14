// routes/pruebasRoutes.js
const express = require('express');
const router = express.Router();
const { randomUUID, randomBytes } = require('crypto');
const verifyToken = require('../middlewares/verifyToken');
const Prueba = require('../models/Prueba');
const Test = require('../models/Test');
const Paciente = require('../models/paciente');

// Crear (en_progreso) — requiere paciente y usuario
router.post('/crear', verifyToken, async (req, res) => {
  try {
    const { pacienteId, testId } = req.body;
    if (!pacienteId || !testId) {
      return res.status(400).json({ ok:false, message: 'Faltan datos' });
    }

    const test = await Test.findOne({ id: testId });
    if (!test) return res.status(404).json({ ok:false, message: 'Test no encontrado' });

    const paciente = await Paciente.findById(pacienteId).select('_id nombreCompleto');
    if (!paciente) return res.status(404).json({ ok:false, message: 'Paciente no encontrado' });

    // --- share token + expiración (ej. 48h) ---
    const shareToken = randomBytes(24).toString('hex');     
    const shareExpiresAt = new Date(Date.now() + 24*60*60*1000);

    const prueba = await Prueba.create({
      usuarioId: req.user.id,
      pacienteId,
      testId,
      estado: 'en_progreso',
      roomId: `room_${randomUUID()}`,
      respuestas: {},
      pacienteNombre: paciente.nombreCompleto,
      testNombre: test.nombre,
      shareToken,
      shareExpiresAt
    });

    // Devuelve el token para armar el link público
    res.json({ ok: true, prueba: prueba.toObject() });
  } catch (err) {
    console.warn('[POST /api/pruebas/crear] Error:', err);
    res.status(500).json({ ok:false, message: 'Error creando prueba' });
  }
});

// Guardar (crea o actualiza)
router.post('/guardar', verifyToken, async (req, res) => {
  try {
    const { pruebaId, pacienteId, testId, respuestas } = req.body;

    if (!pacienteId || !testId) {
      return res.status(400).json({ ok: false, message: 'Faltan datos' });
    }

    const test = await Test.findOne({ id: testId });
    if (!test) return res.status(404).json({ ok: false, message: 'Test no encontrado' });

    const paciente = await Paciente.findById(pacienteId).select('nombreCompleto');
    if (!paciente) return res.status(404).json({ ok: false, message: 'Paciente no encontrado' });

    let prueba;
    if (pruebaId) {
      prueba = await Prueba.findById(pruebaId);
      if (!prueba) return res.status(404).json({ ok: false, message: 'Prueba no encontrada' });

      prueba.respuestas = respuestas || prueba.respuestas || {};
      prueba.estado = 'guardada';
      prueba.pacienteNombre = paciente.nombreCompleto;
      prueba.testNombre = test.nombre;
      if (!prueba.usuarioId) prueba.usuarioId = req.user.id; // compatibilidad
      await prueba.save();
    } else {
      prueba = await Prueba.create({
        usuarioId: req.user.id,
        pacienteId,
        testId,
        estado: 'guardada',
        respuestas: respuestas || {},
        pacienteNombre: paciente.nombreCompleto,
        testNombre: test.nombre
      });
    }

    res.json({ ok: true, prueba });
  } catch (err) {
    console.warn('[POST /api/pruebas/guardar] Error:', err);
    res.status(500).json({ ok: false, message: 'Error guardando prueba' });
  }
});

// Obtener detalle de prueba (usa token porque el frontend ahora envía Authorization)
router.get('/:pruebaId', verifyToken, async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const prueba = await Prueba.findById(pruebaId).lean();
    if (!prueba) return res.status(404).json({ ok:false, message: 'Prueba no encontrada' });

    const test = await Test.findOne({ id: prueba.testId }).lean();
    res.json({ ok: true, prueba: { ...prueba, test } });
  } catch (err) {
    console.warn('[GET /api/pruebas/:id] Error:', err);
    res.status(500).json({ ok:false, message: 'Error obteniendo prueba' });
  }
});

// Eliminar prueba
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prueba = await Prueba.findById(id);
    if (!prueba) return res.status(404).json({ ok: false, message: 'Prueba no encontrada' });

    // asegura que el dueño sea el usuario autenticado
    if (String(prueba.usuarioId) !== String(req.user.id)) {
      return res.status(403).json({ ok: false, message: 'No autorizado' });
    }

    await Prueba.deleteOne({ _id: id });
    return res.json({ ok: true, message: 'Prueba eliminada' });
  } catch (err) {
    console.error('[DELETE /api/pruebas/:id] Error:', err);
    return res.status(500).json({ ok: false, message: 'Error eliminando prueba' });
  }
});

router.post('/:id/interpretacion', verifyToken, async (req, res) => {
    try {
      const { id } = req.params; // pruebaId
      const { texto, metodoMedicion, diccionario } = req.body;
  
      if (typeof texto !== 'string') {
        return res.status(400).json({ ok: false, message: 'Texto de interpretación inválido' });
      }
  
      const prueba = await Prueba.findById(id);
      if (!prueba) return res.status(404).json({ ok: false, message: 'Prueba no encontrada' });
  
      // Asegura que la prueba pertenece al usuario autenticado
      if (String(prueba.usuarioId) !== String(req.user.id)) {
        return res.status(403).json({ ok: false, message: 'No autorizado' });
      }
  
    prueba.interpretacion = {
        texto: String(texto ?? ''),
        metodoMedicion: String(metodoMedicion ?? ''),
        diccionario: diccionario && typeof diccionario === 'object' ? diccionario : {},
        actualizadoEn: new Date()
    };
    await prueba.save();
  
      return res.json({ ok: true, message: 'Interpretación guardada', prueba });
    } catch (err) {
      console.error('[POST /api/pruebas/:id/interpretacion] Error:', err);
      return res.status(500).json({ ok: false, message: 'Error guardando interpretación' });
    }
  });

router.get('/publica/:pruebaId', async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { share } = req.query;
    if (!share) {
      return res.status(401).json({ ok:false, message: 'Acceso denegado. Falta share token.' });
    }

    const prueba = await Prueba.findById(pruebaId).lean();
    if (!prueba) {
      return res.status(404).json({ ok:false, message: 'Prueba no encontrada' });
    }

    // valida token + expiración
    const now = new Date();
    if (prueba.shareToken !== share) {
      return res.status(401).json({ ok:false, message: 'Token inválido' });
    }
    if (prueba.shareExpiresAt && now > new Date(prueba.shareExpiresAt)) {
      return res.status(401).json({ ok:false, message: 'Enlace expirado' });
    }

    // Adjunta el test para render
    const test = await Test.findOne({ id: prueba.testId }).lean();
    return res.json({
      ok: true,
      prueba: {
        ...prueba,
        test
      }
    });
  } catch (err) {
    console.warn('[GET /api/pruebas/publica/:id] Error:', err);
    res.status(500).json({ ok:false, message: 'Error obteniendo prueba pública' });
  }
});

router.post('/:pruebaId/rotar-share', verifyToken, async (req, res) => {
  try {
    const { pruebaId } = req.params;
    const { horas = 48, revocar = false } = req.body; // revocar=true elimina token

    const prueba = await Prueba.findById(pruebaId);
    if (!prueba) return res.status(404).json({ ok:false, message: 'Prueba no encontrada' });
    if (String(prueba.usuarioId) !== String(req.user.id)) {
      return res.status(403).json({ ok:false, message: 'No autorizado' });
    }

    if (revocar) {
      prueba.shareToken = undefined;
      prueba.shareExpiresAt = undefined;
    } else {
      prueba.shareToken = randomBytes(24).toString('hex');
      prueba.shareExpiresAt = new Date(Date.now() + Number(horas)*60*60*1000);
    }

    await prueba.save();
    res.json({ ok:true, shareToken: prueba.shareToken, shareExpiresAt: prueba.shareExpiresAt });
  } catch (err) {
    console.error('[POST /api/pruebas/:id/rotar-share] Error:', err);
    res.status(500).json({ ok:false, message: 'Error rotando token' });
  }
});

// --- helpers ---
const isShareValid = (prueba, token) => {
  if (!prueba?.shareToken) return false;
  if (String(prueba.shareToken) !== String(token)) return false;
  if (prueba.shareExpiresAt && new Date(prueba.shareExpiresAt) < new Date()) return false;
  return true;
};

// --- GET pública: devuelve prueba + test si token válido ---
router.get('/publica/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { share } = req.query;
    const prueba = await Prueba.findById(id).lean();
    if (!prueba) return res.status(404).json({ ok:false, message:'Prueba no encontrada' });
    if (!isShareValid(prueba, share)) {
      return res.status(401).json({ ok:false, message:'Link inválido o expirado' });
    }
    const test = await Test.findOne({ id: prueba.testId }).lean();
    return res.json({ ok:true, prueba: { ...prueba, test } });
  } catch (e) {
    console.error('[GET /api/pruebas/publica/:id] Error:', e);
    return res.status(500).json({ ok:false, message:'Error obteniendo prueba pública' });
  }
});

// Guardado parcial público
router.post('/publica/:id/parcial', async (req, res) => {
  try {
    const { id } = req.params;            // pruebaId
    const { share } = req.query;          // shareToken
    const { key, valor } = req.body;

    if (!share) return res.status(401).json({ ok:false, message: 'Acceso denegado. Falta share token.' });
    if (!key)   return res.status(400).json({ ok:false, message: 'Falta key' });

    const prueba = await Prueba.findById(id);
    if (!prueba) return res.status(404).json({ ok:false, message: 'Prueba no encontrada' });
    if (!prueba.shareToken || String(prueba.shareToken) !== String(share))
      return res.status(401).json({ ok:false, message: 'Token inválido' });
    if (prueba.shareExpiresAt && prueba.shareExpiresAt < new Date())
      return res.status(401).json({ ok:false, message: 'Enlace expirado' });

    // set anidado: respuestas.key = valor
    prueba.respuestas = prueba.respuestas || {};
    prueba.respuestas[key] = valor;
    await prueba.save();

    return res.json({ ok:true });
  } catch (e) {
    console.error('[POST publica/:id/parcial] Error:', e);
    return res.status(500).json({ ok:false, message: 'Error guardando parcial' });
  }
});

// Finalizar público (guarda TODO y marca estado)
router.post('/publica/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { share } = req.query;
    const { respuestas } = req.body || {};

    if (!share) return res.status(401).json({ ok:false, message: 'Acceso denegado. Falta share token.' });

    const prueba = await Prueba.findById(id);
    if (!prueba) return res.status(404).json({ ok:false, message: 'Prueba no encontrada' });
    if (!prueba.shareToken || String(prueba.shareToken) !== String(share))
      return res.status(401).json({ ok:false, message: 'Token inválido' });
    if (prueba.shareExpiresAt && prueba.shareExpiresAt < new Date())
      return res.status(401).json({ ok:false, message: 'Enlace expirado' });

    // mergea respuestas completas si vienen en el body
    if (respuestas && typeof respuestas === 'object') {
      prueba.respuestas = { ...(prueba.respuestas || {}), ...respuestas };
    }

    prueba.estado = 'guardada'; // o 'finalizada' si prefieres
    await prueba.save();

    return res.json({ ok:true, prueba });
  } catch (e) {
    console.error('[POST publica/:id/finalizar] Error:', e);
    return res.status(500).json({ ok:false, message: 'Error al finalizar' });
  }
});

module.exports = router;