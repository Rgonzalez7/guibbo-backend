// server/utils/analisisRolePlayIA.js

function clampText(text, max = 12000) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n[...texto recortado para análisis...]";
}

/* =========================================================
   ✅ PRAXIS-TH
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

function normalizePraxisNivel(raw) {
  const v = String(raw || "").trim().toLowerCase();

  if (v === "nivel_1" || v === "nivel1" || v === "1" || v.includes("inicial")) {
    return "nivel_1";
  }
  if (
    v === "nivel_2" ||
    v === "nivel2" ||
    v === "2" ||
    v.includes("intermedio")
  ) {
    return "nivel_2";
  }
  if (v === "nivel_3" || v === "nivel3" || v === "3" || v.includes("avanzad")) {
    return "nivel_3";
  }

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

function normalizeHerramientas(herramientasRaw) {
  if (
    herramientasRaw &&
    typeof herramientasRaw === "object" &&
    !Array.isArray(herramientasRaw)
  ) {
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
    examen:
      data?.examenMental || data?.estadoMental || data?.mentalStatusExam || {},
    convergencia: data?.convergencia || [],
    hipotesis: data?.hipotesis || data?.hipotesisDiagnostica || "",
    diagnostico: data?.diagnosticoFinal || data?.diagnostico || "",
    pruebas: {
      pruebaTranscripcion:
        data?.pruebaTranscripcion ||
        data?.transcripcionPrueba ||
        data?.transcripcionDePrueba ||
        "",
      pruebasRespuestas: data?.pruebasRespuestas || {},
      pruebaNombre: data?.pruebaNombre || "",
      pruebaCategoria: data?.pruebaCategoria || "",
      pruebaTestId: data?.pruebaTestId || "",
    },
    interpretacion:
      data?.interpretacionPrueba ||
      data?.interpretacionDePrueba ||
      data?.interpretacionPruebas ||
      "",
    recomendaciones: data?.recomendaciones || "",
    anexos: data?.anexos || "",
    plan:
      data?.planIntervencionAgenda ||
      data?.agendaIntervencion ||
      data?.planIntervencion ||
      data?.planAgenda ||
      [],
  };

  const out = {};
  for (const k of toolKeys) out[k] = map[k] ?? null;
  return out;
}

/* =========================================================
   ✅ PROMPT PRAXIS-TH + HERRAMIENTAS
   - PRAXIS evalúa
   - la salida pedagógica final se resume en 3 áreas
========================================================= */

function buildRolePlayPrompt({
  praxisNivel,
  modeloIntervencion,
  herramientas,
  data,
}) {
  const nivel = normalizePraxisNivel(praxisNivel);
  const modelo = normalizeModeloIntervencion(modeloIntervencion);
  const weights = getPraxisWeights(nivel);
  const toolKeys = normalizeToolKeys(herramientas);

  const toolList = toolKeys.map((k) => ({
    key: k,
    label: TOOL_LABELS[k] || k,
  }));

  const toolPayloads = buildToolPayloads(data, herramientas);

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
          "loQueHicisteBien": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "loQuePodriasMejorar": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "sugerenciaParaMejorar": {
            "textoBreve": "",
            "ejemploIntervencion": ""
          },
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
          "loQueHicisteBien": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "loQuePodriasMejorar": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "sugerenciaParaMejorar": {
            "textoBreve": "",
            "ejemploIntervencion": ""
          },
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
          "loQueHicisteBien": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "loQuePodriasMejorar": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "sugerenciaParaMejorar": {
            "textoBreve": "",
            "ejemploIntervencion": ""
          },
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
          "loQueHicisteBien": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "loQuePodriasMejorar": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "sugerenciaParaMejorar": {
            "textoBreve": "",
            "ejemploIntervencion": ""
          },
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
          "loQueHicisteBien": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "loQuePodriasMejorar": {
            "textoBreve": "",
            "evidencias": [
              { "quote": "", "explanation": "" }
            ]
          },
          "sugerenciaParaMejorar": {
            "textoBreve": "",
            "ejemploIntervencion": ""
          },
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
  "meta": {
    "praxisNivel": ${JSON.stringify(nivel)},
    "modeloIntervencion": ${JSON.stringify(modelo)}
  }
}

