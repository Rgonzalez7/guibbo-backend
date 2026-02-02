// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

// --- CORS (frontend prod + local) ---
const FRONTEND_ORIGIN_ENV = process.env.FRONTEND_ORIGIN || "";
const ALLOWED_ORIGINS = FRONTEND_ORIGIN_ENV
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://localhost:5173");
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ IMPORTS DE RUTAS (ANTES de app.use)
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const expedienteRoutes = require("./routes/expedienteRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const progresoRoutes = require("./routes/progresoRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ SOLO UNA VEZ
const pacienteRoutes = require("./routes/pacienteRoutes");
const sesionesIntervencionRoutes = require("./routes/sesionesIntervencionRoutes");
const cuadroConvergenciaRoutes = require("./routes/cuadroConvergenciaRoutes");
const hipotesisRoutes = require("./routes/hipotesisRoutes");
const diagnosticoFinalRoutes = require("./routes/diagnosticoFinalRoutes");
const iaRoutes = require("./routes/iaRoutes");
const diarizacionRoutes = require("./routes/diarizacionRoutes");
const consentimientoRoutes = require("./routes/consentimientoRoutes");
const pruebasRoutes = require("./routes/pruebasRoutes");
const historialRoutes = require("./routes/historialRoutes");

const superRoutes = require("./routes/superRoutes");
const adminRoutes = require("./routes/adminRoutes");
const estudianteRoutes = require("./routes/estudianteRoutes");
const profesorRoutes = require("./routes/profesorRoutes");


// ✅ ESTA es la única ruta de tests que vamos a usar:
const testsRoutes = require("./routes/testsRoutes");

// --- Rutas HTTP ---
app.use("/api/auth", authRoutes);
app.use("/api/sesiones", sessionRoutes);
app.use("/api/expedientes", expedienteRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/progreso", progresoRoutes);

// ✅ Usuarios (estándar)
app.use("/api/usuarios", userRoutes);

app.use("/api/pacientes", pacienteRoutes);
app.use("/api/sesiones-intervencion", sesionesIntervencionRoutes);
app.use("/api/cuadro-convergencia", cuadroConvergenciaRoutes);
app.use("/api/hipotesis", hipotesisRoutes);
app.use("/api/diagnostico", diagnosticoFinalRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/diarizacion", diarizacionRoutes);
app.use("/api/consentimiento", consentimientoRoutes);

// ✅ Tests catalog + seguimiento (PUBLICO + privado con JWT)
app.use("/api/tests", testsRoutes);

app.use("/api/pruebas", pruebasRoutes);
app.use("/api/historial", historialRoutes);

// 🔹 súper usuario
app.use("/api/super", superRoutes);

// 🔹 admin carrera (director)
app.use("/api/admin", adminRoutes);

// 🔹 estudiante
app.use("/api/estudiante", estudianteRoutes);

// 🔹 profesor
app.use("/api/profesor", profesorRoutes);

/**
 * ✅ Servir uploads
 * OJO: tu multer guarda en "public/uploads"
 * así que hay que servir esa carpeta.
 *
 * URL final: /uploads/archivo.png
 * FS path: server/public/uploads/archivo.png
 */
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// --- Health & raíz ---
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

app.get("/", (_req, res) => res.send("Servidor funcionando correctamente 🚀"));

app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    name: "Guibbo API",
    env: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    time: new Date().toISOString(),
    endpoints: [
      "/api/auth",
      "/api/pacientes",
      "/api/sesiones",
      "/api/expedientes",
      "/api/feedback",
      "/api/progreso",
      "/api/usuarios",
      "/api/sesiones-intervencion",
      "/api/cuadro-convergencia",
      "/api/hipotesis",
      "/api/diagnostico",
      "/api/ia",
      "/api/diarizacion",
      "/api/consentimiento",
      "/api/tests",
      "/api/pruebas",
      "/api/historial",
      "/api/super",
      "/api/admin",
      "/api/estudiante",
    ],
  });
});

const server = http.createServer(app);

// --- Socket.io ---
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true, methods: ["GET", "POST"] },
});

// ✅ CRÍTICO: expone io para controllers (req.app.get("io"))
app.set("io", io);
// (opcional compat)
app.locals.io = io;

// ✅ Rooms para seguimiento en vivo (join-room)
io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, rol } = {}) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("room-joined", { roomId });
  });

  socket.on("leave-room", ({ roomId } = {}) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {});
});

// --- Puentes WS ---
const { createDeepgramProxy } = require("./controllers/deepgramLiveProxy");
const { createSimWSS } = require("./controllers/simFlow");

const deepgramWSS = createDeepgramProxy();
const simWSS = createSimWSS();

server.on("upgrade", (req, socket, head) => {
  const { url } = req;

  if (url.startsWith("/ws/deepgram")) {
    deepgramWSS.handleUpgrade(req, socket, head, (ws) => {
      deepgramWSS.emit("connection", ws, req);
    });
    return;
  }

  if (url.startsWith("/ws/sim")) {
    simWSS.handleUpgrade(req, socket, head, (ws) => {
      simWSS.emit("connection", ws, req);
    });
    return;
  }

  // ✅ socket.io maneja su propio upgrade
  if (url.startsWith("/socket.io")) return;

  socket.destroy();
});

// --- Boot ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    server.listen(port, () => {
      console.log(`🚀 API & WS corriendo en el puerto ${port}`);
      console.log("🎧 WS Deepgram en /ws/deepgram  |  🤖 WS Sim en /ws/sim");
      console.log(
        "🌐 Orígenes permitidos (CORS):",
        ALLOWED_ORIGINS.join(", ") || "(ninguno)"
      );
      console.log("🧪 Tests catalog:", `http://localhost:${port}/api/tests/catalog`);
      console.log("🧩 Socket.io listo ✅");
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err.message);
  });

module.exports = { app, server, io };