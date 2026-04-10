// server/controllers/depuracionController.js
const EjercicioInstancia = require("../models/ejercicioInstancia");

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
    const parts = String(path || "").split(".").map((s) => s.trim()).filter(Boolean);
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

function clampText(text, max = 12000) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[...texto recortado...]";
}

function markTranscripcionModified(inst) {
  if (!inst || typeof inst.markModified !== "function") return;
  inst.markModified("respuestas");
  inst.markModified("respuestas.rolePlaying");
  inst.markModified("respuestas.rolePlaying.transcripcion");
  inst.markModified("respuestas.rolePlaying.transcripcion.depuracion");
}

/* =========================================================
   Undo history
========================================================= */
function cloneJSON(v) {
  try { return JSON.parse(JSON.stringify(v)); } catch { return v; }
}

function ensureDepHistory(dep) {
  if (!dep || typeof dep !== "object") return;
  if (!Array.isArray(dep.history)) dep.history = [];
}

function pushDepHistorySnapshot(dep, payload, max = 30) {
  if (!dep || typeof dep !== "object") return;
  ensureDepHistory(dep);
  dep.history.push({ at: new Date().toISOString(), ...cloneJSON(payload || {}) });
  if (dep.history.length > max) dep.history = dep.history.slice(dep.history.length - max);
}

function popDepHistorySnapshot(dep) {
  if (!dep || typeof dep !== "object") return null;
  ensureDepHistory(dep);
  if (dep.history.length === 0) return null;
  return dep.history.pop();
}

/* =========================================================
   Resolve instancia
========================================================= */
async function resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId }) {
  if (instanciaId) {
    const inst = await EjercicioInstancia.findById(instanciaId);
    if (inst) return inst;
  }
  if (!userId || !ejercicioId) return null;
  const q = {
    ejercicio: ejercicioId,
    $or: [{ estudiante: userId }, { usuario: userId }],
  };
  if (moduloInstanciaId) q.moduloInstancia = moduloInstanciaId;
  return EjercicioInstancia.findOne(q).sort({ createdAt: -1, updatedAt: -1 });
}

/* =========================================================
   ensureTranscripcionObj
========================================================= */
function ensureTranscripcionObj(inst) {
  if (!inst.respuestas) inst.respuestas = {};
  if (!inst.respuestas.rolePlaying) inst.respuestas.rolePlaying = {};
  if (!inst.respuestas.rolePlaying.transcripcion) inst.respuestas.rolePlaying.transcripcion = {};

  const t = inst.respuestas.rolePlaying.transcripcion;

  if (!t.raw) t.raw = { text: "", createdAt: null };
  if (!t.depuracion) {
    t.depuracion = {
      status: "idle",
      error: "",
      model: "",
      createdAt: null,
      updatedAt: null,
      result: null,
      userDecisions: { resolvedIssues: {}, speakerOverrides: {}, turnSplits: {}, turnEdits: {} },
      finalText: "",
      history: [],
    };
  }

  if (!isObj(t.depuracion.userDecisions)) {
    t.depuracion.userDecisions = { resolvedIssues: {}, speakerOverrides: {}, turnSplits: {}, turnEdits: {} };
  } else {
    if (!isObj(t.depuracion.userDecisions.resolvedIssues)) t.depuracion.userDecisions.resolvedIssues = {};
    if (!isObj(t.depuracion.userDecisions.speakerOverrides)) t.depuracion.userDecisions.speakerOverrides = {};
    if (!isObj(t.depuracion.userDecisions.turnSplits)) t.depuracion.userDecisions.turnSplits = {};
    if (!isObj(t.depuracion.userDecisions.turnEdits)) t.depuracion.userDecisions.turnEdits = {};
  }

  if (!Array.isArray(t.depuracion.history)) t.depuracion.history = [];
  if (!t.activeVersion) t.activeVersion = "raw";

  markTranscripcionModified(inst);
  return t;
}

/* =========================================================
   Manual diarization helpers
========================================================= */
function normalizeSpeakerManual(value) {
  const raw = safeStr(value, "").trim().toLowerCase();
  if (["estudiante", "terapeuta", "therapist", "ter", "student"].includes(raw)) return "estudiante";
  if (["paciente", "patient", "pac", "cliente"].includes(raw)) return "paciente";
  return "unknown";
}

