// server/utils/licencias.js
// =========================================================
// Punto único donde se resuelve "¿este usuario puede hacer X?".
// Todo el resto del backend debe preguntar acá en vez de mirar
// las licencias por su cuenta.
// =========================================================
const Licencia = require("../models/licencia");

const VIGENTE = { activo: true, estadoPago: "pagado" };

function filtroVigencia() {
  const ahora = new Date();
  return {
    ...VIGENTE,
    $and: [
      { $or: [{ inicia: null }, { inicia: { $lte: ahora } }] },
      { $or: [{ expira: null }, { expira: { $gte: ahora } }] },
    ],
  };
}

/**
 * Licencias vigentes que aplican a un usuario:
 * las suyas propias + las de su universidad.
 */
async function licenciasDeUsuario(user) {
  if (!user) return [];

  const uid = user.id || user._id;
  const uni = String(user.universidad || "").trim();

  const or = [];
  if (uid) or.push({ titular: "usuario", usuario: uid });
  if (uni) or.push({ titular: "institucion", universidad: uni });
  if (!or.length) return [];

  return Licencia.find({ ...filtroVigencia(), $or: or }).lean();
}

/** Licencias vigentes de una universidad. */
async function licenciasDeUniversidad(universidad) {
  const uni = String(universidad || "").trim();
  if (!uni) return [];
  return Licencia.find({ ...filtroVigencia(), titular: "institucion", universidad: uni }).lean();
}

/**
 * IDs de módulos a los que el usuario tiene acceso por licencia.
 */
async function modulosPermitidos(user) {
  const lics = await licenciasDeUsuario(user);
  const set = new Set();

  for (const l of lics) {
    for (const m of l.modulos || []) set.add(String(m));
  }

  return Array.from(set);
}

/**
 * ¿Puede crear módulos? ¿De qué tipos de ejercicio?
 * Devuelve { permitido, tiposEjercicio, limite, licencias }
 */
async function permisoCreacion(user) {
  const lics = await licenciasDeUsuario(user);
  const deCreacion = lics.filter(
    (l) => l.productoTipo === "creacion" || (l.tiposEjercicio || []).length > 0
  );

  if (!deCreacion.length) {
    return { permitido: false, tiposEjercicio: [], limite: 0, licencias: [] };
  }

  const tipos = new Set();
  let limite = 0; // 0 = ilimitado
  let algunoIlimitado = false;

  for (const l of deCreacion) {
    for (const t of l.tiposEjercicio || []) tipos.add(t);
    if (!l.limiteModulos) algunoIlimitado = true;
    else limite += l.limiteModulos;
  }

  return {
    permitido: true,
    tiposEjercicio: Array.from(tipos),
    limite: algunoIlimitado ? 0 : limite,
    licencias: deCreacion.map((l) => String(l._id)),
  };
}

/** ¿Puede crear un ejercicio de este tipo concreto? */
async function puedeCrearTipoEjercicio(user, tipoEjercicio) {
  // El súper usuario nunca necesita licencia
  if (String(user?.rol) === "super") return true;

  const { permitido, tiposEjercicio } = await permisoCreacion(user);
  if (!permitido) return false;
  if (!tipoEjercicio) return true;

  return tiposEjercicio.includes(String(tipoEjercicio));
}

/** ¿El usuario tiene acceso a este módulo? */
async function tieneAccesoAModulo(user, moduloId) {
  if (String(user?.rol) === "super") return true;

  const ids = await modulosPermitidos(user);
  return ids.includes(String(moduloId));
}

/** Fecha de expiración a partir de una vigencia en días. */
function calcularExpiracion(vigenciaDias, desde = new Date()) {
  const dias = Number(vigenciaDias);
  if (!Number.isFinite(dias) || dias <= 0) return null; // sin vencimiento
  const d = new Date(desde);
  d.setDate(d.getDate() + dias);
  return d;
}

/** Estado legible de una licencia (para las tablas del panel). */
function estadoLicencia(lic) {
  if (!lic) return "desconocido";
  if (!lic.activo) return "inactiva";
  if (lic.estadoPago === "cancelado") return "cancelada";
  if (lic.estadoPago === "pendiente") return "pendiente de pago";

  if (lic.expira && new Date(lic.expira) < new Date()) return "vencida";
  return "activa";
}

module.exports = {
  filtroVigencia,
  licenciasDeUsuario,
  licenciasDeUniversidad,
  modulosPermitidos,
  permisoCreacion,
  puedeCrearTipoEjercicio,
  tieneAccesoAModulo,
  calcularExpiracion,
  estadoLicencia,
};
