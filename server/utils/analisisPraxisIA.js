// server/utils/analisisPraxisIA.js

/* =========================================================
   HELPERS INTERNOS
========================================================= */

function clampText(text, max = 12000) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[...texto recortado para análisis...]";
}

function safeInt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function safeLevel(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const r = Math.round(x);
  return Math.max(1, Math.min(5, r));
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

/* =========================================================
   CONSTANTES PRAXIS-TH
========================================================= */

const PRAXIS_DIMENSIONS = {
  ASC: {
    label: "Organización de la conversación",
    shortLabel: "ASC – Análisis Secuencial Conversacional",
    description:
      "Esta dimensión analiza qué tan clara y ordenada fue la conversación durante la sesión.",
  },
  IIT: {
    label: "Intención de tus intervenciones",
    shortLabel: "IIT – Intencionalidad de la Intervención Terapéutica",
    description:
      "Esta dimensión analiza si tus preguntas e intervenciones tuvieron un propósito claro dentro de la conversación terapéutica y si ayudaron a comprender mejor la situación del paciente.",
  },
  IRI: {
    label: "Escucha e integración de lo que dice el paciente",
    shortLabel: "IRI – Integración de Referencias Internas",
    description:
      "Esta dimensión analiza qué tan bien escuchaste al paciente y cómo utilizaste la información que él o ella fue compartiendo durante la sesión.",
  },
  MMD: {
    label: "Capacidad para generar avance en la conversación",
    shortLabel: "MMD – Movilización Micro-Dinámica",
    description:
      "Esta dimensión analiza si tus intervenciones ayudaron a que la conversación avanzara hacia una mayor comprensión o reflexión sobre lo que el paciente está viviendo.",
  },
  MLT: {
    label: "Manejo del encuadre terapéutico",
    shortLabel: "MLT – Manejo del Límite Terapéutico",
    description:
      "Esta dimensión analiza cómo mantuviste el marco profesional de la sesión y si lograste sostener un espacio terapéutico claro y seguro para el paciente.",
  },
};

const PRAXIS_LEVEL_LABELS = {
  nivel_1: "Nivel I – Formación inicial",
  nivel_2: "Nivel II – Desarrollo intermedio",
  nivel_3: "Nivel III – Formación avanzada",
};

const PRAXIS_LEVEL_DESCRIPTIONS = {
  nivel_1:
    "Enfoque en habilidades básicas. Se prioriza la organización conversacional y el encuadre básico.",
  nivel_2:
    "Integración técnica. Se equilibra la estructura con la integración narrativa y la movilización micro-dinámica.",
  nivel_3:
    "Competencia estratégica. Se incrementa el peso de la intencionalidad estratégica y la movilización terapéutica.",
};

const PRAXIS_WEIGHTS_BY_LEVEL = {
  nivel_1: { ASC: 0.3, IIT: 0.2, IRI: 0.15, MMD: 0.15, MLT: 0.2 },
  nivel_2: { ASC: 0.25, IIT: 0.2, IRI: 0.2, MMD: 0.2, MLT: 0.15 },
  nivel_3: { ASC: 0.2, IIT: 0.25, IRI: 0.2, MMD: 0.25, MLT: 0.1 },
};

const PRAXIS_LEVEL_SCORE_LABELS = {
  1: "Incipiente",
  2: "Básico",
  3: "Competente",
  4: "Avanzado",
  5: "Estratégico",
};

const CONTEXTOS_SESION = {
  exploracion_clinica: {
    label: "Exploración clínica",
    description:
      "Incluye entrevista inicial, encuadre breve, motivo de consulta, exploración del problema y clarificación clínica.",
  },
  intervencion_terapeutica: {
    label: "Intervención terapéutica",
    description:
      "Se espera uso de intervenciones con intención de cambio, movilización o reestructuración clínica.",
  },
  aplicacion_pruebas_psicometricas: {
    label: "Aplicación de pruebas psicométricas",
    description:
      "Se espera explicación clara de consignas, neutralidad del evaluador y manejo adecuado del procedimiento.",
  },
  devolucion_resultados: {
    label: "Devolución de resultados",
    description:
      "Se espera comunicación clara, empática y comprensible de resultados psicológicos y recomendaciones.",
  },
};

const OBSERVABILIDAD_VALUES = {
  OBSERVABLE: "observable",
  LIMITADA: "evidencia_limitada",
  NO_APLICABLE: "no_aplicable",
};

/* =========================================================
   NORMALIZADORES
========================================================= */

function normalizePraxisNivel(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "nivel_1" || v === "nivel1" || v === "1" || v.includes("inicial"))
    return "nivel_1";
  if (v === "nivel_2" || v === "nivel2" || v === "2" || v.includes("intermedio"))
    return "nivel_2";
  if (v === "nivel_3" || v === "nivel3" || v === "3" || v.includes("avanzad"))
    return "nivel_3";
  return "nivel_1";
}

function normalizeModeloIntervencion(raw) {
  return String(raw || "").trim();
}

function normalizeContextoSesion(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (
    v === "exploracion_clinica" || v === "exploracion" ||
    v.includes("entrevista inicial") || v.includes("evaluacion clinica") ||
    v.includes("evaluación clínica") || v.includes("exploracion")
  ) return "exploracion_clinica";
  if (
    v === "intervencion_terapeutica" || v === "intervencion" ||
    v.includes("intervención")
  ) return "intervencion_terapeutica";
  if (
    v === "aplicacion_pruebas_psicometricas" || v === "aplicacion_pruebas" ||
    v.includes("pruebas psicometricas") || v.includes("pruebas psicométricas") ||
    v.includes("aplicacion de pruebas")
  ) return "aplicacion_pruebas_psicometricas";
  if (
    v === "devolucion_resultados" || v === "devolucion" ||
    v.includes("devolución")
  ) return "devolucion_resultados";
  return "exploracion_clinica";
}

function normalizeObservabilidad(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (v === OBSERVABILIDAD_VALUES.OBSERVABLE || v === "observability" || v === "visible")
    return OBSERVABILIDAD_VALUES.OBSERVABLE;
  if (v === OBSERVABILIDAD_VALUES.LIMITADA || v === "limited" || v.includes("limitada"))
    return OBSERVABILIDAD_VALUES.LIMITADA;
  if (
    v === OBSERVABILIDAD_VALUES.NO_APLICABLE || v === "not_applicable" ||
    v === "na" || v.includes("no aplicable")
  ) return OBSERVABILIDAD_VALUES.NO_APLICABLE;
  return OBSERVABILIDAD_VALUES.OBSERVABLE;
}

