// server/utils/analisisMicroPraxis.js
// =========================================================
// Evaluación PRAXIS-TH adaptada para micro-intervenciones
// (ejercicio Grabar Voz — respuestas cortas, 5 seg–20 min)
// =========================================================

const {
  clampText,
  normalizePraxisNivel,
  normalizeModeloIntervencion,
  normalizeContextoSesion,
  normalizeObservabilidad,
  getPraxisWeights,
  getPraxisLevelLabelByScore: _getPraxisLevelLabelByScore,
  computePraxisIndex,
  aplicarTechoIntervencion,
  PRAXIS_DIMENSIONS,
  PRAXIS_LEVEL_LABELS,
  PRAXIS_LEVEL_DESCRIPTIONS,
  PRAXIS_WEIGHTS_BY_LEVEL,
  CONTEXTOS_SESION,
  OBSERVABILIDAD_VALUES,
  PRAXIS_LEVEL_SCORE_LABELS,
} = require("./analisisPraxisIA");

/* =========================================================
   HELPERS
========================================================= */
function safeLevel(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.max(1, Math.min(5, Math.round(x)));
}

function safeWeight(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function normalizeScoreValue(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  if (n <= 1.0) return Math.round(n * 100);
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeRecommendations(rawRec) {
  let rec = rawRec || [];
  if (!Array.isArray(rec)) rec = rec ? [rec] : [];
  return rec.map((x) => String(x || "").trim()).filter(Boolean);
}

function normalizeSimpleEvidence(rawEvidence, maxItems = 2) {
  let evidence = rawEvidence || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
  return evidence
    .map((ev) => ({
      quote:       String(ev?.quote || ev?.cita || "").trim(),
      explanation: String(ev?.explanation || ev?.explicacion || ev?.why || "").trim(),
    }))
    .filter((ev) => ev.quote || ev.explanation)
    .slice(0, maxItems);
}

function normalizeEvidence(rawEvidence) {
  let evidence = rawEvidence || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
  return evidence
    .map((ev) => ({
      quote:     String(ev?.quote || ev?.cita || "").trim(),
      technique: String(ev?.technique || ev?.tecnica || "").trim(),
      why:       String(ev?.why || ev?.porque || "").trim(),
    }))
    .filter((ev) => ev.quote);
}

function normalizeMicroStudentGuidance(raw) {
  const g = raw && typeof raw === "object" ? raw : {};
  const bien   = g.loQueHicisteBien || g.goodBlock || {};
  const mejor  = g.loQuePodriasMejorar || g.improveBlock || {};
  const sug    = g.sugerenciaParaMejorar || g.nextSuggestion || {};
  return {
    loQueHicisteBien: {
      textoBreve: String(bien?.textoBreve || bien?.text || "").trim(),
      evidencias: normalizeSimpleEvidence(bien?.evidencias || bien?.evidence, 2),
    },
    loQuePodriasMejorar: {
      textoBreve: String(mejor?.textoBreve || mejor?.text || "").trim(),
      evidencias: normalizeSimpleEvidence(mejor?.evidencias || mejor?.evidence, 2),
    },
    sugerenciaParaMejorar: {
      textoBreve:          String(sug?.textoBreve || sug?.text || "").trim(),
      ejemploIntervencion: String(sug?.ejemploIntervencion || sug?.example || "").trim(),
    },
    whyThisMatters: normalizeRecommendations(g.whyThisMatters || g.porQueImporta),
  };
}

function normalizeMicroDimension(rawBlock, key, weight) {
  const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};
  const nivel = safeLevel(base.nivel ?? base.level) ?? 1;
  const scoreRaw = base.score ?? base.porcentaje ?? base.percent;
  const score = scoreRaw != null
    ? normalizeScoreValue(scoreRaw) ?? Math.round((nivel / 5) * 100)
    : Math.round((nivel / 5) * 100);
  const observabilidad = normalizeObservabilidad(
    base.observabilidad || base.observability || OBSERVABILIDAD_VALUES.OBSERVABLE
  );
  return {
    key,
    label:        PRAXIS_DIMENSIONS[key]?.label        || key,
    shortLabel:   PRAXIS_DIMENSIONS[key]?.shortLabel   || key,
    description:  PRAXIS_DIMENSIONS[key]?.description  || "",
    nivel,
    nivelLabel:   PRAXIS_LEVEL_SCORE_LABELS?.[nivel]   || "Incipiente",
    observabilidad,
    weight:       safeWeight(weight),
    score,
    weightedScore: Number((nivel * safeWeight(weight)).toFixed(4)),
    recommendations: normalizeRecommendations(base.recommendations || base.recomendaciones),
    evidence:        normalizeEvidence(base.evidence || base.evidencia),
    studentGuidance: normalizeMicroStudentGuidance(base.studentGuidance),
  };
}

function parseRawJson(raw) {
  let obj = raw;
  if (typeof raw === "string") {
    try { obj = JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) obj = JSON.parse(m[0]);
      else throw new Error("La IA no devolvió JSON parseable.");
    }
  }
  return obj && typeof obj === "object" ? obj : {};
}

