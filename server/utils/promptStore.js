// server/utils/promptStore.js
// =========================================================
// Registro + caché de los prompts de IA.
//
// Cómo funciona:
//  1. Cada módulo que usa un prompt lo registra al cargarse
//     con registerPrompt({ clave, nombre, categoria, ..., defecto }).
//  2. initPromptStore() (en index.js) carga de MongoDB los
//     prompts personalizados y los deja en caché en memoria.
//  3. getPrompt("clave") devuelve el texto de la BD si existe y
//     está activo; si no, el texto por defecto del código.
//     -> Si la BD falla o el prompt no fue editado nunca,
//        el sistema sigue funcionando exactamente igual que antes.
//  4. render(texto, vars) reemplaza {{variable}} por su valor.
// =========================================================

const REGISTRO = new Map(); // clave -> { clave, nombre, categoria, descripcion, variables, defecto }
const CACHE = new Map();    // clave -> { contenido, version, activo, actualizadoEn }

let cargado = false;

/* ========== Registro (defaults del código) ========== */

function registerPrompt(def = {}) {
  const clave = String(def.clave || "").trim();
  if (!clave) return;

  REGISTRO.set(clave, {
    clave,
    nombre: def.nombre || clave,
    categoria: def.categoria || "General",
    descripcion: def.descripcion || "",
    variables: Array.isArray(def.variables) ? def.variables : [],
    defecto: String(def.defecto || ""),
  });
}

function listRegistered() {
  return Array.from(REGISTRO.values()).sort((a, b) => {
    const c = String(a.categoria).localeCompare(String(b.categoria), "es");
    if (c !== 0) return c;
    return String(a.nombre).localeCompare(String(b.nombre), "es");
  });
}

function getRegistered(clave) {
  return REGISTRO.get(String(clave || "").trim()) || null;
}

function getDefault(clave) {
  return getRegistered(clave)?.defecto || "";
}

/* ========== Caché (versiones personalizadas) ========== */

function setCache(clave, doc) {
  if (!clave) return;
  if (!doc) {
    CACHE.delete(clave);
    return;
  }
  CACHE.set(clave, {
    contenido: String(doc.contenido || ""),
    version: Number(doc.version || 1),
    activo: doc.activo !== false,
    actualizadoEn: doc.updatedAt || new Date(),
  });
}

function clearCache(clave) {
  if (clave) CACHE.delete(clave);
  else CACHE.clear();
}

/**
 * Texto vigente del prompt: BD (si está activo) o default del código.
 */
function getPrompt(clave) {
  const key = String(clave || "").trim();
  const cached = CACHE.get(key);

  if (cached && cached.activo && String(cached.contenido || "").trim()) {
    return cached.contenido;
  }

  return getDefault(key);
}

function isPersonalizado(clave) {
  const cached = CACHE.get(String(clave || "").trim());
  return Boolean(cached && cached.activo && String(cached.contenido || "").trim());
}

/* ========== Render de variables {{var}} ========== */

function render(texto, vars = {}) {
  let out = String(texto == null ? "" : texto);

  for (const [k, v] of Object.entries(vars || {})) {
    const valor = v == null ? "" : String(v);
    // {{ var }} con o sin espacios
    const re = new RegExp(`\\{\\{\\s*${escapeRe(k)}\\s*\\}\\}`, "g");
    out = out.replace(re, () => valor);
  }

  return out;
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Variables {{...}} presentes en un texto.
 */
function extractVariables(texto) {
  const out = new Set();
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let m;
  while ((m = re.exec(String(texto || "")))) out.add(m[1]);
  return Array.from(out);
}

/**
 * Variables declaradas que el texto editado ya no contiene.
 */
function missingVariables(clave, texto) {
  const declaradas = getRegistered(clave)?.variables || [];
  const presentes = new Set(extractVariables(texto));
  return declaradas.filter((v) => !presentes.has(v));
}

/* ========== Carga inicial desde MongoDB ========== */

async function initPromptStore() {
  try {
    // Se requiere aquí para no forzar la conexión antes de tiempo
    const PromptIA = require("../models/promptIA");
    const docs = await PromptIA.find({}).lean();

    CACHE.clear();
    for (const d of docs) setCache(d.clave, d);

    cargado = true;
    console.log(`🧠 promptStore: ${REGISTRO.size} prompts registrados, ${docs.length} personalizados`);
  } catch (err) {
    cargado = false;
    console.error("⚠️  promptStore: no se pudieron cargar los prompts de la BD:", err?.message || err);
    console.error("    Se usarán los prompts por defecto del código.");
  }
}

async function reloadPrompt(clave) {
  try {
    const PromptIA = require("../models/promptIA");
    const doc = await PromptIA.findOne({ clave }).lean();
    setCache(clave, doc || null);
    return true;
  } catch {
    return false;
  }
}

function isLoaded() {
  return cargado;
}

module.exports = {
  registerPrompt,
  listRegistered,
  getRegistered,
  getDefault,
  getPrompt,
  isPersonalizado,
  render,
  extractVariables,
  missingVariables,
  setCache,
  clearCache,
  initPromptStore,
  reloadPrompt,
  isLoaded,
};
