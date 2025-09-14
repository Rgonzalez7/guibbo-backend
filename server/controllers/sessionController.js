const Session = require('../models/session');
const Paciente = require('../models/paciente');

// ✅ Crear nueva sesión
const crearSesion = async (req, res) => {
  try {
    const {
      tipo,
      transcripcion,
      minuta,
      historialClinico,
      fichaTecnica,
      nombrePaciente
    } = req.body;

    if (!nombrePaciente || nombrePaciente.trim() === '') {
      return res.status(400).json({ message: 'El nombre del paciente es obligatorio.' });
    }

    const nombreLimpio = nombrePaciente.trim();

    // Extraer datos de historial clínico
    const {
      datosPersonales,
      interesesPersonales,
      antecedentesPersonales,
      antecedentesPsicologicos,
      aspectosFamiliares,
      aspectosPsicologicosFamiliares,
      situacionesActuales,
      analisisResultados,
      sintesis,
      sintesisPruebas,
      recomendaciones
    } = historialClinico || {};

    // Buscar paciente
    let paciente = await Paciente.findOne({
      nombreCompleto: nombreLimpio,
      usuarioId: req.user.id
    });

    // Crear paciente si no existe
    if (!paciente) {
      paciente = new Paciente({
        usuarioId: req.user.id,
        nombreCompleto: nombreLimpio,
        edad: fichaTecnica?.edad || '',
        fechaNacimiento: fichaTecnica?.fechaNacimiento || '',
        genero: fichaTecnica?.genero || '',
        estadoCivil: fichaTecnica?.estadoCivil || '',
        lugarResidencia: fichaTecnica?.lugarResidencia || '',
        ocupacion: fichaTecnica?.ocupacion || '',
        periodoEvaluacion: fichaTecnica?.periodoEvaluacion || '',
        motivoConsulta: fichaTecnica?.motivoConsulta || '',
        instrumentos: fichaTecnica?.instrumentos || []
      });

      await paciente.save();
    }

    if (!paciente || !paciente._id) {
      return res.status(500).json({ message: 'No se pudo obtener el ID del paciente.' });
    }

    // Crear sesión
    const nuevaSesion = new Session({
      userId: req.user.id,
      tipo,
      transcripcion,
      minuta: {
        descripcionProgreso: minuta?.descripcionProgreso || '',
        objetivos: minuta?.objetivos || '',
        sintomasPsicoticos: minuta?.sintomasPsicoticos || '',
        pensamientosSuicidas: minuta?.pensamientosSuicidas || false,
        planAccion: minuta?.planAccion || '',
        proximaCita: minuta?.proximaCita || ''
      },
      pacienteId: paciente._id,
      fichaTecnica: {
        nombreCompleto: nombreLimpio,
        edad: fichaTecnica?.edad || paciente?.edad || '',
        fechaNacimiento: fichaTecnica?.fechaNacimiento || paciente?.fechaNacimiento || '',
        genero: fichaTecnica?.genero || paciente?.genero || '',
        estadoCivil: fichaTecnica?.estadoCivil || paciente?.estadoCivil || '',
        lugarResidencia: fichaTecnica?.lugarResidencia || paciente?.lugarResidencia || '',
        ocupacion: fichaTecnica?.ocupacion || paciente?.ocupacion || '',
        periodoEvaluacion: fichaTecnica?.periodoEvaluacion || paciente?.periodoEvaluacion || '',
        motivoConsulta: fichaTecnica?.motivoConsulta || paciente?.motivoConsulta || '',
        instrumentos: fichaTecnica?.instrumentos || paciente?.instrumentos || []
      },
      historialClinico: {
        datosPersonales,
        interesesPersonales,
        antecedentesPersonales,
        antecedentesPsicologicos,
        aspectosFamiliares,
        aspectosPsicologicosFamiliares,
        situacionesActuales,
        analisisResultados,
        sintesis,
        sintesisPruebas,
        recomendaciones
      }
    });

    await nuevaSesion.save();

    res.status(201).json({
      message: 'Sesión creada correctamente',
      session: nuevaSesion
    });

  } catch (error) {
    console.error('[crearSesion] ❌', error.message);
    res.status(500).json({ message: 'Error al crear la sesión', error: error.message });
  }
};

// ✅ Obtener historial de sesiones
const obtenerHistorialSesiones = async (req, res) => {
  try {
    const sesiones = await Session.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('pacienteId', 'nombreCompleto');

    const historial = sesiones.map((s) => {
      const resumenMinuta = [
        s.minuta?.objetivos,
        s.minuta?.temas
      ]
        .filter(Boolean)
        .join(' • ')
        .slice(0, 100); // Puedes ajustar el límite de caracteres

      return {
        id: s._id,
        tipo: s.tipo,
        fecha: s.createdAt.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        paciente: s.pacienteId ? s.pacienteId.nombreCompleto : 'Paciente desconocido',
        resumenMinuta: resumenMinuta || null
      };
    });

    res.json({ historial });
  } catch (error) {
    console.error('[obtenerHistorialSesiones] ❌', error.message);
    res.status(500).json({ message: 'Error al obtener sesiones', error: error.message });
  }
};

// ✅ Obtener sesión individual por ID
const obtenerSesionPorId = async (req, res) => {
  try {
    const sesion = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('pacienteId').lean();

    if (!sesion) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    res.json({ sesion });
  } catch (error) {
    console.error('[obtenerSesionPorId] ❌', error.message);
    res.status(500).json({ message: 'Error al obtener la sesión', error: error.message });
  }
};

const actualizarFichaTecnica = async (req, res) => {
  const { id } = req.params;
  const { fichaTecnica } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });

    session.fichaTecnica = fichaTecnica;
    await session.save();

    res.status(200).json({ message: 'Ficha técnica actualizada', session });
  } catch (error) {
    console.error('[❌ Error actualizando ficha técnica]', error);
    res.status(500).json({ message: 'Error actualizando ficha técnica' });
  }
};

const actualizarHistorialClinico = async (req, res) => {
  const { id } = req.params;
  const { historialClinico, resaltados } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });

    if (historialClinico) session.historialClinico = historialClinico;
    if (Array.isArray(resaltados)) session.resaltadosTranscripcion = resaltados;

    await session.save();

    res.status(200).json({ message: 'Historial clínico y resaltados actualizados', session });
  } catch (error) {
    console.error('[❌ Error actualizando historial clínico]', error);
    res.status(500).json({ message: 'Error al actualizar historial clínico y resaltados' });
  }
};

const actualizarMinuta = async (req, res) => {
  const { id } = req.params;
  const { minuta } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });

    session.minuta = minuta;
    await session.save();

    res.status(200).json({ message: 'Minuta actualizada', session });
  } catch (error) {
    console.error('[❌ Error actualizando minuta]', error);
    res.status(500).json({ message: 'Error actualizando minuta' });
  }
};

const actualizarResaltadosTranscripcion = async (req, res) => {
  const { id } = req.params;
  const { resaltados } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });

    session.resaltadosTranscripcion = resaltados;
    await session.save();

    res.status(200).json({ message: 'Resaltados actualizados', session });
  } catch (error) {
    console.error('[❌ Error actualizando resaltados]', error);
    res.status(500).json({ message: 'Error actualizando resaltados' });
  }
};

module.exports = {
  crearSesion,
  obtenerHistorialSesiones,
  obtenerSesionPorId,
  actualizarFichaTecnica,
  actualizarHistorialClinico,
  actualizarMinuta,
  actualizarResaltadosTranscripcion
};