REGLAS DE SALIDA:
- Responde SOLO JSON válido.
- No incluyas markdown, explicaciones, ni texto fuera del JSON.
- Todos los scores deben ser enteros entre 0 y 100.
- Todos los niveles PRAXIS deben ser enteros entre 1 y 5.
- Usa evidencia textual exacta de la transcripción cuando exista.
- Si no hay evidencia suficiente, dilo explícitamente y baja la puntuación.
- NO inventes contenido clínico que no esté presente en la transcripción o en las herramientas.
- La salida debe sonar como supervisión formativa, no como juicio punitivo.
- La retroalimentación debe ayudar al estudiante a comprender qué hizo, qué debe ajustar y cómo puede mejorar de forma concreta.

MARCO METODOLÓGICO OBLIGATORIO:
PRAXIS-TH es un método estructurado de entrenamiento clínico orientado al desarrollo progresivo de la competencia clínica.
Debes tratarlo como un marco formativo basado en:
1. dimensiones observables,
2. ponderaciones paramétricas,
3. evidencia textual,
4. progresión de desempeño,
5. retroalimentación formativa.
NO lo trates como una certificación profesional.
NO sustituyas la supervisión humana.
Tu tarea es producir retroalimentación técnica, clara, pedagógica y accionable.

TAREA 1 — EVALUACIÓN PRAXIS-TH:
Debes evaluar SOLO estas 5 dimensiones:
- ASC: Análisis Secuencial Conversacional
- IIT: Intencionalidad de la Intervención Terapéutica
- IRI: Integración de Referencias Internas
- MMD: Movilización Micro-Dinámica
- MLT: Manejo del Límite Terapéutico

PONDERACIONES PARA ESTE CASO:
- ASC = ${weights.ASC}
- IIT = ${weights.IIT}
- IRI = ${weights.IRI}
- MMD = ${weights.MMD}
- MLT = ${weights.MLT}

DEFINICIÓN OPERATIVA DE CADA DIMENSIÓN:
- ASC: analiza si la conversación tiene secuencia clínica clara, continuidad temática, transiciones comprensibles, escucha conectada con la respuesta y cierre parcial de bloques.
- IIT: analiza si las intervenciones del terapeuta tienen dirección clínica reconocible, propósito terapéutico y sentido dentro del proceso.
- IRI: analiza si el terapeuta retoma e integra elementos previos que el paciente ya había dicho, mostrando continuidad y elaboración.
- MMD: analiza si el terapeuta logra pequeños movimientos clínicos dentro de la sesión, como ampliar conciencia, matizar emociones, abrir perspectiva o facilitar insight.
- MLT: analiza el manejo del encuadre, el rol terapéutico, los límites conversacionales y la consistencia profesional.

CÓMO EVALUAR PRAXIS-TH:
- "nivel" = nivel de desempeño de 1 a 5 según PRAXIS-TH.
- "score" = traducción porcentual del desempeño de esa dimensión (0..100).
- Evalúa con base en la transcripción clínica del estudiante.
- La retroalimentación debe sustentarse en evidencia textual observable.
- Si la diarización no es perfecta, infiere el rol terapéutico por intención, estructura clínica, preguntas, validaciones, reformulaciones, encuadre y manejo del proceso.
- Si hay modelo de intervención configurado, úsalo como lente de ajuste clínico e interpretativo, pero NO cambies las 5 dimensiones PRAXIS-TH ni sus ponderaciones base.
- El índice global debe integrarse a partir de las dimensiones, pero NO debe reemplazar el análisis detallado por dimensión.
- El resumen global debe ser formativo, técnico y claro.

GUÍA DE NIVELES:
- 1 = Incipiente
- 2 = Básico
- 3 = Competente
- 4 = Avanzado
- 5 = Estratégico

REGLAS PEDAGÓGICAS OBLIGATORIAS PARA PRAXIS-TH:
Para cada dimensión debes explicar SIEMPRE tres cosas:
1. qué hizo bien el estudiante,
2. qué podría mejorar,
3. cómo podría intervenir mejor la próxima vez.

