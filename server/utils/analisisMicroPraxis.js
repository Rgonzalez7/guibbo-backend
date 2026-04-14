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
      "habilidad": "preguntas_abiertas",
      "nivel": 2,
      "objetivo": "Explorar procesos internos del paciente facilitando mayor claridad en pensamientos, emociones o conductas sin interpretar.",
      "criterios_adecuada": [
        "Pregunta abierta",
        "Se mantiene en el contenido",
        "Explora procesos internos",
        "Facilita claridad o diferenciación",
        "Apunta a ambivalencias o contradicciones",
        "No interpreta",
        "No cierra la respuesta"
      ],
      "criterios_parcial": [
        "Demasiado general",
        "Dirección débil",
        "Superficial",
        "Interpretación leve",
        "No aprovecha contradicciones"
      ],
      "criterios_incorrecta": [
        "Cerrada",
        "Interpreta",
        "Dirige conclusión",
        "Juzga o aconseja",
        "No es pregunta"
      ],
      "errores_tipicos": [
        "Quedarse en nivel 1",
        "No explorar lo interno",
        "No detectar ambivalencia",
        "Interpretar",
        "Preguntas cerradas"
      ],
      "lineamientos_correccion": [
        "Explorar pensamientos, emociones o conductas",
        "Apuntar a contradicciones",
        "Usar 'qué', 'cómo', 'qué pasa cuando'",
        "Mantener conexión con el contenido",
        "Evitar interpretar"
      ]
    },
    nivel_3:{
      "habilidad": "preguntas_abiertas",
      "nivel": 3,
      "objetivo": "Explorar con precisión clínica los procesos internos del paciente, especialmente ambivalencias y contradicciones, sin interpretar.",
      "criterios_adecuada": [
        "Pregunta abierta",
        "Se mantiene en el contenido",
        "Explora ambivalencias o contradicciones",
        "Facilita precisión",
        "Relaciona partes de la experiencia",
        "No interpreta",
        "No cierra la respuesta"
      ],
      "criterios_parcial": [
        "Nivel 2 (no profundiza)",
        "No integra contradicción",
        "Dirección poco precisa",
        "Exploración incompleta",
        "Interpretación leve"
      ],
      "criterios_incorrecta": [
        "Cerrada",
        "Interpreta",
        "Simplifica en exceso",
        "Ignora conflicto",
        "No es pregunta",
        "Juzga o aconseja"
      ],
      "errores_tipicos": [
        "Quedarse en nivel 2",
        "No explorar ambivalencia",
        "Simplificar",
        "Interpretar",
        "No integrar partes"
      ],
      "lineamientos_correccion": [
        "Explorar contradicción",
        "Relacionar dos partes de la experiencia",
        "Usar preguntas de precisión",
        "Mantenerse en el contenido",
        "Evitar interpretar"
      ]
    },
  },

  parafrasis: {
    nivel_1: {
      "objetivo": "Reformular el contenido del paciente de manera clara y fiel, sin interpretar ni agregar información.",
      "criterios_adecuada": [
        "Reformula el contenido",
        "Mantiene significado",
        "Es clara",
        "No agrega información",
        "No interpreta"
      ],
      "criterios_parcial": [
        "Reformulación incompleta",
        "Demasiado literal",
        "Leve distorsión",
        "Poca claridad",
        "Interpretación leve"
      ],
      "criterios_incorrecta": [
        "Interpreta",
        "Agrega contenido",
        "Cambia significado",
        "Da consejo",
        "Hace pregunta"
      ],
      "errores_tipicos": [
        "Copiar literal",
        "Interpretar",
        "Cambiar sentido",
        "Preguntar",
        "Ser muy general"
      ],
      "lineamientos_correccion": [
        "Reformular con palabras propias",
        "Mantener significado original",
        "No agregar contenido",
        "Organizar la idea claramente"
      ]
    },
    nivel_2: {
      "objetivo": "Reformular el contenido del paciente haciendo explícita la contradicción o tensión y organizando el mensaje con intención, sin interpretar.",
      "criterios_adecuada": [
        "Reformula con palabras propias",
        "Mantiene significado",
        "Hace explícita la contradicción",
        "Usa conectores organizadores",
        "Destaca elementos clave",
        "No interpreta"
      ],
      "criterios_parcial": [
        "Nivel 1 (no marca contradicción)",
        "Tensión implícita",
        "No usa conectores",
        "Omite elementos clave",
        "Interpretación leve"
      ],
      "criterios_incorrecta": [
        "Interpreta",
        "Agrega contenido",
        "Cambia significado",
        "Da consejo",
        "Hace pregunta"
      ],
      "errores_tipicos": [
        "Quedarse en nivel 1",
        "No marcar contradicción",
        "No usar conectores",
        "Simplificar",
        "Interpretar"
      ],
      "lineamientos_correccion": [
        "Destacar contradicción",
        "Usar 'pero', 'aunque', 'sin embargo'",
        "Integrar ambos elementos",
        "No interpretar",
        "Organizar claramente"
      ]
    },
    nivel_3:{
      "objetivo": "Reformular organizando de manera precisa y estructurada la experiencia compleja del paciente, integrando ambivalencias sin interpretar.",
      "criterios_adecuada": [
        "Reformula con palabras propias",
        "Mantiene significado",
        "Integra múltiples elementos",
        "Estructura la experiencia",
        "Destaca ambivalencias",
        "Relaciona partes",
        "No interpreta"
      ],
      "criterios_parcial": [
        "Nivel 2",
        "No integra todo",
        "Simplifica",
        "Estructura incompleta",
        "Interpretación leve"
      ],
      "criterios_incorrecta": [
        "Interpreta",
        "Agrega contenido",
        "Reduce a una idea",
        "Distorsiona",
        "Da consejo",
        "Hace pregunta"
      ],
      "errores_tipicos": [
        "Quedarse en nivel 2",
        "No integrar ambivalencia",
        "Simplificar",
        "Interpretar",
        "Perder partes del conflicto"
      ],
      "lineamientos_correccion": [
        "Integrar múltiples elementos",
        "Estructurar la experiencia",
        "Relacionar partes",
        "Mantener fidelidad",
        "No interpretar"
      ]
    },
  },

  reflejo: {
    nivel_1: {

    },
    nivel_2: {

    },
  },

  validacion: {
    nivel_1: {
      "objetivo": "Legitimar la emoción del paciente haciendo que su experiencia tenga sentido, sin explicar ni interpretar.",
      "criterios_adecuada": [
        "La intervención valida la emoción del paciente",
        "Utiliza lenguaje legitimador (por ejemplo: 'es entendible', 'tiene sentido', 'es normal', 'es lógico')",
        "Puede o no incluir la emoción explícita",
        "Se mantiene breve y clara",
        "No introduce interpretación",
        "No explica el porqué de la emoción",
        "No incluye juicio ni consejo"
      ],
      "criterios_parcial": [
        "Valida la emoción pero de forma débil o poco clara",
        "Lenguaje poco natural o poco empático",
        "No utiliza claramente una estructura de validación",
        "Suena genérica o poco conectada con la experiencia del paciente"
      ],
      "criterios_incorrecta": [
        "No valida la emoción",
        "Solo refleja (nombra emoción sin legitimar)",
        "Introduce interpretación",
        "Explica el porqué de la emoción",
        "Incluye consejo o juicio",
        "Minimiza la experiencia del paciente"
      ],
      "errores_tipicos": [
        "Responder con reflejo en lugar de validación",
        "Explicar en lugar de legitimar",
        "Usar frases como 'pero' que invalidan",
        "Minimizar la emoción (por ejemplo: 'no es para tanto')",
        "Dar consejo en lugar de validar"
      ],
      "lineamientos_correccion": [
        "Usar estructuras como: 'es entendible que…', 'tiene sentido que…', 'es normal que…'",
        "Mantener la respuesta breve y directa",
        "Validar sin explicar ni justificar",
        "Mantener un tono empático y natural",
        "Evitar agregar causas o interpretaciones"
      ]
    },
    nivel_2: {
      "objetivo": "Legitimar la emoción del paciente aportando sentido a su experiencia en contexto, reduciendo el autojuicio, sin interpretar ni explicar en profundidad.",
      "criterios_adecuada": [
        "Valida explícitamente la emoción del paciente",
        "Utiliza lenguaje legitimador (por ejemplo: 'es entendible', 'tiene sentido', 'es normal', 'es lógico')",
        "Aporta un sentido contextual cercano a lo dicho por el paciente (sin agregar información nueva)",
        "Reduce o suaviza el autojuicio del paciente (culpa, vergüenza, exigencia)",
        "Se mantiene breve y clara (1–2 líneas)",
        "No introduce interpretación ni explicaciones profundas",
        "No incluye juicio, consejo ni minimización"
      ],
      "criterios_parcial": [
        "Valida la emoción pero se queda en nivel 1 (sin aportar contexto)",
        "Aporta contexto pero de forma débil o poco conectada",
        "El lenguaje legitimador es poco claro o poco natural",
        "El intento de reducir autojuicio es insuficiente",
        "La respuesta es correcta pero genérica"
      ],
      "criterios_incorrecta": [
        "No valida la emoción",
        "Solo refleja (nombra emoción sin legitimar)",
        "Introduce interpretación (explica causas o significados no expresados)",
        "Explica en exceso (sobre-elabora el contexto)",
        "Incluye consejo o directividad",
        "Minimiza o invalida la experiencia del paciente"
      ],
      "errores_tipicos": [
        "Quedarse en validación nivel 1 (solo 'es entendible…')",
        "Explicar el porqué de la emoción (interpretación)",
        "Dar consejo disfrazado de validación",
        "Usar 'pero' que invalida (por ejemplo: 'es entendible, pero…')",
        "Agregar información no dicha por el paciente",
        "Sonar genérico o poco empático"
      ],
      "lineamientos_correccion": [
        "Iniciar con una frase legitimadora ('es entendible que…', 'tiene sentido que…')",
        "Añadir un contexto cercano a lo dicho por el paciente (sin interpretar)",
        "Apuntar a aliviar autojuicio (normalizar la reacción humana)",
        "Mantener la respuesta breve (1–2 líneas)",
        "Evitar 'pero' invalidante; usar conectores neutros como 'sobre todo cuando…', 'considerando que…'",
        "No explicar causas profundas ni agregar significados nuevos"
      ]
    },
  },

  clarificacion: {
    nivel_1: {
      "objetivo": "Precisar elementos difusos o poco claros del discurso del paciente.",
      "criterios_adecuada": [
        "La intervención es una pregunta abierta",
        "Busca aclarar algo que el paciente no logra expresar con precisión",
        "Se mantiene directamente en lo dicho por el paciente",
        "No introduce interpretaciones ni contenido nuevo",
        "Usa lenguaje simple y directo",
        "Apunta a que el paciente defina o describa mejor su experiencia"
      ],
      "criterios_parcial": [
        "La pregunta es abierta pero muy general",
        "No apunta claramente a lo difuso del discurso",
        "Pierde precisión en lo que intenta clarificar",
        "Podría aplicarse a cualquier caso (genérica)"
      ],
      "criterios_incorrecta": [
        "No es una pregunta",
        "Es una pregunta cerrada",
        "Introduce interpretación",
        "Cambia el foco del discurso",
        "Dirige la respuesta",
        "Introduce contenido que el paciente no mencionó"
      ],
      "errores_tipicos": [
        "Preguntas demasiado generales",
        "No identificar qué parte es difusa",
        "Interpretar en lugar de clarificar",
        "Cambiar de tema",
        "Usar preguntas cerradas"
      ],
      "lineamientos_correccion": [
        "Identificar la parte poco clara del discurso",
        "Usar preguntas tipo '¿a qué te refieres con…?'",
        "Mantenerse en lo que el paciente dijo",
        "Usar lenguaje simple",
        "Evitar agregar significado"
      ]
    },
    nivel_2: {
      "objetivo": "Precisar contradicciones, ambivalencias o matices dentro del discurso del paciente.",
      "criterios_adecuada": [
        "La intervención es una pregunta abierta",
        "Identifica y enfoca una contradicción o ambivalencia del paciente",
        "Invita al paciente a diferenciar o explicar dos partes de su experiencia",
        "Se mantiene dentro del contenido expresado",
        "No introduce interpretación",
        "Ayuda a organizar el discurso del paciente"
      ],
      "criterios_parcial": [
        "Detecta la ambivalencia pero no la enfoca claramente",
        "La pregunta es abierta pero poco precisa",
        "No logra diferenciar claramente los elementos en conflicto",
        "Se queda en exploración general (nivel 1)"
      ],
      "criterios_incorrecta": [
        "No es una pregunta abierta",
        "Ignora la contradicción del paciente",
        "Introduce interpretación",
        "Dirige la respuesta hacia una conclusión",
        "Explica en lugar de preguntar"
      ],
      "errores_tipicos": [
        "No identificar la ambivalencia",
        "Hacer preguntas generales en lugar de focalizadas",
        "Interpretar la contradicción",
        "Reducir la complejidad del discurso",
        "Dirigir la respuesta"
      ],
      "lineamientos_correccion": [
        "Detectar frases con 'pero', 'aunque', contradicciones",
        "Usar preguntas tipo 'cuando dices… pero…, ¿cómo es eso?'",
        "Invitar a diferenciar experiencias",
        "Mantenerse en lo dicho por el paciente",
        "Evitar conclusiones"
      ]
    },
    nivel_3: {
      "objetivo": "Delimitar la estructura de la experiencia del paciente (origen, niveles, partes o condiciones).",
      "criterios_adecuada": [
        "La intervención es una pregunta abierta",
        "Apunta a diferenciar dimensiones más complejas (tiempo, origen, intensidad, partes)",
        "Invita al paciente a distinguir entre posibles fuentes o capas de su experiencia",
        "Se mantiene en lo expresado por el paciente",
        "No introduce interpretación ni explicaciones",
        "Aumenta la precisión y profundidad del discurso sin dirigirlo"
      ],
      "criterios_parcial": [
        "Intenta profundizar pero sin delimitar claramente",
        "La pregunta es abierta pero poco estructurante",
        "No logra diferenciar claramente las dimensiones",
        "Se queda en nivel 2 (ambivalencia simple)"
      ],
      "criterios_incorrecta": [
        "Introduce interpretación (por ejemplo: causas no dichas)",
        "Dirige la respuesta hacia una explicación",
        "No es una pregunta abierta",
        "Es demasiado compleja o confusa",
        "Se convierte en análisis en lugar de clarificación"
      ],
      "errores_tipicos": [
        "Confundir clarificación con interpretación",
        "Hacer preguntas demasiado complejas",
        "Agregar significado no expresado",
        "Dirigir hacia una explicación",
        "Forzar profundidad innecesaria"
      ],
      "lineamientos_correccion": [
        "Identificar elementos como origen, tiempo o intensidad",
        "Usar preguntas tipo '¿qué diferencias notas…?', '¿cómo distingues…?'",
        "Invitar a separar partes de la experiencia",
        "Mantener claridad y simplicidad",
        "Evitar explicar o interpretar"
      ]
    },
  },

  sintesis: {
    nivel_1: {
      "objetivo": "Resumir de forma clara y fiel los elementos principales del discurso del paciente.",
      "criterios_adecuada": [
        "Resume los elementos principales del caso",
        "Mantiene fidelidad al contenido expresado",
        "No agrega información nueva",
        "No interpreta ni explica",
        "Usa lenguaje claro y breve",
        "Integra los elementos en una sola frase coherente"
      ],
      "criterios_parcial": [
        "Incluye solo parte de la información relevante",
        "La síntesis es poco clara o desorganizada",
        "Se acerca más a una paráfrasis que a una síntesis",
        "No logra integrar los elementos en una sola idea"
      ],
      "criterios_incorrecta": [
        "No es una síntesis",
        "Agrega información no dicha",
        "Introduce interpretación o explicación",
        "Cambia el sentido del contenido",
        "Enumera sin integrar",
        "Se enfoca en detalles irrelevantes"
      ],
      "errores_tipicos": [
        "Listar elementos sin integrarlos",
        "Repetir el contenido sin resumir",
        "Agregar explicaciones",
        "Perder información clave",
        "Confundir con paráfrasis"
      ],
      "lineamientos_correccion": [
        "Identificar las ideas principales",
        "Reducir el contenido a lo esencial",
        "Unir los elementos en una sola frase",
        "Mantener fidelidad al discurso",
        "Evitar explicar o interpretar"
      ]
    },
    nivel_2: {
      "objetivo": "Integrar elementos del discurso del paciente organizándolos en una secuencia coherente.",
      "criterios_adecuada": [
        "Integra múltiples elementos del caso",
        "Organiza la información en una secuencia lógica (por ejemplo: situación → reacción → consecuencia)",
        "Mantiene fidelidad al contenido",
        "No agrega información nueva",
        "No interpreta ni explica",
        "Logra una síntesis clara y estructurada"
      ],
      "criterios_parcial": [
        "Integra los elementos pero sin una organización clara",
        "La secuencia es confusa o incompleta",
        "Se acerca a nivel 1 (solo resume)",
        "Pierde parte del hilo lógico"
      ],
      "criterios_incorrecta": [
        "No integra los elementos",
        "Enumera sin organizar",
        "Introduce interpretación",
        "Cambia el significado del contenido",
        "Agrega información no dicha",
        "Pierde la coherencia"
      ],
      "errores_tipicos": [
        "Listar sin organizar",
        "No identificar la secuencia",
        "Agregar explicaciones",
        "Simplificar en exceso",
        "Confundir con paráfrasis"
      ],
      "lineamientos_correccion": [
        "Identificar la relación entre los elementos",
        "Organizar en secuencia lógica",
        "Mantener claridad y coherencia",
        "No agregar significado",
        "Evitar interpretación"
      ]
    },
    nivel_3: {
      "objetivo": "Integrar y jerarquizar la experiencia del paciente identificando el elemento central que organiza su conflicto.",
      "criterios_adecuada": [
        "Integra múltiples elementos del caso",
        "Identifica el eje central que organiza la experiencia del paciente",
        "Jerarquiza la información (no todos los elementos tienen el mismo peso)",
        "Expresa cómo ese elemento central influye en el resto",
        "Mantiene fidelidad al contenido",
        "No agrega información nueva",
        "No interpreta ni explica causas",
        "Logra una síntesis clara, organizada y con sentido clínico"
      ],
      "criterios_parcial": [
        "Integra los elementos pero sin jerarquizarlos",
        "No identifica claramente el eje central",
        "Se queda en nivel 2 (solo organiza)",
        "La síntesis es correcta pero plana (sin profundidad)",
        "La relación entre elementos no es clara"
      ],
      "criterios_incorrecta": [
        "No integra los elementos",
        "No identifica ningún eje organizador",
        "Introduce interpretación (explica causas o significados)",
        "Agrega información no dicha",
        "Simplifica en exceso perdiendo complejidad",
        "Se convierte en análisis o intervención"
      ],
      "errores_tipicos": [
        "Integrar sin jerarquizar",
        "No identificar lo central",
        "Explicar en lugar de sintetizar",
        "Agregar significado no dicho",
        "Reducir la complejidad del paciente",
        "Confundir con interpretación clínica"
      ],
      "lineamientos_correccion": [
        "Identificar el elemento más relevante del discurso",
        "Organizar la síntesis alrededor de ese eje",
        "Mostrar cómo ese eje conecta los demás elementos",
        "Mantener la complejidad sin explicar",
        "No agregar significado",
        "Usar lenguaje claro y estructurado"
      ]
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
