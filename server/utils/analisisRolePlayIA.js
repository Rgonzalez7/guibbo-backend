// server/utils/analisisRolePlayIA.js

function clampText(text, max = 12000) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[...texto recortado para análisis...]";
}

const EVAL_LABELS = {
  // base
  rapport: "Rapport",
  preguntasAbiertas: "Preguntas abiertas",
  encuadre: "Encuadre",
  alianzaTerapeutica: "Alianza terapéutica",

  // opcionales conversacionales
  parafrasis: "Paráfrasis",
  reflejo: "Reflejo",
  clarificacion: "Clarificación",
  chisteTerapeutico: "Humor terapéutico",
  sarcasmoTerapeutico: "Sarcasmo terapéutico",
  empatia: "Empatía",
  revelacion: "Revelación",
  metafora: "Metáfora",
  resumen: "Resumen",
  practicarConsignasPruebas: "Consignas de pruebas",
  palabrasClave: "Palabras clave",

  // enfoques
  logoterapiaProposito: "Logoterapia: propósito",
  logoterapiaSentido: "Logoterapia: sentido",

  tccReestructuracion: "TCC: reestructuración",
  tccIdeasIrracionales: "TCC: ideas irracionales",
  tccABC: "TCC: modelo ABC",

  psicoLapsus: "Psicoanálisis: lapsus",
  psicoDefensas: "Psicoanálisis: defensas",

  // otros
  entrevistaTrabajo: "Entrevista de trabajo",
  protocolosMEP: "Protocolos MEP",
};

const TOOL_LABELS = {
  ficha: "Ficha técnica",
  hc: "Historial clínico",
  convergencia: "Cuadro de convergencia",
  hipotesis: "Hipótesis diagnóstica",
  diagnostico: "Diagnóstico final",
  pruebas: "Pruebas",
  interpretacion: "Interpretación",
  recomendaciones: "Recomendaciones",
  anexos: "Anexos",
  plan: "Plan de intervención",
};

/**
 * ✅ PROMPT MEJORADO:
 * - Evaluar evaluaciones configuradas detectando técnicas terapéuticas
 * - No requiere diarización perfecta
 * - Inferir intervenciones del terapeuta con heurísticas
 * - Pedir evidencia textual exacta (quotes) por sección
 * - Mantener estructura JSON EXACTA (se agregan campos opcionales dentro de cada sección)
 */