// ✅ versión más permisiva — busca texto en todos los campos posibles
function normalizeTurnManual(raw, idx = 0) {
  if (!raw || typeof raw !== "object") return null;

  const id = safeStr(raw.id, "")
    || safeStr(raw._id, "")
    || safeStr(raw.turnId, "")
    || `t_${idx + 1}`;

  const text = safeStr(raw.text, "")
    || safeStr(raw.texto, "")
    || safeStr(raw.content, "")
    || safeStr(raw.message, "")
    || safeStr(raw.transcripcion, "")
    || "";

  const cleanedText = text.trim();
  if (!cleanedText) return null;

  const speaker = normalizeSpeakerManual(
    raw.speaker
    || raw.role
    || raw.rol
    || raw.label
    || raw.participant
    || raw.hablante
    || raw.speakerLabel
    || ""
  );

  return {
    id,
    speaker,
    text: cleanedText,
    confidence: Number.isFinite(Number(raw?.confidence)) ? Number(raw.confidence) : null,
    needsReview: Boolean(raw?.needsReview),
    reason: safeStr(raw?.reason, "") || "manual_source",
    startChar: Number.isFinite(Number(raw?.startChar)) ? Number(raw.startChar) : null,
    endChar: Number.isFinite(Number(raw?.endChar)) ? Number(raw.endChar) : null,
  };
}

function parseTurnsFromRawText(rawText) {
  const text = safeStr(rawText, "").trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const turns = [];
  let current = null;
  const rx = /^(terapeuta|paciente|speaker|estudiante|therapist|patient|ambiguo)\s*:\s*(.*)$/i;

  for (const line of lines) {
    const m = safeStr(line, "").match(rx);
    if (m) {
      if (current && safeStr(current.text, "").trim()) {
        turns.push({
          id: `t_${turns.length + 1}`,
          speaker: normalizeSpeakerManual(current.speaker),
          text: safeStr(current.text, "").trim(),
          confidence: null, needsReview: false,
          reason: "parsed_from_raw",
          startChar: null, endChar: null,
        });
      }
      current = { speaker: m[1], text: safeStr(m[2], "") };
    } else if (current) {
      current.text += `${current.text ? "\n" : ""}${safeStr(line, "")}`;
    } else {
      current = { speaker: "unknown", text: safeStr(line, "") };
    }
  }

  if (current && safeStr(current.text, "").trim()) {
    turns.push({
      id: `t_${turns.length + 1}`,
      speaker: normalizeSpeakerManual(current.speaker),
      text: safeStr(current.text, "").trim(),
      confidence: null, needsReview: false,
      reason: "parsed_from_raw",
      startChar: null, endChar: null,
    });
  }

  return turns;
}

// ✅ más rutas de búsqueda para cubrir Role Playing y Grabar Voz
function extractManualBaseTurns(inst, rpData = {}, fallbackRawText = "") {
  const candidates = [
    rpData?.diarizacionTurnos,
    deepGet(rpData, "transcripcionDiarizada.turns", null),
    deepGet(rpData, "transcripcionDiarizada", null),
    deepGet(rpData, "diarizacion.turns", null),
    deepGet(rpData, "diarizacion", null),
    rpData?.diarizedTurns,
    rpData?.turnsDiarizados,
    rpData?.turnosDiarizados,
    rpData?.turnos,
    rpData?.transcriptionTurns,
    rpData?.transcriptTurns,
    deepGet(rpData, "transcriptionData.turns", null),
    deepGet(rpData, "payload.diarizacionTurnos", null),
    deepGet(rpData, "payload.turnos", null),
    deepGet(rpData, "payload.diarizedTurns", null),
    deepGet(inst, "respuestas.rolePlaying.transcripcion.diarizacion.turns", null),
    deepGet(inst, "respuestas.rolePlaying.transcripcion.diarizacion", null),
    deepGet(inst, "respuestas.rolePlaying.turnosDiarizados", null),
    deepGet(inst, "respuestas.rolePlaying.turnos", null),
    deepGet(inst, "respuestas.rolePlaying.payload.diarizacionTurnos", null),
    deepGet(inst, "respuestas.rolePlaying.payload.turnos", null),
    deepGet(inst, "respuestas.rolePlaying.diarizacionTurnos", null),
    deepGet(inst, "respuestas.grabarVoz.diarizacionTurnos", null),
    deepGet(inst, "respuestas.grabarVoz.turnos", null),
  ];

  for (const item of candidates) {
    if (Array.isArray(item) && item.length > 0) {
      const normalized = item.map(normalizeTurnManual).filter(Boolean);
      if (normalized.length > 0) return normalized;
    }
  }

  return parseTurnsFromRawText(fallbackRawText);
}