function getPraxisWeights(praxisNivel) {
  const nivel = normalizePraxisNivel(praxisNivel);
  return PRAXIS_WEIGHTS_BY_LEVEL[nivel] || PRAXIS_WEIGHTS_BY_LEVEL.nivel_1;
}

function getPraxisLevelLabelByScore(scorePct) {
  const n = Number(scorePct || 0);
  if (n < 20) return "Incipiente";
  if (n < 40) return "Básico";
  if (n < 60) return "Competente";
  if (n < 80) return "Avanzado";
  return "Estratégico";
}

/* =========================================================
   NORMALIZADORES DE BLOQUES
========================================================= */

function normalizeRecommendations(rawRec) {
  let rec = rawRec || [];
  if (!Array.isArray(rec)) rec = rec ? [rec] : [];
  return rec.map((x) => String(x || "").trim()).filter(Boolean);
}

function normalizeMetrics(rawMetrics) {
  let metrics = rawMetrics || [];
  if (metrics && !Array.isArray(metrics) && typeof metrics === "object") {
    metrics = Object.entries(metrics).map(([k, v]) => ({ key: k, label: String(k), score: v }));
  }
  if (!Array.isArray(metrics)) metrics = [];
  return metrics
    .map((m, i) => ({
      key: m?.key || `m${i + 1}`,
      label: String(m?.label || m?.nombre || `Criterio ${i + 1}`),
      score: m?.score != null ? normalizeScoreValue(m.score) : null,
      icon: m?.icon || null,
    }))
    .filter((m) => m.label);
}

function normalizeEvidence(rawEvidence) {
  let evidence = rawEvidence || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
  return evidence
    .map((ev) => ({
      quote: String(ev?.quote || ev?.cita || "").trim(),
      technique: String(ev?.technique || ev?.tecnica || "").trim(),
      why: String(ev?.why || ev?.porque || ev?.reason || "").trim(),
    }))
    .filter((ev) => ev.quote);
}

function normalizeSimpleEvidence(rawEvidence, maxItems = 2) {
  let evidence = rawEvidence || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
  return evidence
    .map((ev) => ({
      quote: String(ev?.quote || ev?.cita || "").trim(),
      explanation: String(
        ev?.explanation || ev?.explicacion || ev?.why || ev?.porque || ""
      ).trim(),
    }))
    .filter((ev) => ev.quote || ev.explanation)
    .slice(0, maxItems);
}

function normalizeStudentGuidance(rawGuidance) {
  const g = rawGuidance && typeof rawGuidance === "object" ? rawGuidance : {};
  const loQueHicisteBienRaw = g.loQueHicisteBien || g.goodBlock || g.strengthBlock || {};
  const loQuePodriasMejorarRaw = g.loQuePodriasMejorar || g.improveBlock || g.weaknessBlock || {};
  const sugerenciaParaMejorarRaw = g.sugerenciaParaMejorar || g.nextSuggestion || g.improvementSuggestion || {};
  return {
    loQueHicisteBien: {
      textoBreve: String(loQueHicisteBienRaw?.textoBreve || loQueHicisteBienRaw?.text || loQueHicisteBienRaw?.summary || "").trim(),
      evidencias: normalizeSimpleEvidence(loQueHicisteBienRaw?.evidencias || loQueHicisteBienRaw?.evidence, 2),
    },
    loQuePodriasMejorar: {
      textoBreve: String(loQuePodriasMejorarRaw?.textoBreve || loQuePodriasMejorarRaw?.text || loQuePodriasMejorarRaw?.summary || "").trim(),
      evidencias: normalizeSimpleEvidence(loQuePodriasMejorarRaw?.evidencias || loQuePodriasMejorarRaw?.evidence, 2),
    },
    sugerenciaParaMejorar: {
      textoBreve: String(sugerenciaParaMejorarRaw?.textoBreve || sugerenciaParaMejorarRaw?.text || sugerenciaParaMejorarRaw?.summary || "").trim(),
      ejemploIntervencion: String(sugerenciaParaMejorarRaw?.ejemploIntervencion || sugerenciaParaMejorarRaw?.example || sugerenciaParaMejorarRaw?.ejemplo || "").trim(),
    },
    whyThisMatters: normalizeRecommendations(
      g.whyThisMatters || g.porQueImporta || g.importancia || g.whyItMatters
    ),
  };
}

function normalizePraxisDimension(rawBlock, key, weight) {
  const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};
  const nivel = safeLevel(base.nivel ?? base.level ?? base.desempeno ?? base.dimensionLevel) ?? 1;
  const scoreRaw = base.score ?? base.porcentaje ?? base.percent ?? base.generalScore;
  const score =
    scoreRaw != null
      ? normalizeScoreValue(scoreRaw) ?? Math.round((nivel / 5) * 100)
      : Math.round((nivel / 5) * 100);
  const observabilidad = normalizeObservabilidad(
    base.observabilidad || base.observability || OBSERVABILIDAD_VALUES.OBSERVABLE
  );
  return {
    key,
    label: PRAXIS_DIMENSIONS[key]?.label || key,
    shortLabel: PRAXIS_DIMENSIONS[key]?.shortLabel || key,
    description: PRAXIS_DIMENSIONS[key]?.description || "",
    nivel,
    nivelLabel: PRAXIS_LEVEL_SCORE_LABELS[nivel] || "Incipiente",
    observabilidad,
    weight: safeWeight(weight),
    score,
    weightedScore: Number((nivel * safeWeight(weight)).toFixed(4)),
    metrics: normalizeMetrics(base.metrics || base.criterios || base.items || base.subScores),
    recommendations: normalizeRecommendations(base.recommendations || base.recomendaciones || base.tips),
    evidence: normalizeEvidence(base.evidence || base.evidencia || base.quotes),
    studentGuidance: normalizeStudentGuidance(base.studentGuidance),
  };
}

/* =========================================================
   PROMPT — BASE (CORE)
========================================================= */

