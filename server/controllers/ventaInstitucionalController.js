// server/controllers/ventaInstitucionalController.js
// =========================================================
// Panel de venta institucional — SOLO súper usuario.
// Aquí se arma el catálogo, se emiten las licencias de cada
// universidad y se lleva el control de pago y de vigencia.
// =========================================================
const Producto = require("../models/producto");
const Licencia = require("../models/licencia");
const Orden = require("../models/orden");
const { Modulo } = require("../models/modulo");
const University = require("../models/university");
const User = require("../models/user");
const PracticaInstancia = require("../models/practicaInstancia");
const Materia = require("../models/materia");
const { calcularExpiracion, estadoLicencia } = require("../utils/licencias");

function nombreUsuario(req) {
  const u = req.user || {};
  return [u.nombre, u.apellidos].filter(Boolean).join(" ") || u.email || "Súper usuario";
}

function movimiento(req, accion, detalle = "") {
  return {
    accion,
    detalle,
    hechoPor: req.user?.id || req.user?._id || null,
    hechoPorNombre: nombreUsuario(req),
    fecha: new Date(),
  };
}

/* =========================================================
   CATÁLOGO DE PRODUCTOS
   ========================================================= */

exports.listarProductos = async (req, res) => {
  try {
    const { tipo, audiencia, incluirInactivos } = req.query;

    const q = {};
    if (tipo) q.tipo = tipo;
    if (audiencia) q.audiencias = audiencia;
    if (String(incluirInactivos) !== "true") q.activo = true;

    const productos = await Producto.find(q)
      .populate("modulos", "titulo descripcion")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ productos });
  } catch (err) {
    console.error("listarProductos:", err);
    res.status(500).json({ message: "No se pudieron listar los productos." });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    const {
      tipo,
      nombre,
      descripcion = "",
      modulos = [],
      tiposEjercicio = [],
      limiteModulos = 0,
      precio = 0,
      moneda = "CRC",
      vigenciaDias = 365,
      audiencias = ["institucion"],
      soloEvaluacionIA = false,
      intentosPermitidos = 1,
      destacado = false,
    } = req.body || {};

    if (!tipo || !nombre) {
      return res.status(400).json({ message: "El tipo y el nombre son obligatorios." });
    }

    if (tipo === "creacion" && !tiposEjercicio.length) {
      return res
        .status(400)
        .json({ message: "Un producto de creación debe incluir al menos un tipo de ejercicio." });
    }

    if ((tipo === "modulo" || tipo === "paquete") && !modulos.length) {
      return res.status(400).json({ message: "Debes seleccionar al menos un módulo." });
    }

    const producto = await Producto.create({
      tipo,
      nombre: String(nombre).trim(),
      descripcion,
      modulos: tipo === "creacion" ? [] : modulos,
      tiposEjercicio: tipo === "creacion" ? tiposEjercicio : [],
      limiteModulos,
      precio,
      moneda,
      vigenciaDias,
      audiencias,
      soloEvaluacionIA,
      intentosPermitidos,
      destacado,
      creadoPor: req.user?.id || null,
    });

    res.status(201).json({ producto });
  } catch (err) {
    console.error("crearProducto:", err);
    res.status(500).json({ message: "No se pudo crear el producto." });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const campos = [
      "nombre", "descripcion", "modulos", "tiposEjercicio", "limiteModulos",
      "precio", "moneda", "vigenciaDias", "audiencias", "soloEvaluacionIA",
      "intentosPermitidos", "destacado", "activo",
    ];

    const patch = {};
    for (const c of campos) {
      if (req.body?.[c] !== undefined) patch[c] = req.body[c];
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!producto) return res.status(404).json({ message: "Producto no encontrado." });

    res.json({ producto });
  } catch (err) {
    console.error("actualizarProducto:", err);
    res.status(500).json({ message: "No se pudo actualizar el producto." });
  }
};

