// server/controllers/iaRolePlayController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");
const Session = require("../models/session");

const {
  buildRolePlayPrompt,
  clampText,
  normalizeAIResult,
  addLabelsToResult,
  extractRPDataFromInstance,
} = require("../utils/analisisRolePlayIA");

const { callLLMJson } = require("../utils/llmClient");

/* =========================================================
   Helpers
========================================================= */
function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return fallback;
}

function safeStr(v, fallback = "") {
  if (typeof v === "string") return v;
  if (v == null) return fallback;
  return String(v);
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function now() {
  return new Date();
}

function deepGet(obj, path, fallback = undefined) {
  try {
    const parts = String(path || "")
      .split(".")
      .map((s) => s.trim())
      .filter(Boolean);
    let cur = obj;
    for (const p of parts) {
      if (!cur || typeof cur !== "object") return fallback;
      cur = cur[p];
    }
    return cur === undefined ? fallback : cur;
  } catch {
    return fallback;
  }
}

/**
 * ✅ MUY IMPORTANTE (FIX):
 * Si tu schema usa Mixed (respuestas...), Mongoose NO detecta cambios profundos.
 * Entonces debes forzar markModified en rutas clave antes de save().
 */
function markTranscripcionModified(inst) {
  if (!inst || typeof inst.markModified !== "function") return;
  inst.markModified("respuestas");
  inst.markModified("respuestas.rolePlaying");
  inst.markModified("respuestas.rolePlaying.transcripcion");
  inst.markModified("respuestas.rolePlaying.transcripcion.depuracion");
}

/**
 * ✅ Normaliza evaluaciones:
 * - si viene ARRAY => ok
 * - si viene OBJ => convierte a array de keys con valor truthy
 */
function normalizeEvaluaciones(evaluacionesRaw) {
  if (Array.isArray(evaluacionesRaw)) {
    return evaluacionesRaw.filter((x) => typeof x === "string" && x.trim());
  }
  if (isObj(evaluacionesRaw)) {
    return Object.keys(evaluacionesRaw).filter((k) => Boolean(evaluacionesRaw[k]));
  }
  return [];
}

/**
 * ✅ Normaliza herramientas:
 * - si viene OBJ => ok
 * - si viene ARRAY => convierte a { key:true }
 */
function normalizeHerramientas(herramientasRaw) {
  if (isObj(herramientasRaw)) return herramientasRaw;
  if (Array.isArray(herramientasRaw)) {
    const out = {};
    for (const k of herramientasRaw) {
      if (typeof k === "string" && k.trim()) out[k.trim()] = true;
    }
    return out;
  }
  return {};
}

/**
 * ✅ Guarda el análisis en EjercicioInstancia, manteniendo compat con UI actual.
 */
function setAnalysisInInstance(inst, result, fuente = "real", replace = true) {
  const t = now();

  inst.analisisIA = replace ? result : { ...(inst.analisisIA || {}), ...result };
  inst.analisisGeneradoAt = t;
  inst.analisisFuente = fuente;

  inst.intentosUsados = Number(inst.intentosUsados || 0) + 1;

  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};

  // compat UI actual
  inst.respuestas.rolePlaying.analysisResult = result;
  inst.respuestas.rolePlaying.savedAt = t.toISOString();

  if (typeof inst.markModified === "function") {
    inst.markModified("respuestas");
    inst.markModified("respuestas.rolePlaying");
  }

  return inst;
}

/**
 * ✅ Resolver EjercicioInstancia:
 */
async function resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId }) {
  let inst = null;

  if (instanciaId) {
    inst = await EjercicioInstancia.findById(instanciaId);
    if (inst) return inst;
  }

  if (!userId || !ejercicioId) return null;

  const q = {
    ejercicio: ejercicioId,
    $or: [{ estudiante: userId }, { usuario: userId }], // compat
  };

  if (moduloInstanciaId) q.moduloInstancia = moduloInstanciaId;

  inst = await EjercicioInstancia.findOne(q).sort({ createdAt: -1, updatedAt: -1 });
  return inst;
}

/* =========================================================
   ✅ Retry 1 vez para callLLMJson
========================================================= */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callLLMJsonWithRetry(opts, retries = 1) {
  try {
    return await callLLMJson(opts);
  } catch (e) {
    if (retries <= 0) throw e;
    await sleep(1200);
    return callLLMJsonWithRetry(opts, retries - 1);
  }
}

