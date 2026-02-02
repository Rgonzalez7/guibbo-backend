// server/services/testsRegistry.js
const fs = require("fs");
const path = require("path");

/**
 * Registry para tests definidos en:
 *   server/data/tests/**.js
 *
 * ✅ NO depende de process.cwd()
 * ✅ Detecta automáticamente dónde está /data/tests
 * ✅ Lee index.js si existe o escanea archivos recursivo
 */

const ROOT = path.resolve(__dirname, "..", "data", "tests"); // ✅ robusto

let CACHE = {
  loaded: false,
  loadedAt: null,
  catalog: [],
  flat: [],
  byId: {},
  debug: {},
};

function safeStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function existsDir(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readIndexIfExists() {
  const indexPath = path.join(ROOT, "index.js");
  if (!fs.existsSync(indexPath)) return { ok: false, reason: "no_index" };

  try {
    delete require.cache[require.resolve(indexPath)];
    const mod = require(indexPath);
    const raw = mod?.default || mod;

    // ✅ soporta index.js que exporte:
    // module.exports = [...]
    // module.exports = { tests: [...] }
    // exports.tests = [...]
    const arr =
      Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.tests)
          ? raw.tests
          : Array.isArray(mod?.tests)
            ? mod.tests
            : null;

    if (!arr) {
      return { ok: false, reason: "index_not_array", sampleKeys: Object.keys(raw || {}) };
    }

    return { ok: true, arr, indexPath };
  } catch (e) {
    return { ok: false, reason: "index_require_error", error: e.message };
  }
}

function listJsFilesRec(dir) {
  const out = [];
  if (!existsDir(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listJsFilesRec(full));
    else if (e.isFile() && e.name.endsWith(".js") && e.name !== "index.js") out.push(full);
  }
  return out;
}

function normalizeOpciones(opciones) {
  const arr = Array.isArray(opciones) ? opciones : [];
  return arr.map((o) => ({
    valor: o?.valor ?? o?.value ?? 0,
    label: o?.label ?? o?.text ?? "",
  }));
}

function normalizeItemsFromConfiguracion(configuracion) {
  const cfg = configuracion && typeof configuracion === "object" ? configuracion : {};
  const rawItems = Array.isArray(cfg.items) ? cfg.items : [];

  return rawItems.map((it, idx) => {
    const key = it?.key || it?.id || `i${idx + 1}`;
    const texto = it?.texto || it?.text || it?.pregunta || it?.enunciado || "";

    const opciones = normalizeOpciones(it?.opciones || it?.options);

    return {
      ...it,
      key,
      texto,
      opciones: opciones.length ? opciones : undefined,
    };
  });
}

function getCategoriaFromSource(sourceRelPath = "") {
  const parts = sourceRelPath.split("/").filter(Boolean);
  return parts[0] || "general";
}

function normalizeTest(raw, sourceRelPath = "") {
  const test = raw && typeof raw === "object" ? raw : {};

  const id = safeStr(test.id).trim();
  if (!id) return null;

  const nombre =
    safeStr(test.nombre || test.title || test.titulo || test.name).trim() || id;

  const tipo = safeStr(test.tipo || test.type).trim() || "escala";
  const version = Number(test.version || 1) || 1;
  const pdfUrl = safeStr(test.pdfUrl || test.pdf || "");

  const categoria = safeStr(test.categoria || getCategoriaFromSource(sourceRelPath)) || "general";

  const configuracion =
    test.configuracion && typeof test.configuracion === "object" ? test.configuracion : {};

  const items = normalizeItemsFromConfiguracion(configuracion);

  return {
    id,
    nombre,
    tipo,
    version,
    pdfUrl,
    categoria,
    configuracion: { ...configuracion, items },
    _source: sourceRelPath || "",
  };
}

function buildCatalog(flat) {
  const catMap = new Map();

  for (const t of flat) {
    const cat = t.categoria || "general";
    const tipo = t.tipo || "escala";

    if (!catMap.has(cat)) catMap.set(cat, new Map());
    const tipoMap = catMap.get(cat);

    if (!tipoMap.has(tipo)) tipoMap.set(tipo, []);
    tipoMap.get(tipo).push({
      id: t.id,
      nombre: t.nombre,
      version: t.version,
      pdfUrl: t.pdfUrl,
    });
  }

  return Array.from(catMap.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([categoria, tipoMap]) => ({
      categoria,
      tipos: Array.from(tipoMap.entries())
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
        .map(([tipo, items]) => ({
          tipo,
          items: items.sort((x, y) => String(x.nombre).localeCompare(String(y.nombre))),
        })),
    }));
}

function buildRegistry() {
  const debug = {
    root: ROOT,
    rootExists: existsDir(ROOT),
    index: null,
    scannedFilesCount: 0,
    requireErrors: [],
  };

  const byId = {};
  const flat = [];

  // 1) Preferir index.js si existe
  const idx = readIndexIfExists();
  debug.index = idx;

  if (idx.ok) {
    for (const t of idx.arr) {
      const norm = normalizeTest(t, "index");
      if (!norm) continue;
      byId[norm.id] = norm;
      flat.push(norm);
    }
  } else {
    // 2) Fallback: escanear filesystem
    const files = listJsFilesRec(ROOT);
    debug.scannedFilesCount = files.length;

    for (const fp of files) {
      const rel = path.relative(ROOT, fp).replace(/\\/g, "/");
      try {
        delete require.cache[require.resolve(fp)];
        const mod = require(fp);
        const raw = mod?.default || mod;

        if (Array.isArray(raw)) {
          raw.forEach((t) => {
            const norm = normalizeTest(t, rel);
            if (!norm) return;
            byId[norm.id] = norm;
            flat.push(norm);
          });
        } else {
          const norm = normalizeTest(raw, rel);
          if (!norm) return;
          byId[norm.id] = norm;
          flat.push(norm);
        }
      } catch (e) {
        debug.requireErrors.push({ file: rel, error: e.message });
      }
    }
  }

  const flatSorted = flat.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
  const catalog = buildCatalog(flatSorted);

  CACHE = {
    loaded: true,
    loadedAt: new Date(),
    catalog,
    flat: flatSorted,
    byId,
    debug,
  };

  return CACHE;
}

function ensureLoaded({ force = false } = {}) {
  if (!CACHE.loaded || force) buildRegistry();
  return CACHE;
}

function getCatalog() {
  return ensureLoaded().catalog;
}

function getFlat() {
  return ensureLoaded().flat;
}

function getTestById(id) {
  const { byId } = ensureLoaded();
  return byId[String(id)] || null;
}

// ✅ para debug desde el controller si quieres
function getDebug() {
  return ensureLoaded().debug;
}

module.exports = {
  ensureLoaded,
  getCatalog,
  getFlat,
  getTestById,
  getDebug,
};