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
  
    // historia de vida
    infancia: "Infancia",
    actualidad: "Actualidad",
    motivoConsulta: "Motivo de consulta",
    relacionPadres: "Relación con padres",
    relacionSentimental: "Relación sentimental",
    antecedentesPsiquiatricos: "Antecedentes psiquiátricos",
    sexualidad: "Sexualidad",
    nivelEducativo: "Nivel educativo",
    situacionLaboral: "Situación laboral",
    vicios: "Vicios",
    creenciasReligiosas: "Creencias religiosas",
    anamnesis: "Anamnesis",
    antecedentesSociales: "Antecedentes sociales",
    antecedentePatologico: "Antecedente patológico",
  
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
  
    // Importante: forzar estructura EXACTA
    return `
  Devuelve SOLO JSON válido con esta estructura EXACTA:
  
  {
    "generalScore": 0,
    "general": { "score": 0, "summary": "" },
  
    "sections": {
      ${evalList.map((e) => `"${e.key}": { "score": 0, "metrics": [ { "key": "", "label": "", "score": 0 } ], "recommendations": [""] }`).join(",\n    ")}
    },
  
    "tools": {
      ${toolList.map((t) => `"${t.key}": { "score": 0, "metrics": [ { "key": "", "label": "", "score": 0 } ], "recommendations": [""] }`).join(",\n    ")}
    },
  
    "meta": {
      "enfoque": ${JSON.stringify(enfoque || "")}
    }
  }
  
  REGLAS:
  - scores 0..100 (enteros).
  - metrics: 3 a 6 items por sección.
  - recommendations: 3 a 6 bullets por sección.
  - Basarte en la TRANSCRIPCIÓN y en lo que el estudiante llenó (ficha/HC/etc si existen).
  - Si falta evidencia para un criterio, baja el score y explica en recomendaciones qué faltó.
  
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
      return { score: null, metrics: [], recommendations: [] };
    }
  
    const score = safeInt(rawBlock.score ?? rawBlock.generalScore ?? rawBlock.puntuacion ?? rawBlock.puntaje);
  
    let metrics = rawBlock.metrics || rawBlock.criterios || rawBlock.items || rawBlock.subScores || [];
    if (metrics && !Array.isArray(metrics) && typeof metrics === "object") {
      metrics = Object.entries(metrics).map(([k, v]) => ({ key: k, label: String(k), score: safeInt(v) }));
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
  
    return { score: score ?? null, metrics, recommendations: rec };
  }
  
  function normalizeAIResult(raw, { evaluaciones, herramientas, enfoque }) {
    // raw puede venir como string JSON o ya objeto
    let obj = raw;
    if (typeof raw === "string") {
      try {
        obj = JSON.parse(raw);
      } catch (e) {
        // fallback: intenta extraer el primer JSON
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
  
    // sections: asegurar keys esperadas
    (evaluaciones || []).forEach((k) => {
      const block = obj?.sections?.[k] || obj?.[k] || null;
      result.sections[k] = normalizeBlock(block);
      // si quedó sin score, pon 0 para evitar UI rara
      if (typeof result.sections[k].score !== "number") result.sections[k].score = 0;
    });
  
    // tools
    const toolKeys = Object.keys(herramientas || {}).filter((k) => herramientas?.[k] === true);
    toolKeys.forEach((k) => {
      const block = obj?.tools?.[k] || obj?.[k] || null;
      result.tools[k] = normalizeBlock(block);
      if (typeof result.tools[k].score !== "number") result.tools[k].score = 0;
    });
  
    // si no vino generalScore, recalcula promedio de sections
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
    // prioridad: payload (tu BD real)
    // fallback: sessionData / data si existen
    return (
      rp?.payload ||
      rp?.sessionData ||
      rp?.data ||
      {}
    );
  }

  function addLabelsToResult(result, { evaluaciones, herramientas }) {
    if (!result || typeof result !== "object") return result;
  
    // sections: añadir label si falta
    (evaluaciones || []).forEach((k) => {
      if (!result.sections) result.sections = {};
      if (!result.sections[k]) result.sections[k] = { score: 0, metrics: [], recommendations: [] };
  
      if (!result.sections[k].label) {
        result.sections[k].label = EVAL_LABELS[k] || k;
      }
      if (!result.sections[k].description) {
        result.sections[k].description = ""; // opcional: si luego quieres mapping de descripciones
      }
    });
  
    // tools: añadir label si falta
    const toolKeys = Object.keys(herramientas || {}).filter((k) => herramientas?.[k] === true);
    toolKeys.forEach((k) => {
      if (!result.tools) result.tools = {};
      if (!result.tools[k]) result.tools[k] = { score: 0, metrics: [], recommendations: [] };
  
      if (!result.tools[k].label) {
        result.tools[k].label = TOOL_LABELS[k] || k;
      }
      if (!result.tools[k].description) {
        result.tools[k].description = "";
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
  };