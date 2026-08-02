// server/controllers/promptIAController.js
// =========================================================
// CRUD de los prompts de IA para el panel de súper usuario.
// Guardar = publicar (el cambio entra en vigor de inmediato).
// Siempre se puede volver al texto por defecto del código o a
// cualquier versión anterior del historial.
// =========================================================
const PromptIA = require("../models/promptIA");
const {
  listRegistered,
  getRegistered,
  getDefault,
  getPrompt,
  isPersonalizado,
  render,
  extractVariables,
  missingVariables,
  setCache,
} = require("../utils/promptStore");

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

/* ========== GET /api/super/prompts ========== */
exports.listarPrompts = async (req, res) => {
  try {
    const registrados = listRegistered();
    const docs = await PromptIA.find({}).lean();
    const byClave = new Map(docs.map((d) => [d.clave, d]));

    const prompts = registrados.map((r) => {
      const doc = byClave.get(r.clave);
      return {
        clave: r.clave,
        nombre: r.nombre,
        categoria: r.categoria,
        descripcion: r.descripcion,
        variables: r.variables,
        personalizado: Boolean(doc && doc.activo !== false),
        version: doc?.version || 0,
        actualizadoPor: doc?.actualizadoPorNombre || "",
        actualizadoEn: doc?.updatedAt || null,
        caracteres: (getPrompt(r.clave) || "").length,
      };
    });

    const categorias = [...new Set(prompts.map((p) => p.categoria))];

    res.json({ prompts, categorias, total: prompts.length });
  } catch (err) {
    console.error("listarPrompts:", err);
    res.status(500).json({ message: "No se pudieron listar los prompts." });
  }
};

/* ========== GET /api/super/prompts/:clave ========== */
exports.obtenerPrompt = async (req, res) => {
  try {
    const clave = String(req.params.clave || "").trim();
    const meta = getRegistered(clave);
    if (!meta) return res.status(404).json({ message: "Prompt no encontrado." });

    const doc = await PromptIA.findOne({ clave }).lean();
    const contenido = doc && doc.activo !== false ? doc.contenido : meta.defecto;

    res.json({
      prompt: {
        clave,
        nombre: meta.nombre,
        categoria: meta.categoria,
        descripcion: meta.descripcion,
        variables: meta.variables,
        contenido,
        defecto: meta.defecto,
        personalizado: Boolean(doc && doc.activo !== false),
        version: doc?.version || 0,
        nota: doc?.nota || "",
        actualizadoPor: doc?.actualizadoPorNombre || "",
        actualizadoEn: doc?.updatedAt || null,
        historial: (doc?.historial || [])
          .slice()
          .reverse()
          .map((h) => ({
            version: h.version,
            nota: h.nota,
            editadoPor: h.editadoPorNombre,
            fecha: h.fecha,
            caracteres: String(h.contenido || "").length,
          })),
      },
    });
  } catch (err) {
    console.error("obtenerPrompt:", err);
    res.status(500).json({ message: "No se pudo obtener el prompt." });
  }
};

/* ========== PUT /api/super/prompts/:clave ========== */
exports.actualizarPrompt = async (req, res) => {
  try {
    const clave = String(req.params.clave || "").trim();
    const meta = getRegistered(clave);
    if (!meta) return res.status(404).json({ message: "Prompt no encontrado." });

    const contenido = String(req.body?.contenido ?? "");
    const nota = String(req.body?.nota || "").trim();

    if (!contenido.trim()) {
      return res.status(400).json({ message: "El prompt no puede quedar vacío." });
    }

    let doc = await PromptIA.findOne({ clave });

    if (!doc) {
      doc = new PromptIA({
        clave,
        contenido: meta.defecto,
        version: 0,
        historial: [],
      });
    }

    // Guardamos la versión vigente en el historial antes de reemplazarla
    doc.historial.push({
      version: doc.version || 0,
      contenido: doc.contenido || meta.defecto,
      nota: doc.nota || "",
      editadoPor: doc.actualizadoPor || null,
      editadoPorNombre: doc.actualizadoPorNombre || "",
      fecha: doc.updatedAt || new Date(),
    });

    doc.contenido = contenido;
    doc.nota = nota;
    doc.activo = true;
    doc.version = (doc.version || 0) + 1;
    doc.actualizadoPor = idUsuario(req);
    doc.actualizadoPorNombre = nombreUsuario(req);

    await doc.save();
    setCache(clave, doc.toObject ? doc.toObject() : doc);

    const faltantes = missingVariables(clave, contenido);

    res.json({
      ok: true,
      version: doc.version,
      advertencias: faltantes.length
        ? [
            `El prompt ya no contiene: ${faltantes
              .map((v) => `{{${v}}}`)
              .join(", ")}. Esa información no se le enviará a la IA.`,
          ]
        : [],
      variablesDetectadas: extractVariables(contenido),
    });
  } catch (err) {
    console.error("actualizarPrompt:", err);
    res.status(500).json({ message: "No se pudo guardar el prompt." });
  }
};

