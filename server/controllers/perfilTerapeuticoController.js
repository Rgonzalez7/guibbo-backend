const EjercicioInstancia = require("../models/ejercicioInstancia");
const User = require("../models/user");

const { buildPerfilTerapeuticoPrompt, normalizePerfilResult } = require("../utils/perfilTerapeuticoIA");
const { callLLMJson } = require("../utils/llmClient");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function callLLMJsonWithRetry(opts, retries = 1) {
  try { return await callLLMJson(opts); }
  catch (e) {
    if (retries <= 0) throw e;
    await sleep(1200);
    return callLLMJsonWithRetry(opts, retries - 1);
  }
}

function safeAvg(numbers) {
  const valid = numbers.filter((n) => typeof n === "number" && Number.isFinite(n));
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function extractTranscripcion(inst) {
  const rp = inst?.respuestas?.rolePlaying || {};
  const depFinalText = rp?.transcripcion?.depuracion?.finalText || "";
  if (depFinalText.trim()) return depFinalText;
  const rawText = rp?.transcripcion?.raw?.text || "";
  if (rawText.trim()) return rawText;
  const transcripcion = rp?.transcripcion || rp?.payload?.transcripcion || rp?.data?.transcripcion || "";
  if (typeof transcripcion === "string" && transcripcion.trim()) return transcripcion;
  return "";
}

function clampText(text, max = 10000) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[...texto recortado para análisis...]";
}

function extractPraxisScoreGlobal(analisisIA) {
  if (!analisisIA) return null;
  let obj = analisisIA;
  if (typeof obj === "string") { try { obj = JSON.parse(obj); } catch { return null; } }
  if (obj?.analisisIA) obj = obj.analisisIA;
  return safeAvg(
    [obj?.generalScore, obj?.indiceGlobal?.porcentaje]
      .filter((n) => n != null).map(Number).filter((n) => Number.isFinite(n))
  );
}

function extractHerramientasScoreGlobal(evalH) {
  if (!evalH) return null;
  let obj = evalH;
  if (typeof obj === "string") { try { obj = JSON.parse(obj); } catch { return null; } }
  if (obj?.evaluacionHerramientas) obj = obj.evaluacionHerramientas;
  return safeAvg(
    [obj?.generalScore, obj?.general?.score]
      .filter((n) => n != null).map(Number).filter((n) => Number.isFinite(n))
  );
}

// ✅ Extrae scores por dimensión PRAXIS (ASC, IIT, IRI, MMD, MLT)
function extractDimensionScores(analisisIA) {
  if (!analisisIA) return null;
  let obj = analisisIA;
  if (typeof obj === "string") { try { obj = JSON.parse(obj); } catch { return null; } }
  if (obj?.analisisIA) obj = obj.analisisIA;
  const sections = obj?.sections;
  if (!sections || typeof sections !== "object") return null;
  const keys = ["ASC", "IIT", "IRI", "MMD", "MLT"];
  if (!keys.some((k) => sections[k])) return null; // formato viejo
  const result = {};
  keys.forEach((k) => {
    const sec = sections[k];
    if (!sec) return;
    const scoreRaw = sec?.score;
    const score = scoreRaw != null ? Number(scoreRaw) : null;
    result[k] = {
      score: Number.isFinite(score) ? Math.round(score) : null,
      label: sec?.label || k,
      nivelLabel: sec?.nivelLabel || null,
    };
  });
  return Object.keys(result).length > 0 ? result : null;
}

