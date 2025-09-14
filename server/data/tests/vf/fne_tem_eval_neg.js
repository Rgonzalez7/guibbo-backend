module.exports = {
    id: "fne_tem_eval_neg",
    nombre: "Fobia y Ansiedad Social - Temor a la Evaluación Negativa (FNE)",
    tipo: "vf",
    version: 1,
    pdfUrl: "/tests/fne_temor_evaluacion_negativa.pdf",
    configuracion: {
      instrucciones: "Por favor, responda VERDADERO (V) o FALSO (F) a las siguientes preguntas.",
      items: [
        { key: "q1", texto: "Casi nunca me preocupa quedar como un tonto ante los demás."},
        { key: "q2", texto: "Me preocupa qué pensará la gente de mí, incluso cuando sé que ello no me perjudicará en absoluto."},
        { key: "q3", texto: "Me pongo tenso/a y nervioso/a cuando alguien me está provocando para ver hasta dónde aguanto."},
        { key: "q4", texto: "No me preocupa saber que la gente está recibiendo de mí una impresión desfavorable."},
        { key: "q5", texto: "Cuando cometo algún error social, me angustio."},
        { key: "q6", texto: "Me importan poco las opiniones que tengan de mí personas importantes."},
        { key: "q7", texto: "A menudo temo quedar en ridículo o hacer alguna tontería."},
        { key: "q8", texto: "Me preocupa muy poco que otras personas tengan mala opinión de mí."},
        { key: "q9", texto: "Temo a menudo que los demás se den cuenta de mis deficiencias."},
        { key: "q10", texto: "La desaprobación de los demás me preocupa poco."},
        { key: "q11", texto: "Si sé que alguien me está valorando, tiendo a esperar lo peor."},
        { key: "q12", texto: "Casi nunca me preocupa la impresión que le cause a una persona."},
        { key: "q13", texto: "Me da miedo que los demás no tengan una buena opinión de mí."},
        { key: "q14", texto: "Me asusta que la gente me critique."},
        { key: "q15", texto: "Las opiniones de los demás me traen sin cuidado."},
        { key: "q16", texto: "Si no le caigo bien a alguien, ello no me molesta necesariamente."},
        { key: "q17", texto: "Cuando estoy hablando con alguien, me preocupa lo que pueda estar pensando de mí."},
        { key: "q18", texto: "Creo que es inevitable que uno cometa errores sociales de vez en cuando, así que, ¿para qué preocuparse?"},
        { key: "q19", texto: "Suele preocuparme la impresión que pueda causar a los demás."},
        { key: "q20", texto: "Me preocupa mucho lo que piensen de mí mis superiores."},
        { key: "q21", texto: "Me importa poco saber que alguien me está juzgando."},
        { key: "q22", texto: "Me preocupa que los demás piensen que no valgo gran cosa."},
        { key: "q23", texto: "Me importa muy poco lo que los demás piensen de mí."},
        { key: "q24", texto: "A veces creo que me preocupa demasiado lo que piensen de mí otras personas."},
        { key: "q25", texto: "A menudo temo que voy a hacer o decir lo que no debiera."},
        { key: "q26", texto: "A menudo me es indiferente la opinión que tengan de mí los demás."},
        { key: "q27", texto: "Suelo pensar que los demás tienen de mí una imagen favorable."},
        { key: "q28", texto: "Me preocupa a menudo la idea de que las personas importantes para mí no me tienen en gran estima."},
        { key: "q29", texto: "Me entristece el mal concepto que creo tienen mis amigos/as de mí."},
        { key: "q30", texto: "Me pongo tenso/a y nervioso/a cuando sé que mis superiores me están juzgando."},
      ],
      // Opcional: mapea valor para scoring
      opciones: [
        { valor: true, label: "Verdadero" },
        { valor: false, label: "Falso" }
      ],
      scoring: { metodo: "custom" } // si luego quieres puntuar VF
    }
  };