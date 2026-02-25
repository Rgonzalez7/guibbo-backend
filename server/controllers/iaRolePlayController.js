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

function deepSet(obj, path, value) {
  const parts = String(path || "")
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return obj;

  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return obj;
}

/**
 * ✅ MUY IMPORTANTE (FIX):
 * Si tu schema usa Mixed (respuestas...), Mongoose NO detecta cambios profundos.
 * Entonces debes forzar markModified en rutas clave antes de save().
 */
function markTranscripcionModified(inst) {
  if (!inst || typeof inst.markModified !== "function") return;
  // marcamos el árbol completo que estamos mutando
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

  // por si respuestas es Mixed
  if (typeof inst.markModified === "function") {
    inst.markModified("respuestas");
    inst.markModified("respuestas.rolePlaying");
  }

  return inst;
}

/**
 * ✅ Resolver EjercicioInstancia:
 * - prioridad: instanciaId
 * - fallback: buscar por (estudiante + ejercicioId [+ moduloInstanciaId])
 *
 * NOTA: tu schema usa "estudiante", NO "usuario"
 *       dejamos compat con "usuario" por si tuvieras datos viejos.
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
   ✅ MEJORA: retry 1 vez para callLLMJson
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
   ✅ Depuración de transcripción
========================================================= */

/**
 * Estructura esperada del LLM (JSON):
 * {
 *   cleanedText: string,
 *   turns: [{ id, speaker, text, confidence, needsReview, reason, startChar, endChar }],
 *   issues: [{ id, type, severity, snippet, reason, suggestion, needsReview, affectedTurnIds: [] }],
 *   stats: { removedDuplicates:number, mergedTurns:number, flagged:number }
 * }
 */
