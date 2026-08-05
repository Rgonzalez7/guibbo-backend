// server/controllers/tiendaController.js
// =========================================================
// Tienda para director (admin), profesor y estudiante.
//
// ⚠️ PAGO SIMULADO: por ahora el botón de compra crea la orden y
// la marca como pagada al instante (metodoPago: "simulado").
// Cuando se conecte la pasarela real, `confirmarPago` es el único
// punto que cambia: recibirá la referencia externa y verificará el
// cobro antes de emitir las licencias. El resto del flujo queda igual.
// =========================================================
const Producto = require("../models/producto");
const Licencia = require("../models/licencia");
const Orden = require("../models/orden");
const PracticaInstancia = require("../models/practicaInstancia");
const { Modulo, Ejercicio } = require("../models/modulo");
const Materia = require("../models/materia");
const {
  licenciasDeUsuario,
  permisoCreacion,
  calcularExpiracion,
  estadoLicencia,
} = require("../utils/licencias");

/* ========== helpers ========== */

function audienciaDeRol(rol) {
  const r = String(rol || "").toLowerCase();
  if (r === "director" || r === "admin") return "director";
  if (r === "profesor") return "profesor";
  if (r === "estudiante") return "estudiante";
  return "";
}

function nombreDe(user) {
  return (
    [user?.nombre, user?.apellidos].filter(Boolean).join(" ") ||
    user?.nombres ||
    user?.email ||
    "Usuario"
  );
}

/* =========================================================
   GET /tienda/catalogo
   Productos que este rol puede comprar
   ========================================================= */
exports.catalogo = async (req, res) => {
  try {
    const audiencia = audienciaDeRol(req.user?.rol);
    if (!audiencia) return res.status(403).json({ message: "Rol sin acceso a la tienda." });

    /* =====================================================
       Director y profesor solo compran el SERVICIO DE CREACIÓN.
       Los módulos y paquetes se venden a la institución (súper
       usuario) o directamente al estudiante.
       ===================================================== */
    const filtro = { activo: true, audiencias: audiencia };
    if (audiencia === "director" || audiencia === "profesor") {
      filtro.tipo = "creacion";
    }

    const productos = await Producto.find(filtro)
      .populate("modulos", "titulo descripcion")
      .sort({ destacado: -1, createdAt: -1 })
      .lean();

    /* =====================================================
       Marcamos lo ya adquirido.

       ⚠️ Para el ESTUDIANTE solo cuentan sus compras personales:
       los módulos que su universidad tiene contratados los usa
       dentro de sus materias, pero eso NO le da práctica libre,
       así que debe poder comprarlos igual.
       ===================================================== */
    const uid = req.user.id || req.user._id;

    const misLicencias =
      audiencia === "estudiante"
        ? await Licencia.find({
            titular: "usuario",
            usuario: uid,
            activo: true,
            estadoPago: "pagado",
          }).lean()
        : await licenciasDeUsuario(req.user);

    const modulosQueTengo = new Set();
    for (const l of misLicencias) {
      for (const m of l.modulos || []) modulosQueTengo.add(String(m));
    }

    const conEstado = productos.map((p) => {
      const ids = (p.modulos || []).map((m) => String(m._id || m));
      const propios = ids.filter((id) => modulosQueTengo.has(id)).length;
      const yaTengo = ids.length > 0 && propios === ids.length;

      return {
        ...p,
        yaAdquirido: p.tipo === "creacion" ? false : yaTengo,
        cantidadModulos: ids.length,
        modulosYaAdquiridos: propios,
      };
    });

    res.json({ productos: conEstado, audiencia });
  } catch (err) {
    console.error("catalogo:", err);
    res.status(500).json({ message: "No se pudo cargar la tienda." });
  }
};

/* =========================================================
   POST /tienda/comprar
   Crea la orden. Con pago simulado, la deja pagada y emite licencias.
   ========================================================= */