/* =========================================================
   LABELS — escenario/contexto legibles
========================================================= */
const CONTEXTO_LABELS = {
  clinico:   "Clínico",
  educativo: "Educativo",
  laboral:   "Laboral",
};

const ESCENARIO_LABELS = {
  exploracion:              "Exploración",
  intervencion:             "Intervención",
  devolucion:               "Devolución",
  aplicacion_pruebas:       "Aplicación de pruebas",
  exploracion_estudiante:   "Exploración con estudiante",
  intervencion_estudiante:  "Intervención con estudiante",
  comunicacion_padres:      "Comunicación con padres",
  entrevista_laboral:       "Entrevista laboral",
  feedback:                 "Feedback",
  manejo_conflictos:        "Manejo de conflictos",
  burnout:                  "Situaciones de burnout",
  acoso_laboral:            "Situaciones de acoso laboral",
};

const NIVEL_LABELS = {
  nivel_1: "Nivel 1",
  nivel_2: "Nivel 2",
  nivel_3: "Nivel 3",
};

const TIPO_ENTRENAMIENTO_LABELS = {
  habilidad_especifica:   "Habilidad específica",
  discriminacion_clinica: "Discriminación clínica",
  mixto:                  "Mixto",
};

const INTERVENCION_LABELS = {
  pregunta_abierta:         "Pregunta abierta",
  clarificacion:            "Clarificación",
  reflejo_simple:           "Reflejo simple",
  validacion_basica:        "Validación básica",
  validacion_emocional:     "Validación emocional",
  escucha_activa:           "Escucha activa",
  contencion_basica:        "Contención básica",
  redireccion_suave:        "Redirección suave",
  presencia:                "Presencia terapéutica",
  mensaje_directo:          "Mensaje directo",
  exploracion_dirigida:     "Exploración dirigida",
  resumen_parcial:          "Resumen parcial",
  psicoeducacion_breve:     "Psicoeducación breve",
  reencuadre_simple:        "Reencuadre simple",
  normalizacion:            "Normalización",
  focalizacion:             "Focalización",
  establecimiento_limites:  "Establecimiento de límites",
  orientacion:              "Orientación",
  manejo_conducta:          "Manejo de conducta",
  feedback_constructivo:    "Feedback constructivo",
  mediacion_basica:         "Mediación básica",
  organizacion_pensamiento: "Organización del pensamiento",
  reduccion_ansiedad:       "Reducción de ansiedad",
  reencuadre_complejo:      "Reencuadre complejo",
  confrontacion_suave:      "Confrontación suave",
  interpretacion:           "Interpretación",
  desarrollo_insight:       "Desarrollo de insight",
  integracion_emocional:    "Integración emocional",
  plan_intervencion:        "Plan de intervención",
  analisis_funcional_basico:"Análisis funcional básico",
  identificacion_patrones:  "Identificación de patrones",
  hipotesis_inicial_suave:  "Hipótesis clínica inicial",
  intervencion_conductual:  "Intervención conductual",
  negociacion:              "Negociación",
  deteccion_incongruencias: "Detección de incongruencias",
  derivacion:               "Derivación",
  plan_proteccion:          "Plan de protección",
};