/** Desactiva el producto: deja de venderse pero conserva lo ya vendido. */
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!producto) return res.status(404).json({ message: "Producto no encontrado." });

    res.json({ ok: true, producto });
  } catch (err) {
    console.error("eliminarProducto:", err);
    res.status(500).json({ message: "No se pudo desactivar el producto." });
  }
};

/** Vuelve a publicar un producto desactivado. */
exports.reactivarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: true },
      { new: true }
    );
    if (!producto) return res.status(404).json({ message: "Producto no encontrado." });

    res.json({ ok: true, producto });
  } catch (err) {
    console.error("reactivarProducto:", err);
    res.status(500).json({ message: "No se pudo reactivar el producto." });
  }
};

/* =========================================================
   BORRAR PRODUCTO DEFINITIVAMENTE
   ---------------------------------------------------------
   Si ya se vendió, avisamos cuántas licencias existen. Solo se
   borra si se confirma con `forzar: true`, y en ese caso las
   licencias emitidas NO se tocan: siguen dando acceso, porque
   guardan su propia copia de los módulos.
   ========================================================= */
exports.borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const forzar = req.query.forzar === "true" || req.body?.forzar === true;

    const producto = await Producto.findById(id).lean();
    if (!producto) return res.status(404).json({ message: "Producto no encontrado." });

    const licenciasEmitidas = await Licencia.countDocuments({ producto: id });

    if (licenciasEmitidas > 0 && !forzar) {
      return res.status(409).json({
        message:
          `Este producto ya se vendió ${licenciasEmitidas} vez(ces). Si lo borrás, las ` +
          "licencias emitidas conservan su acceso pero quedan sin producto de referencia.",
        codigo: "PRODUCTO_CON_VENTAS",
        licenciasEmitidas,
      });
    }

    // Las licencias quedan huérfanas a propósito: ya tienen copiados
    // sus módulos y tipos, así que el acceso del cliente no se ve afectado.
    if (licenciasEmitidas > 0) {
      await Licencia.updateMany({ producto: id }, { $set: { producto: null } });
    }

    await Producto.deleteOne({ _id: id });

    console.log(
      `[venta] Producto borrado "${producto.nombre}" · licencias afectadas=${licenciasEmitidas}`
    );

    res.json({ ok: true, licenciasAfectadas: licenciasEmitidas });
  } catch (err) {
    console.error("borrarProducto:", err);
    res.status(500).json({ message: "No se pudo borrar el producto." });
  }
};

/* =========================================================
   LICENCIAS
   ========================================================= */

exports.listarLicencias = async (req, res) => {
  try {
    const { universidad, estadoPago, titular } = req.query;

    const q = {};
    if (universidad) q.universidad = universidad;
    if (estadoPago) q.estadoPago = estadoPago;
    if (titular) q.titular = titular;

    const licencias = await Licencia.find(q)
      .populate("modulos", "titulo")
      .populate("usuario", "nombre apellidos email rol")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      licencias: licencias.map((l) => ({
        ...l,
        estado: estadoLicencia(l),
        diasRestantes: l.expira
          ? Math.ceil((new Date(l.expira).getTime() - Date.now()) / 86400000)
          : null,
      })),
    });
  } catch (err) {
    console.error("listarLicencias:", err);
    res.status(500).json({ message: "No se pudieron listar las licencias." });
  }
};

