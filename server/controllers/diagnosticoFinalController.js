const DiagnosticoFinal = require('../models/DiagnosticoFinal');

exports.obtenerDiagnosticoFinal = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const doc = await DiagnosticoFinal.findOne({ pacienteId });

    res.json(doc?.contenido || '');
  } catch (err) {
    console.error('❌ Error al obtener diagnóstico final:', err);
    res.status(500).json({ message: 'Error al obtener diagnóstico final' });
  }
};

exports.guardarDiagnosticoFinal = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { contenido } = req.body;

    let doc = await DiagnosticoFinal.findOne({ pacienteId });

    if (doc) {
      doc.contenido = contenido;
    } else {
      doc = new DiagnosticoFinal({ pacienteId, contenido });
    }

    await doc.save();
    res.status(200).json({ message: 'Diagnóstico final guardado' });
  } catch (err) {
    console.error('❌ Error al guardar diagnóstico final:', err);
    res.status(500).json({ message: 'Error al guardar diagnóstico final' });
  }
};