/* =========================================================
   ✅ Depuración (SIN incongruencias):
   Solo segmenta en turnos y asigna speaker:
   - terapeuta (estudiante)
   - paciente
   - unknown (ambiguo)
========================================================= */
function normalizeDepuracionResult(raw) {
  const out = isObj(raw) ? raw : {};
  const cleanedText = safeStr(out.cleanedText, "");

  const turns = safeArr(out.turns)
    .map((t, idx) => {
      const id = safeStr(t?.id, `t_${idx + 1}`);
      const speakerRaw = safeStr(t?.speaker, "").toLowerCase();
      const speaker =
        speakerRaw.includes("tera") ||
        speakerRaw === "estudiante" ||
        speakerRaw === "therapist"
          ? "estudiante"
          : speakerRaw.includes("paci") ||
            speakerRaw === "paciente" ||
            speakerRaw === "patient"
          ? "paciente"
          : "unknown";

      const confidence = Number.isFinite(Number(t?.confidence))
        ? Number(t.confidence)
        : null;

      return {
        id,
        speaker,
        text: safeStr(t?.text, "").trim(),
        confidence,
        needsReview: Boolean(t?.needsReview),
        reason: safeStr(t?.reason, ""),
        startChar: Number.isFinite(Number(t?.startChar)) ? Number(t.startChar) : null,
        endChar: Number.isFinite(Number(t?.endChar)) ? Number(t.endChar) : null,
      };
    })
    .filter((t) => t.text);

  // Compat: dejamos issues/stats, pero vacíos/0 (sin “incongruencias”)
  const statsIn = isObj(out.stats) ? out.stats : {};
  const stats = {
    removedDuplicates: Number(statsIn.removedDuplicates || 0) || 0,
    mergedTurns: Number(statsIn.mergedTurns || 0) || 0,
    flagged: Number(statsIn.flagged || 0) || 0,
  };

  return {
    cleanedText,
    turns,
    issues: [], // 👈 ya no se usa
    stats,
  };
}

function ensureTranscripcionObj(inst) {
  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};
  if (!inst.respuestas.rolePlaying.transcripcion) inst.respuestas.rolePlaying.transcripcion = {};

  const t = inst.respuestas.rolePlaying.transcripcion;

  if (!t.raw) t.raw = { text: "", createdAt: null };
  if (!t.depuracion)
    t.depuracion = {
      status: "idle",
      error: "",
      model: "",
      createdAt: null,
      updatedAt: null,
      result: null,
      userDecisions: {
        resolvedIssues: {}, // compat (ya no se usa)
        speakerOverrides: {},
        turnSplits: {},
        turnEdits: {},
      },
      finalText: "",
    };

  if (!isObj(t.depuracion.userDecisions)) {
    t.depuracion.userDecisions = {
      resolvedIssues: {},
      speakerOverrides: {},
      turnSplits: {},
      turnEdits: {},
    };
  } else {
    if (!isObj(t.depuracion.userDecisions.resolvedIssues))
      t.depuracion.userDecisions.resolvedIssues = {};
    if (!isObj(t.depuracion.userDecisions.speakerOverrides))
      t.depuracion.userDecisions.speakerOverrides = {};
    if (!isObj(t.depuracion.userDecisions.turnSplits))
      t.depuracion.userDecisions.turnSplits = {};
    if (!isObj(t.depuracion.userDecisions.turnEdits))
      t.depuracion.userDecisions.turnEdits = {};
  }

  if (!t.activeVersion) t.activeVersion = "raw";

  markTranscripcionModified(inst);
  return t;
}

function buildFinalTextFromTurns(turns = [], speakerOverrides = {}) {
  const lines = [];

  for (const t of turns) {
    const id = String(t?.id || "");
    const override =
      speakerOverrides && typeof speakerOverrides === "object" ? speakerOverrides[id] : null;

    const speaker = override || t.speaker || "unknown";

    const label =
      speaker === "estudiante"
        ? "Terapeuta"
        : speaker === "paciente"
        ? "Paciente"
        : "Speaker";

    const text = safeStr(t?.text, "").trim();
    if (!text) continue;

    lines.push(`${label}: ${text}`.trim());
  }

  return lines.join("\n");
}