IMPORTANTE:
- La metodología sigue siendo PRAXIS-TH.
- Pero la respuesta pedagógica final debe resumirse SOLO en estas 3 áreas:
  1. "loQueHicisteBien"
  2. "loQuePodriasMejorar"
  3. "sugerenciaParaMejorar"
- NO uses "whatWentWell", "whatToImprove" ni "howToImprove" dentro de cada dimensión PRAXIS.
- Esas 3 áreas no son una traducción posterior: son la forma principal de salida pedagógica.
- Debes escribir como si estuvieras ayudando al estudiante a entender su desempeño sin abrumarlo con tecnicismos.
- Mantén precisión clínica, pero expresa el aprendizaje de forma clara.

FORMATO OBLIGATORIO DE "studentGuidance" EN CADA DIMENSIÓN:
- "loQueHicisteBien":
  - "textoBreve": resumen breve, claro y humano de lo que hizo bien.
  - "evidencias": devuelve 2 evidencias siempre que exista base suficiente en la transcripción, si existen.
  - Cada evidencia debe tener:
    - "quote": cita exacta breve de la sesión.
    - "explanation": explicación breve de por qué eso estuvo bien.
- "loQuePodriasMejorar":
  - "textoBreve": resumen breve, claro y humano de lo que podría mejorar.
  - "evidencias": devuelve 2 evidencias siempre que exista base suficiente en la transcripción, si existen.
  - Cada evidencia debe tener:
    - "quote": cita exacta breve de la sesión.
    - "explanation": explicación breve de por qué eso podría mejorar.
- "sugerenciaParaMejorar":
  - "textoBreve": consejo breve y accionable.
  - "ejemploIntervencion": un solo ejemplo claro, breve y clínicamente realista de cómo sonaría una mejor intervención.
- "whyThisMatters": una lista breve explicando por qué esto importa clínicamente.

ESTILO OBLIGATORIO DE REDACCIÓN PEDAGÓGICA:
- Habla como supervisor formativo.
- Evita frases frías, abstractas o excesivamente técnicas sin explicación.
- Convierte observación técnica en aprendizaje práctico.
- No digas solo “fortalece X” o “mejora Y”.
- Explica brevemente por qué y muestra cómo.
- Si propones mejora, intenta añadir ejemplo clínico breve y realista.
- No repitas ideas innecesariamente.
- No pongas listas largas.
- No des más de 2 evidencias por bloque.
- Si no hay evidencia suficiente, deja una sola evidencia explicando que la base observacional fue limitada.

EJEMPLO DEL FORMATO ESPERADO EN studentGuidance:
{
  "loQueHicisteBien": {
    "textoBreve": "En varios momentos lograste mantener una secuencia clara en la conversación y ayudar al paciente a profundizar en su experiencia.",
    "evidencias": [
      {
        "quote": "Antes de empezar con lo que te trae por aquí, me gustaría explicarte brevemente cómo funciona este espacio para que te sientas más cómoda.",
        "explanation": "Esta intervención organiza el inicio de la sesión y ayuda a establecer un marco claro para la conversación."
      }
    ]
  },
  "loQuePodriasMejorar": {
    "textoBreve": "En algunos momentos la conversación cambió de tema rápidamente sin cerrar completamente lo que el paciente estaba expresando.",
    "evidencias": [
      {
        "quote": "¿Y eso cuándo empezó exactamente?",
        "explanation": "La pregunta ayuda a precisar información, pero se cambió de tema sin cerrar la idea anterior que el paciente estaba explicando."
      }
    ]
  },
  "sugerenciaParaMejorar": {
    "textoBreve": "Cuando sientas que una idea importante ya fue explorada, intenta resumirla antes de pasar a un nuevo tema.",
    "ejemploIntervencion": "Entonces, lo que estoy escuchando es que desde ese momento empezaste a sentir más presión. Ahora me gustaría entender cómo eso ha afectado tu vida diaria."
  },
  "whyThisMatters": [
    "Cerrar una idea antes de cambiar de tema ayuda al paciente a sentirse escuchado y da más coherencia clínica a la sesión."
  ]
}

