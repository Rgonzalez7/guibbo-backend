// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

// --- CORS (frontend prod + local) ---
const FRONTEND_ORIGIN_ENV = process.env.FRONTEND_ORIGIN || '';
const ALLOWED_ORIGINS = FRONTEND_ORIGIN_ENV
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:5173');
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// --- Rutas HTTP ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sesiones', require('./routes/sessionRoutes'));
app.use('/api/expedientes', require('./routes/expedienteRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/progreso', require('./routes/progresoRoutes'));
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/pacientes', require('./routes/pacienteRoutes'));
app.use('/api/sesiones-intervencion', require('./routes/sesionesIntervencionRoutes'));
app.use('/api/cuadro-convergencia', require('./routes/cuadroConvergenciaRoutes'));
app.use('/api/hipotesis', require('./routes/hipotesisRoutes'));
app.use('/api/diagnostico', require('./routes/diagnosticoFinalRoutes'));
app.use('/api/ia', require('./routes/iaRoutes'));
app.use('/api/diarizacion', require('./routes/diarizacionRoutes'));
app.use('/api/consentimiento', require('./routes/consentimientoRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/pruebas', require('./routes/pruebasRoutes'));
app.use('/api/historial', require('./routes/historialRoutes'));

// --- Health & raíz ---
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

app.get('/', (_req, res) => res.send('Servidor funcionando correctamente 🚀'));

// ✅ Índice de API (útil para comprobar en producción)
app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    name: 'Guibbo API',
    env: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    time: new Date().toISOString(),
    endpoints: [
      '/api/auth',
      '/api/pacientes',
      '/api/sesiones',
      '/api/expedientes',
      '/api/feedback',
      '/api/progreso',
      '/api/usuarios',
      '/api/sesiones-intervencion',
      '/api/cuadro-convergencia',
      '/api/hipotesis',
      '/api/diagnostico',
      '/api/ia',
      '/api/diarizacion',
      '/api/consentimiento',
      '/api/tests',
      '/api/pruebas',
      '/api/historial',
    ],
  });
});

const server = http.createServer(app);

// --- Socket.io ---
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true, methods: ['GET','POST'] },
});

// (tu lógica de socket.io aquí, sin tocar)

// --- Puentes WS (noServer + upgrade) ---
const { createDeepgramProxy } = require('./controllers/deepgramLiveProxy');
const { createSimWSS } = require('./controllers/simFlow');

const deepgramWSS = createDeepgramProxy();
const simWSS = createSimWSS();

server.on('upgrade', (req, socket, head) => {
  const { url } = req;

  if (url.startsWith('/ws/deepgram')) {
    deepgramWSS.handleUpgrade(req, socket, head, (ws) => {
      deepgramWSS.emit('connection', ws, req);
    });
    return;
  }

  if (url.startsWith('/ws/sim')) {
    simWSS.handleUpgrade(req, socket, head, (ws) => {
      simWSS.emit('connection', ws, req);
    });
    return;
  }

  // 👇 Deja que socket.io maneje su propio upgrade
  if (url.startsWith('/socket.io')) {
    return;
  }

  // Si no matchea ningún WS path conocido, cerrar
  socket.destroy();
});

// --- Boot ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    server.listen(port, () => {
      console.log(`🚀 API & WS corriendo en el puerto ${port}`);
      console.log('🎧 WS Deepgram en /ws/deepgram  |  🤖 WS Sim en /ws/sim');
      console.log('🌐 Orígenes permitidos (CORS):', ALLOWED_ORIGINS.join(', ') || '(ninguno)');
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
  });

module.exports = { app, server, io };