/* =========================================================
   ✅ turnSplits helpers
========================================================= */
function normalizeTurnSplits(turnSplitsRaw) {
  // Esperado: { [turnId]: [{ id, speaker, text }] }
  if (!isObj(turnSplitsRaw)) return {};

  const out = {};
  for (const [turnId, arr] of Object.entries(turnSplitsRaw)) {
    const tid = String(turnId || "").trim();
    if (!tid) continue;

    const items = safeArr(arr)
      .map((x, idx) => {
        const id = safeStr(x?.id, `split_${tid}_${idx + 1}`);
        const speakerRaw = safeStr(x?.speaker, "unknown").toLowerCase();
        const speaker =
          speakerRaw === "estudiante" ||
          speakerRaw.includes("tera") ||
          speakerRaw === "therapist"
            ? "estudiante"
            : speakerRaw === "paciente" ||
              speakerRaw.includes("paci") ||
              speakerRaw === "patient"
            ? "paciente"
            : "unknown";

        const text = safeStr(x?.text, "").trim();
        if (!text) return null;

        return { id, speaker, text };
      })
      .filter(Boolean);

    if (items.length) out[tid] = items;
  }

  return out;
}

function applyTurnSplitsToTurns(turns = [], turnSplits = {}) {
  // - Mantener turnos base en orden
  // - Insertar splits DESPUÉS del turno original
  if (!Array.isArray(turns) || turns.length === 0) return [];
  if (!isObj(turnSplits) || Object.keys(turnSplits).length === 0) return turns;

  const out = [];
  for (const t of turns) {
    out.push(t);

    const tid = String(t?.id || "");
    const splits = Array.isArray(turnSplits[tid]) ? turnSplits[tid] : [];
    for (const sp of splits) {
      const id = safeStr(sp?.id, "");
      const text = safeStr(sp?.text, "").trim();
      if (!id || !text) continue;

      out.push({
        id,
        speaker: safeStr(sp?.speaker, "unknown"),
        text,
        confidence: null,
        needsReview: false,
        reason: "user_split",
        startChar: null,
        endChar: null,
      });
    }
  }

  return out;
}

