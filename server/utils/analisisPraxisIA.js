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
  
  // ✅ FIX CENTRAL: la IA devuelve scores en escala 0.0–1.0 en lugar de 0–100
  // Esta función detecta la escala y convierte correctamente
  function normalizeScoreValue(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return 0;
    // Si está claramente en escala 0–1 (valor < 2, puede ser 0.0 a 1.0)
    // Excepción: valores como 0, 1 en escala 0–100 también son posibles,
    // pero estadísticamente un score de "1/100" no tiene sentido pedagógico.
    // Regla: si n <= 1, asumir escala 0–1 → multiplicar × 100
    if (n <= 1.0) return Math.round(n * 100);
    // Si ya está en escala 0–100
    return Math.max(0, Math.min(100, Math.round(n)));
  }
  
  /* =========================================================
     CONSTANTES PRAXIS-TH
  ========================================================= */
  
  const PRAXIS_DIMENSIONS = {
    ASC: {
      label: "Organización de la conversación",
      shortLabel: "ASC – Análisis Secuencial Conversacional",
      description: "Esta dimensión analiza qué tan clara y ordenada fue la conversación durante la sesión.",
    },
    IIT: {
      label: "Intención de tus intervenciones",
      shortLabel: "IIT – Intencionalidad de la Intervención Terapéutica",
      description: "Esta dimensión analiza si tus preguntas e intervenciones tuvieron un propósito claro dentro de la conversación terapéutica y si ayudaron a comprender mejor la situación del paciente.",
    },
    IRI: {
      label: "Escucha e integración de lo que dice el paciente",
      shortLabel: "IRI – Integración de Referencias Internas",
      description: "Esta dimensión analiza qué tan bien escuchaste al paciente y cómo utilizaste la información que él o ella fue compartiendo durante la sesión.",
    },
    MMD: {
      label: "Capacidad para generar avance en la conversación",
      shortLabel: "MMD – Movilización Micro-Dinámica",
      description: "Esta dimensión analiza si tus intervenciones ayudaron a que la conversación avanzara hacia una mayor comprensión o reflexión sobre lo que el paciente está viviendo.",
    },
    MLT: {
      label: "Manejo del encuadre terapéutico",
      shortLabel: "MLT – Manejo del Límite Terapéutico",
      description: "Esta dimensión analiza cómo mantuviste el marco profesional de la sesión y si lograste sostener un espacio terapéutico claro y seguro para el paciente.",
    },
  };
  
  const PRAXIS_LEVEL_LABELS = {
    nivel_1: "Nivel I – Formación inicial",
    nivel_2: "Nivel II – Desarrollo intermedio",
    nivel_3: "Nivel III – Formación avanzada",
  };
  
  const PRAXIS_LEVEL_DESCRIPTIONS = {
    nivel_1: "Enfoque en habilidades básicas. Se prioriza la organización conversacional y el encuadre básico.",
    nivel_2: "Integración técnica. Se equilibra la estructura con la integración narrativa y la movilización micro-dinámica.",
    nivel_3: "Competencia estratégica. Se incrementa el peso de la intencionalidad estratégica y la movilización terapéutica.",
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
  
  /* =========================================================
     NORMALIZADORES DE NIVEL / MODELO
  ========================================================= */
  
  function normalizePraxisNivel(raw) {
    const v = String(raw || "").trim().toLowerCase();
    if (v === "nivel_1" || v === "nivel1" || v === "1" || v.includes("inicial")) return "nivel_1";
    if (v === "nivel_2" || v === "nivel2" || v === "2" || v.includes("intermedio")) return "nivel_2";
    if (v === "nivel_3" || v === "nivel3" || v === "3" || v.includes("avanzad")) return "nivel_3";
    return "nivel_1";
  }
  
  function normalizeModeloIntervencion(raw) {
    return String(raw || "").trim();
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
      metrics = Object.entries(metrics).map(([k, v]) => ({
        key: k,
        label: String(k),
        score: v,
      }));
    }
    if (!Array.isArray(metrics)) metrics = [];
    return metrics
      .map((m, i) => ({
        key: m?.key || `m${i + 1}`,
        label: String(m?.label || m?.nombre || `Criterio ${i + 1}`),
        // ✅ FIX: normalizar score de métricas también (pueden venir en 0-1)
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
        explanation: String(ev?.explanation || ev?.explicacion || ev?.why || ev?.porque || "").trim(),
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
      whyThisMatters: normalizeRecommendations(g.whyThisMatters || g.porQueImporta || g.importancia || g.whyItMatters),
    };
  }
  
  function normalizePraxisDimension(rawBlock, key, weight) {
    const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};
  
    const nivel = safeLevel(base.nivel ?? base.level ?? base.desempeno ?? base.dimensionLevel) ?? 1;
  
    // ✅ FIX: normalizar score con detección de escala 0-1 vs 0-100
    const scoreRaw = base.score ?? base.porcentaje ?? base.percent ?? base.generalScore;
    const score = scoreRaw != null
      ? (normalizeScoreValue(scoreRaw) ?? Math.round((nivel / 5) * 100))
      : Math.round((nivel / 5) * 100);
  
    return {
      key,
      label: PRAXIS_DIMENSIONS[key]?.label || key,
      shortLabel: PRAXIS_DIMENSIONS[key]?.shortLabel || key,
      description: PRAXIS_DIMENSIONS[key]?.description || "",
      nivel,
      nivelLabel: PRAXIS_LEVEL_SCORE_LABELS[nivel] || "Incipiente",
      weight: safeWeight(weight),
      score,
      weightedScore: Number((nivel * safeWeight(weight)).toFixed(4)),
      // ✅ normalizeMetrics ya aplica normalizeScoreValue internamente
      metrics: normalizeMetrics(base.metrics || base.criterios || base.items || base.subScores),
      recommendations: normalizeRecommendations(base.recommendations || base.recomendaciones || base.tips),
      evidence: normalizeEvidence(base.evidence || base.evidencia || base.quotes),
      studentGuidance: normalizeStudentGuidance(base.studentGuidance),
    };
  }
  
  /* =========================================================
     PROMPT PRAXIS-TH
  ========================================================= */
  
  function buildPraxisPrompt({ praxisNivel, modeloIntervencion, data }) {
    const nivel = normalizePraxisNivel(praxisNivel);
    const modelo = normalizeModeloIntervencion(modeloIntervencion);
    const weights = getPraxisWeights(nivel);
  
    return `
  Devuelve SOLO JSON válido con esta estructura EXACTA:
  
  {
    "praxisTH": {
      "praxisNivel": ${JSON.stringify(nivel)},
      "modeloIntervencion": ${JSON.stringify(modelo)},
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
          "nivel": 1,
          "score": 0,
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
          "nivel": 1,
          "score": 0,
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
          "nivel": 1,
          "score": 0,
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
          "nivel": 1,
          "score": 0,
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
          "nivel": 1,
          "score": 0,
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
      "modeloIntervencion": ${JSON.stringify(modelo)}
    }
  }
  
  ESCALA DE SCORES — MUY IMPORTANTE:
  Todos los valores de "score" (en dimensiones, métricas e indiceGlobal.porcentaje) deben ser ENTEROS entre 0 y 100.
  NO uses decimales entre 0 y 1.
  Ejemplo correcto: "score": 70
  Ejemplo incorrecto: "score": 0.7
  El campo indiceGlobal.porcentaje también debe ser un entero entre 0 y 100.
  
  REGLAS DE SALIDA
  
  Responde SOLO JSON válido.
  No agregues texto fuera del JSON.
  Usa evidencia textual real de la transcripción.
  No inventes contenido clínico.
  
  ---
  
  REGLA FUNDAMENTAL DE EVALUACIÓN
  
  Evalúa únicamente lo observable en la transcripción.
  
  Si la sesión es corta o la fase clínica no permite evaluar una dimensión:
  
  NO penalices automáticamente al estudiante.
  
  La ausencia de evidencia no significa ausencia de competencia.
  
  ---
  
  REGLA DE EVIDENCIA
  
  No reutilices la misma frase como evidencia principal en múltiples dimensiones.
  
  Si la sesión es corta y no hay suficiente evidencia para una dimensión:
  
  Indica que la evidencia es limitada y no penalices automáticamente.
  
  ---
  
  LÓGICA DE NIVEL PRAXIS
  
  El nivel PRAXIS configurado indica el mínimo esperado, no el máximo permitido.
  
  Si el estudiante:
  
  actúa por debajo del nivel → señálalo pedagógicamente
  cumple el nivel → reconócelo
  supera el nivel → destácalo como fortaleza
  
  Nunca penalices intervenciones más avanzadas.
  
  ---
  
  MOTOR DE DETECCIÓN DE MICROINTERVENCIONES CLÍNICAS
  
  Antes de evaluar PRAXIS analiza las intervenciones del terapeuta.
  
  Una microintervención es una acción verbal breve que modifica o guía la conversación terapéutica.
  
  Detecta mediante análisis semántico:
  
  Reflejo emocional
  Paráfrasis
  Clarificación
  Pregunta abierta
  Confrontación terapéutica
  Síntesis
  Ironía terapéutica
  Chiste terapéutico
  
  Los ejemplos siguientes son ilustrativos.
  Las intervenciones reales pueden variar.
  
  ---
  
  Reflejo emocional
  
  Detecta cuando el terapeuta devuelve la emoción del paciente.
  
  Ejemplos:
  
  "Suena como si eso te hubiera dolido mucho."
  "Parece que esta situación te genera mucha frustración."
  
  ---
  
  Paráfrasis
  
  Detecta cuando el terapeuta reformula el contenido.
  
  Ejemplos:
  
  "Entonces lo que ocurrió fue que..."
  "Si te entiendo bien, lo que pasó fue..."
  
  ---
  
  Clarificación
  
  Detecta cuando el terapeuta pide precisión.
  
  Ejemplos:
  
  "¿Qué quieres decir exactamente con eso?"
  "¿A qué te refieres cuando dices que fue difícil?"
  
  ---
  
  Pregunta abierta
  
  Ejemplos:
  
  "¿Cómo fue esa experiencia para ti?"
  "¿Qué pasó después?"
  
  ---
  
  Confrontación terapéutica
  
  Detecta discrepancias.
  
  Ejemplo:
  
  "Por un lado dices que quieres cambiar, pero parece que sigues evitando esa conversación."
  
  ---
  
  Síntesis
  
  Ejemplo:
  
  "Entonces hemos visto que esto afecta tu trabajo, tu familia y tu autoestima."
  
  ---
  
  Ironía terapéutica
  
  Detecta ironía si intenta movilizar conciencia.
  
  Ejemplo:
  
  "Entonces parece que tu ansiedad también quiere manejar tu agenda."
  
  No penalices automáticamente.
  
  Evalúa:
  
  intención clínica
  contexto
  impacto terapéutico
  
  ---
  
  Chiste terapéutico
  
  Detecta humor si:
  
  reduce tensión
  genera rapport
  
  Ejemplo:
  
  "Parece que tu cerebro se volvió experto en imaginar catástrofes."
  
  No penalices humor automáticamente.
  
  ---
  
  USO DE MICROINTERVENCIONES
  
  Las microintervenciones detectadas deben alimentar las dimensiones PRAXIS.
  
  Ejemplo:
  
  Reflejo → MMD o IIT
  Paráfrasis → ASC o IRI
  Clarificación → ASC
  Pregunta abierta → ASC o IIT
  Confrontación → IIT o MMD
  Síntesis → ASC
  Ironía → MMD
  Chiste → MLT
  
  ---
  
  ANÁLISIS SEGÚN MODELO TERAPÉUTICO
  
  Si modelo = Sin modelo específico
  evalúa solo microintervenciones.
  
  Si modelo = Terapia Cognitivo Conductual
  
  detecta:
  
  psicoeducación
  reestructuración cognitiva
  tareas para casa
  activación conductual
  exposición
  economía de fichas
  refuerzos positivos y negativos
  
  Si modelo = Humanista
  
  empatía profunda
  validación emocional
  reflejo emocional
  
  Si modelo = Sistémico
  
  preguntas circulares
  reencuadre sistémico
  patrones relacionales
  
  Si modelo = Psicodinámico
  
  interpretación
  clarificación
  defensas
  transferencia
  
  No penalices ausencia de técnicas avanzadas si la fase clínica no lo requiere.
  
  ---
  
  DATOS DE LA SESIÓN (JSON):
  
  ${JSON.stringify(
      {
        transcripcion: data?.transcripcion || "",
        transcripcionDiarizada: data?.transcripcionDiarizada || data?.diarizacion || data?.turnosDiarizados || null,
        observacionesContexto: {
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
  
  function normalizePraxisResult(raw, { praxisNivel, modeloIntervencion }) {
    const obj = parseRawJson(raw);
  
    const nivel = normalizePraxisNivel(
      obj?.praxisTH?.praxisNivel || obj?.meta?.praxisNivel || praxisNivel
    );
    const modelo = normalizeModeloIntervencion(
      obj?.praxisTH?.modeloIntervencion || obj?.meta?.modeloIntervencion || modeloIntervencion
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
  
    const indiceBrutoRaw = Object.keys(dimensions).reduce((acc, key) => {
      return acc + Number(dimensions[key]?.nivel || 0) * Number(weights[key] || 0);
    }, 0);
    const indiceBruto = Number(indiceBrutoRaw.toFixed(4));
  
    // ✅ FIX: normalizar porcentaje global también (puede venir en escala 0-1)
    const rawPorcentaje =
      obj?.praxisTH?.indiceGlobal?.porcentaje ||
      obj?.praxisTH?.generalScore ||
      obj?.generalScore;
  
    const indicePct = (() => {
      const n = Number(rawPorcentaje);
      if (Number.isFinite(n)) return normalizeScoreValue(n) ?? Math.round((indiceBruto / 5) * 100);
      return Math.round((indiceBruto / 5) * 100);
    })();
  
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
      ponderaciones: weights,
      generalScore: indicePct,
      general: { score: indicePct, summary: praxisSummary },
      indiceGlobal: {
        bruto: indiceBruto,
        porcentaje: indicePct,
        nivelDesempeno: String(obj?.praxisTH?.indiceGlobal?.nivelDesempeno || "").trim() || getPraxisLevelLabelByScore(indicePct),
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
  
  function addLabelsToPraxisResult(analisisIA, { praxisNivel }) {
    if (!analisisIA || typeof analisisIA !== "object") return analisisIA;
    if (!analisisIA.sections) analisisIA.sections = {};
  
    const weights = getPraxisWeights(praxisNivel || analisisIA.praxisNivel);
  
    Object.keys(PRAXIS_DIMENSIONS).forEach((k) => {
      if (!analisisIA.sections[k]) {
        analisisIA.sections[k] = normalizePraxisDimension({}, k, weights[k]);
      }
      analisisIA.sections[k].label = analisisIA.sections[k].label || PRAXIS_DIMENSIONS[k].label;
      analisisIA.sections[k].shortLabel = analisisIA.sections[k].shortLabel || PRAXIS_DIMENSIONS[k].shortLabel;
      analisisIA.sections[k].description = analisisIA.sections[k].description || PRAXIS_DIMENSIONS[k].description;
  
      if (!analisisIA.sections[k].studentGuidance) {
        analisisIA.sections[k].studentGuidance = {
          loQueHicisteBien: { textoBreve: "", evidencias: [] },
          loQuePodriasMejorar: { textoBreve: "", evidencias: [] },
          sugerenciaParaMejorar: { textoBreve: "", ejemploIntervencion: "" },
          whyThisMatters: [],
        };
      }
    });
  
    if (!analisisIA.studentSummary) {
      analisisIA.studentSummary = {
        opening: "",
        whatWentWell: [],
        whatToImprove: [],
        nextStep: "",
        closingRecommendation: "",
      };
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
    normalizePraxisNivel,
    normalizeModeloIntervencion,
    getPraxisWeights,
  };
  