function buildFinalTextFromTurns(turns = [], speakerOverrides = {}) {
  const lines = [];
  for (const t of turns) {
    const id = String(t?.id || "");
    const override = speakerOverrides && typeof speakerOverrides === "object" ? speakerOverrides[id] : null;
    const speaker = override || t.speaker || "unknown";
    const label = speaker === "estudiante" ? "Terapeuta" : speaker === "paciente" ? "Paciente" : "Ambiguo";
    const text = safeStr(t?.text, "").trim();
    if (!text) continue;
    lines.push(`${label}: ${text}`.trim());
  }
  return lines.join("\n");
}

function buildManualDepuracionResultFromSource(baseTurns = []) {
  const turns = safeArr(baseTurns).map((t, idx) => ({
    id: safeStr(t?.id, `t_${idx + 1}`),
    speaker: normalizeSpeakerManual(t?.speaker),
    text: safeStr(t?.text, "").trim(),
    confidence: Number.isFinite(Number(t?.confidence)) ? Number(t.confidence) : null,
    needsReview: Boolean(t?.needsReview),
    reason: safeStr(t?.reason, "") || "manual_source",
    startChar: Number.isFinite(Number(t?.startChar)) ? Number(t.startChar) : null,
    endChar: Number.isFinite(Number(t?.endChar)) ? Number(t.endChar) : null,
  }));

  return {
    cleanedText: buildFinalTextFromTurns(turns, {}),
    turns,
    baseTurns: turns,
    appliedTurns: turns,
    issues: [],
    stats: { removedDuplicates: 0, mergedTurns: 0, flagged: 0 },
  };
}

/* =========================================================
   turnSplits helpers
========================================================= */
function normalizeTurnSplits(turnSplitsRaw) {
  if (!isObj(turnSplitsRaw)) return {};
  const out = {};
  for (const [turnId, arr] of Object.entries(turnSplitsRaw)) {
    const tid = String(turnId || "").trim();
    if (!tid) continue;
    const items = safeArr(arr).map((x, idx) => {
      const id = safeStr(x?.id, `split_${tid}_${idx + 1}`);
      const speakerRaw = safeStr(x?.speaker, "unknown").toLowerCase();
      const speaker = ["estudiante", "terapeuta", "therapist"].includes(speakerRaw) ? "estudiante"
        : ["paciente", "patient", "pac"].includes(speakerRaw) ? "paciente"
        : "unknown";
      const text = safeStr(x?.text, "").trim();
      if (!text) return null;
      return { id, speaker, text };
    }).filter(Boolean);
    if (items.length) out[tid] = items;
  }
  return out;
}

function applyTurnSplitsToTurns(turns = [], turnSplits = {}) {
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
        id, speaker: safeStr(sp?.speaker, "unknown"), text,
        confidence: null, needsReview: false,
        reason: "user_split", startChar: null, endChar: null,
      });
    }
  }
  return out;
}

