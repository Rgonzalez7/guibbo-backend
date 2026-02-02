module.exports = {
  id: "hdrs_ham_dep",
  nombre: "Escala de Hamilton - Hamilton Depression Rating Scale (HDRS)",
  tipo: "escala-gradual",
  version: 1,
  pdfUrl: "/tests/hdrs_hamilton.pdf",
  configuracion: {
    instrucciones:
      "Indicar la puntuación de 0 a 2, 0 a 3 o 0 a 4 según la gravedad descrita en cada ítem.",
    items: [
      {
        key: "q1",
        texto:
          "Humor depresivo (tristeza, desesperanza, desamparo, sentimiento de inutilidad)",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "Solo si le preguntan" },
          { valor: 2, label: "Relata espontáneamente" },
          { valor: 3, label: "Expresión facial, postura, voz, tendencia al llanto" },
          { valor: 4, label: "Manifiesta verbal y no verbal espontáneamente" },
        ],
      },
      {
        key: "q2",
        texto: "Sentimientos de culpa",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "Se culpa a sí mismo, cree haber decepcionado a la gente" },
          { valor: 2, label: "Ideas de culpabilidad o medita errores pasados" },
          { valor: 3, label: "Siente que la enfermedad es un castigo" },
          { valor: 4, label: "Voces acusatorias, alucinaciones de amenaza" },
        ],
      },
      {
        key: "q3",
        texto: "Suicidio",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "La vida no vale la pena" },
          { valor: 2, label: "Desearía estar muerto o piensa en morirse" },
          { valor: 3, label: "Ideas de suicidio o amenazas" },
          { valor: 4, label: "Intentos de suicidio" },
        ],
      },
      {
        key: "q4",
        texto: "Insomnio precoz",
        opciones: [
          { valor: 0, label: "No tiene dificultad" },
          { valor: 1, label: "Dificultad ocasional (>30 min)" },
          { valor: 2, label: "Dificultad cada noche" },
        ],
      },
      {
        key: "q5",
        texto: "Insomnio intermedio",
        opciones: [
          { valor: 0, label: "No hay dificultad" },
          { valor: 1, label: "Desvelado, inquieto, despertares frecuentes" },
          { valor: 2, label: "Despierto gran parte de la noche" },
        ],
      },
      {
        key: "q6",
        texto: "Insomnio tardío",
        opciones: [
          { valor: 0, label: "No hay dificultad" },
          { valor: 1, label: "Se despierta temprano pero se vuelve a dormir" },
          { valor: 2, label: "No puede volver a dormir" },
        ],
      },
      {
        key: "q7",
        texto: "Trabajo y actividades",
        opciones: [
          { valor: 0, label: "No hay dificultad" },
          { valor: 1, label: "Ideas de incapacidad, fatiga" },
          { valor: 2, label: "Pérdida de interés, indecisión" },
          { valor: 3, label: "Disminuye el tiempo/productividad" },
          { valor: 4, label: "Dejó de trabajar, solo tareas mínimas o con ayuda" },
        ],
      },
      {
        key: "q8",
        texto: "Inhibición psicomotora",
        opciones: [
          { valor: 0, label: "Normal" },
          { valor: 1, label: "Ligero retraso en el habla" },
          { valor: 2, label: "Evidente retraso en el habla" },
          { valor: 3, label: "Dificultad para expresarse" },
          { valor: 4, label: "Incapacidad para expresarse" },
        ],
      },
      {
        key: "q9",
        texto: "Agitación psicomotora",
        opciones: [
          { valor: 0, label: "Ninguna" },
          { valor: 1, label: "Juega con los dedos" },
          { valor: 2, label: "Juega con manos, cabello, etc." },
          { valor: 3, label: "No puede quedarse quieto" },
          { valor: 4, label: "Retuerce manos, se muerde uñas, tira del cabello" },
        ],
      },
      {
        key: "q10",
        texto: "Ansiedad psíquica",
        opciones: [
          { valor: 0, label: "Ninguna" },
          { valor: 1, label: "Tensión e irritabilidad" },
          { valor: 2, label: "Preocupación por pequeñas cosas" },
          { valor: 3, label: "Actitud aprensiva en expresión/habla" },
          { valor: 4, label: "Expresa temores sin que le pregunten" },
        ],
      },
      {
        key: "q11",
        texto: "Ansiedad somática",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "Ligera" },
          { valor: 2, label: "Moderada" },
          { valor: 3, label: "Severa" },
          { valor: 4, label: "Incapacitante" },
        ],
      },
      {
        key: "q12",
        texto: "Síntomas somáticos gastrointestinales",
        opciones: [
          { valor: 0, label: "Ninguno" },
          { valor: 1, label: "Pérdida de apetito, sensación de pesadez" },
          { valor: 2, label: "Dificultad en comer sin estímulo, requiere medicación" },
          { valor: 3, label: "Grave malestar gastrointestinal" },
        ],
      },
      {
        key: "q13",
        texto: "Síntomas somáticos generales",
        opciones: [
          { valor: 0, label: "Ninguno" },
          { valor: 1, label: "Pesadez en extremidades, cefaleas, pérdida de energía" },
          { valor: 2, label: "Síntomas somáticos bien definidos" },
        ],
      },
      {
        key: "q14",
        texto:
          "Síntomas genitales (disminución de la libido, trastornos menstruales)",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "Débil" },
          { valor: 2, label: "Grave" },
        ],
      },
      {
        key: "q15",
        texto: "Hipocondría",
        opciones: [
          { valor: 0, label: "Ausente" },
          { valor: 1, label: "Preocupado de sí mismo" },
          { valor: 2, label: "Preocupado por su salud" },
          { valor: 3, label: "Se lamenta constantemente, solicita ayuda" },
        ],
      },
      {
        key: "q16",
        texto: "Pérdida de peso",
        opciones: [
          { valor: 0, label: "< 500 gr/semana" },
          { valor: 1, label: "> 500 gr/semana" },
          { valor: 2, label: "> 1 Kg/semana" },
        ],
      },
      {
        key: "q17",
        texto: "Introspección (insight)",
        opciones: [
          { valor: 0, label: "Reconoce depresión y enfermedad" },
          { valor: 1, label: "Reconoce enfermedad pero atribuye a factores externos" },
          { valor: 2, label: "No reconoce estar enfermo" },
        ],
      },
    ],
  },
};