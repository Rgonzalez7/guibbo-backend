// server/middlewares/requireLicencia.js
// =========================================================
// Candados de licencia para la creación de contenido.
//
// El súper usuario nunca pasa por acá (crea sin restricción).
// Para director y profesor, la creación de módulos y de cada
// tipo de ejercicio depende de haber comprado el servicio
// de creación correspondiente.
// =========================================================
const { permisoCreacion } = require("../utils/licencias");
const { Modulo } = require("../models/modulo");
const Universidad = require("../models/university");

const MENSAJE_SIN_LICENCIA =
  "Tu institución no tiene activo el servicio de creación de módulos. Podés adquirirlo desde la Tienda.";

function esSuper(req) {
  return String(req.user?.rol || "") === "super";
}

/**
 * Exige tener el servicio de creación activo.
 * Deja el permiso en req.permisoCreacion para los middlewares siguientes.
 */
async function requireCreacionModulos(req, res, next) {
  try {
    if (esSuper(req)) return next();

    const permiso = await permisoCreacion(req.user);

    if (!permiso.permitido) {
      return res.status(403).json({
        message: MENSAJE_SIN_LICENCIA,
        codigo: "SIN_LICENCIA_CREACION",
      });
    }

    req.permisoCreacion = permiso;
    next();
  } catch (err) {
    console.error("requireCreacionModulos:", err);
    res.status(500).json({ message: "No se pudo verificar la licencia." });
  }
}

/**
 * Además del servicio activo, verifica que no se haya superado
 * el límite de módulos contratado (0 = sin límite).
 */
async function requireCupoModulos(req, res, next) {
  try {
    if (esSuper(req)) return next();

    const permiso = req.permisoCreacion || (await permisoCreacion(req.user));

    if (!permiso.permitido) {
      return res.status(403).json({
        message: MENSAJE_SIN_LICENCIA,
        codigo: "SIN_LICENCIA_CREACION",
      });
    }

    if (!permiso.limite) return next(); // sin límite

    // Contamos los módulos ya creados por la universidad
    let universidadId = req.user?.universidad || null;
    if (universidadId && typeof universidadId === "string") {
      const uniDoc = await Universidad.findOne({ nombre: universidadId.trim() }).lean();
      universidadId = uniDoc?._id || null;
    }

    const creados = await Modulo.countDocuments({
      esGlobal: false,
      activo: true,
      ...(universidadId ? { universidad: universidadId } : { creadoPor: req.user?.id }),
    });

    if (creados >= permiso.limite) {
      return res.status(403).json({
        message: `Alcanzaste el límite de ${permiso.limite} módulos de tu plan. Podés ampliarlo desde la Tienda.`,
        codigo: "LIMITE_MODULOS",
        limite: permiso.limite,
        creados,
      });
    }

    next();
  } catch (err) {
    console.error("requireCupoModulos:", err);
    res.status(500).json({ message: "No se pudo verificar el cupo de módulos." });
  }
}

/**
 * Verifica el tipo de ejercicio.
 * - requireTipoEjercicio("Grabar voz")  → tipo fijo de la ruta
 * - requireTipoEjercicio()              → lo toma de req.body.tipoEjercicio
 *
 * Los tipos que no forman parte del catálogo de venta (por ejemplo
 * los heredados) solo requieren el servicio de creación activo.
 */
const TIPOS_VENDIBLES = [
  "Role playing persona",
  "Role Playing IA",
  "Grabar voz",
  "Informe clínico",
  "Multi Sesion",
];

function requireTipoEjercicio(tipoFijo = null) {
  return async (req, res, next) => {
    try {
      if (esSuper(req)) return next();

      const permiso = req.permisoCreacion || (await permisoCreacion(req.user));

      if (!permiso.permitido) {
        return res.status(403).json({
          message: MENSAJE_SIN_LICENCIA,
          codigo: "SIN_LICENCIA_CREACION",
        });
      }

      const tipo = tipoFijo || req.body?.tipoEjercicio || "";
      if (!tipo) return next();

      // Role playing: el tipo real depende de tipoRole
      let tipoReal = tipo;
      if (String(tipo).toLowerCase().includes("role")) {
        const tipoRole = String(req.body?.tipoRole || "").toLowerCase();
        if (tipoRole === "simulada") tipoReal = "Role Playing IA";
        else if (tipoRole === "real") tipoReal = "Role playing persona";
      }

      if (!TIPOS_VENDIBLES.includes(tipoReal)) return next();

      if (!permiso.tiposEjercicio.includes(tipoReal)) {
        return res.status(403).json({
          message: `Tu plan no incluye ejercicios de tipo "${tipoReal}". Podés agregarlo desde la Tienda.`,
          codigo: "TIPO_NO_LICENCIADO",
          tipo: tipoReal,
          tiposPermitidos: permiso.tiposEjercicio,
        });
      }

      next();
    } catch (err) {
      console.error("requireTipoEjercicio:", err);
      res.status(500).json({ message: "No se pudo verificar la licencia del ejercicio." });
    }
  };
}

module.exports = {
  requireCreacionModulos,
  requireCupoModulos,
  requireTipoEjercicio,
  TIPOS_VENDIBLES,
  MENSAJE_SIN_LICENCIA,
};
