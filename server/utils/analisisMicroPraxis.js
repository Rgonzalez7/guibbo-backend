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
  // Habilidades nucleares (nuevas y existentes)
  pregunta_abierta:          "Pregunta abierta",
  parafrasis:                "Paráfrasis",
  reflejo:                   "Reflejo",
  validacion:                "Validación",
  clarificacion:             "Clarificación",
  sintesis:                  "Síntesis",
  interpretacion:            "Interpretación",
  confrontacion:             "Confrontación",
  auto_revelacion:           "Autorrevelación",
  humor_terapeutico:         "Humor terapéutico",

  // Otras intervenciones del catálogo original (compatibilidad)
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
  nivel_1:     "Nivel 1",
  nivel_2:     "Nivel 2",
  nivel_3:     "Nivel 3",
  nivel_unico: "Único",
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
      objetivo: "Facilitar que el paciente amplíe su discurso mediante preguntas abiertas simples, sin dirigir, interpretar ni imponer contenido.",
      criterios_adecuada: [
        "Es una pregunta abierta (no se responde con sí/no)",
        "Inicia preferentemente con 'qué', 'cómo', 'cuándo', 'dónde' o formulaciones equivalentes",
        "Permite múltiples posibles respuestas (no limita a una sola dirección)",
        "No contiene hipótesis, causas ni explicaciones dentro de la pregunta",
        "No introduce emociones, diagnósticos o significados no mencionados por el paciente",
        "Se mantiene en el contenido literal expresado por el paciente",
        "Es clara, simple y comprensible",
      ],
      criterios_parcial: [
        "Es una pregunta abierta pero demasiado general (por ejemplo: '¿a qué te refieres?')",
        "Es abierta pero poco precisa o poco conectada con el contenido del paciente",
        "Introduce una leve orientación (por ejemplo hacia emociones o experiencias) sin imponer causa o explicación",
        "Incluye más de una intención (pregunta doble) pero sigue siendo mayormente abierta",
        "La pregunta es válida pero poco útil clínicamente",
      ],
      criterios_incorrecta: [
        "Es una pregunta cerrada (se responde con sí/no)",
        "Incluye estructuras que introducen hipótesis o causa (por ejemplo: '¿crees que es porque...?', '¿será que...?')",
        "Introduce un diagnóstico o etiqueta (por ejemplo: '¿tienes depresión?')",
        "Dirige la respuesta hacia una conclusión específica",
        "Reduce significativamente la apertura del paciente",
        "Incluye juicio, consejo o corrección",
        "No es una pregunta",
      ],
      errores_tipicos: [
        "Usar '¿crees que...?' con una hipótesis implícita",
        "Intentar explicar en lugar de explorar",
        "Asumir causas o emociones",
        "Hacer preguntas cerradas",
        "Hacer preguntas dobles",
        "Introducir diagnósticos o etiquetas",
        "Dirigir la respuesta del paciente",
      ],
      lineamientos_correccion: [
        "Transformar la intervención en una pregunta abierta iniciada con 'qué' o 'cómo'",
        "Eliminar cualquier hipótesis o causa dentro de la pregunta",
        "Eliminar diagnósticos o interpretaciones",
        "Mantener la pregunta en el contenido literal del paciente",
        "Formular una sola intención por intervención",
        "Priorizar claridad y apertura sobre complejidad",
      ],
      reglas_decision_critica: [
        "Si la pregunta contiene 'porque', 'se debe a', 'crees que', 'será que' → clasificar como INCORRECTA",
        "Si la pregunta incluye un diagnóstico o etiqueta → clasificar como INCORRECTA",
        "Si la pregunta puede responderse con sí/no → clasificar como INCORRECTA",
        "Si la pregunta es abierta pero muy general → clasificar como PARCIAL",
        "Si la pregunta es abierta, clara y no dirige → clasificar como ADECUADA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser siempre preguntas abiertas",
        "Las alternativas deben iniciar preferentemente con 'qué' o 'cómo'",
        "Las alternativas no deben incluir hipótesis ni causas",
        "Las alternativas no deben introducir diagnósticos",
        "Las alternativas deben mejorar apertura y claridad respecto a la respuesta original",
      ],
    },

    nivel_2: {
      objetivo: "Explorar procesos internos del paciente (pensamientos, emociones o conductas) mediante preguntas abiertas, sin interpretar ni dirigir hacia causas o conclusiones.",
      criterios_adecuada: [
        "Es una pregunta abierta (no se responde con sí/no)",
        "Se mantiene en el contenido expresado por el paciente",
        "Explora al menos un proceso interno (pensamientos, emociones o conductas)",
        "Facilita que el paciente profundice en su experiencia interna",
        "No introduce causas, explicaciones ni hipótesis",
        "No incluye diagnósticos ni etiquetas",
        "No dirige la respuesta hacia una conclusión específica",
        "Es clara, focalizada y con una sola intención",
      ],
      criterios_parcial: [
        "Es una pregunta abierta pero se queda en nivel descriptivo (nivel 1)",
        "Explora el contenido pero no profundiza en procesos internos",
        "Es abierta pero demasiado general o poco precisa",
        "Incluye más de una intención (pregunta doble) pero sigue siendo mayormente exploratoria",
        "Explora procesos internos pero de forma débil o poco clara",
      ],
      criterios_incorrecta: [
        "Es una pregunta cerrada (se responde con sí/no)",
        "Incluye hipótesis o causa explícita (por ejemplo: '¿por qué...?', '¿crees que es porque...?', '¿se debe a...?')",
        "Introduce una interpretación (asume emoción, causa o significado no dicho)",
        "Introduce un diagnóstico o etiqueta",
        "Dirige la respuesta hacia una explicación o conclusión específica",
        "Reduce significativamente la apertura del paciente",
        "Incluye juicio, consejo o corrección",
        "No es una pregunta",
      ],
      errores_tipicos: [
        "Quedarse en descripción sin explorar lo interno",
        "Confundir explorar con interpretar",
        "Usar preguntas de causa ('por qué', 'se debe a')",
        "Introducir hipótesis implícitas ('¿crees que...?')",
        "Hacer preguntas cerradas",
        "Incluir diagnósticos o etiquetas",
        "Hacer preguntas dobles que confunden la intención",
      ],
      lineamientos_correccion: [
        "Transformar la intervención en una pregunta abierta iniciada con 'qué' o 'cómo'",
        "Dirigir la pregunta hacia pensamientos, emociones o conductas",
        "Eliminar cualquier causa, explicación o hipótesis",
        "Eliminar diagnósticos o etiquetas",
        "Mantener una sola intención clara",
        "Asegurar conexión directa con lo dicho por el paciente",
        "Priorizar exploración interna sobre descripción externa",
      ],
      reglas_decision_critica: [
        "Si la pregunta contiene 'por qué', 'se debe a', 'crees que es porque', 'será que' → clasificar como INCORRECTA",
        "Si introduce una causa o explicación → INCORRECTA",
        "Si incluye diagnóstico o etiqueta → INCORRECTA",
        "Si puede responderse con sí/no → INCORRECTA",
        "Si es abierta pero no explora procesos internos → PARCIAL",
        "Si es abierta, explora procesos internos y no dirige → ADECUADA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser preguntas abiertas",
        "Deben explorar pensamientos, emociones o conductas",
        "No deben incluir causas ni hipótesis",
        "No deben incluir diagnósticos",
        "Deben mejorar precisión y profundidad respecto a la respuesta original",
        "Deben mantener una sola intención clara",
      ],
    },

    nivel_3: {
      objetivo: "Explorar con precisión clínica los procesos internos del paciente integrando múltiples elementos de su experiencia (pensamientos, emociones o conductas), facilitando claridad sobre tensiones o ambivalencias, sin interpretar ni confrontar.",
      criterios_adecuada: [
        "Es una pregunta abierta",
        "Se mantiene en el contenido expresado por el paciente",
        "Explora procesos internos (pensamientos, emociones o conductas)",
        "Integra al menos dos elementos del discurso del paciente dentro de la misma pregunta",
        "Relaciona estos elementos sin afirmar una conclusión",
        "Puede señalar una tensión o diferencia sin imponerla",
        "Facilita mayor claridad en la experiencia del paciente",
        "No introduce causas, explicaciones ni hipótesis",
        "No incluye diagnósticos ni etiquetas",
        "Mantiene una sola intención clara y no cierra la respuesta",
      ],
      criterios_parcial: [
        "Explora procesos internos pero solo un elemento (nivel 2)",
        "No integra múltiples elementos del discurso",
        "La pregunta es abierta pero no organiza la experiencia",
        "Es precisa pero no aporta claridad adicional",
        "Incluye integración débil o poco clara",
        "No aprovecha elementos relevantes del discurso (posibles tensiones)",
      ],
      criterios_incorrecta: [
        "Es una pregunta cerrada",
        "Introduce causa o explicación (por ejemplo: 'por qué', 'se debe a', 'crees que es porque')",
        "Introduce una interpretación (asume significado no dicho)",
        "Señala directamente una contradicción como afirmación (por ejemplo: 'dices que... pero...')",
        "Incluye tono confrontativo o desafiante",
        "Introduce diagnóstico o etiqueta",
        "Dirige hacia una conclusión específica",
        "Reduce la experiencia del paciente a una sola explicación",
        "Incluye juicio o consejo",
        "No es una pregunta",
      ],
      errores_tipicos: [
        "Quedarse en nivel 2 (explorar solo un elemento)",
        "No integrar elementos del discurso",
        "Convertir integración en confrontación",
        "Interpretar en lugar de explorar",
        "Introducir causas o explicaciones",
        "Usar tono confrontativo",
        "Simplificar en exceso la experiencia",
        "Forzar significados no expresados",
      ],
      lineamientos_correccion: [
        "Transformar la intervención en una pregunta abierta que integre al menos dos elementos del discurso",
        "Relacionar elementos sin afirmar una conclusión",
        "Usar estructuras como 'cuando... y al mismo tiempo...' o 'por un lado... y por otro...'",
        "Eliminar cualquier causa, explicación o hipótesis",
        "Eliminar diagnósticos o etiquetas",
        "Evitar tono confrontativo",
        "Mantener una sola intención clara",
        "Facilitar que el paciente observe su propia experiencia",
      ],
      reglas_decision_critica: [
        "Si la pregunta integra solo un elemento → PARCIAL",
        "Si la pregunta integra dos o más elementos sin imponer conclusión → ADECUADA",
        "Si contiene 'por qué', 'se debe a', 'crees que es porque', 'será que' → INCORRECTA",
        "Si afirma contradicción directamente → INCORRECTA",
        "Si introduce diagnóstico o interpretación → INCORRECTA",
        "Si es cerrada → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser preguntas abiertas",
        "Deben integrar al menos dos elementos del discurso del paciente",
        "Deben relacionar elementos sin afirmar conclusiones",
        "No deben incluir causas ni hipótesis",
        "No deben incluir diagnósticos",
        "No deben usar tono confrontativo",
        "Deben mejorar claridad y organización de la experiencia",
      ],
    },
  },

  validacion: {
    nivel_1: {
      objetivo: "Legitimar la emoción del paciente haciendo que su experiencia tenga sentido, sin explorar, sin interpretar y sin cambiar de técnica.",
      criterios_adecuada: [
        "La intervención incluye lenguaje legitimador explícito (por ejemplo: 'es entendible', 'tiene sentido', 'es normal', 'es lógico')",
        "Reconoce la emoción o experiencia del paciente",
        "Se mantiene breve, clara y directa",
        "No introduce interpretación",
        "No explica el porqué de la emoción",
        "No incluye juicio ni consejo",
        "No intenta profundizar ni explorar procesos internos",
        "No incluye preguntas",
      ],
      criterios_parcial: [
        "Incluye lenguaje legitimador pero es poco claro o poco natural",
        "La validación es correcta pero poco conectada con el contenido del paciente",
        "La expresión legitimadora es vaga o redundante",
        "Incluye elementos innecesarios que diluyen la validación",
        "La validación es correcta pero débil en impacto emocional",
      ],
      criterios_incorrecta: [
        "No incluye lenguaje legitimador explícito",
        "Solo refleja (nombra emoción sin legitimar)",
        "Usa expresiones vacías (por ejemplo: 'entiendo', 'comprendo') sin validación",
        "Introduce interpretación",
        "Explica el porqué de la emoción",
        "Incluye consejo o juicio",
        "Minimiza la experiencia del paciente",
        "Cambia de técnica (por ejemplo: hace una pregunta)",
        "Incluye preguntas",
      ],
      errores_tipicos: [
        "Usar reflejo en lugar de validación",
        "Usar expresiones vacías ('entiendo', 'comprendo')",
        "Explicar en lugar de legitimar",
        "Introducir causas ('porque')",
        "Minimizar la emoción",
        "Dar consejo",
        "Usar 'pero' que invalida",
        "Hacer preguntas en lugar de validar",
      ],
      lineamientos_correccion: [
        "Iniciar con una estructura legitimadora ('es entendible que…', 'tiene sentido que…')",
        "Mantener la respuesta breve y directa",
        "Eliminar explicaciones, causas o interpretaciones",
        "Eliminar cualquier pregunta",
        "Mantener la intervención dentro de validación (no cambiar de técnica)",
        "Usar un tono empático y natural",
        "Asegurar que la validación sea clara y explícita",
      ],
      reglas_decision_critica: [
        "Si NO hay lenguaje legitimador explícito → INCORRECTA",
        "Si contiene solo reflejo → INCORRECTA",
        "Si contiene 'entiendo' o 'comprendo' sin validar → INCORRECTA",
        "Si introduce causa ('porque', 'se debe a') → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
        "Si valida claramente → ADECUADA",
        "Si valida pero de forma débil → PARCIAL",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser validaciones completas",
        "Deben incluir lenguaje legitimador explícito",
        "No deben incluir preguntas",
        "No deben incluir explicaciones ni causas",
        "No deben introducir exploración",
        "Deben mejorar claridad y conexión emocional",
      ],
    },

    nivel_2: {
      objetivo: "Legitimar la emoción del paciente incorporando un contexto explícito basado en su experiencia, aportando sentido sin interpretar ni cambiar de técnica.",
      criterios_adecuada: [
        "Incluye lenguaje legitimador explícito (por ejemplo: 'es entendible', 'tiene sentido', 'es normal')",
        "Reconoce la emoción o experiencia del paciente",
        "Incluye un elemento contextual explícito derivado de lo dicho por el paciente (por ejemplo: 'sobre todo cuando...', 'considerando que...')",
        "El contexto no introduce causas ni interpretaciones",
        "Se mantiene breve, clara y directa (1–2 líneas)",
        "No incluye juicio, consejo ni minimización",
        "No incluye preguntas",
      ],
      criterios_parcial: [
        "Incluye lenguaje legitimador pero no incorpora contexto (nivel 1)",
        "Incluye contexto pero es redundante o no aporta claridad",
        "El contexto es poco claro o poco conectado con el contenido del paciente",
        "La validación es correcta pero genérica",
        "Incluye más de una idea sin claridad",
      ],
      criterios_incorrecta: [
        "No incluye lenguaje legitimador explícito",
        "Solo refleja (nombra emoción sin legitimar)",
        "Usa expresiones vacías ('entiendo', 'comprendo') sin validar",
        "Introduce causa o explicación (por ejemplo: 'porque', 'se debe a')",
        "Agrega información no mencionada por el paciente",
        "Introduce interpretación o significado no dicho",
        "Incluye consejo o directividad",
        "Minimiza la experiencia del paciente",
        "Cambia de técnica (por ejemplo: hace preguntas)",
        "Incluye preguntas",
      ],
      errores_tipicos: [
        "Quedarse en nivel 1 (solo validar sin contexto)",
        "Usar expresiones vacías ('entiendo', 'comprendo')",
        "Introducir causas ('porque', 'se debe a')",
        "Agregar contexto inventado",
        "Explicar en lugar de validar",
        "Dar consejo disfrazado",
        "Usar 'pero' que invalida",
        "Hacer preguntas en lugar de validar",
      ],
      lineamientos_correccion: [
        "Iniciar con lenguaje legitimador ('es entendible que…', 'tiene sentido que…')",
        "Agregar un contexto explícito usando estructuras como 'sobre todo cuando...' o 'considerando que...'",
        "El contexto debe provenir del contenido expresado por el paciente",
        "Eliminar cualquier causa o explicación",
        "Eliminar diagnósticos o interpretaciones",
        "Mantener una sola idea clara",
        "Mantener formato de validación (no cambiar de técnica)",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si NO hay lenguaje legitimador → INCORRECTA",
        "Si NO hay contexto → PARCIAL",
        "Si hay lenguaje legitimador + contexto → ADECUADA",
        "Si contiene 'porque', 'se debe a' → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
        "Si agrega información no dicha → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser validaciones completas",
        "Deben incluir lenguaje legitimador + contexto",
        "Deben usar estructuras como 'sobre todo cuando...' o 'considerando que...'",
        "No deben incluir preguntas",
        "No deben incluir causas ni explicaciones",
        "No deben introducir exploración",
        "Deben mejorar claridad y conexión emocional",
      ],
    },
  },

  reflejo: {
    nivel_unico: {
      objetivo: "Nombrar de forma directa la emoción del paciente usando lenguaje emocional, sin agregar contenido, explicación ni otras técnicas.",
      criterios_adecuada: [
        "La respuesta incluye una emoción explícita (por ejemplo: frustrado, triste, ansioso, enojado)",
        "Tiene forma directa de reflejo (por ejemplo: 'te sientes…', 'estás…', 'te notas…')",
        "Se centra únicamente en la emoción (no incluye contenido o situación)",
        "Es breve (una sola idea)",
        "No incluye explicación ni causa",
        "No incluye validación (no usa 'tiene sentido', 'es entendible')",
        "No incluye preguntas",
        "No agrega información no dicha por el paciente",
      ],
      criterios_parcial: [
        "Incluye emoción pero es muy general (por ejemplo: 'mal', 'raro')",
        "Mezcla emoción con contenido (por ejemplo: 'te sientes mal por lo que pasó')",
        "Incluye más de una emoción sin claridad",
        "No usa estructura directa de reflejo",
        "Es más larga de lo necesario",
        "Se acerca a paráfrasis",
      ],
      criterios_incorrecta: [
        "No incluye ninguna emoción explícita",
        "Se centra en contenido o situación",
        "Introduce causa o explicación (por ejemplo: 'porque')",
        "Incluye validación (por ejemplo: 'es normal que…')",
        "Hace preguntas",
        "Incluye consejo o solución",
        "Agrega información no mencionada",
        "Usa lenguaje no emocional",
      ],
      errores_tipicos: [
        "Parafrasear en lugar de reflejar",
        "Usar palabras vagas ('mal', 'raro')",
        "Explicar en lugar de nombrar emoción",
        "Validar en lugar de reflejar",
        "Responder con preguntas",
        "Agregar contenido no dicho",
        "Ser demasiado largo",
        "No usar lenguaje emocional claro",
      ],
      lineamientos_correccion: [
        "Transformar la respuesta en una frase directa tipo 'te sientes…'",
        "Usar una emoción específica (triste, frustrado, ansioso, etc.)",
        "Eliminar cualquier contenido, causa o explicación",
        "Eliminar validación o preguntas",
        "Mantener una sola emoción principal",
        "Mantener la respuesta breve",
      ],
      reglas_decision_critica: [
        "Si NO hay emoción explícita → INCORRECTA",
        "Si incluye 'porque', 'ya que', 'se debe a' → INCORRECTA",
        "Si incluye validación ('tiene sentido', 'es normal') → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
        "Si incluye contenido o situación → PARCIAL",
        "Si incluye emoción clara + formato directo → ADECUADA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser reflejos",
        "Deben usar formato 'te sientes…' o equivalente",
        "Deben incluir una emoción clara y específica",
        "No deben incluir contenido, causa ni explicación",
        "No deben incluir validación ni preguntas",
        "Deben ser breves (una sola idea)",
      ],
    },
  },

  parafrasis: {
    nivel_1: {
      objetivo: "Reformular el contenido del paciente de forma clara usando palabras propias, manteniendo el significado original sin agregar emoción, interpretación ni otras técnicas.",
      criterios_adecuada: [
        "Reformula el contenido usando palabras diferentes al paciente",
        "Mantiene las ideas principales del discurso",
        "Se centra en contenido (hechos, situación), no en emoción",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye validación ni preguntas",
        "Es clara y breve (una sola idea organizada)",
      ],
      criterios_parcial: [
        "Repite gran parte del contenido de forma casi literal",
        "Omite parte relevante del contenido",
        "La reformulación es poco clara o desordenada",
        "Incluye contenido pero con estructura confusa",
        "Es correcta pero poco útil clínicamente",
      ],
      criterios_incorrecta: [
        "No es una paráfrasis",
        "Agrega información que el paciente no dijo",
        "Introduce interpretación o explicación",
        "Cambia el significado del discurso",
        "Incluye emoción (reflejo)",
        "Incluye validación ('tiene sentido…')",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Repetir literalmente",
        "Agregar explicaciones ('porque')",
        "Cambiar el sentido del mensaje",
        "Convertirlo en reflejo (emoción)",
        "Convertirlo en validación",
        "Ser demasiado largo o desordenado",
      ],
      lineamientos_correccion: [
        "Reformular usando palabras propias",
        "Mantener las ideas principales del paciente",
        "Eliminar cualquier emoción, explicación o interpretación",
        "Mantener una sola idea clara",
        "Organizar el contenido de forma simple",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si repite casi literalmente → PARCIAL",
        "Si agrega información → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
        "Si mantiene contenido con palabras propias → ADECUADA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser paráfrasis",
        "Deben reformular usando palabras diferentes",
        "Deben mantener el contenido original",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben ser claras y breves",
      ],
    },

    nivel_2: {
      objetivo: "Reformular el contenido del paciente integrando dos partes del discurso (por ejemplo, una contradicción o ambivalencia) en una sola frase clara, sin interpretar ni agregar información.",
      criterios_adecuada: [
        "Reformula el contenido usando palabras propias",
        "Incluye al menos dos elementos del discurso del paciente",
        "Integra ambos elementos en una sola frase (por ejemplo: 'quieres... pero...')",
        "Mantiene fidelidad al significado original",
        "Se centra en contenido, no en emoción",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye validación ni preguntas",
        "Es clara y organizada",
      ],
      criterios_parcial: [
        "Reformula solo una parte del discurso (nivel 1)",
        "Incluye dos elementos pero no los integra claramente",
        "La relación entre ambas partes es confusa",
        "Repite gran parte del contenido literal",
        "La organización es débil o poco clara",
      ],
      criterios_incorrecta: [
        "No es una paráfrasis",
        "No incluye dos elementos del discurso",
        "Agrega información que el paciente no dijo",
        "Introduce interpretación o explicación",
        "Cambia el significado del discurso",
        "Incluye emoción (reflejo)",
        "Incluye validación",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Quedarse en nivel 1 (reformular una sola idea)",
        "No integrar la contradicción",
        "Repetir literal",
        "Agregar explicaciones ('porque')",
        "Interpretar en lugar de organizar",
        "Confundir con reflejo o validación",
      ],
      lineamientos_correccion: [
        "Identificar dos elementos del discurso (por ejemplo: intención + acción, deseo + dificultad)",
        "Integrarlos en una sola frase usando conectores como 'pero', 'aunque', 'y al mismo tiempo'",
        "Usar palabras propias",
        "Eliminar cualquier emoción, explicación o interpretación",
        "Mantener una sola idea organizada",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si incluye solo un elemento → PARCIAL",
        "Si incluye dos elementos pero no los integra → PARCIAL",
        "Si integra dos elementos claramente → ADECUADA",
        "Si agrega información → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser paráfrasis",
        "Deben incluir dos elementos del discurso del paciente",
        "Deben integrarlos en una sola frase",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben ser claras y organizadas",
      ],
    },

    nivel_3: {
      objetivo: "Reformular el contenido del paciente integrando tres o más elementos del discurso en una sola estructura clara, manteniendo la complejidad sin interpretar ni simplificar.",
      criterios_adecuada: [
        "Reformula el contenido usando palabras propias",
        "Incluye tres o más elementos del discurso del paciente",
        "Integra los elementos en una sola estructura organizada",
        "Mantiene fidelidad al significado original",
        "No simplifica la experiencia a una sola idea",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye emoción (reflejo)",
        "No incluye validación ni preguntas",
        "Es clara y organizada",
      ],
      criterios_parcial: [
        "Integra solo dos elementos (nivel 2)",
        "Incluye tres elementos pero no los organiza claramente",
        "Simplifica parcialmente la experiencia",
        "Omite elementos relevantes del discurso",
        "La integración es confusa o poco clara",
      ],
      criterios_incorrecta: [
        "No es una paráfrasis",
        "Incluye menos de dos elementos",
        "Agrega información que el paciente no dijo",
        "Introduce interpretación o explicación",
        "Reduce la experiencia a una sola idea",
        "Incluye emoción (reflejo)",
        "Incluye validación",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Quedarse en nivel 2 (solo dos elementos)",
        "Simplificar en exceso",
        "Interpretar en lugar de integrar",
        "Agregar explicaciones ('porque')",
        "Perder partes del discurso",
        "Confundir con análisis clínico",
      ],
      lineamientos_correccion: [
        "Identificar al menos tres elementos del discurso (por ejemplo: emoción + acción + intención)",
        "Integrarlos en una sola frase organizada",
        "Usar conectores como 'y al mismo tiempo', 'pero', 'mientras', 'por un lado... y por otro...'",
        "Eliminar cualquier explicación o interpretación",
        "Mantener fidelidad al contenido original",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si incluye 3 o más elementos → ADECUADA",
        "Si incluye solo 2 elementos → PARCIAL",
        "Si incluye solo 1 elemento → INCORRECTA",
        "Si agrega información → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye explicación ('porque') → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser paráfrasis",
        "Deben incluir tres o más elementos del discurso",
        "Deben integrarlos en una sola estructura clara",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben mantener la complejidad sin simplificar",
      ],
    },
  },

  sintesis: {
    nivel_1: {
      objetivo: "Reducir el contenido del paciente a sus ideas principales integrándolas en una sola frase clara, sin agregar ni interpretar.",
      criterios_adecuada: [
        "Incluye al menos dos elementos relevantes del discurso",
        "Reduce el contenido a lo esencial (no repite todo)",
        "Integra los elementos en una sola frase",
        "Mantiene fidelidad al significado original",
        "Se centra en contenido (no emoción)",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye validación ni preguntas",
        "Es clara, breve y organizada",
      ],
      criterios_parcial: [
        "Incluye solo un elemento relevante",
        "Incluye varios elementos pero no los integra",
        "Se acerca a paráfrasis (reformulación sin reducción)",
        "La síntesis es confusa o poco clara",
        "Reduce en exceso perdiendo información importante",
      ],
      criterios_incorrecta: [
        "No es una síntesis",
        "Enumera elementos sin integrarlos",
        "Agrega información no dicha",
        "Introduce interpretación o explicación",
        "Cambia el significado del contenido",
        "Se centra en emoción (reflejo)",
        "Incluye validación",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Listar sin integrar",
        "Repetir en lugar de resumir",
        "Agregar explicaciones ('porque')",
        "Reducir demasiado",
        "Perder ideas clave",
        "Confundir con paráfrasis",
        "Incluir emoción",
      ],
      lineamientos_correccion: [
        "Identificar al menos dos ideas principales del discurso",
        "Reducir el contenido eliminando detalles secundarios",
        "Integrar las ideas en una sola frase",
        "Usar lenguaje claro y directo",
        "Eliminar cualquier emoción, explicación o interpretación",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si incluye 2 o más elementos reducidos e integrados → ADECUADA",
        "Si incluye 1 elemento → PARCIAL",
        "Si enumera sin integrar → INCORRECTA",
        "Si repite sin reducir → PARCIAL",
        "Si agrega información → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser síntesis",
        "Deben reducir el contenido (no repetirlo)",
        "Deben incluir al menos dos elementos",
        "Deben integrarlos en una sola frase",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben ser claras y breves",
      ],
    },

    nivel_2: {
      objetivo: "Reducir el discurso del paciente integrando múltiples elementos organizados en una secuencia clara (por ejemplo: situación → reacción → consecuencia), sin interpretar ni agregar información.",
      criterios_adecuada: [
        "Incluye tres o más elementos relevantes del discurso",
        "Organiza los elementos en una secuencia clara (por ejemplo: situación → reacción → consecuencia)",
        "Integra los elementos en una sola frase o estructura coherente",
        "Reduce el contenido a lo esencial (no repite todo)",
        "Mantiene fidelidad al significado original",
        "Se centra en contenido (no emoción)",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye validación ni preguntas",
      ],
      criterios_parcial: [
        "Incluye dos elementos (nivel 1)",
        "Incluye varios elementos pero sin orden claro",
        "La secuencia es confusa o incompleta",
        "Se acerca a paráfrasis o síntesis básica",
        "Reduce en exceso perdiendo coherencia",
      ],
      criterios_incorrecta: [
        "No es una síntesis",
        "Enumera elementos sin organizarlos",
        "No integra los elementos en una estructura",
        "Agrega información no dicha",
        "Introduce interpretación o explicación",
        "Cambia el significado del contenido",
        "Incluye emoción (reflejo)",
        "Incluye validación",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Listar sin ordenar",
        "No identificar la secuencia (antes/después/reacción)",
        "Repetir en lugar de sintetizar",
        "Agregar explicaciones ('porque')",
        "Reducir en exceso",
        "Confundir con paráfrasis",
        "Incluir emoción",
      ],
      lineamientos_correccion: [
        "Identificar al menos tres elementos del discurso",
        "Organizarlos en una secuencia (por ejemplo: situación → reacción → consecuencia)",
        "Integrarlos en una sola frase clara",
        "Eliminar detalles secundarios",
        "Eliminar cualquier emoción, explicación o interpretación",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si incluye 3 o más elementos organizados → ADECUADA",
        "Si incluye 2 elementos → PARCIAL",
        "Si incluye varios elementos sin orden → PARCIAL",
        "Si enumera sin integrar → INCORRECTA",
        "Si agrega información → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye explicación ('porque') → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser síntesis",
        "Deben incluir tres o más elementos",
        "Deben organizarlos en una secuencia clara",
        "Deben integrarlos en una sola frase",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben mejorar claridad y organización",
      ],
    },

    nivel_3: {
      objetivo: "Reducir e integrar el discurso del paciente organizando múltiples elementos alrededor de un elemento principal explícito, sin interpretar ni agregar información.",
      criterios_adecuada: [
        "Incluye tres o más elementos relevantes del discurso",
        "Identifica un elemento principal explícito dentro del contenido del paciente",
        "Organiza los demás elementos en relación a ese elemento principal",
        "Integra todo en una sola estructura clara",
        "Reduce el contenido a lo esencial",
        "Mantiene fidelidad al significado original",
        "No agrega información nueva",
        "No incluye interpretación ni explicación",
        "No incluye emoción (reflejo)",
        "No incluye validación ni preguntas",
      ],
      criterios_parcial: [
        "Incluye múltiples elementos pero no define un elemento principal",
        "Organiza elementos pero todos con el mismo peso (nivel 2)",
        "El elemento central no es claro",
        "La relación entre elementos es débil",
        "La síntesis es correcta pero plana (sin jerarquía)",
      ],
      criterios_incorrecta: [
        "No es una síntesis",
        "Incluye menos de tres elementos",
        "No integra los elementos",
        "Enumera sin organizar",
        "Agrega información no dicha",
        "Introduce interpretación o explicación",
        "Define un 'eje central' que no está explícito en el discurso",
        "Simplifica en exceso perdiendo elementos clave",
        "Incluye emoción (reflejo)",
        "Incluye validación",
        "Hace preguntas",
        "Incluye consejo o juicio",
      ],
      errores_tipicos: [
        "Organizar sin jerarquizar",
        "Elegir un eje no presente en el discurso",
        "Interpretar en lugar de sintetizar",
        "Simplificar en exceso",
        "Listar elementos sin integrarlos",
        "Agregar explicaciones ('porque')",
        "Confundir con análisis clínico",
      ],
      lineamientos_correccion: [
        "Identificar al menos tres elementos del discurso",
        "Detectar el elemento que aparece como más recurrente o relevante",
        "Usar ese elemento como punto central de la frase",
        "Relacionar los demás elementos alrededor de ese eje",
        "Mantener todo en una sola frase clara",
        "Eliminar cualquier interpretación o explicación",
        "No usar preguntas",
      ],
      reglas_decision_critica: [
        "Si incluye 3+ elementos y define uno como central → ADECUADA",
        "Si incluye 3+ elementos sin jerarquía → PARCIAL",
        "Si incluye 2 elementos → PARCIAL",
        "Si incluye menos de 2 elementos → INCORRECTA",
        "Si agrega información → INCORRECTA",
        "Si introduce interpretación → INCORRECTA",
        "Si define un eje no presente en el discurso → INCORRECTA",
        "Si incluye emoción → INCORRECTA",
        "Si incluye validación → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser síntesis",
        "Deben incluir tres o más elementos",
        "Deben definir un elemento principal explícito",
        "Deben organizar los demás elementos en torno a ese eje",
        "No deben incluir emoción",
        "No deben incluir validación",
        "No deben incluir preguntas",
        "Deben mantener fidelidad al contenido",
      ],
    },
  },

  interpretacion: {
    nivel_unico: {
      objetivo: "Proponer un significado no explícito conectando la frase del paciente con el contexto clínico proporcionado, utilizando lenguaje tentativo y sin afirmar como verdad absoluta.",
      criterios_adecuada: [
        "Propone un significado no explícito en la frase del paciente",
        "Conecta explícitamente al menos un elemento del contexto con la frase del paciente",
        "Establece una relación lógica entre la experiencia actual y el contexto dado",
        "Usa lenguaje tentativo (por ejemplo: 'parece', 'podría ser', 'me da la impresión')",
        "No afirma el significado como verdad absoluta",
        "No es una repetición ni reformulación del contenido",
        "No es una validación ni reflejo",
        "No incluye preguntas",
        "No incluye consejo o dirección",
      ],
      criterios_parcial: [
        "Propone un significado pero se basa solo en la frase del paciente (sin usar el contexto)",
        "La conexión entre contexto y frase es débil o poco clara",
        "La interpretación es muy general o superficial",
        "Se acerca a paráfrasis con leve inferencia",
        "No aporta una comprensión nueva clara",
        "El lenguaje tentativo es inconsistente",
      ],
      criterios_incorrecta: [
        "No propone ningún significado nuevo",
        "Es una paráfrasis o repetición",
        "Es una validación o reflejo",
        "Hace preguntas",
        "Incluye consejo o dirección",
        "Afirma de forma rígida (por ejemplo: 'esto es porque...')",
        "Introduce información no presente en el contexto o la frase",
        "No utiliza el contexto clínico proporcionado",
        "La interpretación no tiene relación lógica con el caso",
        "Es obvia (el paciente ya lo dijo explícitamente)",
      ],
      errores_tipicos: [
        "Ignorar el contexto clínico",
        "Interpretar solo la frase",
        "Inventar información no dada",
        "Ser demasiado afirmativo",
        "Hacer interpretaciones genéricas",
        "Explicar en lugar de sugerir",
        "Convertir la intervención en pregunta",
        "Confundir con validación o reflejo",
      ],
      lineamientos_correccion: [
        "Identificar un elemento relevante del contexto",
        "Relacionarlo con la frase del paciente",
        "Proponer un significado que conecte ambos",
        "Usar lenguaje tentativo ('parece', 'podría ser', 'me da la impresión')",
        "Evitar afirmaciones absolutas",
        "Evitar repetir lo que el paciente ya dijo",
        "No usar preguntas",
        "No dar consejos",
        "Mantener coherencia con la información disponible",
      ],
      reglas_decision_critica: [
        "Si NO propone un significado nuevo → INCORRECTA",
        "Si repite el contenido → INCORRECTA",
        "Si NO usa el contexto → PARCIAL",
        "Si usa solo la frase → PARCIAL",
        "Si conecta contexto + frase → ADECUADA",
        "Si inventa información → INCORRECTA",
        "Si afirma de forma rígida ('esto es porque...') → INCORRECTA",
        "Si usa lenguaje tentativo → favorece ADECUADA",
        "Si incluye pregunta → INCORRECTA",
        "Si incluye consejo → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser interpretaciones",
        "Deben proponer un significado no explícito",
        "Deben conectar explícitamente el contexto con la frase",
        "Deben usar lenguaje tentativo",
        "No deben incluir preguntas",
        "No deben incluir consejo",
        "No deben afirmar como verdad absoluta",
        "No deben inventar información",
      ],
      reglas_seguridad_clinica: [
        "Si el contexto incluye experiencias sensibles (abuso, violencia, abandono), la interpretación debe ser especialmente tentativa",
        "Evitar afirmaciones directas en estos casos",
        "Priorizar formulaciones protectoras (por ejemplo: 'podría ser que esto te ha ayudado a…', 'quizá esto ha funcionado como…')",
      ],
    },
  },

  confrontacion: {
    nivel_unico: {
      objetivo: "Señalar una discrepancia del discurso del paciente conectando explícitamente dos elementos contradictorios, sin interpretar ni usar preguntas.",
      criterios_adecuada: [
        "Incluye dos elementos del discurso del paciente",
        "Expone ambas partes de la discrepancia en la misma intervención",
        "Usa un conector de contraste explícito (por ejemplo: 'por un lado... y por otro...', 'al mismo tiempo...', 'sin embargo...')",
        "Se basa únicamente en lo que el paciente ha dicho",
        "No introduce explicación ni causa",
        "No incluye interpretación",
        "No incluye preguntas",
        "No incluye juicio, crítica o conclusión",
        "Es clara y directa",
      ],
      criterios_parcial: [
        "Incluye dos elementos pero no los conecta claramente",
        "Señala solo una parte de la discrepancia",
        "La contradicción no queda completamente explícita",
        "La estructura es confusa",
        "Se acerca a interpretación o pregunta",
        "El contraste es débil",
      ],
      criterios_incorrecta: [
        "No incluye discrepancia (solo una idea)",
        "Incluye solo un elemento del discurso",
        "Es una interpretación (explica el porqué)",
        "Hace preguntas",
        "Incluye juicio o crítica",
        "Impone conclusión ('eso no tiene sentido', 'te estás contradiciendo')",
        "Introduce información no dicha",
        "No conecta las partes del discurso",
      ],
      errores_tipicos: [
        "Hacer preguntas en lugar de confrontar",
        "Explicar en lugar de mostrar la discrepancia",
        "No usar contraste explícito",
        "Señalar solo una parte del discurso",
        "Usar tono acusatorio",
        "Introducir contenido no dicho",
        "Convertirlo en interpretación",
      ],
      lineamientos_correccion: [
        "Identificar dos partes del discurso que se contradicen",
        "Unirlas en una sola intervención",
        "Usar conectores como 'por un lado... y por otro...', 'al mismo tiempo...', 'sin embargo...'",
        "Eliminar cualquier explicación o causa",
        "Eliminar preguntas",
        "No añadir conclusiones",
        "Mantenerse en lo que el paciente dijo",
      ],
      reglas_decision_critica: [
        "Si NO incluye dos elementos → INCORRECTA",
        "Si incluye dos elementos pero no los conecta → PARCIAL",
        "Si conecta dos elementos con contraste explícito → ADECUADA",
        "Si incluye pregunta → INCORRECTA",
        "Si incluye explicación ('porque', 'se debe a') → INCORRECTA",
        "Si introduce información no dicha → INCORRECTA",
        "Si impone conclusión → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben ser confrontaciones",
        "Deben incluir dos elementos del discurso del paciente",
        "Deben usar contraste explícito",
        "No deben incluir preguntas",
        "No deben incluir explicación ni causa",
        "No deben incluir juicio",
        "Deben ser claras y directas",
      ],
    },
  },

  auto_revelacion: {
    nivel_unico: {
      objetivo: "Compartir brevemente una experiencia propia del terapeuta conectándola explícitamente con la experiencia del paciente y utilizando el contexto dado, sin desplazar el foco ni dar consejo.",
      criterios_adecuada: [
        "Incluye una experiencia propia explícita del terapeuta (uso de 'yo')",
        "Utiliza el contexto del terapeuta proporcionado",
        "Conecta explícitamente la experiencia del terapeuta con la del paciente",
        "Se mantiene centrada en el proceso del paciente",
        "Es breve (máximo 1–2 líneas)",
        "No incluye consejo ni indicaciones",
        "No incluye interpretación del paciente",
        "No incluye preguntas",
        "No agrega detalles innecesarios",
        "El foco final permanece en el paciente",
      ],
      criterios_parcial: [
        "Incluye experiencia propia pero no utiliza claramente el contexto del terapeuta",
        "Incluye experiencia pero la conexión con el paciente es débil o implícita",
        "Es demasiado general (por ejemplo: 'yo también')",
        "Incluye más detalles de los necesarios",
        "El foco se desplaza parcialmente al terapeuta",
        "La conexión terapéutica es poco clara",
      ],
      criterios_incorrecta: [
        "No incluye experiencia propia del terapeuta",
        "No utiliza el contexto del terapeuta proporcionado",
        "No conecta con la experiencia del paciente",
        "Se convierte en validación o consejo",
        "Incluye consejo directo ('a mí me sirvió...', 'deberías...')",
        "Se centra en exceso en el terapeuta",
        "Es extensa o detallada",
        "Desplaza el foco completamente al terapeuta",
        "Incluye interpretación del paciente",
        "Incluye preguntas",
      ],
      errores_tipicos: [
        "Decir 'yo también' sin contenido clínico",
        "No usar el contexto del terapeuta",
        "No conectar con lo que dijo el paciente",
        "Contar una historia larga",
        "Dar consejo disfrazado",
        "Hablar más del terapeuta que del paciente",
        "Usar la revelación para enseñar",
        "Cerrar el proceso del paciente",
      ],
      lineamientos_correccion: [
        "Usar una experiencia propia explícita basada en el contexto del terapeuta",
        "Mantener la intervención breve (1–2 líneas)",
        "Conectar explícitamente la experiencia del terapeuta con la del paciente",
        "Eliminar cualquier consejo o instrucción",
        "Eliminar detalles innecesarios",
        "Mantener el foco en el paciente al final",
        "No usar preguntas",
        "Priorizar conexión sobre explicación",
      ],
      reglas_decision_critica: [
        "Si NO incluye experiencia propia ('yo') → INCORRECTA",
        "Si NO usa el contexto del terapeuta → PARCIAL",
        "Si NO conecta la experiencia con el paciente → PARCIAL",
        "Si incluye experiencia + contexto + conexión explícita → ADECUADA",
        "Si incluye consejo → INCORRECTA",
        "Si es extensa o detallada → INCORRECTA",
        "Si desplaza el foco al terapeuta → INCORRECTA",
        "Si incluye preguntas → INCORRECTA",
        "Si incluye interpretación → INCORRECTA",
      ],
      reglas_alternativas: [
        "Las alternativas deben incluir una experiencia breve en primera persona",
        "Deben utilizar el contexto del terapeuta",
        "Deben conectar explícitamente con la experiencia del paciente",
        "No deben incluir consejo",
        "No deben incluir interpretación",
        "No deben incluir preguntas",
        "Deben ser breves (1–2 líneas)",
        "Deben mantener el foco en el paciente",
      ],
    },
  },

  humor_terapeutico: {
    nivel_unico: {
      objetivo: "Señalar de forma ligera una contradicción o patrón del paciente mediante una formulación humorística sutil basada en su propio discurso, favoreciendo insight sin invalidar ni interpretar.",
      criterios_adecuada: [
        "Se basa en una contradicción, ambivalencia o patrón explícito del paciente",
        "Incluye al menos dos elementos del discurso del paciente",
        "Utiliza una formulación ligera o humorística (no agresiva)",
        "Sugiere el patrón sin explicarlo directamente",
        "Mantiene respeto total (no ridiculiza ni invalida)",
        "No incluye interpretación explícita",
        "No incluye consejo ni dirección",
        "No incluye preguntas",
        "Se mantiene breve (1 línea o máximo 2)",
        "No introduce contenido nuevo",
      ],
      criterios_parcial: [
        "Se basa en el discurso pero la contradicción no es clara",
        "El humor es débil o poco evidente",
        "Se acerca a confrontación directa (pierde ligereza)",
        "La intervención es correcta pero sin efecto clínico claro",
        "La formulación pierde sutileza o naturalidad",
      ],
      criterios_incorrecta: [
        "No se basa en una contradicción del paciente",
        "No incluye discrepancia (solo una idea)",
        "Es una burla o ridiculización",
        "Incluye juicio o tono agresivo",
        "Introduce interpretación",
        "Hace preguntas",
        "Incluye consejo",
        "Introduce contenido no dicho",
        "No tiene coherencia clínica",
      ],
      errores_tipicos: [
        "Confundir humor con burla",
        "No usar el contenido del paciente",
        "Ser demasiado directo (confrontación)",
        "Explicar el patrón en lugar de sugerirlo",
        "Perder la base clínica",
        "Usar humor en momentos inadecuados",
      ],
      lineamientos_correccion: [
        "Identificar una contradicción explícita del paciente",
        "Usar esa contradicción como base",
        "Exagerar ligeramente el patrón (sin ridiculizar)",
        "Mantener un tono ligero y respetuoso",
        "No explicar el patrón",
        "No usar preguntas",
        "No dar consejo",
        "Mantener la intervención breve",
      ],
      reglas_decision_critica: [
        "Si NO hay contradicción en la frase → INCORRECTA",
        "Si NO usa el contenido del paciente → INCORRECTA",
        "Si incluye burla o juicio → INCORRECTA",
        "Si incluye interpretación → INCORRECTA",
        "Si incluye pregunta → INCORRECTA",
        "Si incluye consejo → INCORRECTA",
        "Si muestra contradicción con ligereza → ADECUADA",
        "Si es demasiado directa (confrontación) → PARCIAL",
      ],
      reglas_alternativas: [
        "Las alternativas deben basarse en una contradicción del paciente",
        "Deben usar una formulación ligera o humorística",
        "No deben incluir burla ni juicio",
        "No deben incluir preguntas",
        "No deben incluir interpretación",
        "No deben incluir consejo",
        "Deben mantenerse breves y respetuosas",
      ],
      reglas_seguridad_clinica: [
        "El humor solo es válido si el paciente ya expresó una contradicción o insight",
        "Si el paciente NO ha reconocido el patrón → INCORRECTA",
        "Si hay alta vulnerabilidad emocional → INCORRECTA",
        "NO usar humor en casos de trauma, abuso o dolor intenso",
        "Si hay duda clínica → evaluar como INCORRECTA",
      ],
    },
  },
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

