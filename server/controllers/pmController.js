// server/controllers/pmController.js
// =========================================================
// Panel de control de proyecto del súper usuario.
//
// El tablero pide las cinco primeras tareas de cada columna más el
// total, para que el panel principal no traiga toda la base. El
// listado completo va aparte, con filtros y paginación.
// =========================================================
const mongoose = require("mongoose");
const TareaPm = require("../models/tareaPm");

const ESTADOS = TareaPm.ESTADOS;
const PRIORIDADES = TareaPm.PRIORIDADES;

const PASO_ORDEN = 1000;

function nombreUsuario(req) {
  const u = req.user || {};
  return (
    [u.nombre, u.apellido].filter(Boolean).join(" ") ||
    u.name ||
    u.email ||
    "Súper usuario"
  );
}

function idUsuario(req) {
  return req.user?.id || req.user?._id || null;
}

function texto(v, max) {
  const s = String(v ?? "").trim();
  return max ? s.slice(0, max) : s;
}

function limpiarAdjuntos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => ({
      url: texto(a?.url, 500),
      nombre: texto(a?.nombre, 200),
    }))
    .filter((a) => a.url)
    .slice(0, 20);
}

function esEstado(v) {
  return ESTADOS.includes(String(v || ""));
}

/* ========== GET /api/super/pm/tablero ========== */
/**
 * Devuelve, por columna, las primeras tareas y el total.
 * `porColumna` controla cuántas trae cada una (5 por defecto).
 */
exports.tablero = async (req, res) => {
  try {
    const porColumna = Math.min(20, Math.max(1, Number(req.query.porColumna) || 5));

    const filtro = {};
    if (texto(req.query.dashboard)) filtro.dashboard = texto(req.query.dashboard);
    if (texto(req.query.seccion)) filtro.seccion = texto(req.query.seccion);

    const columnas = await Promise.all(
      ESTADOS.map(async (estado) => {
        const q = { ...filtro, estado };
        const [tareas, total] = await Promise.all([
          TareaPm.find(q).sort({ orden: 1, updatedAt: -1 }).limit(porColumna).lean(),
          TareaPm.countDocuments(q),
        ]);
        return { estado, tareas, total };
      })
    );

    const totales = columnas.reduce((acc, c) => {
      acc[c.estado] = c.total;
      return acc;
    }, {});
    totales.todas = columnas.reduce((n, c) => n + c.total, 0);

    res.json({ columnas, totales });
  } catch (e) {
    console.error("[pm.tablero]", e);
    res.status(500).json({ message: "No se pudo cargar el tablero." });
  }
};

/* ========== GET /api/super/pm/tareas ========== */
exports.listar = async (req, res) => {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const porPagina = Math.min(100, Math.max(1, Number(req.query.porPagina) || 30));

    const filtro = {};
    if (esEstado(req.query.estado)) filtro.estado = req.query.estado;
    if (texto(req.query.dashboard)) filtro.dashboard = texto(req.query.dashboard);
    if (texto(req.query.seccion)) filtro.seccion = texto(req.query.seccion);
    if (PRIORIDADES.includes(String(req.query.prioridad || ""))) {
      filtro.prioridad = req.query.prioridad;
    }

    const q = texto(req.query.q, 120);
    if (q) {
      // Escapado: un título con paréntesis rompería la expresión.
      const seguro = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(seguro, "i");
      filtro.$or = [{ titulo: re }, { descripcion: re }];
    }

    const [tareas, total] = await Promise.all([
      TareaPm.find(filtro)
        .sort({ orden: 1, updatedAt: -1 })
        .skip((pagina - 1) * porPagina)
        .limit(porPagina)
        .lean(),
      TareaPm.countDocuments(filtro),
    ]);

    res.json({ tareas, total, pagina, porPagina });
  } catch (e) {
    console.error("[pm.listar]", e);
    res.status(500).json({ message: "No se pudieron cargar las tareas." });
  }
};

/* ========== GET /api/super/pm/tareas/:id ========== */
exports.obtener = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identificador inválido." });
    }
    const tarea = await TareaPm.findById(req.params.id).lean();
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });
    res.json(tarea);
  } catch (e) {
    console.error("[pm.obtener]", e);
    res.status(500).json({ message: "No se pudo cargar la tarea." });
  }
};

/* ========== POST /api/super/pm/tareas ========== */
exports.crear = async (req, res) => {
  try {
    const titulo = texto(req.body?.titulo, 200);
    if (!titulo) {
      return res.status(400).json({ message: "La tarea necesita un título." });
    }

    const estado = esEstado(req.body?.estado) ? req.body.estado : "sin_empezar";

    // Entra al principio de su columna: lo nuevo se ve sin buscar.
    const primera = await TareaPm.findOne({ estado }).sort({ orden: 1 }).lean();
    const orden = primera ? Number(primera.orden || 0) - PASO_ORDEN : 0;

    const tarea = await TareaPm.create({
      titulo,
      descripcion: texto(req.body?.descripcion, 5000),
      dashboard: texto(req.body?.dashboard, 80),
      seccion: texto(req.body?.seccion, 120),
      estado,
      prioridad: PRIORIDADES.includes(String(req.body?.prioridad || ""))
        ? req.body.prioridad
        : "media",
      adjuntos: limpiarAdjuntos(req.body?.adjuntos),
      orden,
      historial: [{ de: null, a: estado, fecha: new Date() }],
      completadaEn: estado === "terminada" ? new Date() : null,
      creadaPor: idUsuario(req),
      creadaPorNombre: nombreUsuario(req),
    });

    res.status(201).json(tarea);
  } catch (e) {
    console.error("[pm.crear]", e);
    res.status(500).json({ message: "No se pudo crear la tarea." });
  }
};

