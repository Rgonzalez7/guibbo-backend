
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const Session = require('../models/session');
const { buildPrompt, MODELOS } = require('../utils/analisisIA');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const {
    crearSesion,
    obtenerHistorialSesiones,
    obtenerSesionPorId,
    actualizarFichaTecnica,
    actualizarHistorialClinico,
    actualizarMinuta
  } = require('../controllers/sessionController');

 // routes/sessionRoutes.js
router.get('/debug/todas', async (req, res) => {
    try {
      const sesiones = await require('../models/session').find();
      // 🔍 Imprimir en consola todos los IDs
      console.log('\n🧾 Lista de IDs de sesiones:');
      sesiones.forEach(s => {
        console.log(`➡️  ID: ${s._id.toString()} | Usuario: ${s.userId} | Tipo: ${s.tipo}`);
      });
  
      res.json(sesiones);
    } catch (error) {
      console.error('❌ Error al obtener sesiones:', error.message);
      res.status(500).json({ message: 'Error al obtener sesiones', error: error.message });
    }
  });

// Ruta para crear una nueva sesión
router.post('/crear', verifyToken, crearSesion);

// Obtener historial y detalle de sesiones
router.get('/historial', verifyToken, obtenerHistorialSesiones);
router.get('/:id', verifyToken, obtenerSesionPorId);

router.put('/:id/actualizar-ficha', actualizarFichaTecnica);

router.put('/:id/actualizar-historial', verifyToken, actualizarHistorialClinico);

router.put('/:id/actualizar-minuta', verifyToken, actualizarMinuta);

// Helper de parseo robusto
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // intenta extraer el primer bloque {...}
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('No JSON found in model output');
    return JSON.parse(m[0]);
  }
}

router.post('/:id/analizarIA', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { modeloSeleccionado } = req.body;

    if (!modeloSeleccionado || !MODELOS.includes(modeloSeleccionado)) {
      return res.status(400).json({
        ok: false,
        message: 'Modelo inválido. Usa uno de: ' + MODELOS.join(' | ')
      });
    }

    const Session = require('../models/session'); // (por si no lo tienes arriba)
    const sesion = await Session.findById(id).lean();
    if (!sesion) return res.status(404).json({ ok: false, message: 'Sesión no encontrada' });

    const prompt = buildPrompt({
      fichaTecnica: sesion.fichaTecnica,
      historialClinico: sesion.historialClinico,
      minuta: sesion.minuta,
      transcripcion: sesion.transcripcion
    }, modeloSeleccionado);

    let parsed;

    // 4) Modo mock si no hay API KEY
    if (!process.env.OPENAI_API_KEY) {
      parsed = {
        evaluacionGeneral: "Mock: evaluación narrativa equilibrando aciertos y quiebres...",
        tecnicasConversacionales: {
          parafrasis: "Mock: hubo buenos reflejos de contenido.",
          reflejo: "Mock: reflejos de sentimiento en 2 ocasiones.",
          empatia: "Mock: validaciones con propósito.",
          preguntasAbiertas: "Mock: varias preguntas 'qué' y 'cómo'.",
          revelacion: "Mock: no hubo; podría ser útil.",
          humor: "Mock: no se utilizó.",
          sarcasmo: "Mock: no se percibe.",
          confrontacion: "Mock: una confrontación suave bien calibrada.",
          quiebresTerapeuticos: "Mock: un microquiebre y reparación rápida.",
          fluidez: "Mock: buen hilo, sin repetirse."
        },
        coberturaTematica: {
          motivoConsulta: "Explorado",
          infancia: "Parcial",
          familia: "Sí",
          ocupacionEstudios: "Sí",
          pareja: "Parcial",
          hijos: "No aplica",
          sexualidad: "No",
          creenciasValores: "Parcial"
        },
        analisisPorModelo: {
          modelo: modeloSeleccionado,
          loEsperado: ["..."],
          observado: "Mock: alineado parcialmente.",
          errores: "Mock: faltó X del modelo.",
          sugerencias: "Mock: incorporar Y/Z."
        },
        sintesisFinal: {
          fortalezas: ["Vinculación empática", "Reflejos bien usados"],
          areasDeMejora: ["Mayor exploración de infancia", "Más preguntas abiertas"]
        }
      };
    } else {
      // 5) Llamada real a OpenAI
      const resp = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        response_format: { type: 'json_object' },
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Eres un supervisor clínico experto en psicoterapia. Responde SOLO con JSON.' },
          { role: 'user', content: prompt }
        ]
      });

      const content = resp?.choices?.[0]?.message?.content || '{}';
      parsed = safeParseJSON(content);
    }

    // 6) Guardar resultado
    await Session.findByIdAndUpdate(id, {
      analisisIA: {
        enfoque: modeloSeleccionado,
        resultado: parsed,
        fechaAnalisis: new Date()
      }
    });

    return res.json({ ok: true, analisis: parsed });
  } catch (err) {
    console.error('❌ Error analizando sesión:', err);
    return res.status(500).json({ ok: false, message: 'Error analizando sesión' });
  }
});

module.exports = router;