function buildRolePlayPrompt({ evaluaciones, herramientas, data, enfoque }) {
  const evalKeys = Array.isArray(evaluaciones) ? evaluaciones : [];
  const toolKeys = Object.keys(herramientas || {}).filter((k) => herramientas?.[k] === true);

  const evalList = evalKeys.map((k) => ({
    key: k,
    label: EVAL_LABELS[k] || k,
  }));

  const toolList = toolKeys.map((k) => ({
    key: k,
    label: TOOL_LABELS[k] || k,
  }));

  // NOTA: mantenemos estructura base EXACTA, pero permitimos que cada sección incluya:
  // - "evidence": [{ "quote": "", "technique": "", "why": "" }]
  // Esto NO rompe tu UI actual si no lo usa (es campo extra).
  return `
Devuelve SOLO JSON válido con esta estructura EXACTA:

{
  "generalScore": 0,
  "general": { "score": 0, "summary": "" },

  "sections": {
    ${evalList
      .map(
        (e) =>
          `"${e.key}": { "score": 0, "metrics": [ { "key": "", "label": "", "score": 0 } ], "recommendations": [""], "evidence": [ { "quote": "", "technique": "", "why": "" } ] }`
      )
      .join(",\n    ")}
  },

  "tools": {
    ${toolList
      .map(
        (t) =>
          `"${t.key}": { "score": 0, "metrics": [ { "key": "", "label": "", "score": 0 } ], "recommendations": [""] }`
      )
      .join(",\n    ")}
  },

  "meta": {
    "enfoque": ${JSON.stringify(enfoque || "")}
  }
}

REGLAS GENERALES:
- scores 0..100 (enteros).
- metrics: 3 a 6 items por sección.
- recommendations: 3 a 6 bullets por sección.
- NO inventes citas ni contenido. Si no hay evidencia, dilo y baja el score.
- Para "evidence.quote" usa texto EXACTO de la transcripción (máx 25-35 palabras por cita).
- La evidencia debe corresponder a intervenciones del TERAPEUTA (estudiante).

ENFOQUE (CRÍTICO) PARA ANALIZAR LA TRANSCRIPCIÓN:
- El objetivo NO es diarizar perfecto.
- El objetivo es detectar TÉCNICAS TERAPÉUTICAS (según las evaluaciones configuradas).
- Debes identificar las intervenciones del terapeuta incluso si hay errores de turnos.

HEURÍSTICAS PARA INFERIR "TERAPEUTA":
1) Probabilidad alta de rol terapeuta:
   - Preguntas (¿...?), exploración, encuadre, metas, tareas, validación, resumen, clarificación.
2) Segmentos largos coherentes:
   - Turnos con estructura clínica (introducción, exploración, reflejo, cierre).
3) Patrones lingüísticos:
   - "¿Cómo te sentiste...?", "Cuéntame más...", "Lo que escucho es...", "Parece que...",
     "Entonces...", "Si entiendo bien...", "Para resumir...", "Al inicio acordamos...".

MÉTODO ROBUSTO (aunque haya errores):
- Detección de intención terapéutica.
- Clasificación de intervención (técnica).
- Análisis de tono textual.
- Análisis estructural del diálogo.

CÓMO CALIFICAR CADA SECCIÓN (sections.<key>):
- score debe reflejar frecuencia + calidad + pertinencia de la técnica.
- metrics deben evaluar aspectos medibles (p.ej. "frecuencia", "calidad", "oportunidad", "seguimiento", "claridad").
- recommendations deben ser accionables ("haz más X", "evita Y", "usa Z en momentos...").
- evidence: 1 a 4 citas EXACTAS que prueben o muestren ausencia.
  - technique: nombre breve ("pregunta abierta", "reflejo emocional", "paráfrasis", "clarificación", etc.)
  - why: por qué esa cita corresponde.

IMPORTANTE:
- Si una evaluación está activa pero NO hay evidencia suficiente, pon score bajo (0-35) y explica qué faltó.
- En "general.summary" da un resumen clínico y didáctico del desempeño del estudiante basado en técnicas detectadas.

DATOS (JSON):
${JSON.stringify(data || {}, null, 2)}
`.trim();
}

function safeInt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function normalizeBlock(rawBlock) {
  if (!rawBlock || typeof rawBlock !== "object") {
    return { score: null, metrics: [], recommendations: [], evidence: [] };
  }

  const score = safeInt(
    rawBlock.score ??
      rawBlock.generalScore ??
      rawBlock.puntuacion ??
      rawBlock.puntaje
  );

  let metrics = rawBlock.metrics || rawBlock.criterios || rawBlock.items || rawBlock.subScores || [];
  if (metrics && !Array.isArray(metrics) && typeof metrics === "object") {
    metrics = Object.entries(metrics).map(([k, v]) => ({
      key: k,
      label: String(k),
      score: safeInt(v),
    }));
  }
  if (!Array.isArray(metrics)) metrics = [];
  metrics = metrics
    .map((m, i) => ({
      key: m?.key || `m${i + 1}`,
      label: String(m?.label || m?.nombre || `Criterio ${i + 1}`),
      score: safeInt(m?.score),
      icon: m?.icon || null,
    }))
    .filter((m) => m.label);

  let rec = rawBlock.recommendations || rawBlock.recomendaciones || rawBlock.tips || [];
  if (!Array.isArray(rec)) rec = rec ? [rec] : [];
  rec = rec.map((x) => String(x || "").trim()).filter(Boolean);

  // ✅ evidence opcional (no rompe UI si no existe)
  let evidence = rawBlock.evidence || rawBlock.evidencia || rawBlock.quotes || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
  evidence = evidence
    .map((ev) => ({
      quote: String(ev?.quote || ev?.cita || "").trim(),
      technique: String(ev?.technique || ev?.tecnica || "").trim(),
      why: String(ev?.why || ev?.porque || ev?.reason || "").trim(),
    }))
    .filter((ev) => ev.quote);

  return { score: score ?? null, metrics, recommendations: rec, evidence };
}