function buildBasePrompt({ nivel, modelo, weights, contextoSesion, data }) {
  return `
Devuelve SOLO JSON válido con esta estructura EXACTA:

{
  "praxisTH": {
    "praxisNivel": ${JSON.stringify(nivel)},
    "modeloIntervencion": ${JSON.stringify(modelo)},
    "contextoSesion": ${JSON.stringify(contextoSesion)},
    "ponderaciones": {
      "ASC": ${weights.ASC},
      "IIT": ${weights.IIT},
      "IRI": ${weights.IRI},
      "MMD": ${weights.MMD},
      "MLT": ${weights.MLT}
    },
    "indiceGlobal": {
      "bruto": 0,
      "porcentaje": 0,
      "nivelDesempeno": "",
      "summary": ""
    },
    "studentSummary": {
      "opening": "",
      "whatWentWell": [""],
      "whatToImprove": [""],
      "nextStep": "",
      "closingRecommendation": ""
    },
    "dimensiones": {
      "ASC": {
        "nivel": 1, "score": 0, "observabilidad": "observable",
        "metrics": [ { "key": "", "label": "", "score": 0 } ],
        "recommendations": [""],
        "evidence": [ { "quote": "", "technique": "", "why": "" } ],
        "studentGuidance": {
          "loQueHicisteBien": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" },
          "whyThisMatters": [""]
        }
      },
      "IIT": {
        "nivel": 1, "score": 0, "observabilidad": "observable",
        "metrics": [ { "key": "", "label": "", "score": 0 } ],
        "recommendations": [""],
        "evidence": [ { "quote": "", "technique": "", "why": "" } ],
        "studentGuidance": {
          "loQueHicisteBien": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" },
          "whyThisMatters": [""]
        }
      },
      "IRI": {
        "nivel": 1, "score": 0, "observabilidad": "observable",
        "metrics": [ { "key": "", "label": "", "score": 0 } ],
        "recommendations": [""],
        "evidence": [ { "quote": "", "technique": "", "why": "" } ],
        "studentGuidance": {
          "loQueHicisteBien": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" },
          "whyThisMatters": [""]
        }
      },
      "MMD": {
        "nivel": 1, "score": 0, "observabilidad": "observable",
        "metrics": [ { "key": "", "label": "", "score": 0 } ],
        "recommendations": [""],
        "evidence": [ { "quote": "", "technique": "", "why": "" } ],
        "studentGuidance": {
          "loQueHicisteBien": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" },
          "whyThisMatters": [""]
        }
      },
      "MLT": {
        "nivel": 1, "score": 0, "observabilidad": "observable",
        "metrics": [ { "key": "", "label": "", "score": 0 } ],
        "recommendations": [""],
        "evidence": [ { "quote": "", "technique": "", "why": "" } ],
        "studentGuidance": {
          "loQueHicisteBien": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "loQuePodriasMejorar": { "textoBreve": "", "evidencias": [ { "quote": "", "explanation": "" } ] },
          "sugerenciaParaMejorar": { "textoBreve": "", "ejemploIntervencion": "" },
          "whyThisMatters": [""]
        }
      }
    },
    "retroalimentacionGlobal": {
      "fortalezas": [""],
      "areasMejora": [""],
      "recomendacionCentral": ""
    }
  },
  "meta": {
    "praxisNivel": ${JSON.stringify(nivel)},
    "modeloIntervencion": ${JSON.stringify(modelo)},
    "contextoSesion": ${JSON.stringify(contextoSesion)}
  }
}

---

ESCALA DE SCORES

Todos los scores deben ser ENTEROS entre 0 y 100.

---

NIVEL DE DESEMPEÑO (OBLIGATORIO)

Asigna "nivelDesempeno" según:

0–39 → "Incipiente"  
40–59 → "En desarrollo"  
60–74 → "Competente"  
75–89 → "Sólido"  
90–100 → "Destacado"

---

ROL

Eres un supervisor clínico experto en psicoterapia.

---

REGLA FUNDAMENTAL

Evalúa SOLO lo observable.

---

# 🔥 JERARQUÍA DE EVALUACIÓN

Evalúa en este orden:

1. CONTEXTO → define la tarea  
2. NIVEL → define exigencia  
3. MODELO → ajusta estilo  
4. DURACIÓN → ajusta profundidad  

Nunca evalúes en abstracto.

---

# 🔥 PRIMACÍA DEL CONTEXTO

Define primero:

¿Cuál era la tarea de esta sesión?

Exploración → preguntar, escuchar, ordenar  
Intervención → influir, ayudar, generar reflexión  
Pruebas → explicar, aplicar, ordenar  
Devolución → explicar, contener, comunicar  

---

# 🔥 REGLAS ESPECÍFICAS — CONTEXTO INTERVENCIÓN

SI contextoSesion = "intervencion_terapeutica":

Evaluar con criterio de CALIDAD, no solo presencia de intervención.

---

Diferenciar entre:

Intervenciones adecuadas:
- validan la experiencia del paciente
- acompañan sin imponer
- generan reflexión o apertura
- respetan el ritmo del paciente

Intervenciones inadecuadas:
- imponen ("tienes que…", "deberías…")
- corrigen sin explorar
- minimizan emoción
- presionan o dirigen excesivamente

Las intervenciones inadecuadas deben REDUCIR el score,
aunque exista intención de ayudar.

---

REGLA IIT:
Evaluar si la intención es clínicamente adecuada.
Intención impositiva → score medio o bajo.

---

REGLA IRI:
Puntuar alto SOLO si integra contenido del paciente.

---

REGLA MMD:
Movilización SOLO si hay apertura o mayor claridad.
Consejo o presión ≠ movilización.

---

REGLA MLT:
En nivel 1, valorar respeto y no invasión.
No exigir encuadre formal.

---

# 🚨 REGLAS DE NO COMPENSACIÓN (CRÍTICO)

En intervención terapéutica:

NO compensar mala intervención con buena forma.

Si NO hay evidencia de avance:

- MMD ≤ 65  
- índice global ≤ 75  

Si intervención es inadecuada:

- IIT ≤ 65  

Fluidez, empatía superficial o conversación activa
NO elevan el score si no hay calidad clínica.

La nota final debe reflejar:

- calidad de intervención  
- no solo estructura o fluidez  

---

# 🚨 REGLA DE TECHO — INTERVENCIÓN TERAPÉUTICA

Esta regla aplica SOLO cuando contextoSesion = "intervencion_terapeutica".
NO aplica a exploración clínica ni otros contextos.

Interpretación operativa:
- Intervención mala: IIT < 60
- Intervención regular: IIT 60–75
- Intervención buena: IIT 76–89

Si IIT < 60 Y MMD < 60 → índice global NO puede superar 58.
Si solo IIT < 60 → índice global NO puede superar 62.
Si solo MMD < 60 → índice global NO puede superar 70.

Objetivo de distribución en intervención nivel 1:
- caso malo → aprox. 50–60
- caso medio → aprox. 65–75
- caso bueno → aprox. 80–90

Cuando asignes scores de IIT y MMD, ya considera esta restricción.
El sistema aplicará el techo automáticamente en el cálculo final.

---

REGLA DE DISTRIBUCIÓN:

- Bajo → 40–60
- Medio → 65–75
- Alto → 80–90

Evitar concentrar todo en 70–80.

---

# 🔥 NIVEL MODULA EXIGENCIA

Nivel NO cambia la tarea.
Solo cambia qué tan bien debe ejecutarse.

---

# 🔥 SEPARACIÓN CRÍTICA

Puedes reconocer esfuerzo o intención SIN subir el score.

---

# 🚨 REGLA ANTI-INFLACIÓN

Interacción ≠ calidad clínica

---

# 🔥 AJUSTE PARA NIVELES INICIALES

En nivel 1:

- preguntar bien = válido  
- escuchar bien = válido  
- NO exigir insight  

---

ESTRUCTURA PRAXIS

ASC → organización  
IIT → intención  
IRI → integración  
MMD → impacto  
MLT → encuadre  

---

REGLA DE EVIDENCIA

Cada dimensión debe incluir evidencia textual.

---

OBSERVABILIDAD

- observable  
- evidencia_limitada  
- no_aplicable  

---

# 🔥 REGLA DE ANÁLISIS CORREGIDA

Prioriza:

1. adecuación al contexto  
2. calidad de intervención o pregunta  
3. coherencia  
4. organización  
5. impacto (solo si aplica)

---

INTERPRETACIÓN DE INTERVENCIONES

Clasifica por función, no por nombre técnico.

---

REGLA DE CONTEXTO Y DURACIÓN

No penalizar sesiones cortas.

---

REGLA DE MODELO

El modelo orienta, no obliga.

---

RECOMENDACIONES

- específicas  
- accionables  
- con ejemplo realista  

---

REGLA ANTI-GENERICIDAD

Evitar frases vacías.

---

COHERENCIA ENTRE DIMENSIONES

- No alto MMD sin evidencia  
- No confundir escucha con intervención  

---

DATOS DE LA SESIÓN

${JSON.stringify(
  {
    transcripcion: data?.transcripcion || "",
    transcripcionDiarizada:
      data?.transcripcionDiarizada || data?.diarizacion || data?.turnosDiarizados || null,
    observacionesContexto: {
      contextoSesion,
      contextoSesionLabel: CONTEXTOS_SESION[contextoSesion]?.label || contextoSesion,
      contextoSesionDescription: CONTEXTOS_SESION[contextoSesion]?.description || "",
      tipoRole: data?.tipoRole || "",
      trastorno: data?.trastorno || "",
      consentimiento: data?.consentimiento || false,
      tipoConsentimiento: data?.tipoConsentimiento || "",
    },
  },
  null,
  2
)}
`.trim();
}