/**
 * Normaliza la clave de la habilidad para buscar en CRITERIOS_HABILIDAD.
 * Acepta variantes comunes (plural, singular, aliases) y las mapea a la key
 * canónica que usa el sistema de criterios.
 */
function normalizeHabilidadKey(habilidad) {
  const h = String(habilidad || "").trim().toLowerCase();

  const MAP = {
    preguntas_abiertas: "pregunta_abierta",
    pregunta_abierta:   "pregunta_abierta",

    parafrasis:       "parafrasis",
    reflejo:          "reflejo",
    validacion:       "validacion",
    clarificacion:    "clarificacion",
    sintesis:         "sintesis",
    interpretacion:   "interpretacion",
    confrontacion:    "confrontacion",
    auto_revelacion:  "auto_revelacion",
    humor_terapeutico:"humor_terapeutico",
  };

  return MAP[h] || h;
}

/**
 * Normaliza el nivel para buscar criterios.
 * Acepta: nivel_1, nivel_2, nivel_3, nivel_unico, basico, intermedio,
 * avanzado, unico, "1", "2", "3", "i", "ii", "iii", etc.
 * Devuelve siempre una key válida del CRITERIOS_HABILIDAD: nivel_1, nivel_2, nivel_3 o nivel_unico.
 */
function normalizeNivelKey(nivel) {
  const v = String(nivel || "").trim().toLowerCase();

  // Ya viene en formato correcto
  if (v === "nivel_1" || v === "nivel_2" || v === "nivel_3" || v === "nivel_unico") return v;

  // Aliases comunes
  if (v === "basico"     || v === "básico"     || v === "1" || v === "i"   || v === "nivel 1") return "nivel_1";
  if (v === "intermedio" || v === "2"          || v === "ii"               || v === "nivel 2") return "nivel_2";
  if (v === "avanzado"   || v === "3"          || v === "iii"              || v === "nivel 3") return "nivel_3";
  if (v === "unico"      || v === "único"      || v === "u")                                    return "nivel_unico";

  // Default seguro
  return "nivel_1";
}