/** Emite una licencia institucional a partir de un producto del catálogo. */
exports.emitirLicencia = async (req, res) => {
  try {
    const {
      productoId,
      universidad,
      usuarioId = null,
      estadoPago = "pendiente",
      inicia,
      vigenciaDias,
      cuposTotal = 0,
      monto,
      notas = "",
    } = req.body || {};

    const producto = await Producto.findById(productoId).lean();
    if (!producto) return res.status(404).json({ message: "Producto no encontrado." });

    const esUsuario = Boolean(usuarioId);
    if (!esUsuario && !String(universidad || "").trim()) {
      return res.status(400).json({ message: "Indica la universidad o el usuario titular." });
    }

    let usuarioDoc = null;
    if (esUsuario) {
      usuarioDoc = await User.findById(usuarioId).lean();
      if (!usuarioDoc) return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const uniNombre = esUsuario
      ? String(usuarioDoc.universidad || "").trim()
      : String(universidad).trim();

    const uniRef = await University.findOne({ nombre: uniNombre }).lean();

    const fechaInicio = inicia ? new Date(inicia) : new Date();
    const dias = vigenciaDias !== undefined ? vigenciaDias : producto.vigenciaDias;

    const licencia = await Licencia.create({
      titular: esUsuario ? "usuario" : "institucion",
      universidad: uniNombre,
      universidadRef: uniRef?._id || null,
      usuario: esUsuario ? usuarioId : null,
      usuarioRol: usuarioDoc?.rol || "",

      producto: producto._id,
      productoNombre: producto.nombre,
      productoTipo: producto.tipo,

      modulos: producto.modulos || [],
      tiposEjercicio: producto.tiposEjercicio || [],
      limiteModulos: producto.limiteModulos || 0,

      estadoPago,
      monto: monto !== undefined ? monto : producto.precio,
      moneda: producto.moneda,

      inicia: fechaInicio,
      expira: calcularExpiracion(dias, fechaInicio),

      cuposTotal,
      soloEvaluacionIA: producto.soloEvaluacionIA,
      intentosPermitidos: producto.soloEvaluacionIA ? producto.intentosPermitidos : 0,

      notas,
      historial: [movimiento(req, "creada", `Licencia emitida (${producto.nombre})`)],
    });

    res.status(201).json({ licencia });
  } catch (err) {
    console.error("emitirLicencia:", err);
    res.status(500).json({ message: "No se pudo emitir la licencia." });
  }
};

/** Cambia el estado de pago (pendiente ↔ pagado ↔ cancelado). */
exports.cambiarEstadoPago = async (req, res) => {
  try {
    const { estadoPago } = req.body || {};
    if (!["pendiente", "pagado", "vencido", "cancelado"].includes(estadoPago)) {
      return res.status(400).json({ message: "Estado de pago no válido." });
    }

    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    const anterior = licencia.estadoPago;
    licencia.estadoPago = estadoPago;
    licencia.historial.push(
      movimiento(req, "estado_pago", `${anterior} → ${estadoPago}`)
    );

    await licencia.save();
    res.json({ licencia, estado: estadoLicencia(licencia) });
  } catch (err) {
    console.error("cambiarEstadoPago:", err);
    res.status(500).json({ message: "No se pudo cambiar el estado de pago." });
  }
};

/** Extiende (o recorta) la vigencia de una licencia. */
exports.extenderVigencia = async (req, res) => {
  try {
    const { dias, nuevaFecha } = req.body || {};

    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    const antes = licencia.expira;

    if (nuevaFecha) {
      licencia.expira = new Date(nuevaFecha);
    } else {
      const n = Number(dias);
      if (!Number.isFinite(n)) {
        return res.status(400).json({ message: "Indica los días o la nueva fecha." });
      }
      const base = licencia.expira ? new Date(licencia.expira) : new Date();
      base.setDate(base.getDate() + n);
      licencia.expira = base;
    }

    licencia.historial.push(
      movimiento(
        req,
        "vigencia",
        `${antes ? new Date(antes).toLocaleDateString("es-CR") : "sin vencimiento"} → ${new Date(
          licencia.expira
        ).toLocaleDateString("es-CR")}`
      )
    );

    await licencia.save();
    res.json({ licencia, estado: estadoLicencia(licencia) });
  } catch (err) {
    console.error("extenderVigencia:", err);
    res.status(500).json({ message: "No se pudo actualizar la vigencia." });
  }
};

/** Actualiza contenido / cupos / notas de una licencia ya emitida. */
exports.actualizarLicencia = async (req, res) => {
  try {
    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    const campos = ["modulos", "tiposEjercicio", "limiteModulos", "cuposTotal", "notas", "activo", "monto"];
    const cambios = [];

    for (const c of campos) {
      if (req.body?.[c] !== undefined) {
        licencia[c] = req.body[c];
        cambios.push(c);
      }
    }

    if (cambios.length) {
      licencia.historial.push(movimiento(req, "editada", `Campos: ${cambios.join(", ")}`));
    }

    await licencia.save();
    res.json({ licencia, estado: estadoLicencia(licencia) });
  } catch (err) {
    console.error("actualizarLicencia:", err);
    res.status(500).json({ message: "No se pudo actualizar la licencia." });
  }
};

exports.revocarLicencia = async (req, res) => {
  try {
    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    licencia.activo = false;
    licencia.historial.push(movimiento(req, "revocada", req.body?.motivo || ""));
    await licencia.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("revocarLicencia:", err);
    res.status(500).json({ message: "No se pudo revocar la licencia." });
  }
};

/**
 * Borra todo lo que depende de una licencia:
 * prácticas del estudiante y su materia personal de práctica.
 * Devuelve un resumen de lo eliminado.
 */
async function limpiarDependencias(licenciaId) {
  const practicas = await PracticaInstancia.find({ licencia: licenciaId }).lean();

  const materiaIds = practicas.map((p) => p.materia).filter(Boolean);

  if (materiaIds.length) {
    // Solo se borran las materias personales de práctica libre,
    // nunca una materia real de la universidad.
    await Materia.deleteMany({ _id: { $in: materiaIds }, esPracticaLibre: true });
  }

  await PracticaInstancia.deleteMany({ licencia: licenciaId });

  return { practicas: practicas.length, materias: materiaIds.length };
}

/* =========================================================
   ELIMINAR LICENCIA (definitivo)
   El acceso desaparece de inmediato para el titular.
   ========================================================= */
exports.eliminarLicencia = async (req, res) => {
  try {
    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    const limpieza = await limpiarDependencias(licencia._id);

    // La quitamos también de la orden que la generó
    if (licencia.orden) {
      await Orden.updateOne(
        { _id: licencia.orden },
        { $pull: { licencias: licencia._id } }
      );
    }

    await Licencia.deleteOne({ _id: licencia._id });

    console.log(
      `[venta] Licencia eliminada "${licencia.productoNombre}" · ` +
      `prácticas=${limpieza.practicas} · materias=${limpieza.materias}`
    );

    res.json({
      ok: true,
      eliminado: {
        licencia: String(licencia._id),
        practicas: limpieza.practicas,
        materias: limpieza.materias,
      },
    });
  } catch (err) {
    console.error("eliminarLicencia:", err);
    res.status(500).json({ message: "No se pudo eliminar la licencia." });
  }
};

/* =========================================================
   REACTIVAR una licencia revocada
   ========================================================= */
exports.reactivarLicencia = async (req, res) => {
  try {
    const licencia = await Licencia.findById(req.params.id);
    if (!licencia) return res.status(404).json({ message: "Licencia no encontrada." });

    licencia.activo = true;
    licencia.historial.push(movimiento(req, "reactivada", req.body?.motivo || ""));
    await licencia.save();

    res.json({ licencia, estado: estadoLicencia(licencia) });
  } catch (err) {
    console.error("reactivarLicencia:", err);
    res.status(500).json({ message: "No se pudo reactivar la licencia." });
  }
};

/* =========================================================
   ELIMINAR COMPRA (orden + sus licencias + dependencias)
   ========================================================= */
exports.eliminarOrden = async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) return res.status(404).json({ message: "Compra no encontrada." });

    // Cubrimos tanto las licencias enlazadas en la orden
    // como las que apuntan a ella (por si el enlace quedó suelto)
    const licencias = await Licencia.find({
      $or: [{ _id: { $in: orden.licencias || [] } }, { orden: orden._id }],
    }).lean();

    let practicas = 0;
    let materias = 0;

    for (const l of licencias) {
      const r = await limpiarDependencias(l._id);
      practicas += r.practicas;
      materias += r.materias;
    }

    await Licencia.deleteMany({ _id: { $in: licencias.map((l) => l._id) } });
    await Orden.deleteOne({ _id: orden._id });

    console.log(
      `[venta] Compra eliminada de ${orden.compradorNombre} · ` +
      `licencias=${licencias.length} · prácticas=${practicas}`
    );

    res.json({
      ok: true,
      eliminado: { licencias: licencias.length, practicas, materias },
    });
  } catch (err) {
    console.error("eliminarOrden:", err);
    res.status(500).json({ message: "No se pudo eliminar la compra." });
  }
};

