const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Session = require(path.join(__dirname, '../models/session')); // ajusta si está en otra ruta

dotenv.config();

const userId = '684e41fa66605275c8ed1937';

const sesionesFalsas = [
  {
    userId,
    tipo: 'simulada',
    createdAt: new Date('2025-02-10T10:00:00Z'),
    retroalimentacion: {
      areasDeMejora: ['Claridad en las preguntas', 'Empatía'],
      posiblesErrores: ['Juicios apresurados']
    }
  },
  {
    userId,
    tipo: 'simulada',
    createdAt: new Date('2025-03-05T14:30:00Z'),
    retroalimentacion: {
      areasDeMejora: ['Escucha activa'],
      posiblesErrores: ['Interrupciones frecuentes']
    }
  },
  {
    userId,
    tipo: 'simulada',
    createdAt: new Date('2025-04-20T09:15:00Z'),
    retroalimentacion: {
      areasDeMejora: ['Validación emocional'],
      posiblesErrores: ['Falta de seguimiento']
    }
  },
  {
    userId,
    tipo: 'simulada',
    createdAt: new Date('2025-05-15T11:00:00Z'),
    retroalimentacion: {
      areasDeMejora: ['Uso de silencios terapéuticos'],
      posiblesErrores: ['Evitar consejos directos']
    }
  },
  {
    userId,
    tipo: 'simulada',
    createdAt: new Date('2025-06-10T16:45:00Z'),
    retroalimentacion: {
      areasDeMejora: ['Exploración profunda'],
      posiblesErrores: ['Falta de empatía']
    }
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Session.insertMany(sesionesFalsas);
    console.log('✅ Sesiones de prueba insertadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al insertar sesiones:', err.message);
    process.exit(1);
  }
};

run();