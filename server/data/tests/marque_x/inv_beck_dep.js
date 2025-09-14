module.exports = {
    id: "inv_beck_dep",
    nombre: "Inventario de Depresión de Beck",
    tipo: "escala-0-3",
    version: 1,
    pdfUrl: "/tests/beck_depresion.pdf",
    configuracion: {
      instrucciones: "En este cuestionario aparecen varios grupos de afirmaciones. Lea con atención cada una. Señale cuál de las afirmaciones describe mejor cómo se ha sentido durante esta última semana, incluido el día de hoy. Si dentro de un mismo grupo hay más de una afirmación aplicable, márquela también. Asegúrese de leer todas las afirmaciones dentro de cada grupo antes de elegir. (Se puntúa 0-1-2-3).",
      items: [
        { key: "q1", texto: "Estado de tristeza", opciones: [
          "No me siento triste",
          "Me siento triste",
          "Me siento triste continuamente y no puedo dejar de estarlo",
          "Me siento tan triste o tan desgraciado que no puedo soportarlo"
        ]},
        { key: "q2", texto: "Visión del futuro", opciones: [
          "No me siento especialmente desanimado respecto al futuro",
          "Me siento desanimado respecto al futuro",
          "Siento que no tengo que esperar nada",
          "Siento que el futuro es desesperanzador y las cosas no mejorarán"
        ]},
        { key: "q3", texto: "Sentimiento de fracaso", opciones: [
          "No me siento fracasado",
          "Creo que he fracasado más que la mayoría de las personas",
          "Cuando miro hacia atrás, sólo veo fracaso tras fracaso",
          "Me siento una persona totalmente fracasada"
        ]},
        { key: "q4", texto: "Satisfacción", opciones: [
          "Las cosas me satisfacen tanto como antes",
          "No disfruto de las cosas tanto como antes",
          "Ya no obtengo una satisfacción auténtica de las cosas",
          "Estoy insatisfecho o aburrido de todo"
        ]},
        { key: "q5", texto: "Culpabilidad", opciones: [
          "No me siento especialmente culpable",
          "Me siento culpable en bastantes ocasiones",
          "Me siento culpable en la mayoría de las ocasiones",
          "Me siento culpable constantemente"
        ]},
        { key: "q6", texto: "Sentimiento de castigo", opciones: [
          "No creo que esté siendo castigado",
          "Me siento como si fuese a ser castigado",
          "Espero ser castigado",
          "Siento que estoy siendo castigado"
        ]},
        { key: "q7", texto: "Decepción personal", opciones: [
          "No estoy decepcionado de mí mismo",
          "Estoy decepcionado de mí mismo",
          "Me da vergüenza de mí mismo",
          "Me detesto"
        ]},
        { key: "q8", texto: "Autocrítica", opciones: [
          "No me considero peor que cualquier otro",
          "Me autocritico por mis debilidades o por mis errores",
          "Continuamente me culpo por mis faltas",
          "Me culpo por todo lo malo que sucede"
        ]},
        { key: "q9", texto: "Ideas suicidas", opciones: [
          "No tengo ningún pensamiento de suicidio",
          "A veces pienso en suicidarme, pero no lo cometería",
          "Desearía suicidarme",
          "Me suicidaría si tuviese la oportunidad"
        ]},
        { key: "q10", texto: "Llanto", opciones: [
          "No lloro más de lo que solía llorar",
          "Ahora lloro más que antes",
          "Lloro continuamente",
          "Antes era capaz de llorar, pero ahora no puedo, incluso aunque quiera"
        ]},
        { key: "q11", texto: "Irritabilidad", opciones: [
          "No estoy más irritado de lo normal en mí",
          "Me molesto o irrito más fácilmente que antes",
          "Me siento irritado continuamente",
          "No me irrito absolutamente nada por las cosas que antes solían irritarme"
        ]},
        { key: "q12", texto: "Interés por los demás", opciones: [
          "No he perdido el interés por los demás",
          "Estoy menos interesado en los demás que antes",
          "He perdido la mayor parte de mi interés por los demás",
          "He perdido todo el interés por los demás"
        ]},
        { key: "q13", texto: "Toma de decisiones", opciones: [
          "Tomo decisiones más o menos como siempre he hecho",
          "Evito tomar decisiones más que antes",
          "Tomar decisiones me resulta mucho más difícil que antes",
          "Ya me es imposible tomar decisiones"
        ]},
        { key: "q14", texto: "Aspecto personal", opciones: [
          "No creo tener peor aspecto que antes",
          "Me temo que ahora parezco más viejo o poco atractivo",
          "Creo que se han producido cambios permanentes en mi aspecto que me hacen parecer poco atractivo",
          "Creo que tengo un aspecto horrible"
        ]},
        { key: "q15", texto: "Rendimiento laboral", opciones: [
          "Trabajo igual que antes",
          "Me cuesta un esfuerzo extra comenzar a hacer algo",
          "Tengo que obligarme mucho para hacer algo",
          "No puedo hacer nada en absoluto"
        ]},
        { key: "q16", texto: "Sueño", opciones: [
          "Duermo tan bien como siempre",
          "No duermo tan bien como antes",
          "Me despierto una o dos horas antes de lo habitual y me resulta difícil volver a dormir",
          "Me despierto varias horas antes de lo habitual y no puedo volverme a dormir"
        ]},
        { key: "q17", texto: "Cansancio", opciones: [
          "No me siento más cansado de lo normal",
          "Me canso más fácilmente que antes",
          "Me canso en cuanto hago cualquier cosa",
          "Estoy demasiado cansado para hacer nada"
        ]},
        { key: "q18", texto: "Apetito", opciones: [
          "Mi apetito no ha disminuido",
          "No tengo tan buen apetito como antes",
          "Ahora tengo mucho menos apetito",
          "He perdido completamente el apetito"
        ]},
        { key: "q19", texto: "Pérdida de peso", opciones: [
          "No he perdido peso últimamente",
          "He perdido más de 2 kilos",
          "He perdido más de 5 kilos",
          "He perdido más de 7 kilos"
        ]},
        { key: "q20", texto: "Preocupación por la salud", opciones: [
          "No estoy más preocupado por mi salud que antes",
          "Estoy preocupado por problemas físicos como dolores, malestar estomacal o estreñimiento",
          "Estoy muy preocupado por problemas físicos y me resulta difícil pensar en otra cosa",
          "Estoy tan preocupado por mis problemas físicos que no puedo pensar en nada más"
        ]},
        { key: "q21", texto: "Interés sexual", opciones: [
          "No he notado ningún cambio reciente en mi interés sexual",
          "Estoy menos interesado en el sexo que antes",
          "Estoy mucho menos interesado en el sexo",
          "He perdido completamente el interés sexual"
        ]}
      ]
    }
  };