/**
 * Devuelve el label legible para un nivel, aceptando aliases.
 * Ej: "basico" → "Nivel 1", "nivel_unico" → "Único".
 */
function getNivelLabel(nivel) {
  const key = normalizeNivelKey(nivel);
  return NIVEL_LABELS[key] || NIVEL_LABELS[nivel] || String(nivel || "—");
}

/**
 * Devuelve los criterios de una habilidad para el nivel solicitado.
 * - Normaliza la habilidad (acepta aliases).
 * - Normaliza el nivel (acepta basico/intermedio/avanzado además de nivel_1/2/3).
 * - Si la habilidad solo tiene `nivel_unico`, lo devuelve sin importar el nivel pedido.
 */
function getCriterios(habilidad, nivel) {
  const habilidadKey = normalizeHabilidadKey(habilidad);
  const habilidadCfg = CRITERIOS_HABILIDAD?.[habilidadKey];
  if (!habilidadCfg) return null;

  // Si la habilidad solo tiene nivel único → devolver siempre ese
  const niveles = Object.keys(habilidadCfg);
  if (niveles.length === 1 && niveles[0] === "nivel_unico") {
    return habilidadCfg.nivel_unico;
  }

  // Normalizar nivel (acepta basico/intermedio/avanzado)
  const nivelKey = normalizeNivelKey(nivel);

  // Pedido directo
  if (habilidadCfg[nivelKey]) return habilidadCfg[nivelKey];

  // Fallback: si existe nivel_unico
  if (habilidadCfg.nivel_unico) return habilidadCfg.nivel_unico;

  return null;
}