/* =========================================================
   GET /api/ia/perfil-terapeutico
========================================================= */
module.exports.obtenerPerfilTerapeutico = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const limit = parseInt(req.query.limit) || 3;
    const skip  = parseInt(req.query.skip)  || 0;

    const instancias = await EjercicioInstancia.find({
      $or: [{ estudiante: userId }, { usuario: userId }],
      estado: "completado",
    })
      .populate({ path: "ejercicio", select: "titulo tipoEjercicio tipo" })
      .populate({
        path: "moduloInstancia",
        select: "materia modulo",
        populate: [
          { path: "materia", select: "titulo", strictPopulate: false },
          { path: "modulo",  select: "titulo", strictPopulate: false },
        ],
        strictPopulate: false,
      })
      .sort({ completedAt: -1, updatedAt: -1 })
      .lean();

    const instanciasRP = instancias.filter((inst) =>
      Boolean(inst?.analisisIA || inst?.evaluacionHerramientas || inst?.perfilTerapeutico)
    );

    // Promedios globales
    const praxisScores = instanciasRP
      .map((inst) => {
        const ai = inst?.analisisIA;
        if (typeof ai === "string") {
          try { const p = JSON.parse(ai); return p?.analisisIA?.generalScore ?? p?.analisisIA?.indiceGlobal?.porcentaje ?? p?.generalScore ?? null; }
          catch { return null; }
        }
        return ai?.analisisIA?.generalScore ?? ai?.generalScore ?? ai?.indiceGlobal?.porcentaje ?? null;
      })
      .filter((n) => n !== null).map(Number).filter((n) => Number.isFinite(n));

    const herramientasScores = instanciasRP
      .map((inst) => {
        const h = inst?.evaluacionHerramientas;
        if (typeof h === "string") {
          try { const p = JSON.parse(h); return p?.evaluacionHerramientas?.generalScore ?? p?.generalScore ?? null; }
          catch { return null; }
        }
        return h?.evaluacionHerramientas?.generalScore ?? h?.generalScore ?? h?.general?.score ?? null;
      })
      .filter((n) => n !== null).map(Number).filter((n) => Number.isFinite(n));

    const promedios = {
      praxis: safeAvg(praxisScores),
      herramientas: safeAvg(herramientasScores),
    };

    // Perfil terapéutico más reciente
    const instanciaConPerfil = instanciasRP.find((inst) => inst?.perfilTerapeutico?.perfilTerapeutico);
    const perfilTerapeutico  = instanciaConPerfil?.perfilTerapeutico?.perfilTerapeutico || null;
    const resumenPerfil      = instanciaConPerfil?.perfilTerapeutico?.resumenPerfil || "";
    const fechaAnalisis      = instanciaConPerfil?.perfilTerapeutico?.meta?.generadoAt || null;

    // ✅ Progreso PRAXIS — últimas 2 instancias con formato nuevo
    const instanciasConPraxis = instanciasRP.filter((inst) => {
      return Boolean(extractDimensionScores(inst?.analisisIA));
    }).slice(0, 2);

    const progresoPraxis = (() => {
      if (instanciasConPraxis.length === 0) return null;
      const ultima   = extractDimensionScores(instanciasConPraxis[0]?.analisisIA);
      const anterior = instanciasConPraxis.length > 1
        ? extractDimensionScores(instanciasConPraxis[1]?.analisisIA)
        : null;
      if (!ultima) return null;
      return {
        ultima,
        anterior,
        fechaUltima: instanciasConPraxis[0]?.completedAt || null,
      };
    })();

    // Historial paginado
    const totalHistorial    = instanciasRP.length;
    const instanciasPagina  = instanciasRP.slice(skip, skip + limit);

    const historial = instanciasPagina.map((inst) => ({
      _id:            inst._id,
      instanciaId:    inst._id,
      ejercicioId:    inst?.ejercicio?._id || null,
      ejercicioTitulo: inst?.ejercicio?.titulo || "Ejercicio de Role Playing",
      materiaTitulo:  inst?.moduloInstancia?.materia?.titulo || null,
      moduloTitulo:   inst?.moduloInstancia?.modulo?.titulo  || null,
      submoduloTitulo: null,
      completedAt:    inst?.completedAt || inst?.updatedAt || null,
      analisisIA:     inst?.analisisIA
        ? { generalScore: extractPraxisScoreGlobal(inst.analisisIA) }
        : null,
      evaluacionHerramientas: inst?.evaluacionHerramientas
        ? { generalScore: extractHerramientasScoreGlobal(inst.evaluacionHerramientas) }
        : null,
      analisisIACompleto:             inst?.analisisIA || null,
      evaluacionHerramientasCompleta: inst?.evaluacionHerramientas || null,
    }));

    const userDoc = await User.findById(userId).select("nombre nombres apellidos rol foto").lean();
    const nombreCompleto = userDoc?.nombre ||
      [userDoc?.nombres, userDoc?.apellidos].filter(Boolean).join(" ") || "Estudiante";

    return res.json({
      ok: true,
      user: { nombre: nombreCompleto, rol: userDoc?.rol || "estudiante", avatarUrl: userDoc?.foto || "" },
      promedios,
      perfilTerapeutico: perfilTerapeutico || {
        validante: 0, directivo: 0, colaborativo: 0, confrontativo: 0, exploratorio: 0, contenedor: 0,
      },
      resumenPerfil,
      fechaAnalisis,
      progresoPraxis,
      historial,
      totalHistorial,
      hasMore: skip + limit < totalHistorial,
    });
  } catch (err) {
    console.error("❌ Error obtenerPerfilTerapeutico:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   POST /api/ia/perfil-terapeutico/generar
========================================================= */
module.exports.generarPerfilTerapeutico = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const { instanciaId } = req.body || {};
    if (!instanciaId) return res.status(400).json({ message: "Falta instanciaId" });

    const inst = await EjercicioInstancia.findById(instanciaId);
    if (!inst) return res.status(404).json({ message: "Instancia no encontrada" });

    const instUserId = String(inst?.estudiante || inst?.usuario || "");
    const reqUserId  = String(userId);
    if (instUserId !== reqUserId) return res.status(403).json({ message: "Sin acceso a esta instancia" });

    const transcripcion = clampText(extractTranscripcion(inst), 10000);

    if (!transcripcion.trim()) {
      const analisisSummary = inst?.analisisIA?.studentSummary?.whatWentWell?.join(". ") ||
        inst?.analisisIA?.general?.summary || "";
      if (!analisisSummary) {
        return res.status(400).json({ message: "No hay transcripción ni análisis disponible para generar el perfil terapéutico." });
      }
    }

    const perfilPrevio = await (async () => {
      try {
        const prev = await EjercicioInstancia.findOne({
          $or: [{ estudiante: userId }, { usuario: userId }],
          "perfilTerapeutico.perfilTerapeutico": { $exists: true },
          _id: { $ne: instanciaId },
        }).sort({ completedAt: -1, updatedAt: -1 }).select("perfilTerapeutico").lean();
        return prev?.perfilTerapeutico?.perfilTerapeutico || null;
      } catch { return null; }
    })();

    const historialReciente = await EjercicioInstancia.find({
      $or: [{ estudiante: userId }, { usuario: userId }],
      estado: "completado",
      _id: { $ne: instanciaId },
    }).sort({ completedAt: -1 }).limit(3).select("analisisIA evaluacionHerramientas completedAt").lean();

    const historialResumen = historialReciente.length
      ? historialReciente.map((h, i) => {
          const praxis = h?.analisisIA?.generalScore ?? h?.analisisIA?.indiceGlobal?.porcentaje ?? "—";
          const herr   = h?.evaluacionHerramientas?.generalScore ?? "—";
          const fecha  = h?.completedAt ? new Date(h.completedAt).toLocaleDateString("es") : "—";
          return `Sesión ${i + 1} (${fecha}): PRAXIS ${praxis}/100, Herramientas ${herr}/100`;
        }).join("\n")
      : null;

    const prompt = buildPerfilTerapeuticoPrompt({
      transcripcion: transcripcion || "(sin transcripción — analizar con datos disponibles)",
      perfilPrevio,
      historialResumen,
    });

    const raw = await callLLMJsonWithRetry({
      system: "Eres un supervisor clínico experto en formación de terapeutas. Devuelve SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
    }, 1);

    const resultado = normalizePerfilResult(raw);
    if (!resultado) return res.status(500).json({ message: "La IA no devolvió un perfil válido." });

    inst.perfilTerapeutico = resultado;
    if (typeof inst.markModified === "function") inst.markModified("perfilTerapeutico");
    await inst.save();

    return res.json({
      ok: true,
      instanciaId: String(inst._id),
      perfilTerapeutico: resultado.perfilTerapeutico,
      resumenPerfil: resultado.resumenPerfil,
      meta: resultado.meta,
    });
  } catch (err) {
    console.error("❌ Error generarPerfilTerapeutico:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* =========================================================
   POST /api/ia/perfil-terapeutico/generar-ultimo
========================================================= */
module.exports.generarPerfilUltimoEjercicio = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const inst = await EjercicioInstancia.findOne({
      $or: [{ estudiante: userId }, { usuario: userId }],
      estado: "completado",
      $or: [{ analisisIA: { $exists: true } }, { evaluacionHerramientas: { $exists: true } }],
    }).sort({ completedAt: -1, updatedAt: -1 }).select("_id estudiante usuario");

    if (!inst) return res.status(404).json({ message: "No se encontró ningún ejercicio completado." });

    req.body = { instanciaId: String(inst._id) };
    return module.exports.generarPerfilTerapeutico(req, res);
  } catch (err) {
    console.error("❌ Error generarPerfilUltimoEjercicio:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