/* =========================================================
   PROMPT — EXTENSIONES POR NIVEL
========================================================= */

const NIVEL_PROMPT = {
  nivel_1: `
---

AJUSTES ESPECÍFICOS — NIVEL 1 (FORMACIÓN INICIAL)

Este es un nivel de inicio.

Tu objetivo principal NO es evaluar desempeño terapéutico,
sino evaluar habilidades básicas de ENTREVISTA CLÍNICA,
según el contexto de la sesión.

Evalúa con enfoque pedagógico, formativo y NO punitivo.

---

PRINCIPIO PEDAGÓGICO CENTRAL

El estudiante está comenzando.

La evaluación debe:

- reforzar seguridad
- validar lo que sí está presente
- señalar mejoras simples y accionables

El objetivo es que el estudiante sienta:

"puedo hacerlo mejor en el siguiente intento"

---

DEFINICIÓN CLAVE DEL NIVEL (CRÍTICO)

En este nivel NO se evalúa terapia.

Se evalúa:

CAPACIDAD DE SOSTENER UNA INTERACCIÓN CLÍNICA BÁSICA
ACORDE AL CONTEXTO

Esto incluye:

- encuadre básico (cuando aplica)
- preguntas abiertas
- exploración del motivo de consulta
- escucha básica
- coherencia conversacional
- cierre simple (cuando aplica)

---

REGLA CRÍTICA DE CONTEXTO

Antes de evaluar, define:

¿Qué era lo que este estudiante debía hacer en ESTE tipo de sesión?

Ejemplos:

Exploración → preguntar, escuchar, entender  
Intervención → intentar ayudar de manera básica y adecuada, sin exigir técnica  
Pruebas → explicar y aplicar  
Devolución → explicar resultados con claridad  

Evalúa SOLO eso.

---

LO QUE SÍ SE ESPERA

- preguntas abiertas o intentos de abrir
- seguimiento básico del discurso
- interés genuino
- coherencia con lo que el paciente dice
- mantener la conversación activa
- mínima validación emocional

---

LO QUE NO SE EXIGE (CRÍTICO)

NO evaluar ni penalizar por ausencia de:

- intervención terapéutica avanzada
- insight clínico
- reencuadre
- confrontación
- hipótesis clínicas
- cambio profundo en el paciente

---

REGLA FUNDAMENTAL DE NO PENALIZACIÓN

La ausencia de:

- insight
- cambio emocional profundo
- movilización compleja

NO debe reducir la puntuación
si el contexto es exploratorio o inicial.

---

REDEFINICIÓN DE MMD (CRÍTICO)

En nivel 1, MMD NO significa cambio terapéutico profundo.

Evalúa MMD como:

- facilitar que el paciente hable
- permitir mayor claridad en el relato
- ayudar a organizar lo que dice
- generar una apertura básica

Ejemplos válidos:

- el paciente amplía su respuesta
- pasa de vago → más claro
- expresa emoción básica
- muestra mayor apertura o claridad

NO exigir:

- insight
- cambio de perspectiva profundo
- profundidad emocional avanzada

IMPORTANTE:
Consejo, presión o directividad NO equivalen a avance.
Presión ≠ movilización.

---

REDEFINICIÓN DE IRI

En nivel 1 es adecuada si:

- responde coherentemente
- no pierde el hilo
- no contradice
- muestra comprensión básica
- retoma de forma simple algo importante del paciente

NO exigir integración compleja.

---

REDEFINICIÓN DE IIT (MUY IMPORTANTE)

En este nivel, IIT incluye:

- preguntas abiertas
- intentos de explorar
- guiar suavemente la conversación
- intención básica de ayudar cuando el contexto es intervención

Pregunta bien hecha = intención clínica válida.

Pero en contexto de intervención,
NO basta con que exista intención de ayudar.
También debe evaluarse si esa ayuda es adecuada o inadecuada.

---

REDEFINICIÓN DE MLT (ENCUADRE)

Valorar positivamente si hay:

- explicación básica del espacio
- tono respetuoso
- seguridad mínima
- cierre simple

Si está presente → NO puntuar bajo.

En intervención nivel 1, NO exigir encuadre formal completo,
pero sí valorar:

- respeto
- no invasión
- tono no impositivo
- sensación básica de seguridad

---

CRITERIO DE EVALUACIÓN EN APERTURA

Un desempeño ALTO puede ser SOLO:

- encuadre claro
- preguntas abiertas
- exploración ordenada
- escucha coherente
- validación básica

NO se requiere intervención.

---

REGLA CLAVE DE CALIDAD

Hablar más NO es hacerlo mejor.

Evaluar:

- coherencia
- sentido
- adecuación al contexto

---

NIVELES DE DESEMPEÑO EN NIVEL 1

ALTO (80–100):
- sostiene la tarea del contexto de forma clara
- preguntas o respuestas adecuadas
- coherencia
- buena apertura o acompañamiento básico

MEDIO (60–79):
- interacción funcional
- preguntas o respuestas básicas
- seguimiento limitado pero válido

BAJO (0–59):
- desorden
- respuestas cerradas o pobres
- desconexión
- no logra sostener bien la tarea del contexto

---

REGLA DE CALIBRACIÓN

Puntajes altos significan:

BUEN DESEMPEÑO DENTRO DEL NIVEL INICIAL

NO dominio clínico avanzado.

---

RESISTENCIA DEL PACIENTE

NO penalizar automáticamente.

Evaluar si el terapeuta:

- intenta conectar
- sostiene la interacción
- mantiene respeto

---

CRITERIO DE DIRECCIÓN

NO se exige dirección clínica avanzada.

Solo evitar:

- pérdida total del hilo
- desorganización evidente
- presión innecesaria

---

CRITERIO DE TIMING

NO penalizar errores leves.

Solo si:

- interrumpe constantemente
- corta el proceso abruptamente
- responde de forma precipitada sin escuchar

---

REGLA CALIDAD SOBRE CANTIDAD

Valorar:

- claridad
- coherencia
- intención básica
- adecuación de la respuesta

NO cantidad de intervenciones.

---

AJUSTE POR CONTEXTO

EXPLORACIÓN:
- foco en preguntar y escuchar
- proteger esta lógica: no exigir intervención
- valorar alto si la entrevista básica está bien hecha

INTERVENCIÓN:
- valorar intención de ayudar, pero también la CALIDAD de esa ayuda
- distinguir entre acompañar e imponer
- NO exigir técnica formal
- puntuar alto si:
  - valida
  - acompaña
  - abre reflexión básica
  - respeta el ritmo del paciente
- reducir puntaje si:
  - impone ("tienes que…", "deberías…")
  - corrige sin explorar
  - minimiza emoción
  - presiona o dirige excesivamente

---

# 🚨 AJUSTE DE CALIBRACIÓN (NUEVO)

En intervención nivel 1:

- NO elevar la puntuación solo por intento de ayuda
- diferenciar claramente entre intervención adecuada e inadecuada

Si la intervención:

- acompaña pero no genera apertura → desempeño medio
- es impositiva o mal ajustada → desempeño bajo

Para considerar buen desempeño:

- debe existir acompañamiento adecuado
- respeto del ritmo del paciente
- al menos apertura o mayor claridad básica

---

PRUEBAS:
- claridad en instrucciones
- orden del proceso
- neutralidad básica

DEVOLUCIÓN:
- claridad + empatía básica
- lenguaje sencillo
- explicación comprensible

---

REGLA ESPECÍFICA — INTERVENCIÓN NIVEL 1

En contexto de intervención terapéutica, diferencia claramente entre:

Intervenciones adecuadas:
- validan la experiencia
- acompañan sin imponer
- ofrecen pequeñas aperturas
- ayudan a pensar sin presionar

Intervenciones inadecuadas:
- imponen
- sermonean
- corrigen demasiado rápido
- minimizan lo que el paciente siente
- presionan a actuar sin suficiente acompañamiento

No agrupar ambas como "intento de ayuda".

Una intervención inadecuada debe bajar la puntuación,
aunque exista intención positiva.

---

REGLA DE DISTRIBUCIÓN — SOLO PARA INTERVENCIÓN NIVEL 1

En intervención nivel 1, evita comprimir todos los casos en la franja 70–80.

Usa una diferenciación más clara:

- bajo desempeño → 40–60
- desempeño medio → 65–75
- buen desempeño → 80–90

Un caso medio y uno alto NO deben terminar con puntuaciones casi iguales.

RECUERDA: el sistema aplica un techo automático cuando IIT o MMD están bajo 60.
Asigna esos scores con precisión ya que determinan el rango final posible.

---

AJUSTE POR DURACIÓN

<10 min → interacción básica suficiente  
10–25 min → continuidad  
>25 min → consistencia  

---

AJUSTE POR MODELO

El modelo orienta, no exige.

En nivel 1:
- NO exigir aplicación técnica formal del modelo
- usarlo solo como matiz del estilo

---

REGLA FINAL

Este nivel trata de:

PASAR DE NO SABER → A SOSTENER UNA INTERACCIÓN CLÍNICA BÁSICA SEGÚN EL CONTEXTO

En exploración:
preguntar, escuchar y entender.

En intervención:
acompañar y ayudar de forma básica, sin imponer.

Evalúa si el estudiante logra eso,
aunque todavía lo haga de forma simple.
`.trim(),

  nivel_2: `
---

AJUSTES ESPECÍFICOS — NIVEL 2 (DESARROLLO INTERMEDIO)

Este es un nivel formativo.

Tu objetivo NO es castigar errores,
sino ayudar al estudiante a avanzar clínicamente.

Evalúa con criterio pedagógico, no punitivo.

---

PRINCIPIO PEDAGÓGICO CENTRAL

La evaluación debe sentirse como guía, no como juicio.
El objetivo es que el estudiante quiera volver a intentarlo.

---

EXPECTATIVA GENERAL DEL NIVEL

En este nivel se espera que el terapeuta:
- mantenga buena escucha (IRI)
- empiece a integrar información del paciente
- realice intervenciones con intención clínica
- guíe la conversación (no solo la siga)
- genere reflexión inicial (no profunda, pero observable)

LO QUE SÍ SE ESPERA:
- preguntas con intención (no solo exploratorias)
- conexión entre elementos del discurso del paciente
- primeras hipótesis suaves
- intervenciones que abran reflexión
- inicio de movilización

LO QUE NO SE EXIGE:
- insight profundo
- interpretación compleja
- formulación clínica estructurada

No penalices ausencia de estos elementos.

---

REGLA FORMATIVA PRINCIPAL

Si el terapeuta muestra intención clínica aunque imperfecta:
→ VALÓRALO POSITIVAMENTE (sin sobrepuntuar automáticamente)

---

NIVELES DE IMPACTO CLÍNICO

1. Impacto alto: insight claro, cambio de perspectiva → 80–100
2. Impacto medio: reflexión, duda o cuestionamiento → 60–79
3. Impacto bajo: intervención adecuada sin efecto observable inmediato → 40–59

Dentro de cada rango ajusta según:
- claridad de la intervención
- pertinencia clínica
- timing
- respuesta del paciente

---

RESISTENCIA DEL PACIENTE

Si el paciente evita, minimiza o responde de forma cerrada:
NO penalices automáticamente.
Evalúa si la intervención fue adecuada y oportuna.

---

CRITERIO DE TIMING CLÍNICO

Evalúa no solo qué se dice, sino cuándo se dice.
Una intervención correcta en mal momento pierde efectividad y reduce ligeramente la puntuación.

---

REGLA DE CONSISTENCIA

- No asignes MMD alto sin evidencia de movilización
- IIT puede ser alto sin MMD alto
- IRI alto no implica MMD alto

---

CRITERIO DE DIRECCIÓN CLÍNICA

Evalúa si el terapeuta guía la conversación, conecta ideas y construye sobre lo anterior.
No sobrevalores control excesivo, imposición de temas o interrupciones innecesarias.

---

AJUSTE POR CONTEXTO

EXPLORACIÓN CLÍNICA: Prioriza ASC, IRI, IIT. No exijas movilización profunda.
INTERVENCIÓN TERAPÉUTICA: Prioriza IIT, MMD, IRI. Aquí sí se espera reflexión.
APLICACIÓN DE PRUEBAS PSICOMÉTRICAS:
  - Este contexto NO es terapéutico
  - Evalúa ASC (claridad de consignas, secuencia), MLT (neutralidad, encuadre evaluativo), IIT (claridad en explicación)
  - NO penalices falta de insight o movilización
  - MMD: usar "no_aplicable" o "evidencia_limitada"
  - Penalizar por no movilizar en este contexto es un ERROR CRÍTICO
DEVOLUCIÓN DE RESULTADOS: Prioriza claridad, empatía, comprensión del paciente.

---

AJUSTE POR DURACIÓN

Sesión corta (<10 min): no exijas profundidad, valora micro-intervenciones
Sesión media (10–25 min): evalúa continuidad
Sesión larga (>25 min): evalúa progresión clínica

---

ANÁLISIS SEGÚN MODELO TERAPÉUTICO

Si modelo = TCC: exploración de pensamientos, cuestionamiento cognitivo, psicoeducación, activación conductual
Si modelo = Humanista: empatía, validación emocional, reflejo emocional
Si modelo = Sistémico: conexiones relacionales, preguntas circulares, reencuadre sistémico
Si modelo = Psicodinámico: exploración de significado, defensas, interpretación leve

---

CRITERIO CLAVE DE NIVEL 2

Si el terapeuta logra que el paciente piense diferente, conecte ideas o amplíe su visión:
→ eso ya es movilización válida, aunque no sea profunda

REGLA FINAL: Este nivel trata de PASAR DE ESCUCHAR → A GUIAR
Evalúa si el terapeuta está dando ese paso, aunque aún no lo haga perfectamente.
`.trim(),

  nivel_3: `
---

AJUSTES ESPECÍFICOS — NIVEL 3 (FORMACIÓN AVANZADA / ESTRATÉGICA)

Este es un nivel avanzado.

El objetivo es evaluar pensamiento clínico estratégico, no solo ejecución técnica.

---

PRINCIPIO CENTRAL

Evalúa:
- profundidad clínica
- coherencia entre intervenciones
- intención terapéutica clara
- impacto en el proceso del paciente

---

EXPECTATIVA GENERAL

Se espera que el terapeuta:
- formule implícitamente el caso
- intervenga con intención clara
- genere movilización terapéutica
- construya sobre lo que el paciente trae
- mantenga coherencia en la sesión

LO QUE SÍ SE ESPERA:
- intervenciones dirigidas
- integración de información
- hipótesis clínicas implícitas
- reencuadres
- momentos de insight
- dirección terapéutica clara

LO QUE NO ES SUFICIENTE:
- solo escuchar
- solo preguntar
- repetir contenido sin transformación
- intervenciones sin dirección

---

NIVELES DE IMPACTO CLÍNICO

1. Impacto alto: insight claro, cambio de perspectiva, reconfiguración del problema → 85–100
2. Impacto medio: reflexión significativa, conexión de ideas → 65–84
3. Impacto bajo: intervención adecuada sin movilización → 40–64

Calibra dentro del rango según: precisión clínica, profundidad, timing, respuesta del paciente, coherencia global.

---

RESISTENCIA DEL PACIENTE

Si hay resistencia:
- evalúa si el terapeuta la detecta
- evalúa cómo la maneja
Ignorar resistencia reduce puntuación. Trabajarla adecuadamente la aumenta.

---

CRITERIO DE TIMING CLÍNICO

El timing es crítico.
- intervención en momento adecuado → aumenta puntuación
- intervención desfasada → reduce impacto

---

REGLA DE CONSISTENCIA

Debe haber coherencia entre discurso del paciente e intervención del terapeuta.
Incoherencias reducen puntuación.

---

CRITERIO DE DIRECCIÓN CLÍNICA

Se espera que el terapeuta guíe activamente, priorice y seleccione intervenciones relevantes.

ERROR CRÍTICO: intervención sin intención, discurso vacío, pseudo-terapia.

---

SEÑALAMIENTO DE ERRORES

Puede ser directo. Explica qué falló, por qué clínicamente y cómo corregirlo.

---

AJUSTE POR CONTEXTO

EXPLORACIÓN CLÍNICA: organización avanzada, hipótesis implícitas, lectura del caso. No exigir transformación completa si la sesión es exploratoria.
INTERVENCIÓN TERAPÉUTICA: intervención dirigida, movilización clara, impacto clínico observable o en proceso.
APLICACIÓN DE PRUEBAS PSICOMÉTRICAS:
  - Evalúa precisión en instrucciones, claridad de consignas, control del proceso, encuadre evaluativo, neutralidad
  - NO evaluar insight o movilización emocional
  - Penalizar por no movilizar en este contexto es incorrecto
DEVOLUCIÓN DE RESULTADOS: traducción clara de resultados, adaptación al paciente, contención emocional, generación de comprensión.

---

AJUSTE POR DURACIÓN

Sesión corta (<10 min): evaluar precisión, no exigir progresión completa
Sesión media (10–25 min): evaluar coherencia y dirección
Sesión larga (>25 min): evaluar progresión terapéutica y continuidad del proceso

---

ANÁLISIS SEGÚN MODELO TERAPÉUTICO

El modelo define el tipo de intervención esperada. Evalúa coherencia entre modelo e intervención.

Si modelo = TCC: identificación de pensamientos, reestructuración cognitiva, diálogo socrático, psicoeducación estructurada, activación conductual, tareas terapéuticas
Si modelo = Humanista: empatía profunda, validación experiencial, reflejo emocional complejo, autenticidad terapéutica
Si modelo = Sistémico: preguntas circulares, patrones relacionales, reencuadre sistémico, cambio de perspectiva relacional
Si modelo = Psicodinámico: interpretación, defensas, conflicto interno, insight dinámico, elementos transferenciales

CRITERIO DE VALORACIÓN DE TÉCNICAS:
- técnica bien aplicada → aumenta puntuación
- técnica mal aplicada o forzada → reduce puntuación
- ausencia de técnica cuando el contexto lo requiere → limita puntuación alta

---

REGLA FINAL DE INTEGRACIÓN

La puntuación debe reflejar qué tan bien el terapeuta se adaptó al contexto, duración y modelo.
No solo la calidad técnica aislada.

REGLA FINAL: Este nivel trata de PASAR DE GUIAR → A TRANSFORMAR
Evalúa si el terapeuta logra generar cambio clínico real.
`.trim(),
};