/* =========================================================
   ✅ turnEdits helpers (quitar texto del turno original)
========================================================= */
function escapeRegExp(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeOnceLoose(haystack, needle) {
  const H = safeStr(haystack, "");
  const N = safeStr(needle, "").trim();
  if (!H || !N) return H;

  const idx = H.indexOf(N);
  if (idx >= 0) {
    return H.slice(0, idx) + H.slice(idx + N.length);
  }

  const parts = N
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(escapeRegExp);

  if (!parts.length) return H;

  const re = new RegExp(parts.join("\\s+"), "m");
  const m = H.match(re);
  if (!m || typeof m.index !== "number") return H;

  const start = m.index;
  const end = start + m[0].length;
  return H.slice(0, start) + H.slice(end);
}

function normalizeSpacing(s) {
  return safeStr(s, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function computeEditedTurnText(originalText, removals = []) {
  let out = safeStr(originalText, "");
  for (const r of removals || []) {
    const piece = safeStr(r?.text, "").trim();
    if (!piece) continue;
    out = removeOnceLoose(out, piece);
  }
  return normalizeSpacing(out);
}

function normalizeTurnEdits(turnEditsRaw) {
  // Esperado:
  // { [turnId]: { originalText: string, removals: [{ splitId, text }] } }
  if (!isObj(turnEditsRaw)) return {};

  const out = {};
  for (const [turnId, ed] of Object.entries(turnEditsRaw)) {
    const tid = safeStr(turnId, "").trim();
    if (!tid) continue;
    if (!isObj(ed)) continue;

    const originalText = safeStr(ed?.originalText, "").trim();
    const removals = safeArr(ed?.removals)
      .map((r) => {
        if (!isObj(r)) return null;
        const splitId = safeStr(r?.splitId, "").trim();
        const text = safeStr(r?.text, "").trim();
        if (!text) return null;
        return { splitId: splitId || null, text };
      })
      .filter(Boolean);

    if (!originalText && removals.length === 0) continue;

    out[tid] = { originalText, removals };
  }

  return out;
}

function applyTurnEditsToTurns(turns = [], turnEdits = {}) {
  if (!Array.isArray(turns) || turns.length === 0) return [];
  if (!isObj(turnEdits) || Object.keys(turnEdits).length === 0) return turns;

  return turns
    .map((t) => {
      const id = safeStr(t?.id, "");
      if (!id) return t;

      const ed = turnEdits[id];
      if (!isObj(ed)) return t;

      const base = safeStr(t?.text, "");
      const originalText = safeStr(ed?.originalText, base) || base;
      const removals = safeArr(ed?.removals);

      const edited = computeEditedTurnText(originalText, removals);
      return { ...t, text: safeStr(edited, "").trim() };
    })
    .filter((t) => safeStr(t?.text, "").trim().length > 0);
}

/* =========================================================
   Controller: análisis
========================================================= */
module.exports.analizarRolePlayIA = async (req, res) => {
  try {
    const {
      ejercicioId,
      tipo,

      evaluaciones: evaluacionesRaw,
      herramientas: herramientasRaw,
      data,

      enfoque,

      instanciaId,
      moduloInstanciaId,
      sessionId,

      replace: replaceRaw = true,
      fuente = "real",
    } = req.body || {};

    const replace = toBool(replaceRaw, true);

    const evaluaciones = normalizeEvaluaciones(evaluacionesRaw);
    const herramientas = normalizeHerramientas(herramientasRaw);

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    if (tipo && tipo !== "role_play") {
      return res.status(400).json({ message: "tipo inválido (usa role_play)" });
    }

    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return res.status(400).json({
        message:
          "Falta evaluaciones. Envía array (['rapport', ...]) o un objeto ({rapport:true, ...}).",
        debug: { type: typeof evaluacionesRaw, sample: evaluacionesRaw || null },
      });
    }

    if (!isObj(herramientas) || Object.keys(herramientas).length === 0) {
      return res.status(400).json({
        message:
          "Falta herramientas. Envía objeto ({ fichaTecnica:true, ... }) o array (['fichaTecnica', ...]).",
        debug: { type: typeof herramientasRaw, sample: herramientasRaw || null },
      });
    }

    const userId = req.user?._id || req.user?.id || null;

    const inst = await resolveInstancia({
      instanciaId,
      ejercicioId,
      moduloInstanciaId,
      userId,
    });

    if (!inst) {
      return res.status(400).json({
        message:
          "No se encontró instancia (EjercicioInstancia). Asegura que el FE envía instanciaId (ctx.ejercicioInstanciaId).",
        debug: {
          hasReqUser: Boolean(userId),
          instanciaId: instanciaId || null,
          moduloInstanciaId: moduloInstanciaId || null,
          ejercicioId: ejercicioId || null,
        },
      });
    }

    let resolvedData = null;
    if (isObj(data)) resolvedData = data;
    else resolvedData = extractRPDataFromInstance(inst);

    if (!isObj(resolvedData)) {
      return res.status(400).json({
        message:
          "Falta data (sessionData) o no se pudo obtener desde la instancia (EjercicioInstancia.respuestas.rolePlaying).",
      });
    }

    const safeData = {
      ...resolvedData,
      transcripcion: clampText(resolvedData?.transcripcion || "", 12000),
      pruebaTranscripcion: clampText(resolvedData?.pruebaTranscripcion || "", 6000),
      interpretacionPrueba: clampText(resolvedData?.interpretacionPrueba || "", 6000),
      anexos: clampText(resolvedData?.anexos || "", 6000),
      planIntervencion: clampText(resolvedData?.planIntervencion || "", 6000),
    };

    const prompt = buildRolePlayPrompt({
      evaluaciones,
      herramientas,
      data: safeData,
      enfoque: enfoque || null,
    });

    const raw = await callLLMJson({
      system:
        "Eres un supervisor clínico experto. Debes devolver SOLO JSON válido, sin texto adicional.",
      prompt,
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
    });

    let result = normalizeAIResult(raw, { evaluaciones, herramientas, enfoque });
    result = addLabelsToResult(result, { evaluaciones, herramientas });

    setAnalysisInInstance(inst, result, fuente, replace);
    await inst.save();

    if (sessionId) {
      const ses = await Session.findById(sessionId);
      if (ses) {
        ses.analisisIA = result;
        await ses.save();
      }
    }

    return res.json({
      ...result,
      _metaPersistencia: {
        instanciaId: String(inst._id),
        analisisGeneradoAt: inst.analisisGeneradoAt || null,
        analisisFuente: inst.analisisFuente || fuente,
        intentosUsados: inst.intentosUsados ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Error analizarRolePlayIA:", err);

    const msg =
      err?.response?.data?.error?.message || err?.message || "Error interno del servidor";

    return res.status(500).json({ message: msg });
  }
};

/* =========================================================
   ✅ POST depurar transcripción (SOLO speakers + segmentación)
========================================================= */
module.exports.depurarTranscripcionRolePlay = async (req, res) => {
  try {
    const {
      ejercicioId,
      instanciaId,
      moduloInstanciaId,

      data,
      replace: replaceRaw = true,
      model: modelRaw,
    } = req.body || {};

    const replace = toBool(replaceRaw, true);
    const userId = req.user?._id || req.user?.id || null;

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const inst = await resolveInstancia({
      instanciaId,
      ejercicioId,
      moduloInstanciaId,
      userId,
    });

    if (!inst) {
      return res.status(400).json({
        message:
          "No se encontró instancia (EjercicioInstancia). Envía instanciaId (ctx.ejercicioInstanciaId).",
        debug: {
          instanciaId: instanciaId || null,
          ejercicioId,
          moduloInstanciaId: moduloInstanciaId || null,
        },
      });
    }

    let rpData = null;
    if (isObj(data)) rpData = data;
    else rpData = extractRPDataFromInstance(inst) || {};

    const rawText =
      safeStr(rpData?.transcripcion, "") ||
      safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion.raw.text", ""), "") ||
      safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion", ""), "");

    const rawTextClamped = clampText(rawText || "", 6000);

    if (!rawTextClamped || rawTextClamped.trim().length < 15) {
      return res.status(400).json({ message: "No hay transcripción suficiente para depurar." });
    }

    const tObj = ensureTranscripcionObj(inst);

    if (replace || !tObj.raw?.text) {
      tObj.raw = { text: rawTextClamped, createdAt: now() };
    }

    tObj.depuracion.status = "processing";
    tObj.depuracion.error = "";
    tObj.depuracion.updatedAt = now();
    if (!tObj.depuracion.createdAt) tObj.depuracion.createdAt = now();

    markTranscripcionModified(inst);
    await inst.save();

    const prompt = `
Vas a preparar una transcripción clínica (terapeuta + paciente) para revisión humana.

OBJETIVO (IMPORTANTE):
- SOLO segmentar en turnos y asignar el locutor:
  - "estudiante" = Terapeuta
  - "paciente"   = Paciente
  - "unknown"    = Ambiguo / no claro

REGLAS:
1) NO inventes texto, NO resumas, NO cambies el sentido.
2) NO detectes ni generes incongruencias/issues. "issues" debe ser [] siempre.
3) Mantén el texto lo más fiel posible (solo limpia espacios excesivos si es necesario).
4) Si no estás seguro del locutor: speaker="unknown", needsReview=true y confidence<0.7.
5) Si el texto viene en líneas tipo "Terapeuta: ..." / "Paciente: ...", respeta eso.
6) Entrega turnos razonablemente cortos: si hay dos intervenciones claramente separadas, sepáralas.

DEVUELVE SOLO JSON VÁLIDO con esta forma EXACTA:

{
  "cleanedText": string,
  "turns": [
    { "id": "t_1", "speaker": "estudiante|paciente|unknown", "text": string, "confidence": number, "needsReview": boolean, "reason": string }
  ],
  "issues": [],
  "stats": { "removedDuplicates": 0, "mergedTurns": 0, "flagged": 0 }
}

TRANSCRIPCIÓN (raw):
${rawTextClamped}
`.trim();

    const model = safeStr(modelRaw, "") || process.env.AI_MODEL || "gpt-4.1-mini";

    const llmRaw = await callLLMJsonWithRetry(
      {
        system: "Devuelve SOLO JSON válido. No agregues texto extra.",
        prompt,
        model,
        temperature: 0.1,
      },
      1
    );

    const result = normalizeDepuracionResult(llmRaw);

    // Fallback: si no hay turns pero hay prefijos ":" lo parseamos
    if ((!result.turns || result.turns.length === 0) && rawTextClamped.includes(":")) {
      const lines = rawTextClamped
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const turns = [];
      let idx = 1;

      for (const line of lines) {
        const m = line.match(/^(paciente|estudiante|terapeuta|speaker)\s*:\s*(.+)$/i);
        if (!m) continue;

        const who = m[1].toLowerCase();
        const text = m[2].trim();

        const speaker = who.includes("paci")
          ? "paciente"
          : who.includes("estu") || who.includes("tera")
          ? "estudiante"
          : "unknown";

        if (text) {
          turns.push({
            id: `t_${idx++}`,
            speaker,
            text,
            confidence: 0.8,
            needsReview: false,
            reason: "parsed_from_raw",
            startChar: null,
            endChar: null,
          });
        }
      }

      if (turns.length) {
        result.turns = turns;
        result.cleanedText = buildFinalTextFromTurns(turns, {});
      }
    }

    ensureTranscripcionObj(inst);

    inst.respuestas.rolePlaying.transcripcion.depuracion.status = "done";
    inst.respuestas.rolePlaying.transcripcion.depuracion.model = model;
    inst.respuestas.rolePlaying.transcripcion.depuracion.updatedAt = now();
    inst.respuestas.rolePlaying.transcripcion.depuracion.result = {
      ...result,
      // Asegura compat:
      issues: [],
      stats: { removedDuplicates: 0, mergedTurns: 0, flagged: 0 },
      // si cleanedText viene vacío, lo armamos desde turns
      cleanedText:
        safeStr(result.cleanedText, "").trim() ||
        buildFinalTextFromTurns(result.turns || [], {}),
    };

    if (replace) {
      inst.respuestas.rolePlaying.transcripcion.depuracion.userDecisions = {
        resolvedIssues: {}, // compat (ya no se usa)
        speakerOverrides: {},
        turnSplits: {},
        turnEdits: {},
      };
      inst.respuestas.rolePlaying.transcripcion.depuracion.finalText = "";
    }

    if (!inst.respuestas.rolePlaying.transcripcion.activeVersion) {
      inst.respuestas.rolePlaying.transcripcion.activeVersion = "raw";
    }

    markTranscripcionModified(inst);
    await inst.save();

    return res.json({
      ok: true,
      instanciaId: String(inst._id),
      transcripcion: inst.respuestas.rolePlaying.transcripcion,
    });
  } catch (err) {
    console.error("❌ Error depurarTranscripcionRolePlay:", err);

    try {
      const userId = req.user?._id || req.user?.id || null;
      const { ejercicioId, instanciaId, moduloInstanciaId } = req.body || {};

      const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
      if (inst) {
        const tObj = ensureTranscripcionObj(inst);
        tObj.depuracion.status = "error";
        tObj.depuracion.error = String(err?.message || "Error en depuración");
        tObj.depuracion.updatedAt = now();

        markTranscripcionModified(inst);
        await inst.save();
      }
    } catch (e2) {
      console.error("❌ No se pudo persistir error de depuración:", e2?.message);
    }

    const msg =
      err?.response?.data?.error?.message || err?.message || "Error interno del servidor";
    return res.status(500).json({ message: msg });
  }
};

/* =========================================================
   ✅ POST aplicar depuración (decisiones del usuario)
   - SIN incongruencias/issues
   - Solo:
     - speakerOverrides
     - turnSplits
     - turnEdits (mover texto: quitar del turno original)
========================================================= */
module.exports.aplicarDepuracionTranscripcionRolePlay = async (req, res) => {
  try {
    const {
      ejercicioId,
      instanciaId,
      moduloInstanciaId,
      decisions,
      setActive: setActiveRaw = true,
      clientResult,
    } = req.body || {};

    const setActive = toBool(setActiveRaw, true);
    const userId = req.user?._id || req.user?.id || null;

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const inst = await resolveInstancia({
      instanciaId,
      ejercicioId,
      moduloInstanciaId,
      userId,
    });

    if (!inst) {
      return res.status(400).json({ message: "No se encontró instancia (EjercicioInstancia)." });
    }

    const tObj = ensureTranscripcionObj(inst);
    const dep = tObj.depuracion || {};

    if (String(dep.status || "").toLowerCase() === "processing") {
      return res.status(409).json({
        message: "La depuración aún está en proceso. Espera a que termine para poder aplicar.",
      });
    }

    // ✅ si backend no tiene result pero FE sí, lo guardamos
    if ((!dep.result || !isObj(dep.result)) && isObj(clientResult)) {
      dep.result = clientResult;
      dep.status = "done";
      dep.updatedAt = now();
      dep.error = "";

      markTranscripcionModified(inst);
      await inst.save();
    }

    const depResult = dep.result;

    if (!depResult || !isObj(depResult)) {
      return res.status(400).json({
        message: "No existe un resultado de depuración. Ejecuta primero /depurar.",
      });
    }

    // ================================
    // 1) Tomar decisiones del FE
    // ================================
    const speakerOverridesIn =
      decisions && typeof decisions === "object" && decisions.speakerOverrides
        ? decisions.speakerOverrides
        : {};

    // compat: ignoramos resolvedIssues (no se usa)
    const turnSplitsIn =
      decisions && typeof decisions === "object" && decisions.turnSplits
        ? decisions.turnSplits
        : {};

    const turnEditsIn =
      decisions && typeof decisions === "object" && decisions.turnEdits ? decisions.turnEdits : {};

    // ================================
    // 2) Merge decisiones (sin borrar)
    // ================================
    const prevDec = dep.userDecisions && typeof dep.userDecisions === "object" ? dep.userDecisions : {};
    const prevSO = isObj(prevDec.speakerOverrides) ? prevDec.speakerOverrides : {};
    const prevTS = isObj(prevDec.turnSplits) ? prevDec.turnSplits : {};
    const prevTE = isObj(prevDec.turnEdits) ? prevDec.turnEdits : {};

    const normTS = normalizeTurnSplits(turnSplitsIn);
    const normTE = normalizeTurnEdits(turnEditsIn);

    dep.userDecisions = {
      // compat (ya no se usa, pero mantenemos)
      resolvedIssues: isObj(prevDec.resolvedIssues) ? prevDec.resolvedIssues : {},

      speakerOverrides: { ...prevSO, ...(isObj(speakerOverridesIn) ? speakerOverridesIn : {}) },
      turnSplits: { ...prevTS, ...(isObj(normTS) ? normTS : {}) },
      turnEdits: { ...prevTE, ...(isObj(normTE) ? normTE : {}) },
    };

    // ================================
    // 3) Aplicar reglas a turnos
    // ================================
    const turnsBase = safeArr(depResult.turns);

    // 3.1 aplicar turnEdits (quita texto del turno original)
    const turnsAfterEdits = applyTurnEditsToTurns(turnsBase, dep.userDecisions.turnEdits);

    // 3.2 splits (insertar después del turno original)
    const turnsApplied = applyTurnSplitsToTurns(turnsAfterEdits, dep.userDecisions.turnSplits);

    // 3.3 finalText (aplica speakerOverrides en labels)
    const finalText = buildFinalTextFromTurns(turnsApplied, dep.userDecisions.speakerOverrides);

    // ================================
    // 4) Persistir resultado aplicado
    // ================================
    dep.finalText = finalText;
    dep.updatedAt = now();
    dep.status = "done";
    dep.error = "";

    if (setActive) {
      tObj.activeVersion = "depurada";
    }

    dep.result = {
      ...depResult,
      // compat: issues vacío siempre
      issues: [],
      stats: { removedDuplicates: 0, mergedTurns: 0, flagged: 0 },

      cleanedText: finalText,
      turns: turnsApplied,
      _applied: {
        setActive: Boolean(setActive),
        baseTurnsCount: turnsBase.length,
        afterEditsCount: turnsAfterEdits.length,
        appliedTurnsCount: turnsApplied.length,
        hasSplits: Object.keys(dep.userDecisions.turnSplits || {}).length > 0,
        splitsCount: Object.values(dep.userDecisions.turnSplits || {}).reduce(
          (a, arr) => a + (Array.isArray(arr) ? arr.length : 0),
          0
        ),
        hasEdits: Object.keys(dep.userDecisions.turnEdits || {}).length > 0,
      },
    };

    markTranscripcionModified(inst);
    await inst.save();

    return res.json({
      ok: true,
      instanciaId: String(inst._id),
      transcripcion: inst.respuestas.rolePlaying.transcripcion,
    });
  } catch (err) {
    console.error("❌ Error aplicarDepuracionTranscripcionRolePlay:", err);

    const msg =
      err?.response?.data?.error?.message || err?.message || "Error interno del servidor";

    return res.status(500).json({ message: msg });
  }
};