function normalizeDepuracionResult(raw) {
  const out = isObj(raw) ? raw : {};
  const cleanedText = safeStr(out.cleanedText, "");

  const turns = safeArr(out.turns)
    .map((t, idx) => {
      const id = safeStr(t?.id, `t_${idx + 1}`);
      const speakerRaw = safeStr(t?.speaker, "").toLowerCase();
      const speaker =
        speakerRaw.includes("tera") || speakerRaw === "estudiante" || speakerRaw === "therapist"
          ? "estudiante"
          : speakerRaw.includes("paci") || speakerRaw === "paciente" || speakerRaw === "patient"
          ? "paciente"
          : "unknown";

      const confidence = Number.isFinite(Number(t?.confidence)) ? Number(t.confidence) : null;

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

  const issues = safeArr(out.issues).map((it, idx) => {
    const id = safeStr(it?.id, `i_${idx + 1}`);
    const type = safeStr(it?.type, "unknown");
    const severity = safeStr(it?.severity, "low");
    const affectedTurnIds = safeArr(it?.affectedTurnIds).map((x) => safeStr(x, "")).filter(Boolean);

    return {
      id,
      type,
      severity,
      snippet: safeStr(it?.snippet, ""),
      reason: safeStr(it?.reason, ""),
      needsReview: Boolean(it?.needsReview),
      suggestion: isObj(it?.suggestion) ? it.suggestion : {},
      affectedTurnIds,
    };
  });

  const statsIn = isObj(out.stats) ? out.stats : {};
  const stats = {
    removedDuplicates: Number(statsIn.removedDuplicates || 0) || 0,
    mergedTurns: Number(statsIn.mergedTurns || 0) || 0,
    flagged: Number(statsIn.flagged || 0) || 0,
  };

  return { cleanedText, turns, issues, stats };
}

function normForMatch(s) {
  return safeStr(s, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function longestCommonWordRun(a, b) {
  const A = normForMatch(a).split(" ").filter(Boolean);
  const B = normForMatch(b).split(" ").filter(Boolean);
  if (A.length === 0 || B.length === 0) return 0;

  const dp = Array(B.length + 1).fill(0);
  let best = 0;

  for (let i = 1; i <= A.length; i++) {
    let prev = 0;
    for (let j = 1; j <= B.length; j++) {
      const tmp = dp[j];
      if (A[i - 1] === B[j - 1]) {
        dp[j] = prev + 1;
        if (dp[j] > best) best = dp[j];
      } else {
        dp[j] = 0;
      }
      prev = tmp;
    }
  }
  return best;
}

function autoIssuesFromTurns(turns) {
  const out = [];
  let idx = 1;

  const mk = (type, severity, snippet, reason, action, affectedTurnIds) => ({
    id: `auto_${idx++}`,
    type,
    severity,
    snippet,
    reason,
    needsReview: false,
    suggestion: { action, speaker: "unknown" },
    affectedTurnIds,
  });

  for (let i = 0; i < turns.length - 1; i++) {
    const t1 = turns[i];
    const t2 = turns[i + 1];
    const run = longestCommonWordRun(t1.text, t2.text);
    if (run >= 6) {
      out.push(
        mk(
          "duplicate",
          run >= 10 ? "high" : "medium",
          `Eco detectado (${run} palabras)`,
          "Frase repetida entre turnos contiguos (posible eco de STT).",
          "merge",
          [String(t1.id), String(t2.id)]
        )
      );
    }
  }

  for (const t of turns) {
    const words = normForMatch(t.text).split(" ").filter(Boolean);
    if (words.length < 18) continue;

    const mid = Math.floor(words.length / 2);
    const a = words.slice(0, mid).join(" ");
    const b = words.slice(mid).join(" ");
    const run = longestCommonWordRun(a, b);
    if (run >= 6) {
      out.push(
        mk(
          "duplicate",
          run >= 10 ? "high" : "medium",
          `Repetición interna (${run} palabras)`,
          "El mismo turno contiene repetición/eco (posible pegado de otra voz).",
          "keep",
          [String(t.id)]
        )
      );
    }
  }

  return out;
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
      userDecisions: { resolvedIssues: {}, speakerOverrides: {} },
      finalText: "",
    };

  if (!t.activeVersion) t.activeVersion = "raw";

  // FIX: si esto vive en Mixed, marcamos
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
      speaker === "estudiante" ? "Terapeuta" : speaker === "paciente" ? "Paciente" : "Speaker";

    lines.push(`${label}: ${safeStr(t?.text, "").trim()}`.trim());
  }

  return lines.join("\n");
}

function applyIssuesToTurns({ turns, issues, resolvedIssues }) {
  const byId = new Map(turns.map((t) => [String(t.id), { ...t }]));
  const removedTurnIds = new Set();
  const resolved = resolvedIssues && typeof resolvedIssues === "object" ? resolvedIssues : {};

  for (const issue of issues || []) {
    const issueId = String(issue?.id || "");
    const resolution = resolved[issueId] || null;

    if (!resolution || typeof resolution !== "object") continue;

    const action = String(resolution.action || resolution?.suggestionAction || "")
      .toLowerCase()
      .trim();

    const affected = Array.isArray(issue?.affectedTurnIds) ? issue.affectedTurnIds : [];

    if (action === "remove") {
      for (const tid of affected) removedTurnIds.add(String(tid));
    } else if (action === "merge") {
      const ids = affected.map((x) => String(x)).filter(Boolean);
      if (ids.length >= 2) {
        const baseId = ids[0];
        const base = byId.get(baseId);
        if (base) {
          const extraTexts = [];
          for (let i = 1; i < ids.length; i++) {
            const t = byId.get(ids[i]);
            if (t?.text) extraTexts.push(t.text);
            removedTurnIds.add(ids[i]);
          }
          const merged = [base.text, ...extraTexts].filter(Boolean).join(" ");
          byId.set(baseId, { ...base, text: merged.trim() });
        }
      }
    }
  }

  const outTurns = [];
  for (const t of turns) {
    const id = String(t?.id || "");
    if (!id) continue;
    if (removedTurnIds.has(id)) continue;

    const fresh = byId.get(id);
    if (fresh && fresh.text) outTurns.push(fresh);
  }

  return outTurns;
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

    console.log("ANALISIS RolePlay => inst", String(inst._id), {
      url: req.originalUrl,
      ejercicioId: String(ejercicioId || ""),
      instanciaId: String(instanciaId || ""),
      moduloInstanciaId: String(moduloInstanciaId || ""),
      userId: String(userId || ""),
      hasTrans: Boolean(inst?.respuestas?.rolePlaying?.transcripcion),
      hasDepResult: Boolean(inst?.respuestas?.rolePlaying?.transcripcion?.depuracion?.result),
      depStatus: inst?.respuestas?.rolePlaying?.transcripcion?.depuracion?.status,
      activeVersion: inst?.respuestas?.rolePlaying?.transcripcion?.activeVersion,
    });

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
   ✅ POST depurar transcripción
   POST /ia/roleplay/transcripcion/depurar
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

    // ✅ MEJORA 1/2: clamp más agresivo
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

    // ✅ FIX: forzar persistencia en Mixed
    markTranscripcionModified(inst);
    await inst.save();

    const prompt = `
Vas a depurar una transcripción clínica (terapeuta + paciente) con errores típicos de STT:
- traslape, duplicación, "eco" (una voz repite frase de la otra), repeticiones parciales, y segmentos ambiguos.

REGLAS (MUY IMPORTANTES):
1) NO inventes texto, NO resumas, NO cambies el sentido clínico.
2) Detecta y marca "eco": cuando una frase del paciente aparece repetida dentro del turno del terapeuta (o viceversa).
   - Si hay repetición >= 6 palabras consecutivas o muy similar, crea issue type="duplicate" con suggestion.action="remove" o "merge".
3) Si un turno contiene dos bloques que parecen la misma frase repetida (repetición parcial), también es "duplicate".
4) Si el speaker es incierto => speaker="unknown", needsReview=true, confidence<0.7.
5) Si detectas duplicados obvios puedes:
   - remove: eliminar turnos duplicados (affectedTurnIds)
   - merge: fusionar texto al primer turno y eliminar los demás
   - keep: no hacer nada
6) IMPORTANTE: si encuentras cualquier eco/duplicación clara, NO devuelvas issues vacío.

FORMATO:
- turns deben ser cortos/limpios (no metas 3 intervenciones distintas dentro de 1 turno si puedes separarlas).
- cleanedText debe ser la reconstrucción limpia.

DEVUELVE SOLO JSON VÁLIDO con esta forma EXACTA:

{
  "cleanedText": string,
  "turns": [
    { "id": "t_1", "speaker": "estudiante|paciente|unknown", "text": string, "confidence": number, "needsReview": boolean, "reason": string }
  ],
  "issues": [
    { "id": "i_1", "type": "duplicate|overlap|speaker_ambiguous|noise|unknown", "severity":"low|medium|high", "snippet": string, "reason": string, "needsReview": boolean, "suggestion": { "action": "keep|remove|merge", "speaker": "estudiante|paciente|unknown" }, "affectedTurnIds": [ "t_1", "t_2" ] }
  ],
  "stats": { "removedDuplicates": number, "mergedTurns": number, "flagged": number }
}

TRANSCRIPCIÓN (raw):
${rawTextClamped}
`.trim();

    const model = safeStr(modelRaw, "") || process.env.AI_MODEL || "gpt-4.1-mini";

    // ✅ MEJORA 2/2: retry 1 vez
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

    if ((!result.turns || result.turns.length === 0) && rawTextClamped.includes(":")) {
      const lines = rawTextClamped.split("\n").map((s) => s.trim()).filter(Boolean);
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
            confidence: 0.75,
            needsReview: false,
            reason: "parsed_from_raw",
          });
        }
      }

      if (turns.length) result.turns = turns;
    }

    if (!Array.isArray(result.issues) || result.issues.length === 0) {
      const auto = autoIssuesFromTurns(result.turns || []);
      if (auto.length) {
        result.issues = auto;
        result.stats = {
          ...(result.stats || {}),
          flagged: (result.stats?.flagged || 0) + auto.length,
        };
      }
    }

    ensureTranscripcionObj(inst);

    inst.respuestas.rolePlaying.transcripcion.depuracion.status = "done";
    inst.respuestas.rolePlaying.transcripcion.depuracion.model = model;
    inst.respuestas.rolePlaying.transcripcion.depuracion.updatedAt = now();
    inst.respuestas.rolePlaying.transcripcion.depuracion.result = result;

    if (replace) {
      inst.respuestas.rolePlaying.transcripcion.depuracion.userDecisions = {
        resolvedIssues: {},
        speakerOverrides: {},
      };
      inst.respuestas.rolePlaying.transcripcion.depuracion.finalText = "";
    }

    if (!inst.respuestas.rolePlaying.transcripcion.activeVersion) {
      inst.respuestas.rolePlaying.transcripcion.activeVersion = "raw";
    }

    // ✅ FIX: forzar persistencia del result en Mixed
    markTranscripcionModified(inst);
    await inst.save();

    return res.json({
      ok: true,
      instanciaId: String(inst._id),
      transcripcion: inst.respuestas.rolePlaying.transcripcion,
    });
  } catch (err) {
    console.error("❌ Error depurarTranscripcionRolePlay:", err);

    // ✅ persistir estado error para evitar "processing" fantasma
    try {
      const userId = req.user?._id || req.user?.id || null;
      const { ejercicioId, instanciaId, moduloInstanciaId } = req.body || {};

      const inst = await resolveInstancia({ instanciaId, ejercicioId, moduloInstanciaId, userId });
      if (inst) {
        const tObj = ensureTranscripcionObj(inst);
        tObj.depuracion.status = "error";
        tObj.depuracion.error = String(err?.message || "Error en depuración");
        tObj.depuracion.updatedAt = now();

        // ✅ FIX: persistir error en Mixed
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
   POST /ia/roleplay/transcripcion/depurar/aplicar
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
      return res.status(400).json({
        message: "No se encontró instancia (EjercicioInstancia).",
      });
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

      // ✅ FIX
      markTranscripcionModified(inst);
      await inst.save();
    }

    const depResult = dep.result;

    if (!depResult || !isObj(depResult)) {
      return res.status(400).json({
        message: "No existe un resultado de depuración. Ejecuta primero /depurar.",
      });
    }

    const speakerOverridesIn =
      decisions && typeof decisions === "object" && decisions.speakerOverrides
        ? decisions.speakerOverrides
        : {};

    const resolvedIssuesIn =
      decisions && typeof decisions === "object" && decisions.resolvedIssues
        ? decisions.resolvedIssues
        : {};

    const prevDec = dep.userDecisions && typeof dep.userDecisions === "object" ? dep.userDecisions : {};
    const prevSO =
      prevDec.speakerOverrides && typeof prevDec.speakerOverrides === "object"
        ? prevDec.speakerOverrides
        : {};
    const prevRI =
      prevDec.resolvedIssues && typeof prevDec.resolvedIssues === "object"
        ? prevDec.resolvedIssues
        : {};

    dep.userDecisions = {
      speakerOverrides: { ...prevSO, ...(isObj(speakerOverridesIn) ? speakerOverridesIn : {}) },
      resolvedIssues: { ...prevRI, ...(isObj(resolvedIssuesIn) ? resolvedIssuesIn : {}) },
    };

    const turns = safeArr(depResult.turns);
    const issues = safeArr(depResult.issues);

    const turnsAfterIssues = applyIssuesToTurns({
      turns,
      issues,
      resolvedIssues: dep.userDecisions.resolvedIssues,
    });

    const finalText = buildFinalTextFromTurns(
      turnsAfterIssues,
      dep.userDecisions.speakerOverrides
    );

    dep.finalText = finalText;
    dep.updatedAt = now();
    dep.status = "done";

    if (setActive) {
      tObj.activeVersion = "depurada";
    }

    dep.result = {
      ...depResult,
      turns: turnsAfterIssues,
      cleanedText: safeStr(depResult.cleanedText, finalText) || finalText,
    };

    // ✅ FIX: si no marcas Modified aquí, también puede perderse
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