TAREA 2 — EVALUACIÓN DE HERRAMIENTAS:
Debes evaluar las herramientas clínicas configuradas, NO por técnica terapéutica, sino por:
1. coherencia clínica interna,
2. calidad de redacción técnica,
3. alineación con la transcripción realizada.

Para cada herramienta activa:
- "score" = puntuación global de calidad.
- "metrics" = mínimo 3 métricas útiles.
- "recommendations" = 3 a 6 acciones concretas.
- "evidence" = 1 a 3 evidencias breves, usando citas o referencias exactas del material o de la transcripción.
- "studentGuidance" debe explicar:
  1. qué está bien en la herramienta,
  2. qué está débil o confuso,
  3. cómo mejorarla en redacción o coherencia clínica.

REGLAS DE HERRAMIENTAS:
- Si la herramienta contradice la transcripción, baja el score.
- Si está incompleta, poco clara o mal redactada, baja el score.
- Si está bien alineada con lo dicho en sesión y redactada técnicamente, sube el score.
- No inventes contenido faltante.
- Si una herramienta no tiene contenido suficiente, dilo claramente.
- La retroalimentación también debe ser pedagógica, no solo evaluativa.

INTERPRETACIÓN GENERAL:
- PRAXIS-TH mide desempeño conversacional clínico.
- evaluacionHerramientas mide coherencia/redacción documental según la transcripción.
- Son dos evaluaciones distintas y complementarias.