exports.comprar = async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body || {};

    const audiencia = audienciaDeRol(req.user?.rol);
    if (!audiencia) return res.status(403).json({ message: "Rol sin acceso a la tienda." });

    const producto = await Producto.findById(productoId).lean();
    if (!producto || !producto.activo) {
      return res.status(404).json({ message: "Producto no disponible." });
    }

    if (!(producto.audiencias || []).includes(audiencia)) {
      return res.status(403).json({ message: "Este producto no está disponible para tu rol." });
    }

    if ((audiencia === "director" || audiencia === "profesor") && producto.tipo !== "creacion") {
      return res.status(403).json({
        message:
          "Desde tu tienda solo se pueden adquirir servicios de creación de módulos. Los paquetes de módulos se contratan a nivel institucional.",
      });
    }

    const cant = Math.max(1, Number(cantidad) || 1);
    const subtotal = (producto.precio || 0) * cant;

    const orden = await Orden.create({
      comprador: req.user.id || req.user._id,
      compradorNombre: nombreDe(req.user),
      compradorRol: req.user.rol,
      universidad: String(req.user.universidad || "").trim(),
      origen: "tienda",
      items: [
        {
          producto: producto._id,
          nombre: producto.nombre,
          tipo: producto.tipo,
          cantidad: cant,
          precioUnitario: producto.precio,
          subtotal,
        },
      ],
      total: subtotal,
      moneda: producto.moneda,
      estado: "pendiente",
      metodoPago: "simulado",
    });

    // 🔧 PAGO SIMULADO — aquí entrará la pasarela real
    const resultado = await confirmarPagoInterno(orden._id, req.user, {
      metodoPago: "simulado",
      referenciaExterna: `SIM-${Date.now()}`,
    });

    res.status(201).json(resultado);
  } catch (err) {
    console.error("comprar:", err);
    res.status(500).json({ message: "No se pudo completar la compra." });
  }
};

/**
 * Marca la orden como pagada y emite las licencias correspondientes.
 * Extraído aparte porque es el punto que usará la pasarela real
 * (webhook / retorno del checkout).
 */
async function confirmarPagoInterno(ordenId, user, { metodoPago, referenciaExterna }) {
  const orden = await Orden.findById(ordenId);
  if (!orden) throw new Error("Orden no encontrada");
  if (orden.estado === "pagada") {
    return { orden, licencias: [], yaPagada: true };
  }

  const licenciasCreadas = [];

  for (const item of orden.items) {
    const producto = await Producto.findById(item.producto).lean();
    if (!producto) continue;

    for (let i = 0; i < (item.cantidad || 1); i++) {
      const inicia = new Date();

      const licencia = await Licencia.create({
        titular: "usuario",
        universidad: orden.universidad,
        usuario: orden.comprador,
        usuarioRol: orden.compradorRol,

        producto: producto._id,
        productoNombre: producto.nombre,
        productoTipo: producto.tipo,

        modulos: producto.modulos || [],
        tiposEjercicio: producto.tiposEjercicio || [],
        limiteModulos: producto.limiteModulos || 0,

        estadoPago: "pagado",
        monto: item.precioUnitario,
        moneda: orden.moneda,

        inicia,
        expira: calcularExpiracion(producto.vigenciaDias, inicia),

        soloEvaluacionIA:
          producto.soloEvaluacionIA || String(orden.compradorRol) === "estudiante",
        intentosPermitidos:
          String(orden.compradorRol) === "estudiante"
            ? producto.intentosPermitidos || 1
            : 0,

        orden: orden._id,
        historial: [
          {
            accion: "compra",
            detalle: `Compra en tienda (${metodoPago})`,
            hechoPor: orden.comprador,
            hechoPorNombre: orden.compradorNombre,
            fecha: new Date(),
          },
        ],
      });

      licenciasCreadas.push(licencia);

      // Todo módulo comprado por un ESTUDIANTE se convierte en práctica libre,
      // sin depender de cómo se haya configurado el producto en el catálogo.
      if (String(orden.compradorRol) === "estudiante") {
        for (const moduloId of producto.modulos || []) {
          const practica = await PracticaInstancia.create({
            estudiante: orden.comprador,
            modulo: moduloId,
            licencia: licencia._id,
            estado: "pendiente",
          });

          // Materia personal de práctica: permite reutilizar todo el motor
          // de ejercicios (borradores, análisis IA, resultados) sin duplicarlo.
          // No la ve ningún profesor y no aparece en "Mis materias".
          const modulo = await Modulo.findById(moduloId).select("titulo").lean();

          const materia = await Materia.create({
            nombre: `Práctica libre — ${modulo?.titulo || "Módulo"}`,
            codigo: `PRACTICA-${String(practica._id).slice(-6).toUpperCase()}`,
            universidad: orden.universidad || "Práctica libre",
            profesor: orden.comprador,      // el propio estudiante: no hay docente
            profesorNombre: "Evaluación por IA",
            profesorEmail: "",
            estudiantes: [orden.comprador],
            modulosGlobales: [moduloId],
            estado: "activo",
            esPracticaLibre: true,
            practicaInstancia: practica._id,
          });

          practica.materia = materia._id;
          await practica.save();
        }
      }
    }
  }

  orden.estado = "pagada";
  orden.metodoPago = metodoPago;
  orden.referenciaExterna = referenciaExterna || "";
  orden.pagadaEn = new Date();
  orden.licencias = licenciasCreadas.map((l) => l._id);
  await orden.save();

  return { orden, licencias: licenciasCreadas };
}

