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

ALLOWED_ORIGINS.push("https://192.168.1.98:5173");

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const allowed =
      ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||

      // ✅ NUEVO: Vite https en LAN
      /^https:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||

      // ✅ por si abres con https localhost
      /^https:\/\/localhost:\d+$/.test(origin);

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

// ✅ IMPORTS DE RUTAS
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
const iaRoutes = require("./routes/iaRoutes");
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
      message:
        "Payload demasiado grande (413). Reduce transcripción o aumenta limit.",
    });
  }
  return next(err);
});

// --- Health & raíz ---
app.get("/health", (_req, res) => {
  const mongoState = mongoose.connection.readyState; // 0=disc,1=conn,2=connecting,3=disconnecting
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    mongoReadyState: mongoState,
    mongoConnected: mongoState === 1,
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

// ✅ Real Dual (2 devices)
let createRealDualWSS = null;
try {
  ({ createRealDualWSS } = require("./controllers/realDualFlow"));
} catch (e) {
  console.log(
    "⚠️ realDualFlow no cargado (aún no existe o hay error):",
    e?.message || e
  );
}

const deepgramWSS = createDeepgramProxy();
const simWSS = createSimWSS();

// ✅ TU controller retorna { hostWSS, patientWSS }
const realDual = typeof createRealDualWSS === "function" ? createRealDualWSS() : null;
const realDualHostWSS = realDual?.hostWSS || null;
const realDualPatientWSS = realDual?.patientWSS || null;

function isAllowedWsOrigin(origin) {
  // WS puede venir sin origin (Postman / native). En browser sí viene.
  if (!origin) return true;

  const o = String(origin).trim().replace(/\/+$/, "");
  if (!o) return true;

  return (
    ALLOWED_ORIGINS.includes(o) ||
    /^http:\/\/localhost:\d+$/.test(o) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(o) ||
    /^https:\/\/localhost:\d+$/.test(o) ||
    /^https:\/\/192\.168\.\d+\.\d+:\d+$/.test(o) ||
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(o)
  );
}

server.on("upgrade", (req, socket, head) => {
  try {
    const base = `http://${req.headers.host || "localhost"}`;
    const url = new URL(req.url || "/", base);

    // ✅ normaliza: quita slash final
    const pathname = String(url.pathname || "/").replace(/\/+$/, "") || "/";

    console.log("🔌 upgrade:", {
      url: req.url,
      origin: req.headers.origin,
      host: req.headers.host,
    });

    // ✅ socket.io lo maneja internamente (NO destruir)
    if (pathname.startsWith("/socket.io")) return;

    // ✅ valida origin para WS (CORS middleware no aplica acá)
    const origin = req.headers.origin;
    if (!isAllowedWsOrigin(origin)) {
      try {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      } catch {}
      socket.destroy();
      return;
    }

    // ✅ Deepgram proxy
    if (pathname === "/ws/deepgram") {
      deepgramWSS.handleUpgrade(req, socket, head, (ws) => {
        deepgramWSS.emit("connection", ws, req);
      });
      return;
    }

    // ✅ Simulación IA
    if (pathname === "/ws/sim") {
      simWSS.handleUpgrade(req, socket, head, (ws) => {
        simWSS.emit("connection", ws, req);
      });
      return;
    }

    // ✅ Real Dual
    if (pathname === "/ws/real-dual/host") {
      if (!realDualHostWSS) return socket.destroy();
      realDualHostWSS.handleUpgrade(req, socket, head, (ws) => {
        realDualHostWSS.emit("connection", ws, req);
      });
      return;
    }

    if (pathname === "/ws/real-dual/patient") {
      if (!realDualPatientWSS) return socket.destroy();
      realDualPatientWSS.handleUpgrade(req, socket, head, (ws) => {
        realDualPatientWSS.emit("connection", ws, req);
      });
      return;
    }

    socket.destroy();
  } catch (_e) {
    socket.destroy();
  }
});

/* =========================================================
   ✅ BOOT (Fly-friendly)
========================================================= */

function startHttpServerOnce() {
  if (server.listening) return;

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 API & WS corriendo en el puerto ${port}`);
    console.log("🎧 WS Deepgram en /ws/deepgram  |  🤖 WS Sim en /ws/sim");

    if (realDualHostWSS && realDualPatientWSS) {
      console.log("🎙️ WS Real Dual en /ws/real-dual/host  |  📱 /ws/real-dual/patient");
    } else {
      console.log("⚠️ WS Real Dual NO habilitado (falta controllers/realDualFlow.js o falló require)");
    }

    console.log(
      "🌐 Orígenes permitidos (CORS):",
      ALLOWED_ORIGINS.join(", ") || "(ninguno)"
    );
    console.log("🧩 Socket.io listo ✅");
  });
}

async function connectMongoWithRetry() {
  const uri = String(process.env.MONGODB_URI || "").trim();
  if (!uri) {
    console.error("❌ MONGODB_URI NO está configurada (Fly secrets).");
    process.exit(1);
  }

  const maxAttempts = Number(process.env.MONGO_RETRY_ATTEMPTS || 30);
  const delayMs = Number(process.env.MONGO_RETRY_DELAY_MS || 2000);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log("✅ Conectado a MongoDB");
      return;
    } catch (err) {
      console.error(
        `❌ Mongo connect failed (attempt ${attempt}/${maxAttempts}):`,
        err?.message || err
      );

      if (attempt === maxAttempts) process.exit(1);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

startHttpServerOnce();

connectMongoWithRetry().catch((e) => {
  console.error("❌ Mongo fatal:", e?.message || e);
  process.exit(1);
});

module.exports = { app, server, io };