DATOS DE LA SESIÓN (JSON):
${JSON.stringify(
  {
    transcripcion: data?.transcripcion || "",
    transcripcionDiarizada:
      data?.transcripcionDiarizada ||
      data?.diarizacion ||
      data?.turnosDiarizados ||
      null,
    observacionesContexto: {
      tipoRole: data?.tipoRole || "",
      trastorno: data?.trastorno || "",
      consentimiento: data?.consentimiento || false,
      tipoConsentimiento: data?.tipoConsentimiento || "",
    },
    herramientas: toolPayloads,
  },
  null,
  2
)}
`.trim();
}

/* =========================================================
   ✅ NORMALIZADORES
========================================================= */

function normalizeMetrics(rawMetrics) {
  let metrics = rawMetrics || [];

  if (metrics && !Array.isArray(metrics) && typeof metrics === "object") {
    metrics = Object.entries(metrics).map(([k, v]) => ({
      key: k,
      label: String(k),
      score: safeInt(v),
    }));
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

function normalizeRecommendations(rawRec) {
  let rec = rawRec || [];
  if (!Array.isArray(rec)) rec = rec ? [rec] : [];
  return rec.map((x) => String(x || "").trim()).filter(Boolean);
}

function normalizeEvidence(rawEvidence, allowTechnique = true) {
  let evidence = rawEvidence || [];
  if (!Array.isArray(evidence)) evidence = evidence ? [evidence] : [];

  return evidence
    .map((ev) => ({
      quote: String(ev?.quote || ev?.cita || "").trim(),
      technique: allowTechnique
        ? String(ev?.technique || ev?.tecnica || "").trim()
        : "",
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

function normalizeHowToImprove(rawList) {
  let items = rawList || [];
  if (!Array.isArray(items)) items = items ? [items] : [];

  return items
    .map((it) => ({
      explanation: String(
        it?.explanation || it?.explicacion || it?.how || ""
      ).trim(),
      example: String(it?.example || it?.ejemplo || "").trim(),
    }))
    .filter((it) => it.explanation || it.example);
}

function normalizeStudentGuidance(rawGuidance) {
  const g = rawGuidance && typeof rawGuidance === "object" ? rawGuidance : {};

  const loQueHicisteBienRaw =
    g.loQueHicisteBien || g.goodBlock || g.strengthBlock || {};
  const loQuePodriasMejorarRaw =
    g.loQuePodriasMejorar || g.improveBlock || g.weaknessBlock || {};
  const sugerenciaParaMejorarRaw =
    g.sugerenciaParaMejorar || g.nextSuggestion || g.improvementSuggestion || {};

  return {
    loQueHicisteBien: {
      textoBreve: String(
        loQueHicisteBienRaw?.textoBreve ||
          loQueHicisteBienRaw?.text ||
          loQueHicisteBienRaw?.summary ||
          ""
      ).trim(),
      evidencias: normalizeSimpleEvidence(
        loQueHicisteBienRaw?.evidencias || loQueHicisteBienRaw?.evidence,
        2
      ),
    },
    loQuePodriasMejorar: {
      textoBreve: String(
        loQuePodriasMejorarRaw?.textoBreve ||
          loQuePodriasMejorarRaw?.text ||
          loQuePodriasMejorarRaw?.summary ||
          ""
      ).trim(),
      evidencias: normalizeSimpleEvidence(
        loQuePodriasMejorarRaw?.evidencias || loQuePodriasMejorarRaw?.evidence,
        2
      ),
    },
    sugerenciaParaMejorar: {
      textoBreve: String(
        sugerenciaParaMejorarRaw?.textoBreve ||
          sugerenciaParaMejorarRaw?.text ||
          sugerenciaParaMejorarRaw?.summary ||
          ""
      ).trim(),
      ejemploIntervencion: String(
        sugerenciaParaMejorarRaw?.ejemploIntervencion ||
          sugerenciaParaMejorarRaw?.example ||
          sugerenciaParaMejorarRaw?.ejemplo ||
          ""
      ).trim(),
    },
    whyThisMatters: normalizeRecommendations(
      g.whyThisMatters || g.porQueImporta || g.importancia || g.whyItMatters
    ),
  };
}

function normalizeToolStudentGuidance(rawGuidance) {
  const g = rawGuidance && typeof rawGuidance === "object" ? rawGuidance : {};

  return {
    whatWentWell: normalizeRecommendations(
      g.whatWentWell || g.fortalezas || g.good || g.wellDone
    ),
    whatToImprove: normalizeRecommendations(
      g.whatToImprove || g.areasMejora || g.improve || g.toImprove
    ),
    howToImprove: normalizeHowToImprove(
      g.howToImprove || g.comoMejorar || g.guidance || g.examples
    ),
    whyThisMatters: normalizeRecommendations(
      g.whyThisMatters || g.porQueImporta || g.importancia || g.whyItMatters
    ),
  };
}

function normalizePraxisDimension(rawBlock, key, weight) {
  const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};

  const nivel =
    safeLevel(base.nivel ?? base.level ?? base.desempeno ?? base.dimensionLevel) ?? 1;

  const score =
    safeInt(base.score ?? base.porcentaje ?? base.percent ?? base.generalScore) ??
    Math.round((nivel / 5) * 100);

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
    metrics: normalizeMetrics(
      base.metrics || base.criterios || base.items || base.subScores
    ),
    recommendations: normalizeRecommendations(
      base.recommendations || base.recomendaciones || base.tips
    ),
    evidence: normalizeEvidence(
      base.evidence || base.evidencia || base.quotes,
      true
    ),
    studentGuidance: normalizeStudentGuidance(base.studentGuidance),
  };
}

function normalizeToolBlock(rawBlock, key) {
  const base = rawBlock && typeof rawBlock === "object" ? rawBlock : {};

  const metrics = normalizeMetrics(
    base.metrics || base.criterios || base.items || base.subScores
  );

  const score =
    safeInt(base.score ?? base.generalScore ?? base.puntuacion ?? base.puntaje) ??
    (() => {
      const metricScores = metrics
        .map((m) => Number(m?.score))
        .filter((n) => Number.isFinite(n));
      if (!metricScores.length) return 0;
      return Math.round(
        metricScores.reduce((a, b) => a + b, 0) / metricScores.length
      );
    })();

  return {
    key,
    label: TOOL_LABELS[key] || key,
    description: "",
    score,
    metrics,
    recommendations: normalizeRecommendations(
      base.recommendations || base.recomendaciones || base.tips
    ),
    evidence: normalizeEvidence(
      base.evidence || base.evidencia || base.quotes,
      false
    ),
    studentGuidance: normalizeToolStudentGuidance(base.studentGuidance),
  };
}

function parseRawJson(raw) {
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
  return obj && typeof obj === "object" ? obj : {};
}

function normalizeAIResult(raw, { praxisNivel, modeloIntervencion, herramientas }) {
  const obj = parseRawJson(raw);

  const nivel = normalizePraxisNivel(
    obj?.praxisTH?.praxisNivel || obj?.meta?.praxisNivel || praxisNivel
  );
  const modelo = normalizeModeloIntervencion(
    obj?.praxisTH?.modeloIntervencion ||
      obj?.meta?.modeloIntervencion ||
      modeloIntervencion
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
  const indicePct =
    safeInt(
      obj?.praxisTH?.indiceGlobal?.porcentaje ||
        obj?.praxisTH?.generalScore ||
        obj?.generalScore
    ) ?? Math.round((indiceBruto / 5) * 100);

  const praxisSummary = String(
    obj?.praxisTH?.indiceGlobal?.summary ||
      obj?.praxisTH?.general?.summary ||
      obj?.general?.summary ||
      obj?.evaluacionGeneral ||
      ""
  ).trim();

  const analisisIA = {
    tipo: "praxis_th",
    praxisNivel: nivel,
    praxisNivelLabel: PRAXIS_LEVEL_LABELS[nivel],
    praxisNivelDescription: PRAXIS_LEVEL_DESCRIPTIONS[nivel] || "",
    modeloIntervencion: modelo,
    ponderaciones: weights,

    generalScore: indicePct,
    general: {
      score: indicePct,
      summary: praxisSummary,
    },

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
      whatWentWell: normalizeRecommendations(
        obj?.praxisTH?.studentSummary?.whatWentWell
      ),
      whatToImprove: normalizeRecommendations(
        obj?.praxisTH?.studentSummary?.whatToImprove
      ),
      nextStep: String(obj?.praxisTH?.studentSummary?.nextStep || "").trim(),
      closingRecommendation: String(
        obj?.praxisTH?.studentSummary?.closingRecommendation || ""
      ).trim(),
    },

    sections: dimensions,

    retroalimentacionGlobal: {
      fortalezas: normalizeRecommendations(
        obj?.praxisTH?.retroalimentacionGlobal?.fortalezas
      ),
      areasMejora: normalizeRecommendations(
        obj?.praxisTH?.retroalimentacionGlobal?.areasMejora
      ),
      recomendacionCentral: String(
        obj?.praxisTH?.retroalimentacionGlobal?.recomendacionCentral || ""
      ).trim(),
    },

    meta: {
      tipo: "praxis_th",
      model: String(obj?.meta?.model || "").trim(),
      createdAt: new Date().toISOString(),
    },
  };

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

  const toolScores = Object.values(tools)
    .map((x) => Number(x?.score))
    .filter((n) => Number.isFinite(n));

  const toolGlobalScore =
    safeInt(
      obj?.evaluacionHerramientas?.generalScore ||
        obj?.evaluacionHerramientas?.general?.score
    ) ??
    (toolScores.length
      ? Math.round(toolScores.reduce((a, b) => a + b, 0) / toolScores.length)
      : 0);

  const evaluacionHerramientas = {
    tipo: "evaluacion_herramientas",
    generalScore: toolGlobalScore,
    general: {
      score: toolGlobalScore,
      summary: String(
        obj?.evaluacionHerramientas?.general?.summary || ""
      ).trim(),
    },
    studentSummary: {
      whatWentWell: normalizeRecommendations(
        obj?.evaluacionHerramientas?.studentSummary?.whatWentWell
      ),
      whatToImprove: normalizeRecommendations(
        obj?.evaluacionHerramientas?.studentSummary?.whatToImprove
      ),
      howToImprove: normalizeHowToImprove(
        obj?.evaluacionHerramientas?.studentSummary?.howToImprove
      ),
    },
    tools,
    meta: {
      tipo: "evaluacion_herramientas",
      createdAt: new Date().toISOString(),
    },
  };

  return {
    analisisIA,
    evaluacionHerramientas,
    meta: {
      praxisNivel: nivel,
      modeloIntervencion: modelo,
      createdAt: new Date().toISOString(),
    },
  };
}

function extractRPDataFromInstance(inst) {
  const rp = inst?.respuestas?.rolePlaying || {};
  return rp?.payload || rp?.sessionData || rp?.data || {};
}

function addLabelsToResult(result, { herramientas }) {
  if (!result || typeof result !== "object") return result;

  if (!result.analisisIA) {
    result.analisisIA = normalizeAIResult(
      {},
      { praxisNivel: "nivel_1", modeloIntervencion: "", herramientas }
    ).analisisIA;
  }

  if (!result.evaluacionHerramientas) {
    result.evaluacionHerramientas = {
      tipo: "evaluacion_herramientas",
      generalScore: 0,
      general: { score: 0, summary: "" },
      studentSummary: {
        whatWentWell: [],
        whatToImprove: [],
        howToImprove: [],
      },
      tools: {},
      meta: {
        tipo: "evaluacion_herramientas",
        createdAt: new Date().toISOString(),
      },
    };
  }

  if (!result.analisisIA.studentSummary) {
    result.analisisIA.studentSummary = {
      opening: "",
      whatWentWell: [],
      whatToImprove: [],
      nextStep: "",
      closingRecommendation: "",
    };
  }

  Object.keys(PRAXIS_DIMENSIONS).forEach((k) => {
    if (!result.analisisIA.sections) result.analisisIA.sections = {};
    if (!result.analisisIA.sections[k]) {
      result.analisisIA.sections[k] = normalizePraxisDimension(
        {},
        k,
        getPraxisWeights(result.analisisIA.praxisNivel || "nivel_1")[k]
      );
    }

    result.analisisIA.sections[k].label =
      result.analisisIA.sections[k].label || PRAXIS_DIMENSIONS[k].label;
    result.analisisIA.sections[k].shortLabel =
      result.analisisIA.sections[k].shortLabel || PRAXIS_DIMENSIONS[k].shortLabel;
    result.analisisIA.sections[k].description =
      result.analisisIA.sections[k].description || PRAXIS_DIMENSIONS[k].description;

    if (!result.analisisIA.sections[k].studentGuidance) {
      result.analisisIA.sections[k].studentGuidance = {
        loQueHicisteBien: {
          textoBreve: "",
          evidencias: [],
        },
        loQuePodriasMejorar: {
          textoBreve: "",
          evidencias: [],
        },
        sugerenciaParaMejorar: {
          textoBreve: "",
          ejemploIntervencion: "",
        },
        whyThisMatters: [],
      };
    }
  });

  const toolKeys = normalizeToolKeys(herramientas);
  toolKeys.forEach((k) => {
    if (!result.evaluacionHerramientas.tools) result.evaluacionHerramientas.tools = {};
    if (!result.evaluacionHerramientas.tools[k]) {
      result.evaluacionHerramientas.tools[k] = normalizeToolBlock({}, k);
    }

    result.evaluacionHerramientas.tools[k].label =
      result.evaluacionHerramientas.tools[k].label || TOOL_LABELS[k] || k;

    if (!result.evaluacionHerramientas.tools[k].description) {
      result.evaluacionHerramientas.tools[k].description = "";
    }

    if (!result.evaluacionHerramientas.tools[k].studentGuidance) {
      result.evaluacionHerramientas.tools[k].studentGuidance = {
        whatWentWell: [],
        whatToImprove: [],
        howToImprove: [],
        whyThisMatters: [],
      };
    }
  });

  return result;
}

module.exports = {
  clampText,
  buildRolePlayPrompt,
  normalizeAIResult,
  addLabelsToResult,
  extractRPDataFromInstance,

  // opcional por si luego lo reutilizas en el front/back
  PRAXIS_DIMENSIONS,
  PRAXIS_LEVEL_LABELS,
  PRAXIS_LEVEL_DESCRIPTIONS,
  PRAXIS_WEIGHTS_BY_LEVEL,
  TOOL_LABELS,
  normalizePraxisNivel,
  normalizeModeloIntervencion,
  getPraxisWeights,
};