/* =========================================================
   PROMPT MICRO-PRAXIS
========================================================= */
function buildMicroPraxisPrompt({ nivel, escenario, contexto, tipoEntrenamiento, intervenciones, data }) {
  const weights        = getPraxisWeights(nivel);
  const intervsLabel   = (intervenciones || []).map((k) => INTERVENCION_LABELS[k] || k).join(", ");
  const escenarioLabel = ESCENARIO_LABELS[escenario] || escenario;
  const contextoLabel  = CONTEXTO_LABELS[contexto]   || contexto;
  const nivelLabel     = NIVEL_LABELS[nivel]         || nivel;
  const entrenLabel    = TIPO_ENTRENAMIENTO_LABELS[tipoEntrenamiento] || tipoEntrenamiento;

  return `Devuelve SOLO JSON válido con esta estructura EXACTA:

{
  "microPraxis": {
    "nivel": ${JSON.stringify(nivel)},
    "escenario": ${JSON.stringify(escenario)},
    "contexto": ${JSON.stringify(contexto)},
    "tipoEntrenamiento": ${JSON.stringify(tipoEntrenamiento)},
    "ponderaciones": {
      "ASC": ${weights.ASC},
      "IIT": ${weights.IIT},
      "IRI": ${weights.IRI},
      "MMD": ${weights.MMD},
      "MLT": ${weights.MLT}
    },
    "indiceGlobal": {
      "porcentaje": 0,
      "nivelDesempeno": "",
      "summary": ""
    },
    "intervencionDetectada": {
      "tipo": "",
      "adecuada": true,
      "razon": ""
    },
    "studentSummary": {
      "opening": "",
      "whatWentWell": [""],
      "whatToImprove": [""],
      "nextStep": ""
    },
    "dimensiones": {
      "ASC": { "nivel": 1, "score": 0, "observabilidad": "observable", "recommendations": [""], "evidence": [{ "quote": "", "technique": "", "why": "" }], "studentGuidance": { "loQueHicisteBien": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" }, "whyThisMatters": [""] } },
      "IIT": { "nivel": 1, "score": 0, "observabilidad": "observable", "recommendations": [""], "evidence": [{ "quote": "", "technique": "", "why": "" }], "studentGuidance": { "loQueHicisteBien": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" }, "whyThisMatters": [""] } },
      "IRI": { "nivel": 1, "score": 0, "observabilidad": "observable", "recommendations": [""], "evidence": [{ "quote": "", "technique": "", "why": "" }], "studentGuidance": { "loQueHicisteBien": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" }, "whyThisMatters": [""] } },
      "MMD": { "nivel": 1, "score": 0, "observabilidad": "observable", "recommendations": [""], "evidence": [{ "quote": "", "technique": "", "why": "" }], "studentGuidance": { "loQueHicisteBien": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" }, "whyThisMatters": [""] } },
      "MLT": { "nivel": 1, "score": 0, "observabilidad": "observable", "recommendations": [""], "evidence": [{ "quote": "", "technique": "", "why": "" }], "studentGuidance": { "loQueHicisteBien": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [{ "quote": "", "explanation": "" }] }, "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" }, "whyThisMatters": [""] } }
    }
  }
}

---

ROL

Eres un supervisor clínico experto en psicoterapia.
Estás evaluando una MICRO-INTERVENCIÓN de un estudiante en formación.

Una micro-intervención es una respuesta breve (5 segundos a 20 minutos) a un caso clínico presentado.
El estudiante leyó el caso y grabó su respuesta verbal.

---

CONTEXTO DEL EJERCICIO

- Contexto: ${contextoLabel}
- Escenario: ${escenarioLabel}
- Nivel: ${nivelLabel}
- Tipo de entrenamiento: ${entrenLabel}
- Intervenciones objetivo: ${intervsLabel}

---

ESCALA DE SCORES

Todos los scores deben ser ENTEROS entre 0 y 100.

NIVEL DE DESEMPEÑO:
0–39   → "Incipiente"
40–59  → "En desarrollo"
60–74  → "Competente"
75–89  → "Sólido"
90–100 → "Destacado"

---

REGLAS GENERALES PARA MICRO-INTERVENCIONES

1. Una micro-intervención es por definición breve. NO penalices por brevedad.
2. Evalúa la CALIDAD de lo que se dijo, no la cantidad.
3. El estudiante responde a un caso clínico ya presentado — no hay turno previo del paciente.
4. Evalúa si la respuesta es adecuada para el escenario y las intervenciones objetivo.
5. MMD en micro-intervención: evalúa el POTENCIAL de movilización de la respuesta, no un cambio observable (no hay paciente respondiendo en tiempo real).
6. IRI en micro-intervención: evalúa si la respuesta integra los elementos del caso presentado.

---

DEFINICIÓN OPERATIVA — INTERVENCIÓN ADECUADA

ADECUADA si:
- se basa en el caso presentado
- no impone solución prematura
- abre exploración o reflexión
- respeta el tipo de escenario

INADECUADA si:
- consejo directo prematuro
- dirige la respuesta del paciente
- juzga o corrige
- minimiza la experiencia
- propone soluciones sin exploración

---

INTERVENCION DETECTADA

En el campo "intervencionDetectada":
- "tipo": qué tipo de intervención realizó (nombre técnico o descripción breve)
- "adecuada": true/false — si fue clínicamente adecuada para este escenario
- "razon": por qué fue adecuada o inadecuada (1-2 oraciones)

---

AJUSTE POR ESCENARIO

Si escenario es de EXPLORACIÓN:
- Prioriza preguntas abiertas, escucha activa, exploración del motivo
- No exiges intervención terapéutica profunda
- MMD: potencial de apertura del paciente

Si escenario es de INTERVENCIÓN:
- Prioriza calidad de la intervención
- Distingue acompañar de imponer
- Regla de techo aplica si IIT ≤ 60

Si escenario es de DEVOLUCIÓN:
- Prioriza claridad y empatía
- No exiges movilización clínica profunda

Si escenario es LABORAL o EDUCATIVO:
- Adapta al contexto — no apliques criterios clínico-terapéuticos estrictos
- Prioriza comunicación adecuada, escucha activa, mensaje claro

---

AJUSTE POR NIVEL

Nivel 1 — Formación inicial:
- No exiges técnica avanzada
- Valoras encuadre básico, preguntas abiertas, escucha
- Rango esperado: 50–80

Nivel 2 — Desarrollo intermedio:
- Valoras intención clínica y conexión con el caso
- Rango esperado: 55–85

Nivel 3 — Formación avanzada:
- Evalúas precisión técnica y coherencia clínica
- Rango esperado: 55–90

---

REGLA DE TECHO (INTERVENCIÓN)

Si el escenario es de intervención Y el contextoSesion equivale a "intervencion_terapeutica":
- Si IIT ≤ 60 Y MMD ≤ 60 → índice global NO supera 58
- Si solo IIT ≤ 60 → índice global NO supera 62
- Si solo MMD ≤ 60 → índice global NO supera 70

---

FEEDBACK PEDAGÓGICO

El feedback debe:
- ser constructivo y específico
- mencionar qué del caso fue bien utilizado
- dar un ejemplo concreto de mejora
- ser motivador para el nivel del estudiante

---

CASO PRESENTADO AL ESTUDIANTE

${JSON.stringify(data?.caso || "", null, 2)}

---

TRANSCRIPCIÓN DE LA RESPUESTA DEL ESTUDIANTE

${JSON.stringify(clampText(data?.transcripcion || "", 4000), null, 2)}

---

CONFIGURACIÓN ADICIONAL

Tiempo de grabación disponible: ${data?.tiempoDisponible || "no especificado"}
`.trim();
}