/* ========== PUT /api/super/pm/tareas/:id ========== */
exports.actualizar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identificador inválido." });
    }

    const tarea = await TareaPm.findById(req.params.id);
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    if (req.body?.titulo !== undefined) {
      const t = texto(req.body.titulo, 200);
      if (!t) return res.status(400).json({ message: "La tarea necesita un título." });
      tarea.titulo = t;
    }
    if (req.body?.descripcion !== undefined) {
      tarea.descripcion = texto(req.body.descripcion, 5000);
    }
    if (req.body?.dashboard !== undefined) tarea.dashboard = texto(req.body.dashboard, 80);
    if (req.body?.seccion !== undefined) tarea.seccion = texto(req.body.seccion, 120);
    if (req.body?.adjuntos !== undefined) tarea.adjuntos = limpiarAdjuntos(req.body.adjuntos);

    if (PRIORIDADES.includes(String(req.body?.prioridad || ""))) {
      tarea.prioridad = req.body.prioridad;
    }

    if (req.body?.estado !== undefined) {
      if (!esEstado(req.body.estado)) {
        return res.status(400).json({ message: "Estado no válido." });
      }
      if (req.body.estado !== tarea.estado) {
        tarea.historial.push({ de: tarea.estado, a: req.body.estado, fecha: new Date() });
        tarea.estado = req.body.estado;
        tarea.completadaEn = req.body.estado === "terminada" ? new Date() : null;
      }
    }

    await tarea.save();
    res.json(tarea);
  } catch (e) {
    console.error("[pm.actualizar]", e);
    res.status(500).json({ message: "No se pudo guardar la tarea." });
  }
};

/* ========== PATCH /api/super/pm/tareas/:id/estado ========== */
/** Mover de columna, que es la acción más frecuente del tablero. */
exports.mover = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identificador inválido." });
    }
    if (!esEstado(req.body?.estado)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const tarea = await TareaPm.findById(req.params.id);
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    if (tarea.estado !== req.body.estado) {
      tarea.historial.push({ de: tarea.estado, a: req.body.estado, fecha: new Date() });
      tarea.estado = req.body.estado;
      tarea.completadaEn = req.body.estado === "terminada" ? new Date() : null;

      const primera = await TareaPm.findOne({ estado: tarea.estado })
        .sort({ orden: 1 })
        .lean();
      tarea.orden = primera ? Number(primera.orden || 0) - PASO_ORDEN : 0;

      await tarea.save();
    }

    res.json(tarea);
  } catch (e) {
    console.error("[pm.mover]", e);
    res.status(500).json({ message: "No se pudo mover la tarea." });
  }
};

/* ========== DELETE /api/super/pm/tareas/:id ========== */
exports.eliminar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identificador inválido." });
    }
    const borrada = await TareaPm.findByIdAndDelete(req.params.id);
    if (!borrada) return res.status(404).json({ message: "Tarea no encontrada." });
    res.json({ message: "Tarea eliminada.", id: req.params.id });
  } catch (e) {
    console.error("[pm.eliminar]", e);
    res.status(500).json({ message: "No se pudo eliminar la tarea." });
  }
};

/* ========== GET /api/super/pm/resumen ========== */
/** Números del encabezado: cuántas hay en cada estado y por dashboard. */
exports.resumen = async (req, res) => {
  try {
    const [porEstado, porDashboard] = await Promise.all([
      TareaPm.aggregate([{ $group: { _id: "$estado", n: { $sum: 1 } } }]),
      TareaPm.aggregate([
        { $group: { _id: { dashboard: "$dashboard", estado: "$estado" }, n: { $sum: 1 } } },
      ]),
    ]);

    const estados = ESTADOS.reduce((acc, e) => ({ ...acc, [e]: 0 }), {});
    porEstado.forEach((r) => {
      if (r._id) estados[r._id] = r.n;
    });

    const dashboards = {};
    porDashboard.forEach((r) => {
      const d = r._id?.dashboard || "sin_asignar";
      if (!dashboards[d]) dashboards[d] = { total: 0 };
      dashboards[d][r._id.estado] = r.n;
      dashboards[d].total += r.n;
    });

    res.json({
      estados,
      dashboards,
      total: Object.values(estados).reduce((a, b) => a + b, 0),
    });
  } catch (e) {
    console.error("[pm.resumen]", e);
    res.status(500).json({ message: "No se pudo cargar el resumen." });
  }
};