/* ========== POST /api/super/prompts/:clave/restaurar ========== */
// body: { version } | { defecto: true }
exports.restaurarPrompt = async (req, res) => {
  try {
    const clave = String(req.params.clave || "").trim();
    const meta = getRegistered(clave);
    if (!meta) return res.status(404).json({ message: "Prompt no encontrado." });

    const aDefecto = req.body?.defecto === true;
    const version = Number(req.body?.version);

    const doc = await PromptIA.findOne({ clave });

    if (aDefecto) {
      if (!doc) return res.json({ ok: true, restaurado: "defecto" });

      doc.historial.push({
        version: doc.version || 0,
        contenido: doc.contenido,
        nota: doc.nota || "",
        editadoPor: doc.actualizadoPor || null,
        editadoPorNombre: doc.actualizadoPorNombre || "",
        fecha: doc.updatedAt || new Date(),
      });

      doc.contenido = meta.defecto;
      doc.activo = false; // vuelve a usarse el texto del código
      doc.version = (doc.version || 0) + 1;
      doc.nota = "Restaurado al texto original";
      doc.actualizadoPor = idUsuario(req);
      doc.actualizadoPorNombre = nombreUsuario(req);

      await doc.save();
      setCache(clave, doc.toObject ? doc.toObject() : doc);

      return res.json({ ok: true, restaurado: "defecto", contenido: meta.defecto });
    }

    if (!doc) return res.status(404).json({ message: "Este prompt no tiene historial." });

    const previa = (doc.historial || []).find((h) => Number(h.version) === version);
    if (!previa) return res.status(404).json({ message: "Versión no encontrada." });

    doc.historial.push({
      version: doc.version || 0,
      contenido: doc.contenido,
      nota: doc.nota || "",
      editadoPor: doc.actualizadoPor || null,
      editadoPorNombre: doc.actualizadoPorNombre || "",
      fecha: doc.updatedAt || new Date(),
    });

    doc.contenido = previa.contenido;
    doc.activo = true;
    doc.version = (doc.version || 0) + 1;
    doc.nota = `Restaurado desde la versión ${version}`;
    doc.actualizadoPor = idUsuario(req);
    doc.actualizadoPorNombre = nombreUsuario(req);

    await doc.save();
    setCache(clave, doc.toObject ? doc.toObject() : doc);

    res.json({ ok: true, restaurado: version, contenido: doc.contenido });
  } catch (err) {
    console.error("restaurarPrompt:", err);
    res.status(500).json({ message: "No se pudo restaurar el prompt." });
  }
};

/* ========== POST /api/super/prompts/:clave/vista-previa ========== */
// Renderiza el texto con valores de ejemplo, sin llamar a la IA.
exports.vistaPrevia = async (req, res) => {
  try {
    const clave = String(req.params.clave || "").trim();
    const meta = getRegistered(clave);
    if (!meta) return res.status(404).json({ message: "Prompt no encontrado." });

    const contenido = String(req.body?.contenido ?? getPrompt(clave));
    const variables = extractVariables(contenido);

    const ejemplo = {};
    for (const v of variables) ejemplo[v] = `«${v}»`;

    res.json({
      texto: render(contenido, ejemplo),
      variables,
      faltantes: missingVariables(clave, contenido),
      caracteres: contenido.length,
      tokensAprox: Math.ceil(contenido.length / 4),
    });
  } catch (err) {
    console.error("vistaPrevia:", err);
    res.status(500).json({ message: "No se pudo generar la vista previa." });
  }
};