/* =========================================================
   NORMALIZAR RESULTADO
========================================================= */
function normalizeMicroPraxisResult(raw, { nivel, escenario, contexto, tipoEntrenamiento, intervenciones }) {
  const obj = parseRawJson(raw);
  const mp  = obj?.microPraxis || obj || {};

  const nivelNorm    = normalizePraxisNivel(mp?.nivel || nivel);
  const weights      = getPraxisWeights(nivelNorm);
  const dimensions   = {};

  for (const dimKey of Object.keys(PRAXIS_DIMENSIONS)) {
    const rawDim = mp?.dimensiones?.[dimKey] || mp?.dimensions?.[dimKey] || null;
    dimensions[dimKey] = normalizeMicroDimension(rawDim, dimKey, weights[dimKey]);
  }

  // Contexto sesión: mapear escenario → contextoSesion para la regla de techo
  const contextoSesionMapped = (() => {
    if (!escenario) return "exploracion_clinica";
    const interv = ["intervencion", "intervencion_estudiante", "feedback", "manejo_conflictos", "burnout", "acoso_laboral"];
    if (interv.includes(escenario)) return "intervencion_terapeutica";
    const dev = ["devolucion"];
    if (dev.includes(escenario)) return "devolucion_resultados";
    const pruebas = ["aplicacion_pruebas"];
    if (pruebas.includes(escenario)) return "aplicacion_pruebas_psicometricas";
    return "exploracion_clinica";
  })();

  const { indiceBruto, indicePct } = computePraxisIndex(dimensions, weights, contextoSesionMapped);

  return {
    tipo:              "micro_praxis",
    nivel:             nivelNorm,
    nivelLabel:        NIVEL_LABELS[nivelNorm] || nivelNorm,
    escenario,
    escenarioLabel:    ESCENARIO_LABELS[escenario] || escenario,
    contexto,
    contextoLabel:     CONTEXTO_LABELS[contexto] || contexto,
    tipoEntrenamiento,
    intervenciones:    intervenciones || [],
    ponderaciones:     weights,
    generalScore:      indicePct,
    indiceGlobal: {
      bruto:           indiceBruto,
      porcentaje:      indicePct,
      nivelDesempeno:  String(mp?.indiceGlobal?.nivelDesempeno || "").trim() || _getPraxisLevelLabelByScore(indicePct),
      summary:         String(mp?.indiceGlobal?.summary || "").trim(),
    },
    intervencionDetectada: {
      tipo:     String(mp?.intervencionDetectada?.tipo     || "").trim(),
      adecuada: Boolean(mp?.intervencionDetectada?.adecuada ?? true),
      razon:    String(mp?.intervencionDetectada?.razon    || "").trim(),
    },
    studentSummary: {
      opening:      String(mp?.studentSummary?.opening  || "").trim(),
      whatWentWell: normalizeRecommendations(mp?.studentSummary?.whatWentWell),
      whatToImprove:normalizeRecommendations(mp?.studentSummary?.whatToImprove),
      nextStep:     String(mp?.studentSummary?.nextStep || "").trim(),
    },
    sections: dimensions,
    meta: { tipo: "micro_praxis", createdAt: new Date().toISOString() },
  };
}

module.exports = {
  buildMicroPraxisPrompt,
  normalizeMicroPraxisResult,
  CONTEXTO_LABELS,
  ESCENARIO_LABELS,
  NIVEL_LABELS,
  TIPO_ENTRENAMIENTO_LABELS,
  INTERVENCION_LABELS,
};