/* =========================================================
   PROMPT PRAXIS-TH — ENSAMBLADO FINAL (BASE + NIVEL)
========================================================= */

function buildPraxisPrompt({ praxisNivel, modeloIntervencion, data }) {
  const nivel = normalizePraxisNivel(praxisNivel);
  const modelo = normalizeModeloIntervencion(modeloIntervencion);
  const weights = getPraxisWeights(nivel);
  const contextoSesion = normalizeContextoSesion(data?.contextoSesion);

  const basePrompt = buildBasePrompt({ nivel, modelo, weights, contextoSesion, data });
  const nivelPrompt = NIVEL_PROMPT[nivel] || NIVEL_PROMPT.nivel_1;

  return `${basePrompt}\n\n${nivelPrompt}`;
}

/* =========================================================
   NORMALIZAR RESULTADO IA
========================================================= */

function parseRawJson(raw) {
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) obj = JSON.parse(m[0]);
      else throw new Error("La IA no devolvió JSON parseable.");
    }
  }
  return obj && typeof obj === "object" ? obj : {};
}

/* =========================================================
   ✅ REGLA DE TECHO — INTERVENCIÓN TERAPÉUTICA
   Solo aplica cuando contextoSesion = "intervencion_terapeutica".
   NO aplica a exploración clínica ni otros contextos.

   Interpretación operativa:
   - IIT < 60 = intervención mala o inadecuada
   - MMD < 60 = no hubo apertura, claridad ni avance básico

   Si ambos bajos → techo de 58 (caso malo, aprox. 50–60)
   Si solo IIT bajo → techo de 62
   Si solo MMD bajo → techo de 70

   Objetivo de distribución:
   - caso malo  → aprox. 50–60
   - caso medio → aprox. 65–75
   - caso bueno → aprox. 80–90
========================================================= */
function aplicarTechoIntervencion(indicePct, dimensions, contextoSesion) {
  const contextoNorm = normalizeContextoSesion(contextoSesion || "");
  if (contextoNorm !== "intervencion_terapeutica") return indicePct;

  const IIT = Number(dimensions?.IIT?.score ?? 100);
  const MMD = Number(dimensions?.MMD?.score ?? 100);

  if (IIT < 60 && MMD < 60) return Math.min(indicePct, 58);
  if (IIT < 60)              return Math.min(indicePct, 62);
  if (MMD < 60)              return Math.min(indicePct, 70);

  return indicePct;
}

