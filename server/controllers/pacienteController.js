const Paciente = require('../models/paciente');
const Session = require('../models/session');
const SesionIntervencion = require('../models/SesionIntervencion'); 
const CuadroConvergencia = require('../models/CuadroConvergencia');
const HipotesisDiagnostica = require('../models/HipotesisDiagnostica');
const DiagnosticoFinal = require('../models/DiagnosticoFinal');
const Prueba = require('../models/Prueba');

// Crear nuevo paciente
exports.crearPaciente = async (req, res) => {
  try {
    const {
      nombreCompleto,
      fechaNacimiento,
      edad,
      genero,
      estadoCivil,
      lugarResidencia,
      ocupacion,
      periodoEvaluacion,
      motivoConsulta,
      instrumentos
    } = req.body;

    if (!nombreCompleto || !fechaNacimiento || !genero) {
      return res.status(400).json({ message: 'Faltan datos obligatorios del paciente.' });
    }

    const nuevoPaciente = new Paciente({
      nombreCompleto,
      fechaNacimiento,
      edad,
      genero,
      estadoCivil,
      lugarResidencia,
      ocupacion,
      periodoEvaluacion,
      motivoConsulta,
      instrumentos,
      usuarioId: req.user.id
    });

    await nuevoPaciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (err) {
    console.error('[crearPaciente]', err);
    res.status(500).json({ message: 'Error al crear paciente.' });
  }
};

// Obtener pacientes del usuario autenticado con paginación
exports.obtenerPacientes = async (req, res) => {
  try {
    const { nombre } = req.query;

    // MODO AUTOSUGERENCIA (cuando viene ?nombre= y al menos 2 letras)
    if (typeof nombre === 'string' && nombre.trim().length >= 2) {
      const safe = nombre.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escapar regex
      const q = {
        usuarioId: req.user.id,
        nombreCompleto: { $regex: safe, $options: 'i' }
      };

      const resultados = await Paciente
        .find(q)
        .select('_id nombreCompleto')
        .limit(20)
        .lean();

      return res.json(resultados); // <-- Array para el autosuggest
    }

    // MODO LISTADO PAGINADO (sin ?nombre=)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const baseQ = { usuarioId: req.user.id };

    const [pacientes, total] = await Promise.all([
      Paciente.find(baseQ).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Paciente.countDocuments(baseQ)
    ]);

    return res.json({
      pacientes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + pacientes.length < total
    });
  } catch (err) {
    console.error('[obtenerPacientes]', err);
    return res.status(500).json({ message: 'Error al obtener/buscar pacientes.' });
  }
};

// Obtener un solo paciente por ID
exports.obtenerPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      _id: req.params.id,
      usuarioId: req.user.id,
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado.' });
    }

    res.json(paciente);
  } catch (err) {
    console.error('[obtenerPaciente]', err);
    res.status(500).json({ message: 'Error al obtener el paciente.' });
  }
};

exports.eliminarPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.user.id
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado o no autorizado.' });
    }

    await Session.deleteMany({ pacienteId: paciente._id });
    await Prueba.deleteMany({ pacienteId: paciente._id }); // ⬅️ limpia pruebas asociadas

    const pacientesActualizados = await Paciente.find({ usuarioId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      message: 'Paciente eliminado correctamente.',
      pacientes: pacientesActualizados
    });
  } catch (err) {
    console.error('[eliminarPaciente]', err);
    res.status(500).json({ message: 'Error al eliminar paciente.' });
  }
};

// Obtener detalle de paciente + sesiones + pruebas
exports.obtenerDetallePaciente = async (req, res) => {
  try {
    const pacienteId = req.params.id;

    // ✅ Seguridad: el paciente debe pertenecer al usuario autenticado
    const paciente = await Paciente.findOne({
      _id: pacienteId,
      usuarioId: req.user.id,
    });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });

    // (Opcional) también puedes filtrar sesiones por usuarioId si tu modelo Session lo guarda
    const sesiones = await Session.find({ pacienteId }).sort({ fecha: 1 });

    const sesionesIntervencion = await SesionIntervencion.find({ pacienteId }).sort({ fechaCreacion: 1 });
    const cuadroConvergencia = await CuadroConvergencia.findOne({ pacienteId });
    const hipotesisDiagnosticaDoc = await HipotesisDiagnostica.findOne({ pacienteId });
    const diagnosticoFinalDoc = await DiagnosticoFinal.findOne({ pacienteId });

    const primeraSesion = sesiones[0];
    const fichaTecnica = primeraSesion?.fichaTecnica || null;

    const resumen = sesiones
      .map((s) => {
        const hc = s.historialClinico || {};
        return [hc.analisisResultados, hc.sintesis, hc.recomendaciones].filter(Boolean).join('\n\n');
      })
      .filter(Boolean)
      .join('\n\n---\n\n');

    const motivos = [...new Set(sesiones.map(s => s.fichaTecnica?.motivoConsulta).filter(Boolean))];

    const listaSesiones = sesiones.map(s => ({
      id: s._id,
      fecha: s.fecha,
      tipo: s.tipo,
      fichaTecnica: s.fichaTecnica || {},
      historialClinico: s.historialClinico || {},
      minuta: s.minuta || {}
    }));

    // ✅ Pruebas del paciente PERO del mismo usuario autenticado
    const pruebasDocs = await Prueba.find({
      pacienteId,
      usuarioId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select('_id testNombre estado createdAt updatedAt')
      .lean();

    const pruebasPaciente = pruebasDocs.map(p => ({
      id: String(p._id),
      nombre: p.testNombre || 'Prueba',
      estado: p.estado,                 // 'en_progreso' | 'guardada' | 'finalizada'
      fechaISO: p.createdAt,
    }));

    return res.json({
      paciente,
      fichaTecnica,
      resumen,
      motivos,
      sesiones: listaSesiones,
      sesionesIntervencion,
      cuadroConvergencia: cuadroConvergencia?.filas || [],
      hipotesisDiagnostica: hipotesisDiagnosticaDoc?.contenido || '',
      diagnosticoFinal: diagnosticoFinalDoc?.contenido || '',
      pruebasPaciente,         // ← tu nueva clave
      pruebas: pruebasPaciente // ← alias para frontends que esperan "pruebas"
    });
  } catch (error) {
    console.error('❌ Error al obtener detalle del paciente:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

