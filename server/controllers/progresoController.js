const Session = require('../models/session');

const obtenerProgresoDelEstudiante = async (req, res) => {
  try {
    const userId = req.user.id;

    const sesiones = await Session.find({ userId });
    const totalSesiones = sesiones.length;

    const sesionesConFeedback = sesiones.filter(s => s.retroalimentacion);
    const totalConFeedback = sesionesConFeedback.length;

    const duracionEstimadasHoras = totalSesiones * 0.5; // 30 minutos por sesión

    // Análisis de áreas más comunes
    const contadorAreas = {};
    const contadorErrores = {};

    sesionesConFeedback.forEach(sesion => {
      sesion.retroalimentacion.areasDeMejora?.forEach(area => {
        contadorAreas[area] = (contadorAreas[area] || 0) + 1;
      });

      sesion.retroalimentacion.posiblesErrores?.forEach(error => {
        contadorErrores[error] = (contadorErrores[error] || 0) + 1;
      });
    });

    // Top 3 de cada uno
    const topAreas = Object.entries(contadorAreas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([texto, repeticiones]) => ({ texto, repeticiones }));

    const topErrores = Object.entries(contadorErrores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([texto, repeticiones]) => ({ texto, repeticiones }));
    
    const comentarioReflexivo = generarComentarioReflexivo({ totalSesiones, topAreas, topErrores });
  
    res.json({
        totalSesiones,
        duracionEstimadasHoras,
        totalConFeedback,
        topAreas,
        topErrores,
        comentarioReflexivo
      });
      

  } catch (error) {
    res.status(500).json({
      message: 'Error al calcular el progreso del estudiante.',
      error: error.message
    });
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generarPDFProgreso = async (req, res) => {
  try {
    const userId = req.user.id;

    const sesiones = await Session.find({ userId });
    const totalSesiones = sesiones.length;
    const sesionesConFeedback = sesiones.filter(s => s.retroalimentacion);
    const totalConFeedback = sesionesConFeedback.length;
    const duracionEstimadasHoras = totalSesiones * 0.5;

    const contadorAreas = {};
    const contadorErrores = {};

    sesionesConFeedback.forEach(s => {
      s.retroalimentacion.areasDeMejora?.forEach(area => {
        contadorAreas[area] = (contadorAreas[area] || 0) + 1;
      });
      s.retroalimentacion.posiblesErrores?.forEach(err => {
        contadorErrores[err] = (contadorErrores[err] || 0) + 1;
      });
    });

    const topAreas = Object.entries(contadorAreas).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topErrores = Object.entries(contadorErrores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const comentarioReflexivo = generarComentarioReflexivo({ totalSesiones, topAreas, topErrores });


    // Iniciar documento
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=progreso_estudiante.pdf');
    doc.pipe(res);

    // (Opcional) Logo
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { width: 80, align: 'center' });
    }

    // Título principal
    doc.fontSize(22).font('Helvetica-Bold').text('Informe de Progreso del Estudiante', {
      align: 'center'
    });
    doc.moveDown(1.5);

    // Sección: resumen numérico
    doc.fontSize(16).fillColor('#333').text('Resumen General:', { underline: true });
    doc.fontSize(12).list([
      `Total de sesiones realizadas: ${totalSesiones}`,
      `Duración estimada: ${duracionEstimadasHoras} horas`,
      `Sesiones con retroalimentación: ${totalConFeedback}`
    ]);
    doc.moveDown();

    // Sección: Áreas de mejora
    doc.fontSize(16).text('Principales áreas de mejora:', { underline: true });
    topAreas.forEach(([texto, rep]) => {
      doc.fontSize(12).text(`• ${texto} (${rep} menciones)`);
    });
    doc.moveDown();

    // Sección: Errores comunes
    doc.fontSize(16).text('Errores frecuentes detectados:', { underline: true });
    topErrores.forEach(([texto, rep]) => {
      doc.fontSize(12).text(`• ${texto} (${rep} menciones)`);
    });
    doc.moveDown();

    // Sección: Comentario reflexivo
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text('📝 Comentario Reflexivo del Mentor IA', {
    align: 'left',
    underline: true
    });
    doc.moveDown();

    const lineasComentario = comentarioReflexivo.split('\n');

    lineasComentario.forEach(linea => {
      doc.text(linea, {
        align: 'left'
      });
      doc.moveDown(0.5);
    });
      
    
    doc.moveDown(3);
    doc.fontSize(11).font('Helvetica-Oblique').text('— Mentor IA Clínico', {
        align: 'right'
    });
      

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#666').text(
      'Este informe ha sido generado automáticamente por la plataforma educativa de entrenamiento clínico.',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar el PDF.',
      error: error.message
    });
  }
};

function generarComentarioReflexivo({ totalSesiones, topAreas, topErrores }) {
    let comentario = '';
  
    if (totalSesiones < 3) {
      comentario += 'Estás dando tus primeros pasos como terapeuta. A medida que acumules más experiencia, notarás más confianza en tus intervenciones.\n\n';
    } else if (totalSesiones < 10) {
      comentario += 'Has empezado a construir una base sólida. Sigue explorando técnicas y reflexionando sobre tus intervenciones para pulir tu estilo clínico.\n\n';
    } else {
      comentario += 'Mostrás un nivel de compromiso constante. Tu crecimiento como terapeuta es evidente en la cantidad de sesiones realizadas.\n\n';
    }
  
    if (topAreas.length > 0) {
      comentario += 'ÁREAS QUE PODRÍAS FORTALECER:\n';
      topAreas.forEach(area => {
        comentario += `- ${area.texto}\n`;
      });
    }
  
    if (topErrores.length > 0) {
      comentario += '\nERRORES FRECUENTES DETECTADOS:\n';
      topErrores.forEach(err => {
        comentario += `- ${err.texto}\n`;
      });
    }
  
    comentario += '\nREFLEXIÓN FINAL:\nRecordá que el crecimiento terapéutico es un proceso. Cada sesión cuenta.';
  
    return comentario;
  }
  
  const obtenerSesionesPorMes = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const sesiones = await Session.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] }, // YYYY-MM
            total: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
  
      const sesionesPorMes = sesiones.map(s => ({
        mes: s._id,
        total: s.total
      }));
  
      res.json({ sesionesPorMes });
  
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener sesiones por mes', error: error.message });
    }
  };


module.exports = {
  obtenerProgresoDelEstudiante,
  generarPDFProgreso,
  obtenerSesionesPorMes // <- ¡Aquí lo añadimos!
};
  