function normalizeAIResult(raw, { evaluaciones, herramientas, enfoque }) {
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch (e) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) obj = JSON.parse(m[0]);
      else throw new Error("La IA no devolvió JSON parseable.");
    }
  }

  const result = {
    generalScore: safeInt(obj?.generalScore ?? obj?.general?.score) ?? 0,
    general: {
      score: safeInt(obj?.general?.score ?? obj?.generalScore) ?? 0,
      summary: String(obj?.general?.summary || obj?.evaluacionGeneral || "").trim(),
    },
    sections: {},
    tools: {},
    meta: {
      enfoque: String(obj?.meta?.enfoque || enfoque || "").trim(),
      model: String(obj?.meta?.model || "").trim(),
      createdAt: new Date().toISOString(),
    },
  };

  (evaluaciones || []).forEach((k) => {
    const block = obj?.sections?.[k] || obj?.[k] || null;
    result.sections[k] = normalizeBlock(block);
    if (typeof result.sections[k].score !== "number") result.sections[k].score = 0;
    if (!Array.isArray(result.sections[k].evidence)) result.sections[k].evidence = [];
  });

  const toolKeys = Object.keys(herramientas || {}).filter((k) => herramientas?.[k] === true);
  toolKeys.forEach((k) => {
    const block = obj?.tools?.[k] || obj?.[k] || null;
    result.tools[k] = normalizeBlock(block);
    if (typeof result.tools[k].score !== "number") result.tools[k].score = 0;
    // tools no necesitan evidence, pero normalizeBlock lo trae; puedes dejarlo sin problema
  });

  if (!result.generalScore) {
    const scores = Object.values(result.sections).map((x) => Number(x?.score || 0));
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    result.generalScore = Math.round(avg);
    result.general.score = result.generalScore;
  }

  return result;
}

function extractRPDataFromInstance(inst) {
  const rp = inst?.respuestas?.rolePlaying || {};
  return rp?.payload || rp?.sessionData || rp?.data || {};
}

function addLabelsToResult(result, { evaluaciones, herramientas }) {
  if (!result || typeof result !== "object") return result;

  (evaluaciones || []).forEach((k) => {
    if (!result.sections) result.sections = {};
    if (!result.sections[k]) result.sections[k] = { score: 0, metrics: [], recommendations: [], evidence: [] };

    if (!result.sections[k].label) result.sections[k].label = EVAL_LABELS[k] || k;
    if (!result.sections[k].description) result.sections[k].description = "";
    if (!Array.isArray(result.sections[k].evidence)) result.sections[k].evidence = [];
  });

  const toolKeys = Object.keys(herramientas || {}).filter((k) => herramientas?.[k] === true);
  toolKeys.forEach((k) => {
    if (!result.tools) result.tools = {};
    if (!result.tools[k]) result.tools[k] = { score: 0, metrics: [], recommendations: [] };

    if (!result.tools[k].label) result.tools[k].label = TOOL_LABELS[k] || k;
    if (!result.tools[k].description) result.tools[k].description = "";
  });

  return result;
}

module.exports = {
  clampText,
  buildRolePlayPrompt,
  normalizeAIResult,
  addLabelsToResult,
  extractRPDataFromInstance,
};