/* =========================================================
   turnEdits helpers
========================================================= */
function escapeRegExp(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceOnceLoose(haystack, needle, replacement) {
  const H = safeStr(haystack, "");
  const N = safeStr(needle, "").trim();
  if (!H || !N) return H;
  const idx = H.indexOf(N);
  if (idx >= 0) return H.slice(0, idx) + replacement + H.slice(idx + N.length);
  const parts = N.split(/\s+/).map((p) => p.trim()).filter(Boolean).map(escapeRegExp);
  if (!parts.length) return H;
  const re = new RegExp(parts.join("\\s+"), "m");
  const m = H.match(re);
  if (!m || typeof m.index !== "number") return H;
  return H.slice(0, m.index) + replacement + H.slice(m.index + m[0].length);
}

function normalizeSpacingKeepMarkers(s) {
  return safeStr(s, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function computeEditedTurnText(originalText, removals = []) {
  const base = safeStr(originalText, "");
  if (!base) return "";

  const withPos = safeArr(removals).map((r) => {
    if (!isObj(r)) return null;
    const splitId = safeStr(r?.splitId, "").trim();
    const piece = safeStr(r?.text, "").trim();
    const start = Number(r?.start);
    const end = Number(r?.end);
    if (!splitId || !piece) return null;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    return { splitId, piece, start, end };
  }).filter(Boolean).sort((a, b) => b.start - a.start);

  let out = base;
  for (const r of withPos) {
    if (r.start < 0 || r.end > out.length) continue;
    out = out.slice(0, r.start) + `[[SPLIT:${r.splitId}]]` + out.slice(r.end);
  }

  for (const r of safeArr(removals)) {
    if (!isObj(r)) continue;
    const splitId = safeStr(r?.splitId, "").trim();
    const piece = safeStr(r?.text, "").trim();
    const start = Number(r?.start);
    const end = Number(r?.end);
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) continue;
    if (!splitId || !piece) continue;
    out = replaceOnceLoose(out, piece, `[[SPLIT:${splitId}]]`);
  }

  return normalizeSpacingKeepMarkers(out);
}

function normalizeTurnEdits(turnEditsRaw) {
  if (!isObj(turnEditsRaw)) return {};
  const out = {};
  for (const [turnId, ed] of Object.entries(turnEditsRaw)) {
    const tid = safeStr(turnId, "").trim();
    if (!tid || !isObj(ed)) continue;
    const originalText = safeStr(ed?.originalText, "").trim();
    const removals = safeArr(ed?.removals).map((r) => {
      if (!isObj(r)) return null;
      const splitId = safeStr(r?.splitId, "").trim();
      const text = safeStr(r?.text, "").trim();
      if (!text) return null;
      const start = Number(r?.start);
      const end = Number(r?.end);
      return {
        splitId: splitId || null,
        text,
        start: Number.isFinite(start) ? start : null,
        end: Number.isFinite(end) ? end : null,
      };
    }).filter(Boolean);
    if (!originalText && removals.length === 0) continue;
    out[tid] = { originalText, removals };
  }
  return out;
}

function applyTurnEditsToTurns(turns = [], turnEdits = {}) {
  if (!Array.isArray(turns) || turns.length === 0) return [];
  if (!isObj(turnEdits) || Object.keys(turnEdits).length === 0) return turns;
  return turns.map((t) => {
    const id = safeStr(t?.id, "");
    if (!id) return t;
    const ed = turnEdits[id];
    if (!isObj(ed)) return t;
    const base = safeStr(t?.text, "");
    const originalText = safeStr(ed?.originalText, base) || base;
    const edited = computeEditedTurnText(originalText, safeArr(ed?.removals));
    return { ...t, text: safeStr(edited, "").trim() };
  });
}

/* =========================================================
   POST /api/ia/roleplay/transcripcion/depurar
========================================================= */
module.exports.depurarTranscripcionRolePlay = async (req, res) => {
  try {
    const { ejercicioId, instanciaId, moduloInstanciaId, data, replace: replaceRaw = true } = req.body || {};
    const replace = toBool(replaceRaw, true);
    const userId = req.user?._id || req.user?.id || null;

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
    if (!inst) {
      return res.status(400).json({
        message: "No se encontró instancia (EjercicioInstancia).",
        debug: { instanciaId: instanciaId || null, ejercicioId, moduloInstanciaId: moduloInstanciaId || null },
      });
    }

    let rpData = isObj(data) ? data : {};
    const rawText =
      safeStr(rpData?.transcripcion, "") ||
      safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion.raw.text", ""), "") ||
      safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion", ""), "");

    const rawTextClamped = clampText(rawText || "", 12000);
    if (!rawTextClamped || rawTextClamped.trim().length < 2) {
      return res.status(400).json({ message: "No hay transcripción suficiente para preparar la depuración manual." });
    }

    const tObj = ensureTranscripcionObj(inst);
    if (replace || !tObj.raw?.text) {
      tObj.raw = { text: rawTextClamped, createdAt: now() };
    }

    const baseTurns = extractManualBaseTurns(inst, rpData, rawTextClamped);
    if (!Array.isArray(baseTurns) || baseTurns.length === 0) {
      return res.status(400).json({ message: "No se pudieron obtener turnos diarizados desde la transcripción actual." });
    }

    const result = buildManualDepuracionResultFromSource(baseTurns);

    tObj.depuracion.status = "done";
    tObj.depuracion.error = "";
    tObj.depuracion.model = "manual_diarization";
    tObj.depuracion.updatedAt = now();
    if (!tObj.depuracion.createdAt) tObj.depuracion.createdAt = now();
    tObj.depuracion.result = result;

    if (replace) {
      tObj.depuracion.userDecisions = { resolvedIssues: {}, speakerOverrides: {}, turnSplits: {}, turnEdits: {} };
      tObj.depuracion.finalText = result.cleanedText;
      tObj.depuracion.history = [];
    } else {
      if (!safeStr(tObj.depuracion.finalText, "").trim()) tObj.depuracion.finalText = result.cleanedText;
    }

    tObj.activeVersion = "raw";
    markTranscripcionModified(inst);
    await inst.save();

    return res.json({ ok: true, instanciaId: String(inst._id), transcripcion: inst.respuestas.rolePlaying.transcripcion });
  } catch (err) {
    console.error("❌ Error depurarTranscripcionRolePlay:", err);
    return res.status(500).json({ message: err?.message || "Error interno del servidor" });
  }
};

/* =========================================================
   POST /api/ia/roleplay/transcripcion/depurar/aplicar
========================================================= */
module.exports.aplicarDepuracionTranscripcionRolePlay = async (req, res) => {
  try {
    const { ejercicioId, instanciaId, moduloInstanciaId, decisions, setActive: setActiveRaw = true, clientResult, data } = req.body || {};
    const setActive = toBool(setActiveRaw, true);
    const userId = req.user?._id || req.user?.id || null;

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
    if (!inst) return res.status(400).json({ message: "No se encontró instancia (EjercicioInstancia)." });

    const tObj = ensureTranscripcionObj(inst);
    const dep = tObj.depuracion || {};

    // ── Si no hay dep.result previo, intentar reconstruirlo ──
    if (!dep.result || !isObj(dep.result)) {
      const rpData = isObj(data) ? data : {};
      const rawText =
        safeStr(rpData?.transcripcion, "") ||
        safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion.raw.text", ""), "") ||
        safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion", ""), "");

      if (isObj(clientResult) && Array.isArray(clientResult.baseTurns) && clientResult.baseTurns.length > 0) {
        dep.result = clientResult;
      } else {
        const baseTurns = extractManualBaseTurns(inst, rpData, clampText(rawText || "", 12000));
        if (!baseTurns.length) return res.status(400).json({ message: "No hay baseTurns ni turnos diarizados para aplicar cambios." });
        dep.result = buildManualDepuracionResultFromSource(baseTurns);
      }

      dep.status = "done";
      dep.error = "";
      dep.model = dep.model || "manual_diarization";
      dep.updatedAt = now();
      if (!dep.createdAt) dep.createdAt = now();
    }

    const depResult = dep.result;
    if (!depResult || !isObj(depResult)) return res.status(400).json({ message: "No existe un resultado de depuración para aplicar." });

    const speakerOverridesIn = decisions?.speakerOverrides && typeof decisions.speakerOverrides === "object" ? decisions.speakerOverrides : {};
    const turnSplitsIn       = decisions?.turnSplits && typeof decisions.turnSplits === "object" ? decisions.turnSplits : {};
    const turnEditsIn        = decisions?.turnEdits && typeof decisions.turnEdits === "object" ? decisions.turnEdits : {};

    ensureDepHistory(dep);
    pushDepHistorySnapshot(dep, {
      userDecisions: dep.userDecisions || { resolvedIssues: {}, speakerOverrides: {}, turnSplits: {}, turnEdits: {} },
      finalText: dep.finalText || "",
      activeVersion: tObj.activeVersion || "raw",
    });

    const prevDec = dep.userDecisions && typeof dep.userDecisions === "object" ? dep.userDecisions : {};
    const normTS = normalizeTurnSplits(turnSplitsIn);
    const normTE = normalizeTurnEdits(turnEditsIn);

    dep.userDecisions = {
      resolvedIssues:   isObj(prevDec.resolvedIssues) ? prevDec.resolvedIssues : {},
      speakerOverrides: isObj(speakerOverridesIn) ? speakerOverridesIn : {},
      turnSplits:       isObj(normTS) ? normTS : {},
      turnEdits:        isObj(normTE) ? normTE : {},
    };

    // ── Obtener turnsBase en orden de prioridad ──
    let turnsBase = [];

    // 1. clientResult.baseTurns del frontend
    if (isObj(clientResult) && Array.isArray(clientResult.baseTurns) && clientResult.baseTurns.length > 0) {
      turnsBase = clientResult.baseTurns.map(normalizeTurnManual).filter(Boolean);
    }

    // 2. depResult.baseTurns guardado en BD
    if (!turnsBase.length) {
      turnsBase = safeArr(depResult.baseTurns).filter((t) => safeStr(t?.text, "").trim().length > 0);
    }

    // 3. depResult.turns sin splits
    if (!turnsBase.length) {
      turnsBase = safeArr(depResult.turns).filter((t) => {
        const id     = safeStr(t?.id, "");
        const reason = safeStr(t?.reason, "");
        return reason !== "user_split"
          && !id.startsWith("split-")
          && !id.startsWith("split_")
          && safeStr(t?.text, "").trim().length > 0;
      });
    }

    // 4. extractManualBaseTurns desde la instancia
    if (!turnsBase.length) {
      const rpData  = isObj(data) ? data : {};
      const rawText =
        safeStr(rpData?.transcripcion, "") ||
        safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion.raw.text", ""), "") ||
        safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion.depuracion.finalText", ""), "") ||
        safeStr(deepGet(inst, "respuestas.rolePlaying.transcripcion", ""), "") ||
        safeStr(deepGet(inst, "respuestas.grabarVoz.transcripcion", ""), "");
      turnsBase = extractManualBaseTurns(inst, rpData, clampText(rawText, 12000));
    }

    if (!turnsBase.length) {
      return res.status(400).json({ message: "No hay baseTurns válidos para reconstruir la transcripción." });
    }

    const turnsAfterEdits = applyTurnEditsToTurns(turnsBase, dep.userDecisions.turnEdits);
    const turnsApplied    = applyTurnSplitsToTurns(turnsAfterEdits, dep.userDecisions.turnSplits);
    const finalText       = buildFinalTextFromTurns(turnsApplied, dep.userDecisions.speakerOverrides);

    dep.finalText  = finalText;
    dep.updatedAt  = now();
    dep.status     = "done";
    dep.error      = "";
    dep.model      = dep.model || "manual_diarization";

    if (setActive) tObj.activeVersion = "depurada";

    dep.result = {
      ...depResult,
      baseTurns:    turnsBase,
      turns:        turnsBase,
      appliedTurns: turnsApplied,
      issues:       [],
      stats:        { removedDuplicates: 0, mergedTurns: 0, flagged: 0 },
      cleanedText:  finalText,
      _applied: {
        mode:              "manual",
        setActive:         Boolean(setActive),
        baseTurnsCount:    turnsBase.length,
        afterEditsCount:   turnsAfterEdits.length,
        appliedTurnsCount: turnsApplied.length,
        hasSplits:         Object.keys(dep.userDecisions.turnSplits || {}).length > 0,
        splitsCount:       Object.values(dep.userDecisions.turnSplits || {}).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0),
        hasEdits:          Object.keys(dep.userDecisions.turnEdits || {}).length > 0,
        historyCount:      Array.isArray(dep.history) ? dep.history.length : 0,
      },
    };

    if (tObj.activeVersion === "depurada") {
      tObj.raw = { ...(tObj.raw || {}), text: safeStr(finalText, ""), createdAt: tObj.raw?.createdAt || now() };
    }

    markTranscripcionModified(inst);
    await inst.save();

    return res.json({ ok: true, instanciaId: String(inst._id), transcripcion: inst.respuestas.rolePlaying.transcripcion });
  } catch (err) {
    console.error("❌ Error aplicarDepuracionTranscripcionRolePlay:", err);
    return res.status(500).json({ message: err?.message || "Error interno del servidor" });
  }
};

/* =========================================================
   POST /api/ia/roleplay/transcripcion/depuracion/undo
========================================================= */
module.exports.deshacerDepuracionTranscripcionRolePlay = async (req, res) => {
  try {
    const { ejercicioId, instanciaId, moduloInstanciaId } = req.body || {};
    const userId = req.user?._id || req.user?.id || null;

    if (!ejercicioId) return res.status(400).json({ message: "Falta ejercicioId" });

    const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
    if (!inst) return res.status(400).json({ message: "No se encontró instancia (EjercicioInstancia)." });

    const tObj = ensureTranscripcionObj(inst);
    const dep = tObj.depuracion || {};
    const depResult = dep.result;

    if (!depResult || !isObj(depResult)) return res.status(400).json({ message: "No existe resultado de depuración para deshacer." });

    ensureDepHistory(dep);
    const snap = popDepHistorySnapshot(dep);
    if (!snap) return res.status(409).json({ message: "No hay acciones para deshacer." });

    const restored = snap.userDecisions && typeof snap.userDecisions === "object" ? snap.userDecisions : {};

    dep.userDecisions = {
      resolvedIssues:   isObj(restored.resolvedIssues)   ? restored.resolvedIssues   : {},
      speakerOverrides: isObj(restored.speakerOverrides) ? restored.speakerOverrides : {},
      turnSplits:       isObj(restored.turnSplits)       ? normalizeTurnSplits(restored.turnSplits) : {},
      turnEdits:        isObj(restored.turnEdits)        ? normalizeTurnEdits(restored.turnEdits)   : {},
    };

    let turnsBase = safeArr(depResult.baseTurns).filter((t) => safeStr(t?.text, "").trim().length > 0);
    if (!turnsBase.length) {
      turnsBase = safeArr(depResult.turns).filter((t) => safeStr(t?.text, "").trim().length > 0);
    }

    // ✅ CORREGIDO: nombre de variable faltaba
    const turnsAfterEdits = applyTurnEditsToTurns(turnsBase, dep.userDecisions.turnEdits);
    const turnsApplied    = applyTurnSplitsToTurns(turnsAfterEdits, dep.userDecisions.turnSplits);
    const finalText       = buildFinalTextFromTurns(turnsApplied, dep.userDecisions.speakerOverrides);

    dep.finalText  = finalText;
    dep.updatedAt  = now();
    dep.status     = "done";
    dep.error      = "";
    dep.model      = dep.model || "manual_diarization";

    dep.result = {
      ...depResult,
      baseTurns:    turnsBase,
      turns:        turnsBase,
      appliedTurns: turnsApplied,
      issues:       [],
      stats:        { removedDuplicates: 0, mergedTurns: 0, flagged: 0 },
      cleanedText:  finalText,
      _undo: {
        restoredAt:   new Date().toISOString(),
        historyCount: Array.isArray(dep.history) ? dep.history.length : 0,
      },
    };

    markTranscripcionModified(inst);
    await inst.save();

    return res.json({ ok: true, instanciaId: String(inst._id), transcripcion: inst.respuestas.rolePlaying.transcripcion });
  } catch (err) {
    console.error("❌ Error deshacerDepuracionTranscripcionRolePlay:", err);
    return res.status(500).json({ message: err?.message || "Error interno del servidor" });
  }
};
