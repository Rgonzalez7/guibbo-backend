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
const port = Number(process.env.PORT || 8080);

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
    if (!origin) return cb(null, true);

    const allowed =
      ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (allowed) return cb(null, true);

    console.log("❌ CORS bloqueado. Origin recibido:", origin);
    console.log("✅ ALLOWED_ORIGINS:", ALLOWED_ORIGINS);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ✅ Body size (para transcripciones + payloads grandes)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// ✅ IMPORTS DE RUTAS (UNA SOLA VEZ CADA UNA)
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const expedienteRoutes = require("./routes/expedienteRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const progresoRoutes = require("./routes/progresoRoutes");
const userRoutes = require("./routes/userRoutes");
const pacienteRoutes = require("./routes/pacienteRoutes");
const sesionesIntervencionRoutes = require("./routes/sesionesIntervencionRoutes");
const cuadroConvergenciaRoutes = require("./routes/cuadroConvergenciaRoutes");
const hipotesisRoutes = require("./routes/hipotesisRoutes");
const diagnosticoFinalRoutes = require("./routes/diagnosticoFinalRoutes");
const iaRoutes = require("./routes/iaRoutes"); // ✅ SOLO UNA VEZ
const diarizacionRoutes = require("./routes/diarizacionRoutes");
const consentimientoRoutes = require("./routes/consentimientoRoutes");
const pruebasRoutes = require("./routes/pruebasRoutes");
const historialRoutes = require("./routes/historialRoutes");

const superRoutes = require("./routes/superRoutes");
const adminRoutes = require("./routes/adminRoutes");
const estudianteRoutes = require("./routes/estudianteRoutes");
const profesorRoutes = require("./routes/profesorRoutes");

const testsRoutes = require("./routes/testsRoutes");

// ✅ MONTA iaRoutes UNA SOLA VEZ, PERO CON 2 PREFIJOS
app.use(["/api/ia", "/ia"], iaRoutes);

// --- Rutas HTTP ---
app.use("/api/auth", authRoutes);
app.use("/api/sesiones", sessionRoutes);
app.use("/api/expedientes", expedienteRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/usuarios", userRoutes);

app.use("/api/pacientes", pacienteRoutes);
app.use("/api/sesiones-intervencion", sesionesIntervencionRoutes);
app.use("/api/cuadro-convergencia", cuadroConvergenciaRoutes);
app.use("/api/hipotesis", hipotesisRoutes);
app.use("/api/diagnostico", diagnosticoFinalRoutes);

app.use("/api/diarizacion", diarizacionRoutes);
app.use("/api/consentimiento", consentimientoRoutes);

app.use("/api/tests", testsRoutes);
app.use("/api/pruebas", pruebasRoutes);
app.use("/api/historial", historialRoutes);

// 🔹 súper usuario
app.use("/api/super", superRoutes);

// 🔹 admin carrera
app.use("/api/admin", adminRoutes);

// 🔹 estudiante
app.use("/api/estudiante", estudianteRoutes);

// 🔹 profesor
app.use("/api/profesor", profesorRoutes);

/**
 * ✅ Servir uploads
 * URL: /uploads/archivo.png
 */
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Handler claro para payload demasiado grande
app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      ok: false,
      message: "Payload demasiado grande (413). Reduce transcripción o aumenta limit.",
    });
  }
  return next(err);
});

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
  });
});

const server = http.createServer(app);

// --- Socket.io ---
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true, methods: ["GET", "POST"] },
});

app.set("io", io);
app.locals.io = io;

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId } = {}) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("room-joined", { roomId });
  });

  socket.on("leave-room", ({ roomId } = {}) => {
    if (!roomId) return;
    socket.leave(roomId);
  });
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

  if (url.startsWith("/socket.io")) return;

  socket.destroy();
});

// --- Boot ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 API & WS corriendo en el puerto ${port}`);
      console.log("🎧 WS Deepgram en /ws/deepgram  |  🤖 WS Sim en /ws/sim");
      console.log(
        "🌐 Orígenes permitidos (CORS):",
        ALLOWED_ORIGINS.join(", ") || "(ninguno)"
      );
      console.log("🧩 Socket.io listo ✅");
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err.message);
  });

module.exports = { app, server, io };