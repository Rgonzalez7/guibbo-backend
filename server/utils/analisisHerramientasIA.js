const { registerPrompt, getPrompt, render } = require("./promptStore");
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
      diagnostico: {
        diagnosticoEstudiante: data?.diagnosticoFinal || data?.diagnostico || "",
        justificacion: data?.diagnosticoJustificacion || "",
        trastornoConfigurado: data?.trastorno || "",
      },
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
  
  /* =======================================================
     VERIFICACIÓN DE EVIDENCIA CONTRA LO QUE LLENÓ EL ESTUDIANTE
     Una cita solo cuenta si aparece en el texto de ESA sección.
  ======================================================= */

  // Con true, una sección sin evidencia verificada no supera SCORE_MAX_SIN_EVIDENCIA.
  /* El diagnóstico no se puntúa como los demás instrumentos: ahí lo que
     importa es si acertó, no cómo redactó. El modelo evaluaba las tres
     métricas genéricas y un acierto podía quedarse en 40.

     El reparto se calcula en código para que sea previsible: dos
     estudiantes que acierten no pueden separarse 35 puntos según cómo
     escriban. */
  const PESO_ACIERTO_DIAGNOSTICO = 60;
  const PESO_JUSTIFICACION_DIAGNOSTICO = 40;

  const PENALIZAR_SIN_EVIDENCIA = false;
  const SCORE_MAX_SIN_EVIDENCIA = 70;
  const MIN_EVIDENCIAS_POR_HERRAMIENTA = 1;

  function normalizarTextoParaMatch(t) {
    return String(t || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9ñ\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Aplana el payload de una herramienta (string, objeto anidado o array)
   * a un único texto normalizado con el que contrastar las citas.
   */
  function aplanarPayloadHerramienta(payload) {
    const partes = [];
    const walk = (v) => {
      if (v == null) return;
      if (typeof v === "string" || typeof v === "number") { partes.push(String(v)); return; }
      if (Array.isArray(v)) { v.forEach(walk); return; }
      if (typeof v === "object") { Object.values(v).forEach(walk); return; }
    };
    walk(payload);
    return normalizarTextoParaMatch(partes.join(" "));
  }

  function verificarCitaEnTexto(quote, textoNorm) {
    const q = normalizarTextoParaMatch(quote);
    if (!q || !textoNorm) return false;
    if (textoNorm.includes(q)) return true;
    const palabras = q.split(" ").filter((w) => w.length > 3);
    if (!palabras.length) return false;
    const hit = palabras.filter((w) => textoNorm.includes(w)).length;
    return hit / palabras.length >= 0.8;
  }

  function normalizeEvidence(rawEvidence, textoNorm = "") {
    let evidence = rawEvidence || [];
    if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];
    return evidence
      .map((ev) => {
        const quote = String(ev?.quote || ev?.cita || "").trim();
        return {
          quote,
          why: String(ev?.why || ev?.porque || ev?.reason || "").trim(),
          // null = no se pudo comprobar (sección sin contenido de referencia)
          verificada: textoNorm ? verificarCitaEnTexto(quote, textoNorm) : null,
        };
      })
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
  
  function normalizeToolBlock(rawBlock, key, textoNorm = "") {
    const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};
    const metrics = normalizeMetrics(base.metrics || base.criterios || base.items || base.subScores);
    let score =
      safeInt(base.score ?? base.generalScore ?? base.puntuacion ?? base.puntaje) ??
      (() => {
        const metricScores = metrics.map((m) => Number(m?.score)).filter((n) => Number.isFinite(n));
        if (!metricScores.length) return 0;
        return Math.round(metricScores.reduce((a, b) => a + b, 0) / metricScores.length);
      })();
  
    const evidence = normalizeEvidence(
      base.evidence || base.evidencia || base.quotes,
      textoNorm
    );
    const verificadas = evidence.filter((e) => e.verificada === true).length;

    const evidenceStatus = {
      total: evidence.length,
      verificadas,
      noVerificadas: evidence.filter((e) => e.verificada === false).length,
      comprobable: Boolean(textoNorm),
      // Sin contenido en la sección no tiene sentido exigir citas.
      seccionVacia: !textoNorm,
      suficiente: evidence.length >= MIN_EVIDENCIAS_POR_HERRAMIENTA,
      respaldada: textoNorm
        ? verificadas >= MIN_EVIDENCIAS_POR_HERRAMIENTA
        : true,
    };

    if (PENALIZAR_SIN_EVIDENCIA && !evidenceStatus.respaldada) {
      score = Math.min(score, SCORE_MAX_SIN_EVIDENCIA);
    }

    return {
      key,
      label: TOOL_LABELS[key] || key,
      description: "",
      score,
      metrics,
      recommendations: normalizeRecommendations(base.recommendations || base.recomendaciones || base.tips),
      evidence,
      evidenceStatus,
      studentGuidance: normalizeToolStudentGuidance(base.studentGuidance),
    };
  }
  
  function buildHerramientasPrompt({ herramientas, data }) {
    const toolKeys = normalizeToolKeys(herramientas);
    const toolList = toolKeys.map((k) => ({ key: k, label: TOOL_LABELS[k] || k }));
    const toolPayloads = buildToolPayloads(data, herramientas);
  
    const base = render(getPrompt("analisis.herramientas"), {
      esquemaHerramientas: toolList
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
          .join(","),
      instruccionDiagnostico: "",
      datosHerramientasJson: JSON.stringify(
      {
        herramientas: toolPayloads,
        contexto: {
          tipoRole: data?.tipoRole || "",
          trastorno: data?.trastorno || "",
        },
      },
      null,
      2
    ),
    }).trim();

    /* La instrucción del diagnóstico se añade DESPUÉS de renderizar.
       Si el prompt se editó desde el panel de súper usuario, la versión
       guardada en base no tiene el marcador y la regla se perdía sin
       que nada lo avisara. */
    const reglaDiagnostico = toolKeys.includes("diagnostico")
        ? `
REGLA ESPECIAL PARA LA HERRAMIENTA "diagnostico"
El ejercicio se configuró con un trastorno concreto que el estudiante NUNCA vio:
tenía que deducirlo de la sesión. En el payload viene como
herramientas.diagnostico.trastornoConfigurado.

Para esa herramienta, además de los campos normales, devolvé:

  "comparacionDiagnostico": {
    "diagnosticoEstudiante": "lo que eligió el estudiante, tal cual",
    "diagnosticoCorrecto": "el nombre clínico completo del trastorno configurado, no la clave interna",
    "acierto": true,
    "notaJustificacion": 0,
    "retroalimentacion": ""
  }

- acierto es true si el diagnóstico del estudiante corresponde al trastorno
  configurado, aunque lo haya nombrado distinto (siglas, sinónimos, el nombre
  DSM-5 completo). Es false si señaló otro cuadro.
- Si acertó, la retroalimentación reconoce el acierto y señala qué elementos
  de la sesión lo sostienen, apoyándote en su justificación.
- Si falló, explica en dos o tres frases por qué el cuadro correcto era otro:
  qué señales de la sesión apuntaban ahí y qué lo pudo desviar. Sin reproches.
- notaJustificacion (0 a 100) mide SOLO la calidad del razonamiento con que
  el estudiante sostiene su diagnóstico: si conecta lo observado en la sesión
  con criterios clínicos y si descarta otros cuadros. Una justificación vacía
  o del tipo "porque sí" es 0. No mezcles aquí si acertó o no.
- No devuelvas "score" para esta herramienta: la nota se calcula aparte.
`
        : "";

    return reglaDiagnostico ? `${base}\n\n${reglaDiagnostico}` : base;
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
  
  function normalizeHerramientasResult(raw, { herramientas, data }) {
    const obj = parseRawJson(raw);
    const toolKeys = normalizeToolKeys(herramientas);

    // Lo que el estudiante llenó en cada herramienta. Es el texto contra el
    // que se verifican las citas. Si no llega `data`, no se verifica nada
    // y todo se comporta como antes.
    const payloads = data ? buildToolPayloads(data, herramientas) : {};
    const textosPorHerramienta = {};
    for (const k of toolKeys) {
      textosPorHerramienta[k] = data ? aplanarPayloadHerramienta(payloads[k]) : "";
    }

    const tools = {};
    toolKeys.forEach((k) => {
      const rawTool =
        obj?.evaluacionHerramientas?.tools?.[k] ||
        obj?.tools?.[k] ||
        obj?.herramientas?.[k] ||
        obj?.[k] ||
        null;
      tools[k] = normalizeToolBlock(rawTool, k, textosPorHerramienta[k] || "");

      /* El diagnóstico se muestra como un cara a cara entre lo que puso el
         estudiante y el trastorno configurado, así que su comparación se
         guarda aparte y no como una métrica más. */
      if (k === "diagnostico") {
        const comp =
          rawTool?.comparacionDiagnostico ||
          obj?.evaluacionHerramientas?.comparacionDiagnostico ||
          obj?.comparacionDiagnostico ||
          null;

        const puesto = String(
          comp?.diagnosticoEstudiante ||
            payloads?.diagnostico?.diagnosticoEstudiante ||
            ""
        ).trim();

        const correcto = String(
          comp?.diagnosticoCorrecto || payloads?.diagnostico?.trastornoConfigurado || ""
        ).trim();

        const justificacion = String(payloads?.diagnostico?.justificacion || "").trim();
        // Sin diagnóstico no hay acierto posible, diga lo que diga el modelo.
        const acierto = puesto ? Boolean(comp?.acierto) : false;

        /* La calidad de la justificación sí la juzga el modelo: es lo que
           sabe hacer. Se toma su nota y se reescala al peso que le toca. */
        const notaJustificacion = justificacion
          ? safeInt(
              comp?.notaJustificacion ??
                tools[k].metrics.find((m) => m.key === "coherencia")?.score ??
                tools[k].score
            ) ?? 0
          : 0;

        const puntosAcierto = acierto ? PESO_ACIERTO_DIAGNOSTICO : 0;
        const puntosJustificacion = Math.round(
          (notaJustificacion / 100) * PESO_JUSTIFICACION_DIAGNOSTICO
        );

        tools[k].score = Math.max(0, Math.min(100, puntosAcierto + puntosJustificacion));

        // Las métricas genéricas no describen lo que se evaluó aquí.
        tools[k].metrics = [
          {
            key: "acierto",
            label: "Acierto diagnóstico",
            score: acierto ? 100 : 0,
            icon: null,
          },
          {
            key: "justificacion",
            label: "Justificación clínica",
            score: notaJustificacion,
            icon: null,
          },
        ];

        tools[k].comparacionDiagnostico = {
          diagnosticoEstudiante: puesto,
          diagnosticoCorrecto: correcto,
          acierto,
          retroalimentacion: String(comp?.retroalimentacion || "").trim(),
          justificacion,
          desglose: {
            acierto: puntosAcierto,
            aciertoMax: PESO_ACIERTO_DIAGNOSTICO,
            justificacion: puntosJustificacion,
            justificacionMax: PESO_JUSTIFICACION_DIAGNOSTICO,
          },
        };
      }
    });
  
    /* La nota global es el promedio de las herramientas que se muestran.
       Antes se tomaba la que devolvía el modelo, y desde que el diagnóstico
       se recalcula en código las dos dejaron de coincidir: con una sola
       herramienta que sacaba 60, la global salía 20. */
    const toolScores = Object.values(tools)
      .map((x) => Number(x?.score))
      .filter((n) => Number.isFinite(n));

    const toolGlobalScore = toolScores.length
      ? Math.round(toolScores.reduce((a, b) => a + b, 0) / toolScores.length)
      : safeInt(
          obj?.evaluacionHerramientas?.generalScore ||
            obj?.evaluacionHerramientas?.general?.score
        ) ?? 0;
  
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
      evidenciaResumen: {
        comprobable: Boolean(data),
        herramientasSinEvidencia: Object.values(tools)
          .filter((t) => !t.evidenceStatus?.suficiente && !t.evidenceStatus?.seccionVacia)
          .map((t) => t.key),
        herramientasSinRespaldo: Object.values(tools)
          .filter((t) => !t.evidenceStatus?.respaldada)
          .map((t) => t.key),
        herramientasVacias: Object.values(tools)
          .filter((t) => t.evidenceStatus?.seccionVacia)
          .map((t) => t.key),
        citasTotales: Object.values(tools).reduce((a, t) => a + (t.evidenceStatus?.total || 0), 0),
        citasVerificadas: Object.values(tools).reduce((a, t) => a + (t.evidenceStatus?.verificadas || 0), 0),
        penalizacionActiva: PENALIZAR_SIN_EVIDENCIA,
      },
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
    aplanarPayloadHerramienta,
    verificarCitaEnTexto,
    TOOL_LABELS,
  };
  

/* =========================================================
   Prompt editable desde el panel de súper usuario
   clave: analisis.herramientas
========================================================= */
const PROMPT_ANALISIS_HERRAMIENTAS = `
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
        {{esquemaHerramientas}}
      }
    },
    "meta": {}
  }
  
  REGLAS DE SALIDA
  
  Responde SOLO JSON válido.
  No agregues texto fuera del JSON.
  Evalúa ÚNICAMENTE el contenido de las secciones del expediente clínico proporcionadas.
  No inventes contenido clínico.
  
  ---
  
  CRITERIOS DE EVALUACIÓN POR SECCIÓN DEL EXPEDIENTE CLÍNICO
  
  Cada sección del expediente clínico se evalúa en tres ejes (score 0–100 cada uno):
  
  coherencia   — ¿La información es clínicamente consistente y no contradictoria?
  redaccion    — ¿Está redactada con lenguaje técnico apropiado?
  alineacion   — ¿Es coherente con la transcripción de la sesión proporcionada?
  
  El score general de cada sección del expediente clínico es el promedio de sus tres métricas.
  El generalScore es el promedio de todos los scores de las secciones del expediente clínico.
  
  ---
  
  REGLA FUNDAMENTAL
  
  Evalúa únicamente lo observable en los datos proporcionados.
  
  Si una sección del expediente clínico está vacía o incompleta: indícalo en recommendations y penaliza proporcionalmente.
  Si una sección del expediente clínico está bien elaborada: reconócelo en studentGuidance.whatWentWell.
  No inventes información que no esté en los datos.
  
  ---
  
  🚨 EVIDENCIA OBLIGATORIA POR SECCIÓN (CRÍTICO)
  
  Cada sección evaluada DEBE incluir entre 1 y 3 entradas en "evidence".
  
  Cada entrada debe tener:
  
  - "quote": fragmento TEXTUAL de lo que el estudiante escribió en ESA
    sección, copiado literalmente, de entre 4 y 40 palabras.
  - "why": por qué ese fragmento justifica el score de esa sección,
    en una o dos frases.
  
  REGLAS ESTRICTAS:
  
  1. NO inventes citas. Cada "quote" debe existir palabra por palabra en
     el contenido de esa sección. Las citas se verifican automáticamente.
  2. La cita debe salir de la MISMA sección que estás evaluando. No cites
     el historial clínico para justificar el score del examen mental.
  3. NO parafrasees dentro de "quote". La interpretación va en "why".
  4. Cuando el problema sea una ausencia (falta un apartado, no se registró
     un dato), cita el fragmento incompleto o mal formulado que sí existe
     y explica en "why" qué falta.
  5. Si la sección está COMPLETAMENTE VACÍA, deja "evidence" como array
     vacío, asigna score bajo y explícalo en "recommendations". No inventes
     una cita para rellenar.
  
  PROHIBIDO:
  
  - Comentarios genéricos aplicables a cualquier expediente
  - Frases como "la redacción es adecuada" sin el fragmento que lo muestra
  - Citar texto que no escribió el estudiante
  
  Un score sin cita que lo respalde es un score inválido.
  
  ---
  {{instruccionDiagnostico}}
  ---
  
  DATOS DE LAS SECCIONES DEL EXPEDIENTE CLÍNICO (JSON):
  
  {{datosHerramientasJson}}
  `;

registerPrompt({
  clave: "analisis.herramientas",
  nombre: "Evaluación de herramientas clínicas",
  categoria: "Análisis de expediente",
  descripcion: "Evalúa la calidad de los instrumentos del expediente clínico completados por el estudiante.",
  variables: ['datosHerramientasJson', 'esquemaHerramientas', 'instruccionDiagnostico'],
  defecto: PROMPT_ANALISIS_HERRAMIENTAS,
});