/**
 * Convierte una lista de strings a un bloque de bullets ("- ...").
 * Si la lista está vacía/undefined devuelve null para que el caller pueda
 * decidir omitir la sección entera.
 */
function bulletList(arr) {
  const items = safeArr(arr);
  if (items.length === 0) return null;
  return items.map((c) => `- ${c}`).join("\n");
}

/* =========================================================
   PROMPT — ANÁLISIS POR CASO
========================================================= */
function buildPromptCaso({ habilidad, nivel, caso, transcripcion }) {
  const habilidadKey   = normalizeHabilidadKey(habilidad);
  const habilidadLabel = INTERVENCION_LABELS[habilidadKey] || habilidadKey;
  const nivelLabel     = getNivelLabel(nivel);
  const criterios      = getCriterios(habilidadKey, nivel);

  // Si no hay criterios definidos, evaluación con criterio clínico general
  if (!criterios) {
    return `Actúa como un supervisor clínico experto en psicoterapia.

No hay criterios específicos definidos para ${habilidadLabel} nivel ${nivelLabel}.
Evalúa con criterio clínico general.

CASO (paciente):
"${caso || ""}"

RESPUESTA DEL ESTUDIANTE:
"${transcripcion || ""}"

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

  // Construcción de cada sección — se omite si no hay datos
  const objetivo                = safeStr(criterios.objetivo) || "—";
  const adecuadaStr             = bulletList(criterios.criterios_adecuada);
  const parcialStr              = bulletList(criterios.criterios_parcial);
  const incorrectaStr           = bulletList(criterios.criterios_incorrecta);
  const erroresStr              = bulletList(criterios.errores_tipicos);
  const lineamientosStr         = bulletList(criterios.lineamientos_correccion);

  // Reglas de decisión crítica + añadido opcional
  const reglasDecisionBase      = safeArr(criterios.reglas_decision_critica);
  const reglasDecisionPlus      = [...reglasDecisionBase, "Si rompe UNA regla crítica → INCORRECTA"];
  const reglasDecisionStr       = bulletList(reglasDecisionPlus);

  const reglasAlternativasStr   = bulletList(criterios.reglas_alternativas);
  // Soporta ambas grafías encontradas en los JSON originales
  const seguridadClinicaSrc     = criterios.reglas_seguridad_clinica || criterios.regla_seguridad_clinica;
  const reglasSeguridadStr      = bulletList(seguridadClinicaSrc);

  // Bloques opcionales
  const reglasDecisionBlock     = reglasDecisionStr     ? `\n\nREGLAS DE DECISIÓN CRÍTICA:\n${reglasDecisionStr}`           : "";
  const reglasAlternativasBlock = reglasAlternativasStr ? `\n\nREGLAS DE ALTERNATIVAS:\n${reglasAlternativasStr}`           : "";
  const seguridadBlock          = reglasSeguridadStr    ? `\n\nREGLAS DE SEGURIDAD CLÍNICA:\n${reglasSeguridadStr}`         : "";

  return `Actúa como un supervisor clínico experto en psicoterapia.

Tu tarea es evaluar la intervención de un estudiante dentro de un ejercicio de micro práctica clínica.

IMPORTANTE:
Debes evaluar de forma ESTRICTAMENTE OPERATIVA, no interpretativa.
Debes priorizar las REGLAS DE DECISIÓN sobre los criterios descriptivos.

RESTRICCIÓN CRÍTICA DE TÉCNICA:

- Solo evalúa si la intervención corresponde EXACTAMENTE a la habilidad indicada.
- Si corresponde a otra técnica → INCORRECTA
- No mezcles habilidades

DISTINCIÓN OPERATIVA:

- Pregunta abierta → debe ser pregunta
- Validacion → no debe tener preguntas
- Reflejo → solo emocion, sin contenido
- Paráfrasis → contenido sin emocion
- Interpretacion → debe usar contexto + significado nuevo
- Confrontacion → debe mostrar contradiccion explicita

Si no cumple esto → INCORRECTA

---

HABILIDAD: ${habilidadLabel}
NIVEL: ${nivelLabel}

---

CRITERIOS DE EVALUACIÓN:

OBJETIVO:
${objetivo}

CRITERIOS — ADECUADA:
${adecuadaStr || "—"}

CRITERIOS — PARCIAL:
${parcialStr || "—"}

CRITERIOS — INCORRECTA:
${incorrectaStr || "—"}

ERRORES TÍPICOS:
${erroresStr || "—"}

LINEAMIENTOS PARA CORRECCIÓN:
${lineamientosStr || "—"}${reglasDecisionBlock}${reglasAlternativasBlock}${seguridadBlock}

---

CASO (paciente):
"${caso || ""}"

RESPUESTA DEL ESTUDIANTE:
"${transcripcion || ""}"

---

TAREA:

1. IDENTIFICACIÓN DE LA INTERVENCIÓN
- Determina qué tipo de intervención realizó el estudiante
- Si NO corresponde a la habilidad evaluada → clasificar como INCORRECTA directamente

---

2. VALIDACIÓN ESTRUCTURAL
- Verifica si cumple la forma mínima de la técnica (ej: pregunta, validación, etc.)
- Si falla estructura → INCORRECTA

---

3. APLICACIÓN DE REGLAS CRÍTICAS (PRIORIDAD MÁXIMA)
- Evalúa cada regla crítica una por una
- Si alguna regla indica INCORRECTA → detener evaluación y clasificar como INCORRECTA
- NO continúes justificando como adecuada o parcial si una regla crítica se rompe

---

4. CLASIFICACIÓN FINAL
- Si cumple reglas críticas → ADECUADA o PARCIAL según precisión
- Si hay ambigüedad → PARCIAL
- Justifica SIEMPRE con base en criterios y reglas

---

5. JUSTIFICACIÓN CLÍNICA
Explica:
- Qué hizo bien o mal el estudiante
- Qué criterio cumplió o no
- Qué regla se activó

---

6. CORRECCIÓN
- Indica cómo mejorar la intervención
- Debe mantenerse dentro de la MISMA técnica
- No introducir otras habilidades

---

7. ALTERNATIVA CORRECTA
Genera UNA alternativa que:
- Cumpla completamente la habilidad evaluada
- Respete reglas de alternativas
- NO contamine con otras técnicas
- Sea clara, breve y clínicamente correcta

---

REGLAS IMPORTANTES PARA EL OUTPUT:
- No expliques teoría
- No salgas del formato JSON
- No mezcles técnicas
- Evalúa únicamente con base en los criterios proporcionados
- Si corresponde a otra técnica → incorrecta
- Si corresponde a un nivel inferior → parcial
- Mantente dentro del nivel indicado
- Usa lenguaje clínico claro y natural

---

MAPEO PARA EL JSON DE RESPUESTA:

- Campo "estado": tu CLASIFICACIÓN final ("adecuada" | "parcial" | "incorrecta")
- Campo "feedback": tu JUSTIFICACIÓN clínica (qué hizo bien/mal, qué criterio o regla se activó). Mantenlo claro y concreto, en 1–3 oraciones.
- Campo "refuerzo": SOLO si estado = "adecuada". Mensaje breve y motivador resaltando lo que hizo bien. Si no es adecuada, deja como string vacío "".
- Campo "correcciones": SOLO si estado != "adecuada". Array con UNA o DOS alternativas correctas (la ALTERNATIVA CORRECTA, eventualmente con una variante). Cada elemento debe ser la intervención sugerida, no una explicación. Si estado = "adecuada", deja como array vacío [].

Responde SOLO en JSON con esta estructura exacta:

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
  const habilidadKey   = normalizeHabilidadKey(habilidad);
  const habilidadLabel = INTERVENCION_LABELS[habilidadKey] || habilidadKey;
  const nivelLabel     = getNivelLabel(nivel);
  const nivelKey       = normalizeNivelKey(nivel);

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

CRITERIOS PARA EL ANÁLISIS GLOBAL:

- Identifica patrones clínicos, no solo conteos
- Distingue si los errores parciales se deben a:
  - superficialidad (nivel básico)
  - falta de exploración de procesos internos
  - dirección leve de la respuesta
  - interpretación leve o contaminación técnica
- Si muchas respuestas adecuadas son básicas o poco profundas, señálalo como observación clínica
- Si predominan incorrectas, identifica si el problema es:
  - preguntas cerradas
  - interpretación directa
  - dirección fuerte
  - mezcla de técnica
- Prioriza el patrón dominante del desempeño
- Usa el score como referencia, no como única base del análisis

---

REGLAS:
- No repitas el feedback caso por caso
- Habla de patrones, no de casos individuales
- Usa lenguaje clínico claro, motivador y constructivo
- No sobreinterpretes el score
- No salgas del formato JSON

Responde SOLO en JSON con esta estructura:

{
  "globalHabilidad": {
    "habilidad": "${habilidadKey}",
    "habilidadLabel": "${habilidadLabel}",
    "nivel": "${nivelKey}",
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

  const habilidadKey = normalizeHabilidadKey(habilidad);

  return {
    tipo:           "micro_caso",
    casoIdx,
    habilidad:      habilidadKey,
    habilidadLabel: INTERVENCION_LABELS[habilidadKey] || habilidadKey,
    nivel:          normalizeNivelKey(nivel),
    nivelLabel:     getNivelLabel(nivel),
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

  const habilidadKey = normalizeHabilidadKey(habilidad);

  return {
    tipo:          "micro_global",
    habilidad:     habilidadKey,
    habilidadLabel: INTERVENCION_LABELS[habilidadKey] || habilidadKey,
    nivel:         normalizeNivelKey(nivel),
    nivelLabel:    getNivelLabel(nivel),
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
  normalizeNivelKey,
  normalizeHabilidadKey,
  getNivelLabel,
  INTERVENCION_LABELS,
  NIVEL_LABELS,
  TIPO_ENTRENAMIENTO_LABELS,
  CRITERIOS_HABILIDAD,
};