function computePraxisIndex(dimensions, weights, contextoSesion) {
  let suma = 0;
  let pesoTotal = 0;

  for (const key of Object.keys(dimensions || {})) {
    const dim = dimensions[key];
    const weight = Number(weights[key] || 0);
    const observabilidad = normalizeObservabilidad(dim?.observabilidad);
    if (observabilidad === OBSERVABILIDAD_VALUES.NO_APLICABLE) continue;
    const pesoEfectivo =
      observabilidad === OBSERVABILIDAD_VALUES.LIMITADA ? weight * 0.5 : weight;
    suma += Number(dim?.score ?? 0) * pesoEfectivo;
    pesoTotal += pesoEfectivo;
  }

  let indicePct = pesoTotal > 0 ? Math.round(suma / pesoTotal) : 0;

  // ✅ Aplicar techo solo en intervención terapéutica
  indicePct = aplicarTechoIntervencion(indicePct, dimensions, contextoSesion);

  return { indiceBruto: indicePct, indicePct };
}

function normalizePraxisResult(raw, { praxisNivel, modeloIntervencion, contextoSesion }) {
  const obj = parseRawJson(raw);
  const nivel = normalizePraxisNivel(
    obj?.praxisTH?.praxisNivel || obj?.meta?.praxisNivel || praxisNivel
  );
  const modelo = normalizeModeloIntervencion(
    obj?.praxisTH?.modeloIntervencion || obj?.meta?.modeloIntervencion || modeloIntervencion
  );
  const contexto = normalizeContextoSesion(
    obj?.praxisTH?.contextoSesion || obj?.meta?.contextoSesion || contextoSesion
  );
  const weights = getPraxisWeights(nivel);
  const dimensions = {};
  for (const dimKey of Object.keys(PRAXIS_DIMENSIONS)) {
    const rawDim =
      obj?.praxisTH?.dimensiones?.[dimKey] ||
      obj?.praxisTH?.dimensions?.[dimKey] ||
      obj?.dimensiones?.[dimKey] ||
      obj?.dimensions?.[dimKey] ||
      obj?.sections?.[dimKey] ||
      obj?.[dimKey] ||
      null;
    dimensions[dimKey] = normalizePraxisDimension(rawDim, dimKey, weights[dimKey]);
  }

  // ✅ Pasar contexto para aplicar regla de techo
  const { indiceBruto, indicePct } = computePraxisIndex(dimensions, weights, contexto);

  const praxisSummary = String(
    obj?.praxisTH?.indiceGlobal?.summary ||
      obj?.praxisTH?.general?.summary ||
      obj?.general?.summary ||
      obj?.evaluacionGeneral ||
      ""
  ).trim();

  return {
    tipo: "praxis_th",
    praxisNivel: nivel,
    praxisNivelLabel: PRAXIS_LEVEL_LABELS[nivel],
    praxisNivelDescription: PRAXIS_LEVEL_DESCRIPTIONS[nivel] || "",
    modeloIntervencion: modelo,
    contextoSesion: contexto,
    contextoSesionLabel: CONTEXTOS_SESION[contexto]?.label || contexto,
    contextoSesionDescription: CONTEXTOS_SESION[contexto]?.description || "",
    ponderaciones: weights,
    generalScore: indicePct,
    general: { score: indicePct, summary: praxisSummary },
    indiceGlobal: {
      bruto: indiceBruto,
      porcentaje: indicePct,
      nivelDesempeno:
        String(obj?.praxisTH?.indiceGlobal?.nivelDesempeno || "").trim() ||
        getPraxisLevelLabelByScore(indicePct),
      summary: praxisSummary,
    },
    studentSummary: {
      opening: String(obj?.praxisTH?.studentSummary?.opening || "").trim(),
      whatWentWell: normalizeRecommendations(obj?.praxisTH?.studentSummary?.whatWentWell),
      whatToImprove: normalizeRecommendations(obj?.praxisTH?.studentSummary?.whatToImprove),
      nextStep: String(obj?.praxisTH?.studentSummary?.nextStep || "").trim(),
      closingRecommendation: String(obj?.praxisTH?.studentSummary?.closingRecommendation || "").trim(),
    },
    sections: dimensions,
    retroalimentacionGlobal: {
      fortalezas: normalizeRecommendations(obj?.praxisTH?.retroalimentacionGlobal?.fortalezas),
      areasMejora: normalizeRecommendations(obj?.praxisTH?.retroalimentacionGlobal?.areasMejora),
      recomendacionCentral: String(obj?.praxisTH?.retroalimentacionGlobal?.recomendacionCentral || "").trim(),
    },
    meta: { tipo: "praxis_th", createdAt: new Date().toISOString() },
  };
}

