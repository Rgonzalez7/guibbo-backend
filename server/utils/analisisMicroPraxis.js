// server/utils/analisisMicroPraxis.js
// =========================================================
// Evaluación de micro-intervenciones (Grabar Voz)
// Sistema basado en habilidad + nivel + criterios
// =========================================================

const { clampText } = require("./analisisPraxisIA");

/* =========================================================
   LABELS
========================================================= */
const INTERVENCION_LABELS = {
  pregunta_abierta:          "Pregunta abierta",
  clarificacion:             "Clarificación",
  reflejo_simple:            "Reflejo simple",
  validacion_basica:         "Validación básica",
  validacion_emocional:      "Validación emocional",
  escucha_activa:            "Escucha activa",
  contencion_basica:         "Contención básica",
  redireccion_suave:         "Redirección suave",
  presencia:                 "Presencia terapéutica",
  mensaje_directo:           "Mensaje directo",
  exploracion_dirigida:      "Exploración dirigida",
  resumen_parcial:           "Resumen parcial",
  psicoeducacion_breve:      "Psicoeducación breve",
  reencuadre_simple:         "Reencuadre simple",
  normalizacion:             "Normalización",
  focalizacion:              "Focalización",
  establecimiento_limites:   "Establecimiento de límites",
  orientacion:               "Orientación",
  manejo_conducta:           "Manejo de conducta",
  feedback_constructivo:     "Feedback constructivo",
  mediacion_basica:          "Mediación básica",
  organizacion_pensamiento:  "Organización del pensamiento",
  reduccion_ansiedad:        "Reducción de ansiedad",
  reencuadre_complejo:       "Reencuadre complejo",
  confrontacion_suave:       "Confrontación suave",
  interpretacion:            "Interpretación",
  desarrollo_insight:        "Desarrollo de insight",
  integracion_emocional:     "Integración emocional",
  plan_intervencion:         "Plan de intervención",
  analisis_funcional_basico: "Análisis funcional básico",
  identificacion_patrones:   "Identificación de patrones",
  hipotesis_inicial_suave:   "Hipótesis clínica inicial",
  intervencion_conductual:   "Intervención conductual",
  negociacion:               "Negociación",
  deteccion_incongruencias:  "Detección de incongruencias",
  derivacion:                "Derivación",
  plan_proteccion:           "Plan de protección",
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

/* =========================================================
   CRITERIOS POR HABILIDAD Y NIVEL
========================================================= */
const CRITERIOS_HABILIDAD = {
  pregunta_abierta: {
    nivel_1: {
      objetivo: "Facilitar que el paciente amplíe su discurso sin dirigirlo ni interpretarlo.",
      criterios_adecuada: [
        "La intervención es una pregunta abierta (no se responde con sí/no)",
        "Se mantiene directamente en el contenido expresado por el paciente",
        "Invita a ampliar la experiencia del paciente",
        "No introduce interpretaciones",
        "No dirige la respuesta hacia una conclusión específica",
        "No contiene juicio ni consejo",
      ],
      criterios_parcial: [
        "La pregunta es abierta pero demasiado genérica",
        "Introduce ligera dirección en la respuesta",
        "Reduce la amplitud de la respuesta",
        "Pierde el foco principal del discurso",
      ],
      criterios_incorrecta: [
        "La pregunta es cerrada",
        "Introduce interpretación",
        "Incluye juicio o consejo",
        "Cambia el tema",
        "No es una pregunta",
      ],
      errores_tipicos: [
        "Preguntas cerradas",
        "Interpretar en lugar de explorar",
        "Uso de 'por qué' de forma confrontativa",
        "Dirigir la respuesta",
        "Dar consejo disfrazado de pregunta",
      ],
      lineamientos_correccion: [
        "Usar preguntas abiertas tipo 'cómo' o 'qué'",
        "Mantenerse en el contenido del paciente",
        "Invitar a ampliar sin dirigir",
        "Usar lenguaje claro y natural",
      ],
    },
    nivel_2: {

    },
    nivel_3:{

    },
  },
  // otras habilidades se agregarán después
};

/* =========================================================
   HELPERS
========================================================= */
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

function safeStr(v, fallback = "") {
  if (typeof v === "string") return v.trim();
  if (v == null) return fallback;
  return String(v).trim();
}

function safeArr(v) {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  return [];
}

function getCriterios(habilidad, nivel) {
  return CRITERIOS_HABILIDAD?.[habilidad]?.[nivel] || null;
}

/* =========================================================
   PROMPT — ANÁLISIS POR CASO
========================================================= */
function buildPromptCaso({ habilidad, nivel, caso, transcripcion }) {
  const habilidadLabel = INTERVENCION_LABELS[habilidad] || habilidad;
  const nivelLabel     = NIVEL_LABELS[nivel]            || nivel;
  const criterios      = getCriterios(habilidad, nivel);

  const criteriosStr = criterios
    ? `OBJETIVO: ${criterios.objetivo}

CRITERIOS — ADECUADA:
${criterios.criterios_adecuada.map((c) => `- ${c}`).join("\n")}

CRITERIOS — PARCIAL:
${criterios.criterios_parcial.map((c) => `- ${c}`).join("\n")}

CRITERIOS — INCORRECTA:
${criterios.criterios_incorrecta.map((c) => `- ${c}`).join("\n")}

ERRORES TÍPICOS:
${criterios.errores_tipicos.map((c) => `- ${c}`).join("\n")}

LINEAMIENTOS PARA CORRECCIÓN:
${criterios.lineamientos_correccion.map((c) => `- ${c}`).join("\n")}`
    : `No hay criterios específicos definidos para ${habilidadLabel} nivel ${nivelLabel}. Evalúa con criterio clínico general.`;

  return `Actúa como un supervisor clínico experto en psicoterapia.

Tu tarea es evaluar la intervención de un estudiante dentro de un ejercicio de micro práctica clínica.

HABILIDAD: ${habilidadLabel}
NIVEL: ${nivelLabel}

CRITERIOS DE EVALUACIÓN:
${criteriosStr}

---

CASO (paciente):
"${clampText(safeStr(caso), 2000)}"

RESPUESTA DEL ESTUDIANTE:
"${clampText(safeStr(transcripcion), 4000)}"

---

TAREA:

1. Clasifica la respuesta como:
- "adecuada"
- "parcial"
- "incorrecta"

2. Genera un feedback breve, claro y clínico (1-2 líneas), basado en los criterios.

3. Si es "adecuada":
- incluye un refuerzo positivo breve
- no incluyas correcciones (array vacío)

4. Si es "parcial" o "incorrecta":
- no incluyas refuerzo (string vacío)
- genera exactamente 2 formas correctas de intervención, alineadas con la técnica y el nivel

---

REGLAS IMPORTANTES:
- No expliques teoría
- No salgas del formato JSON
- No mezcles técnicas
- Evalúa únicamente con base en los criterios proporcionados
- Mantente dentro del nivel indicado
- Usa lenguaje clínico claro y natural

Responde SOLO en JSON con esta estructura:

{
  "evaluacion": {
    "estado": "adecuada | parcial | incorrecta",
    "feedback": "string",
    "refuerzo": "string",
    "correcciones": ["string", "string"]
  }
}`.trim();
}

/* =========================================================
   PROMPT — ANÁLISIS GLOBAL (habilidad_especifica)
========================================================= */
function buildPromptGlobal({ habilidad, nivel, resultadosCasos }) {
  const habilidadLabel = INTERVENCION_LABELS[habilidad] || habilidad;
  const nivelLabel     = NIVEL_LABELS[nivel]            || nivel;

  const resumenCasos = resultadosCasos
    .map((r, i) => {
      const e = r?.evaluacion || {};
      return `Caso ${i + 1}:
- Estado: ${e.estado || "—"}
- Feedback: ${e.feedback || "—"}
${e.refuerzo ? `- Refuerzo: ${e.refuerzo}` : ""}
${e.correcciones?.length ? `- Correcciones sugeridas:\n${e.correcciones.map((c) => `  · ${c}`).join("\n")}` : ""}`.trim();
    })
    .join("\n\n");

  const totalCasos     = resultadosCasos.length;
  const adecuadas      = resultadosCasos.filter((r) => r?.evaluacion?.estado === "adecuada").length;
  const parciales      = resultadosCasos.filter((r) => r?.evaluacion?.estado === "parcial").length;
  const incorrectas    = resultadosCasos.filter((r) => r?.evaluacion?.estado === "incorrecta").length;

  return `Actúa como un supervisor clínico experto en psicoterapia.

Vas a generar un análisis global del desempeño de un estudiante en un ejercicio de micro práctica clínica.

HABILIDAD EVALUADA: ${habilidadLabel}
NIVEL: ${nivelLabel}
TOTAL DE CASOS: ${totalCasos}
RESUMEN: ${adecuadas} adecuadas · ${parciales} parciales · ${incorrectas} incorrectas

---

RESULTADOS POR CASO:

${resumenCasos}

---

TAREA:

Genera un análisis global pedagógico con:

1. Una apertura motivadora (1-2 oraciones) que contextualice el desempeño general
2. Lo que el estudiante demostró bien de forma consistente (2-3 puntos)
3. El patrón de error más frecuente o la oportunidad de mejora principal (1-2 puntos)
4. Un paso concreto de práctica recomendado para mejorar esta habilidad

Además, asigna un score global de 0-100 basado en:
- adecuada = 100 puntos
- parcial   = 50 puntos
- incorrecta = 0 puntos
- El score es el promedio ponderado

---

REGLAS:
- No repitas el feedback caso por caso
- Habla de patrones, no de casos individuales
- Usa lenguaje clínico claro, motivador y constructivo
- No salgas del formato JSON

Responde SOLO en JSON con esta estructura:

{
  "globalHabilidad": {
    "habilidad": "${habilidad}",
    "habilidadLabel": "${habilidadLabel}",
    "nivel": "${nivel}",
    "nivelLabel": "${nivelLabel}",
    "score": 0,
    "totalCasos": ${totalCasos},
    "adecuadas": ${adecuadas},
    "parciales": ${parciales},
    "incorrectas": ${incorrectas},
    "apertura": "string",
    "loQueDominas": ["string", "string"],
    "oportunidadMejora": ["string"],
    "pasoSiguiente": "string"
  }
}`.trim();
}

/* =========================================================
   NORMALIZAR — RESULTADO POR CASO
========================================================= */
function normalizeCasoResult(raw, { habilidad, nivel, casoIdx }) {
  const obj = parseRawJson(raw);
  const ev  = obj?.evaluacion || obj || {};
  const estado = ["adecuada", "parcial", "incorrecta"].includes(safeStr(ev.estado))
    ? safeStr(ev.estado)
    : "incorrecta";

  return {
    tipo:       "micro_caso",
    casoIdx,
    habilidad,
    habilidadLabel: INTERVENCION_LABELS[habilidad] || habilidad,
    nivel,
    nivelLabel: NIVEL_LABELS[nivel] || nivel,
    evaluacion: {
      estado,
      feedback:     safeStr(ev.feedback),
      refuerzo:     estado === "adecuada" ? safeStr(ev.refuerzo) : "",
      correcciones: estado !== "adecuada" ? safeArr(ev.correcciones).slice(0, 2) : [],
    },
    meta: { createdAt: new Date().toISOString() },
  };
}

/* =========================================================
   NORMALIZAR — RESULTADO GLOBAL
========================================================= */
function normalizeGlobalResult(raw, { habilidad, nivel, resultadosCasos }) {
  const obj = parseRawJson(raw);
  const g   = obj?.globalHabilidad || obj || {};

  const totalCasos  = resultadosCasos.length;
  const adecuadas   = resultadosCasos.filter((r) => r?.evaluacion?.estado === "adecuada").length;
  const parciales   = resultadosCasos.filter((r) => r?.evaluacion?.estado === "parcial").length;
  const incorrectas = resultadosCasos.filter((r) => r?.evaluacion?.estado === "incorrecta").length;

  // Score calculado en el backend como fallback si la IA da un valor inválido
  const scoreCalculado = totalCasos > 0
    ? Math.round(((adecuadas * 100) + (parciales * 50)) / totalCasos)
    : 0;

  const scoreIA = Number(g.score);
  const score   = Number.isFinite(scoreIA) && scoreIA >= 0 && scoreIA <= 100
    ? scoreIA
    : scoreCalculado;

  return {
    tipo:          "micro_global",
    habilidad,
    habilidadLabel: INTERVENCION_LABELS[habilidad] || habilidad,
    nivel,
    nivelLabel:    NIVEL_LABELS[nivel] || nivel,
    score,
    totalCasos,
    adecuadas,
    parciales,
    incorrectas,
    apertura:        safeStr(g.apertura),
    loQueDominas:    safeArr(g.loQueDominas),
    oportunidadMejora: safeArr(g.oportunidadMejora),
    pasoSiguiente:   safeStr(g.pasoSiguiente),
    meta: { createdAt: new Date().toISOString() },
  };
}

module.exports = {
  buildPromptCaso,
  buildPromptGlobal,
  normalizeCasoResult,
  normalizeGlobalResult,
  getCriterios,
  INTERVENCION_LABELS,
  NIVEL_LABELS,
  TIPO_ENTRENAMIENTO_LABELS,
  CRITERIOS_HABILIDAD,
};
