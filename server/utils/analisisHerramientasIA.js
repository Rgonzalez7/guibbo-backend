// server/utils/analisisHerramientasIA.js
// =========================================================
// Evaluación de Herramientas Clínicas — analiza la calidad
// de los instrumentos completados por el estudiante.
// NO evalúa la transcripción de la sesión.
// =========================================================

function safeInt(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return null;
    return Math.max(0, Math.min(100, Math.round(x)));
  }
  
  const TOOL_LABELS = {
    manejoExpediente: "Manejo de expediente",
    ficha: "Ficha técnica",
    hc: "Historial clínico",
    examen: "Examen mental",
    convergencia: "Cuadro de convergencia",
    hipotesis: "Hipótesis diagnóstica",
    diagnostico: "Diagnóstico final",
    pruebas: "Pruebas",
    interpretacion: "Interpretación",
    recomendaciones: "Recomendaciones",
    anexos: "Anexos",
    plan: "Plan de intervención",
  };
  
  function normalizeHerramientas(herramientasRaw) {
    if (herramientasRaw && typeof herramientasRaw === "object" && !Array.isArray(herramientasRaw)) {
      return herramientasRaw;
    }
    if (Array.isArray(herramientasRaw)) {
      const out = {};
      for (const k of herramientasRaw) {
        if (typeof k === "string" && k.trim()) out[k.trim()] = true;
      }
      return out;
    }
    return {};
  }
  
  function normalizeToolKeys(herramientas) {
    const h = normalizeHerramientas(herramientas);
    return Object.keys(h).filter((k) => h[k] === true);
  }
  
  function buildToolPayloads(data = {}, herramientas = {}) {
    const toolKeys = normalizeToolKeys(herramientas);
    const map = {
      manejoExpediente: data?.manejoExpediente || data?.expediente || "",
      ficha: data?.fichaTecnica || data?.ficha || {},
      hc: data?.historialClinico || data?.hc || {},
      examen: data?.examenMental || data?.estadoMental || data?.mentalStatusExam || {},
      convergencia: data?.convergencia || [],
      hipotesis: data?.hipotesis || data?.hipotesisDiagnostica || "",
      diagnostico: data?.diagnosticoFinal || data?.diagnostico || "",
      pruebas: {
        pruebaTranscripcion: data?.pruebaTranscripcion || data?.transcripcionPrueba || data?.transcripcionDePrueba || "",
        pruebasRespuestas: data?.pruebasRespuestas || {},
        pruebaNombre: data?.pruebaNombre || "",
        pruebaCategoria: data?.pruebaCategoria || "",
        pruebaTestId: data?.pruebaTestId || "",
      },
      interpretacion: data?.interpretacionPrueba || data?.interpretacionDePrueba || data?.interpretacionPruebas || "",
      recomendaciones: data?.recomendaciones || "",
      anexos: data?.anexos || "",
      plan: data?.planIntervencionAgenda || data?.agendaIntervencion || data?.planIntervencion || data?.planAgenda || [],
    };
    const out = {};
    for (const k of toolKeys) out[k] = map[k] ?? null;
    return out;
  }
  
  function normalizeRecommendations(rawRec) {
    let rec = rawRec || [];
    if (!Array.isArray(rec)) rec = rec ? [rec] : [];
    return rec.map((x) => String(x || "").trim()).filter(Boolean);
  }
  
  function normalizeMetrics(rawMetrics) {
    let metrics = rawMetrics || [];
    if (metrics && !Array.isArray(metrics) && typeof metrics === "object") {
      metrics = Object.entries(metrics).map(([k, v]) => ({ key: k, label: String(k), score: safeInt(v) }));
    }
    if (!Array.isArray(metrics)) metrics = [];
    return metrics
      .map((m, i) => ({
        key: m?.key || `m${i + 1}`,
        label: String(m?.label || m?.nombre || `Criterio ${i + 1}`),
        score: safeInt(m?.score),
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
        why: String(ev?.why || ev?.porque || ev?.reason || "").trim(),
      }))
      .filter((ev) => ev.quote);
  }
  
  function normalizeHowToImprove(rawList) {
    let items = rawList || [];
    if (!Array.isArray(items)) items = items ? [items] : [];
    return items
      .map((it) => ({
        explanation: String(it?.explanation || it?.explicacion || it?.how || "").trim(),
        example: String(it?.example || it?.ejemplo || "").trim(),
      }))
      .filter((it) => it.explanation || it.example);
  }
  
  function normalizeToolStudentGuidance(rawGuidance) {
    const g = rawGuidance && typeof rawGuidance === "object" ? rawGuidance : {};
    return {
      whatWentWell: normalizeRecommendations(g.whatWentWell || g.fortalezas || g.good || g.wellDone),
      whatToImprove: normalizeRecommendations(g.whatToImprove || g.areasMejora || g.improve || g.toImprove),
      howToImprove: normalizeHowToImprove(g.howToImprove || g.comoMejorar || g.guidance || g.examples),
    };
  }
  
  function normalizeToolBlock(rawBlock, key) {
    const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};
    const metrics = normalizeMetrics(base.metrics || base.criterios || base.items || base.subScores);
    const score =
      safeInt(base.score ?? base.generalScore ?? base.puntuacion ?? base.puntaje) ??
      (() => {
        const metricScores = metrics.map((m) => Number(m?.score)).filter((n) => Number.isFinite(n));
        if (!metricScores.length) return 0;
        return Math.round(metricScores.reduce((a, b) => a + b, 0) / metricScores.length);
      })();
  
    return {
      key,
      label: TOOL_LABELS[key] || key,
      description: "",
      score,
      metrics,
      recommendations: normalizeRecommendations(base.recommendations || base.recomendaciones || base.tips),
      evidence: normalizeEvidence(base.evidence || base.evidencia || base.quotes),
      studentGuidance: normalizeToolStudentGuidance(base.studentGuidance),
    };
  }
  
  function buildHerramientasPrompt({ herramientas, data }) {
    const toolKeys = normalizeToolKeys(herramientas);
    const toolList = toolKeys.map((k) => ({ key: k, label: TOOL_LABELS[k] || k }));
    const toolPayloads = buildToolPayloads(data, herramientas);
  
    return `
  Devuelve SOLO JSON válido con esta estructura EXACTA:
  
  {
    "evaluacionHerramientas": {
      "generalScore": 0,
      "general": {
        "score": 0,
        "summary": ""
      },
      "studentSummary": {
        "whatWentWell": [""],
        "whatToImprove": [""],
        "howToImprove": [
          { "explanation": "", "example": "" }
        ]
      },
      "tools": {
        ${toolList
          .map(
            (t) => `
        "${t.key}": {
          "score": 0,
          "metrics": [
            { "key": "coherencia", "label": "Coherencia clínica", "score": 0 },
            { "key": "redaccion", "label": "Redacción técnica", "score": 0 },
            { "key": "alineacion", "label": "Alineación con transcripción", "score": 0 }
          ],
          "recommendations": [""],
          "evidence": [ { "quote": "", "why": "" } ],
          "studentGuidance": {
            "whatWentWell": [""],
            "whatToImprove": [""],
            "howToImprove": [
              { "explanation": "", "example": "" }
            ]
          }
        }`
          )
          .join(",")}
      }
    },
    "meta": {}
  }
  
  REGLAS DE SALIDA
  
  Responde SOLO JSON válido.
  No agregues texto fuera del JSON.
  Evalúa ÚNICAMENTE el contenido de las herramientas clínicas proporcionadas.
  No inventes contenido clínico.
  
  ---
  
  CRITERIOS DE EVALUACIÓN POR HERRAMIENTA
  
  Cada herramienta se evalúa en tres ejes (score 0–100 cada uno):
  
  coherencia   — ¿La información es clínicamente consistente y no contradictoria?
  redaccion    — ¿Está redactada con lenguaje técnico apropiado?
  alineacion   — ¿Es coherente con la transcripción de la sesión proporcionada?
  
  El score general de cada herramienta es el promedio de sus tres métricas.
  El generalScore es el promedio de todos los scores de herramientas.
  
  ---
  
  REGLA FUNDAMENTAL
  
  Evalúa únicamente lo observable en los datos proporcionados.
  
  Si una herramienta está vacía o incompleta: indícalo en recommendations y penaliza proporcionalmente.
  Si una herramienta está bien elaborada: reconócelo en studentGuidance.whatWentWell.
  No inventes información que no esté en los datos.
  
  ---
  
  DATOS DE LAS HERRAMIENTAS CLÍNICAS (JSON):
  
  ${JSON.stringify(
      {
        herramientas: toolPayloads,
        contexto: {
          tipoRole: data?.tipoRole || "",
          trastorno: data?.trastorno || "",
        },
      },
      null,
      2
    )}
  `.trim();
  }
  
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
  
  function normalizeHerramientasResult(raw, { herramientas }) {
    const obj = parseRawJson(raw);
    const toolKeys = normalizeToolKeys(herramientas);
  
    const tools = {};
    toolKeys.forEach((k) => {
      const rawTool =
        obj?.evaluacionHerramientas?.tools?.[k] ||
        obj?.tools?.[k] ||
        obj?.herramientas?.[k] ||
        obj?.[k] ||
        null;
      tools[k] = normalizeToolBlock(rawTool, k);
    });
  
    const toolScores = Object.values(tools).map((x) => Number(x?.score)).filter((n) => Number.isFinite(n));
    const toolGlobalScore =
      safeInt(obj?.evaluacionHerramientas?.generalScore || obj?.evaluacionHerramientas?.general?.score) ??
      (toolScores.length ? Math.round(toolScores.reduce((a, b) => a + b, 0) / toolScores.length) : 0);
  
    return {
      tipo: "evaluacion_herramientas",
      generalScore: toolGlobalScore,
      general: {
        score: toolGlobalScore,
        summary: String(obj?.evaluacionHerramientas?.general?.summary || "").trim(),
      },
      studentSummary: {
        whatWentWell: normalizeRecommendations(obj?.evaluacionHerramientas?.studentSummary?.whatWentWell),
        whatToImprove: normalizeRecommendations(obj?.evaluacionHerramientas?.studentSummary?.whatToImprove),
        howToImprove: normalizeHowToImprove(obj?.evaluacionHerramientas?.studentSummary?.howToImprove),
      },
      tools,
      meta: { tipo: "evaluacion_herramientas", createdAt: new Date().toISOString() },
    };
  }
  
  function addLabelsToHerramientasResult(evaluacionHerramientas, { herramientas }) {
    if (!evaluacionHerramientas || typeof evaluacionHerramientas !== "object") return evaluacionHerramientas;
    if (!evaluacionHerramientas.tools) evaluacionHerramientas.tools = {};
  
    const toolKeys = normalizeToolKeys(herramientas);
    toolKeys.forEach((k) => {
      if (!evaluacionHerramientas.tools[k]) {
        evaluacionHerramientas.tools[k] = normalizeToolBlock({}, k);
      }
      evaluacionHerramientas.tools[k].label = evaluacionHerramientas.tools[k].label || TOOL_LABELS[k] || k;
      if (!evaluacionHerramientas.tools[k].description) evaluacionHerramientas.tools[k].description = "";
      if (!evaluacionHerramientas.tools[k].studentGuidance) {
        evaluacionHerramientas.tools[k].studentGuidance = { whatWentWell: [], whatToImprove: [], howToImprove: [] };
      }
    });
  
    return evaluacionHerramientas;
  }
  
  module.exports = {
    buildHerramientasPrompt,
    normalizeHerramientasResult,
    addLabelsToHerramientasResult,
    normalizeToolKeys,
    buildToolPayloads,
    TOOL_LABELS,
  };
  