/* =========================================================
   GET /tienda/mis-compras
   ========================================================= */
exports.misCompras = async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;

    const ordenes = await Orden.find({ comprador: uid })
      .sort({ createdAt: -1 })
      .lean();

    const licencias = await Licencia.find({ titular: "usuario", usuario: uid })
      .populate("modulos", "titulo descripcion")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ordenes,
      licencias: licencias.map((l) => ({
        ...l,
        estado: estadoLicencia(l),
        diasRestantes: l.expira
          ? Math.ceil((new Date(l.expira).getTime() - Date.now()) / 86400000)
          : null,
      })),
    });
  } catch (err) {
    console.error("misCompras:", err);
    res.status(500).json({ message: "No se pudo cargar el historial." });
  }
};

/* =========================================================
   GET /tienda/mis-vencimientos
   Accesos con fecha de caducidad: los que compró el usuario
   y los que le da su universidad.
   ========================================================= */
exports.misVencimientos = async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;
    const universidad = String(req.user.universidad || "").trim();

    const propias = await Licencia.find({
      titular: "usuario",
      usuario: uid,
      activo: true,
      estadoPago: "pagado",
    })
      .populate("modulos", "titulo")
      .sort({ expira: 1 })
      .lean();

    const institucionales = universidad
      ? await Licencia.find({
          titular: "institucion",
          universidad: { $regex: `^\\s*${universidad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, $options: "i" },
          activo: true,
          estadoPago: "pagado",
        })
          .populate("modulos", "titulo")
          .sort({ expira: 1 })
          .lean()
      : [];

    const mapear = (l, origen) => ({
      _id: String(l._id),
      nombre: l.productoNombre,
      tipo: l.productoTipo,
      origen, // "propia" | "universidad"
      modulos: (l.modulos || []).map((m) => m?.titulo).filter(Boolean),
      cantidadModulos: (l.modulos || []).length,
      expira: l.expira || null,
      diasRestantes: l.expira
        ? Math.ceil((new Date(l.expira).getTime() - Date.now()) / 86400000)
        : null,
    });

    const items = [
      ...propias.map((l) => mapear(l, "propia")),
      ...institucionales.map((l) => mapear(l, "universidad")),
    ].sort((a, b) => {
      // Primero lo que vence antes; lo que no vence, al final
      if (a.expira && b.expira) return new Date(a.expira) - new Date(b.expira);
      if (a.expira) return -1;
      if (b.expira) return 1;
      return 0;
    });

    res.json({ vencimientos: items });
  } catch (err) {
    console.error("misVencimientos:", err);
    res.status(500).json({ message: "No se pudieron cargar los vencimientos." });
  }
};

/* =========================================================
   GET /tienda/mis-permisos
   Lo que el usuario tiene habilitado hoy (para admin y profesor)
   ========================================================= */
exports.misPermisos = async (req, res) => {
  try {
    const creacion = await permisoCreacion(req.user);
    const licencias = await licenciasDeUsuario(req.user);

    const modulos = new Set();
    for (const l of licencias) {
      for (const m of l.modulos || []) modulos.add(String(m));
    }

    res.json({
      puedeCrearModulos: creacion.permitido,
      tiposEjercicioPermitidos: creacion.tiposEjercicio,
      limiteModulos: creacion.limite,
      modulosDisponibles: modulos.size,
      licenciasVigentes: licencias.length,
    });
  } catch (err) {
    console.error("misPermisos:", err);
    res.status(500).json({ message: "No se pudieron cargar los permisos." });
  }
};

/**
 * Devuelve la materia personal de una práctica, creándola si todavía
 * no existe (compras hechas antes de este flujo, o si falló al comprar).
 */
async function asegurarMateriaPractica(practica, user) {
  if (practica.materia) return practica.materia;

  // Si el registro quedó huérfano (compra vieja o fallo al comprar),
  // reutilizamos la materia existente antes de crear otra.
  const existente = await Materia.findOne({
    esPracticaLibre: true,
    practicaInstancia: practica._id,
  })
    .select("_id")
    .lean();

  if (existente?._id) {
    practica.materia = existente._id;
    await practica.save();
    return existente._id;
  }

  const modulo = await Modulo.findById(practica.modulo).select("titulo").lean();

  const materia = await Materia.create({
    nombre: `Práctica libre — ${modulo?.titulo || "Módulo"}`,
    codigo: `PRACTICA-${String(practica._id).slice(-6).toUpperCase()}`,
    universidad: String(user?.universidad || "").trim() || "Práctica libre",
    profesor: practica.estudiante,
    profesorNombre: "Evaluación por IA",
    profesorEmail: "",
    estudiantes: [practica.estudiante],
    modulosGlobales: [practica.modulo],
    estado: "activo",
    esPracticaLibre: true,
    practicaInstancia: practica._id,
  });

  practica.materia = materia._id;
  await practica.save();

  return materia._id;
}

/**
 * Crea las prácticas que falten para las licencias ya compradas
 * por el estudiante. Sirve para compras hechas antes de este flujo
 * o cuando el producto no tenía marcada la práctica libre.
 */
async function sincronizarPracticas(uid) {
  const Licencia = require("../models/licencia");

  const licencias = await Licencia.find({
    titular: "usuario",
    usuario: uid,
    activo: true,
    estadoPago: "pagado",
  }).lean();

  if (!licencias.length) return 0;

  const existentes = await PracticaInstancia.find({ estudiante: uid })
    .select("licencia modulo")
    .lean();

  const yaCreadas = new Set(
    existentes.map((p) => `${String(p.licencia)}|${String(p.modulo)}`)
  );

  let creadas = 0;

  for (const lic of licencias) {
    for (const moduloId of lic.modulos || []) {
      const clave = `${String(lic._id)}|${String(moduloId)}`;
      if (yaCreadas.has(clave)) continue;

      try {
        await PracticaInstancia.create({
          estudiante: uid,
          modulo: moduloId,
          licencia: lic._id,
          estado: "pendiente",
        });
        creadas++;
      } catch (e) {
        // El índice único puede rechazar duplicados en carreras: se ignora
        if (e?.code !== 11000) console.error("sincronizarPracticas:", e.message);
      }
    }
  }

  if (creadas) console.log(`[practicas] ${creadas} práctica(s) creadas para ${uid}`);
  return creadas;
}

/* =========================================================
   GET /tienda/mis-practicas  (solo estudiante)
   Módulos comprados para práctica libre
   ========================================================= */
exports.misPracticas = async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;

    // Recupera compras que quedaron sin su práctica asociada
    await sincronizarPracticas(uid);

    const practicas = await PracticaInstancia.find({ estudiante: uid })
      .populate("modulo", "titulo descripcion")
      .populate("licencia", "productoNombre expira estadoPago activo")
      .populate("materia", "nombre codigo")
      .sort({ createdAt: -1 })
      .lean();

    // Ejercicios de cada módulo, para mostrar el contenido
    const ids = practicas.map((p) => p.modulo?._id).filter(Boolean);
    const ejercicios = await Ejercicio.find({ modulo: { $in: ids } })
      .select("modulo titulo tipoEjercicio tiempo")
      .lean();

    const porModulo = new Map();
    for (const e of ejercicios) {
      const k = String(e.modulo);
      if (!porModulo.has(k)) porModulo.set(k, []);
      porModulo.get(k).push(e);
    }

    console.log(`[practicas] ${uid} → ${practicas.length} práctica(s) devueltas`);

    res.json({
      practicas: practicas.map((p) => ({
        ...p,
        ejercicios: porModulo.get(String(p.modulo?._id)) || [],
        vigente: p.licencia?.activo !== false && p.licencia?.estadoPago === "pagado",
      })),
      // 🔍 Permite confirmar en el navegador qué versión está respondiendo
      meta: { version: "practicas-v2", total: practicas.length },
    });
  } catch (err) {
    console.error("misPracticas:", err);
    res.status(500).json({
      message: "No se pudieron cargar tus prácticas.",
      detalle: err?.message || String(err),
    });
  }
};

/* =========================================================
   POST /tienda/practicas/:id/iniciar   (solo estudiante)
   ========================================================= */
exports.iniciarPractica = async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;

    const practica = await PracticaInstancia.findOne({
      _id: req.params.id,
      estudiante: uid,
    });
    if (!practica) return res.status(404).json({ message: "Práctica no encontrada." });

    if (practica.bloqueado || practica.estado === "completado") {
      return res.status(409).json({
        message:
          "Este módulo ya fue completado. Podés consultar tus resultados, pero para volver a realizarlo tenés que comprarlo de nuevo.",
        bloqueado: true,
      });
    }

    if (practica.estado === "pendiente") {
      practica.estado = "en_progreso";
      practica.fechaInicio = new Date();
      await practica.save();
    }

    // ✅ Si por cualquier motivo no tiene materia personal, la creamos ahora
    let materiaId = null;
    try {
      materiaId = await asegurarMateriaPractica(practica, req.user);
    } catch (e) {
      console.error("asegurarMateriaPractica:", e);
      return res.status(500).json({
        message:
          "No se pudo preparar el espacio de práctica de este módulo. " +
          (e?.message || "Error desconocido."),
        codigo: "MATERIA_PRACTICA",
      });
    }

    if (!materiaId) {
      return res.status(500).json({
        message: "No se pudo preparar el espacio de práctica de este módulo.",
        codigo: "MATERIA_PRACTICA",
      });
    }

    res.json({
      practica,
      materiaId: String(materiaId),
      moduloId: String(practica.modulo),
    });
  } catch (err) {
    console.error("iniciarPractica:", err);
    res.status(500).json({ message: "No se pudo iniciar la práctica." });
  }
};

/* =========================================================
   POST /tienda/practicas/:id/finalizar  (solo estudiante)
   Cierra el intento único: resultados de por vida, sin reinicio.
   ========================================================= */
exports.finalizarPractica = async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;

    const practica = await PracticaInstancia.findOne({
      _id: req.params.id,
      estudiante: uid,
    });
    if (!practica) return res.status(404).json({ message: "Práctica no encontrada." });

    practica.estado = "completado";
    practica.progreso = 100;
    practica.bloqueado = true;
    practica.fechaFinalizacion = new Date();
    await practica.save();

    const licencia = await Licencia.findById(practica.licencia);
    if (licencia) {
      licencia.intentosUsados = (licencia.intentosUsados || 0) + 1;
      await licencia.save();
    }

    res.json({ practica });
  } catch (err) {
    console.error("finalizarPractica:", err);
    res.status(500).json({ message: "No se pudo finalizar la práctica." });
  }
};

exports.confirmarPagoInterno = confirmarPagoInterno;
