module.exports = {
    id: "hdrs_ham_dep",
    nombre: "Escala de Hamilton - Hamilton Depression Rating Scale (HDRS)",
    tipo: "escala-gradual",
    version: 1,
    pdfUrl: "/tests/hdrs_hamilton.pdf",
    configuracion: {
      instrucciones: "Indicar la puntuación de 0 a 2, 0 a 3 o 0 a 4 según la gravedad descrita en cada ítem.",
      items: [
        { key: "q1", texto: "Humor depresivo (tristeza, desesperanza, desamparo, sentimiento de inutilidad)", opciones: [
          "0 - Ausente",
          "1 - Solo si le preguntan",
          "2 - Relata espontáneamente",
          "3 - Expresión facial, postura, voz, tendencia al llanto",
          "4 - Manifiesta verbal y no verbal espontáneamente"
        ]},
        { key: "q2", texto: "Sentimientos de culpa", opciones: [
          "0 - Ausente",
          "1 - Se culpa a sí mismo, cree haber decepcionado a la gente",
          "2 - Ideas de culpabilidad o medita errores pasados",
          "3 - Siente que la enfermedad es un castigo",
          "4 - Voces acusatorias, alucinaciones de amenaza"
        ]},
        { key: "q3", texto: "Suicidio", opciones: [
          "0 - Ausente",
          "1 - La vida no vale la pena",
          "2 - Desearía estar muerto o piensa en morirse",
          "3 - Ideas de suicidio o amenazas",
          "4 - Intentos de suicidio"
        ]},
        { key: "q4", texto: "Insomnio precoz", opciones: [
          "0 - No tiene dificultad",
          "1 - Dificultad ocasional (>30 min)",
          "2 - Dificultad cada noche"
        ]},
        { key: "q5", texto: "Insomnio intermedio", opciones: [
          "0 - No hay dificultad",
          "1 - Desvelado, inquieto, despertares frecuentes",
          "2 - Despierto gran parte de la noche"
        ]},
        { key: "q6", texto: "Insomnio tardío", opciones: [
          "0 - No hay dificultad",
          "1 - Se despierta temprano pero se vuelve a dormir",
          "2 - No puede volver a dormir"
        ]},
        { key: "q7", texto: "Trabajo y actividades", opciones: [
          "0 - No hay dificultad",
          "1 - Ideas de incapacidad, fatiga",
          "2 - Pérdida de interés, indecisión",
          "3 - Disminuye el tiempo/productividad",
          "4 - Dejó de trabajar, solo tareas mínimas o con ayuda"
        ]},
        { key: "q8", texto: "Inhibición psicomotora", opciones: [
          "0 - Normal",
          "1 - Ligero retraso en el habla",
          "2 - Evidente retraso en el habla",
          "3 - Dificultad para expresarse",
          "4 - Incapacidad para expresarse"
        ]},
        { key: "q9", texto: "Agitación psicomotora", opciones: [
          "0 - Ninguna",
          "1 - Juega con los dedos",
          "2 - Juega con manos, cabello, etc.",
          "3 - No puede quedarse quieto",
          "4 - Retuerce manos, se muerde uñas, tira del cabello"
        ]},
        { key: "q10", texto: "Ansiedad psíquica", opciones: [
          "0 - Ninguna",
          "1 - Tensión e irritabilidad",
          "2 - Preocupación por pequeñas cosas",
          "3 - Actitud aprensiva en expresión/habla",
          "4 - Expresa temores sin que le pregunten"
        ]},
        { key: "q11", texto: "Ansiedad somática", opciones: [
          "0 - Ausente",
          "1 - Ligera",
          "2 - Moderada",
          "3 - Severa",
          "4 - Incapacitante"
        ]},
        { key: "q12", texto: "Síntomas somáticos gastrointestinales", opciones: [
          "0 - Ninguno",
          "1 - Pérdida de apetito, sensación de pesadez",
          "2 - Dificultad en comer sin estímulo, requiere medicación",
          "3 - Grave malestar gastrointestinal"
        ]},
        { key: "q13", texto: "Síntomas somáticos generales", opciones: [
          "0 - Ninguno",
          "1 - Pesadez en extremidades, cefaleas, pérdida de energía",
          "2 - Síntomas somáticos bien definidos"
        ]},
        { key: "q14", texto: "Síntomas genitales (disminución de la libido, trastornos menstruales)", opciones: [
          "0 - Ausente",
          "1 - Débil",
          "2 - Grave"
        ]},
        { key: "q15", texto: "Hipocondría", opciones: [
          "0 - Ausente",
          "1 - Preocupado de sí mismo",
          "2 - Preocupado por su salud",
          "3 - Se lamenta constantemente, solicita ayuda"
        ]},
        { key: "q16", texto: "Pérdida de peso", opciones: [
          "0 - < 500 gr/semana",
          "1 - > 500 gr/semana",
          "2 - > 1 Kg/semana"
        ]},
        { key: "q17", texto: "Introspección (insight)", opciones: [
          "0 - Reconoce depresión y enfermedad",
          "1 - Reconoce enfermedad pero atribuye a factores externos",
          "2 - No reconoce estar enfermo"
        ]}
      ]
    }
  }
  