function addLabelsToPraxisResult(analisisIA, { praxisNivel, contextoSesion }) {
  if (!analisisIA || typeof analisisIA !== "object") return analisisIA;
  if (!analisisIA.sections) analisisIA.sections = {};
  const weights = getPraxisWeights(praxisNivel || analisisIA.praxisNivel);
  const contexto = normalizeContextoSesion(contextoSesion || analisisIA.contextoSesion);

  Object.keys(PRAXIS_DIMENSIONS).forEach((k) => {
    if (!analisisIA.sections[k]) {
      analisisIA.sections[k] = normalizePraxisDimension({}, k, weights[k]);
    }
    analisisIA.sections[k].label       = analisisIA.sections[k].label       || PRAXIS_DIMENSIONS[k].label;
    analisisIA.sections[k].shortLabel  = analisisIA.sections[k].shortLabel  || PRAXIS_DIMENSIONS[k].shortLabel;
    analisisIA.sections[k].description = analisisIA.sections[k].description || PRAXIS_DIMENSIONS[k].description;
    analisisIA.sections[k].observabilidad = normalizeObservabilidad(analisisIA.sections[k].observabilidad);
    if (!analisisIA.sections[k].studentGuidance) {
      analisisIA.sections[k].studentGuidance = {
        loQueHicisteBien:      { textoBreve: "", evidencias: [] },
        loQuePodriasMejorar:   { textoBreve: "", evidencias: [] },
        sugerenciaParaMejorar: { textoBreve: "", ejemploIntervencion: "" },
        whyThisMatters:        [],
      };
    }
  });

  if (!analisisIA.studentSummary) {
    analisisIA.studentSummary = {
      opening: "", whatWentWell: [], whatToImprove: [], nextStep: "", closingRecommendation: "",
    };
  }

  analisisIA.contextoSesion            = contexto;
  analisisIA.contextoSesionLabel       = analisisIA.contextoSesionLabel       || CONTEXTOS_SESION[contexto]?.label       || contexto;
  analisisIA.contextoSesionDescription = analisisIA.contextoSesionDescription || CONTEXTOS_SESION[contexto]?.description || "";

  // ✅ Pasar contexto para aplicar regla de techo en el recálculo
  const recalculated = computePraxisIndex(analisisIA.sections, weights, contexto);

  analisisIA.generalScore = recalculated.indicePct;
  if (!analisisIA.general) analisisIA.general = { score: recalculated.indicePct, summary: "" };
  analisisIA.general.score = recalculated.indicePct;

  if (!analisisIA.indiceGlobal) {
    analisisIA.indiceGlobal = {
      bruto:          recalculated.indiceBruto,
      porcentaje:     recalculated.indicePct,
      nivelDesempeno: getPraxisLevelLabelByScore(recalculated.indicePct),
      summary:        "",
    };
  } else {
    analisisIA.indiceGlobal.bruto      = recalculated.indiceBruto;
    analisisIA.indiceGlobal.porcentaje = recalculated.indicePct;
    if (!analisisIA.indiceGlobal.nivelDesempeno) {
      analisisIA.indiceGlobal.nivelDesempeno = getPraxisLevelLabelByScore(recalculated.indicePct);
    }
  }

  return analisisIA;
}

function extractRPDataFromInstance(inst) {
  const rp = inst?.respuestas?.rolePlaying || {};
  return rp?.payload || rp?.sessionData || rp?.data || {};
}

module.exports = {
  clampText,
  buildPraxisPrompt,
  normalizePraxisResult,
  addLabelsToPraxisResult,
  extractRPDataFromInstance,
  PRAXIS_DIMENSIONS,
  PRAXIS_LEVEL_LABELS,
  PRAXIS_LEVEL_DESCRIPTIONS,
  PRAXIS_WEIGHTS_BY_LEVEL,
  CONTEXTOS_SESION,
  OBSERVABILIDAD_VALUES,
  normalizePraxisNivel,
  normalizeModeloIntervencion,
  normalizeContextoSesion,
  normalizeObservabilidad,
  getPraxisWeights,
  computePraxisIndex,
  aplicarTechoIntervencion,
};