/* =========================================================
   RESUMEN POR UNIVERSIDAD
   ========================================================= */

exports.resumenUniversidades = async (req, res) => {
  try {
    const universidades = await University.find().sort({ nombre: 1 }).lean();
    const licencias = await Licencia.find({ titular: "institucion" }).lean();

    const porUni = new Map();
    for (const l of licencias) {
      const k = String(l.universidad || "");
      if (!porUni.has(k)) porUni.set(k, []);
      porUni.get(k).push(l);
    }

    const filas = universidades.map((u) => {
      const lics = porUni.get(String(u.nombre)) || [];
      const activas = lics.filter((l) => estadoLicencia(l) === "activa");
      const pendientes = lics.filter((l) => l.estadoPago === "pendiente");

      const modulos = new Set();
      const tipos = new Set();
      for (const l of activas) {
        for (const m of l.modulos || []) modulos.add(String(m));
        for (const t of l.tiposEjercicio || []) tipos.add(t);
      }

      const proximaExpira = activas
        .map((l) => l.expira)
        .filter(Boolean)
        .sort((a, b) => new Date(a) - new Date(b))[0] || null;

      return {
        _id: u._id,
        nombre: u.nombre,
        codigo: u.codigo,
        pais: u.pais,
        pago: u.pago,
        licenciasTotal: lics.length,
        licenciasActivas: activas.length,
        licenciasPendientes: pendientes.length,
        modulosContratados: modulos.size,
        tiposCreacion: Array.from(tipos),
        proximaExpiracion: proximaExpira,
        montoPendiente: pendientes.reduce((s, l) => s + (l.monto || 0), 0),
      };
    });

    res.json({ universidades: filas });
  } catch (err) {
    console.error("resumenUniversidades:", err);
    res.status(500).json({ message: "No se pudo generar el resumen." });
  }
};

/** Módulos disponibles para armar productos (los del súper usuario). */
exports.modulosVendibles = async (req, res) => {
  try {
    const modulos = await Modulo.find({ esGlobal: true, activo: true })
      .select("titulo descripcion createdAt")
      .sort({ titulo: 1 })
      .lean();

    res.json({ modulos });
  } catch (err) {
    console.error("modulosVendibles:", err);
    res.status(500).json({ message: "No se pudieron listar los módulos." });
  }
};

/* =========================================================
   ÓRDENES
   ========================================================= */

exports.listarOrdenes = async (req, res) => {
  try {
    const { estado, universidad, origen } = req.query;

    const q = {};
    if (estado) q.estado = estado;
    if (universidad) q.universidad = universidad;
    if (origen) q.origen = origen;

    const ordenes = await Orden.find(q)
      .populate("comprador", "nombre apellidos email rol")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    res.json({ ordenes });
  } catch (err) {
    console.error("listarOrdenes:", err);
    res.status(500).json({ message: "No se pudieron listar las órdenes." });
  }
};
