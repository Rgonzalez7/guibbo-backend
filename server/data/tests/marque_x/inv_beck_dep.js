module.exports = {
  id: "inv_beck_dep",
  nombre: "Inventario de Depresión de Beck",
  tipo: "escala-0-3",
  version: 1,
  pdfUrl: "/tests/beck_depresion.pdf",
  configuracion: {
    instrucciones:
      "En este cuestionario aparecen varios grupos de afirmaciones. Lea con atención cada una. Señale cuál de las afirmaciones describe mejor cómo se ha sentido durante esta última semana, incluido el día de hoy. Si dentro de un mismo grupo hay más de una afirmación aplicable, márquela también. Asegúrese de leer todas las afirmaciones dentro de cada grupo antes de elegir. (Se puntúa 0-1-2-3).",
    items: [
      {
        key: "q1",
        texto: "Estado de tristeza",
        opciones: [
          { valor: 0, label: "No me siento triste" },
          { valor: 1, label: "Me siento triste" },
          { valor: 2, label: "Me siento triste continuamente y no puedo dejar de estarlo" },
          { valor: 3, label: "Me siento tan triste o tan desgraciado que no puedo soportarlo" },
        ],
      },
      {
        key: "q2",
        texto: "Visión del futuro",
        opciones: [
          { valor: 0, label: "No me siento especialmente desanimado respecto al futuro" },
          { valor: 1, label: "Me siento desanimado respecto al futuro" },
          { valor: 2, label: "Siento que no tengo que esperar nada" },
          { valor: 3, label: "Siento que el futuro es desesperanzador y las cosas no mejorarán" },
        ],
      },
      {
        key: "q3",
        texto: "Sentimiento de fracaso",
        opciones: [
          { valor: 0, label: "No me siento fracasado" },
          { valor: 1, label: "Creo que he fracasado más que la mayoría de las personas" },
          { valor: 2, label: "Cuando miro hacia atrás, sólo veo fracaso tras fracaso" },
          { valor: 3, label: "Me siento una persona totalmente fracasada" },
        ],
      },
      {
        key: "q4",
        texto: "Satisfacción",
        opciones: [
          { valor: 0, label: "Las cosas me satisfacen tanto como antes" },
          { valor: 1, label: "No disfruto de las cosas tanto como antes" },
          { valor: 2, label: "Ya no obtengo una satisfacción auténtica de las cosas" },
          { valor: 3, label: "Estoy insatisfecho o aburrido de todo" },
        ],
      },
      {
        key: "q5",
        texto: "Culpabilidad",
        opciones: [
          { valor: 0, label: "No me siento especialmente culpable" },
          { valor: 1, label: "Me siento culpable en bastantes ocasiones" },
          { valor: 2, label: "Me siento culpable en la mayoría de las ocasiones" },
          { valor: 3, label: "Me siento culpable constantemente" },
        ],
      },
      {
        key: "q6",
        texto: "Sentimiento de castigo",
        opciones: [
          { valor: 0, label: "No creo que esté siendo castigado" },
          { valor: 1, label: "Me siento como si fuese a ser castigado" },
          { valor: 2, label: "Espero ser castigado" },
          { valor: 3, label: "Siento que estoy siendo castigado" },
        ],
      },
      {
        key: "q7",
        texto: "Decepción personal",
        opciones: [
          { valor: 0, label: "No estoy decepcionado de mí mismo" },
          { valor: 1, label: "Estoy decepcionado de mí mismo" },
          { valor: 2, label: "Me da vergüenza de mí mismo" },
          { valor: 3, label: "Me detesto" },
        ],
      },
      {
        key: "q8",
        texto: "Autocrítica",
        opciones: [
          { valor: 0, label: "No me considero peor que cualquier otro" },
          { valor: 1, label: "Me autocritico por mis debilidades o por mis errores" },
          { valor: 2, label: "Continuamente me culpo por mis faltas" },
          { valor: 3, label: "Me culpo por todo lo malo que sucede" },
        ],
      },
      {
        key: "q9",
        texto: "Ideas suicidas",
        opciones: [
          { valor: 0, label: "No tengo ningún pensamiento de suicidio" },
          { valor: 1, label: "A veces pienso en suicidarme, pero no lo cometería" },
          { valor: 2, label: "Desearía suicidarme" },
          { valor: 3, label: "Me suicidaría si tuviese la oportunidad" },
        ],
      },
      {
        key: "q10",
        texto: "Llanto",
        opciones: [
          { valor: 0, label: "No lloro más de lo que solía llorar" },
          { valor: 1, label: "Ahora lloro más que antes" },
          { valor: 2, label: "Lloro continuamente" },
          { valor: 3, label: "Antes era capaz de llorar, pero ahora no puedo, incluso aunque quiera" },
        ],
      },
      {
        key: "q11",
        texto: "Irritabilidad",
        opciones: [
          { valor: 0, label: "No estoy más irritado de lo normal en mí" },
          { valor: 1, label: "Me molesto o irrito más fácilmente que antes" },
          { valor: 2, label: "Me siento irritado continuamente" },
          { valor: 3, label: "No me irrito absolutamente nada por las cosas que antes solían irritarme" },
        ],
      },
      {
        key: "q12",
        texto: "Interés por los demás",
        opciones: [
          { valor: 0, label: "No he perdido el interés por los demás" },
          { valor: 1, label: "Estoy menos interesado en los demás que antes" },
          { valor: 2, label: "He perdido la mayor parte de mi interés por los demás" },
          { valor: 3, label: "He perdido todo el interés por los demás" },
        ],
      },
      {
        key: "q13",
        texto: "Toma de decisiones",
        opciones: [
          { valor: 0, label: "Tomo decisiones más o menos como siempre he hecho" },
          { valor: 1, label: "Evito tomar decisiones más que antes" },
          { valor: 2, label: "Tomar decisiones me resulta mucho más difícil que antes" },
          { valor: 3, label: "Ya me es imposible tomar decisiones" },
        ],
      },
      {
        key: "q14",
        texto: "Aspecto personal",
        opciones: [
          { valor: 0, label: "No creo tener peor aspecto que antes" },
          { valor: 1, label: "Me temo que ahora parezco más viejo o poco atractivo" },
          { valor: 2, label: "Creo que se han producido cambios permanentes en mi aspecto que me hacen parecer poco atractivo" },
          { valor: 3, label: "Creo que tengo un aspecto horrible" },
        ],
      },
      {
        key: "q15",
        texto: "Rendimiento laboral",
        opciones: [
          { valor: 0, label: "Trabajo igual que antes" },
          { valor: 1, label: "Me cuesta un esfuerzo extra comenzar a hacer algo" },
          { valor: 2, label: "Tengo que obligarme mucho para hacer algo" },
          { valor: 3, label: "No puedo hacer nada en absoluto" },
        ],
      },
      {
        key: "q16",
        texto: "Sueño",
        opciones: [
          { valor: 0, label: "Duermo tan bien como siempre" },
          { valor: 1, label: "No duermo tan bien como antes" },
          { valor: 2, label: "Me despierto una o dos horas antes de lo habitual y me resulta difícil volver a dormir" },
          { valor: 3, label: "Me despierto varias horas antes de lo habitual y no puedo volverme a dormir" },
        ],
      },
      {
        key: "q17",
        texto: "Cansancio",
        opciones: [
          { valor: 0, label: "No me siento más cansado de lo normal" },
          { valor: 1, label: "Me canso más fácilmente que antes" },
          { valor: 2, label: "Me canso en cuanto hago cualquier cosa" },
          { valor: 3, label: "Estoy demasiado cansado para hacer nada" },
        ],
      },
      {
        key: "q18",
        texto: "Apetito",
        opciones: [
          { valor: 0, label: "Mi apetito no ha disminuido" },
          { valor: 1, label: "No tengo tan buen apetito como antes" },
          { valor: 2, label: "Ahora tengo mucho menos apetito" },
          { valor: 3, label: "He perdido completamente el apetito" },
        ],
      },
      {
        key: "q19",
        texto: "Pérdida de peso",
        opciones: [
          { valor: 0, label: "No he perdido peso últimamente" },
          { valor: 1, label: "He perdido más de 2 kilos" },
          { valor: 2, label: "He perdido más de 5 kilos" },
          { valor: 3, label: "He perdido más de 7 kilos" },
        ],
      },
      {
        key: "q20",
        texto: "Preocupación por la salud",
        opciones: [
          { valor: 0, label: "No estoy más preocupado por mi salud que antes" },
          { valor: 1, label: "Estoy preocupado por problemas físicos como dolores, malestar estomacal o estreñimiento" },
          { valor: 2, label: "Estoy muy preocupado por problemas físicos y me resulta difícil pensar en otra cosa" },
          { valor: 3, label: "Estoy tan preocupado por mis problemas físicos que no puedo pensar en nada más" },
        ],
      },
      {
        key: "q21",
        texto: "Interés sexual",
        opciones: [
          { valor: 0, label: "No he notado ningún cambio reciente en mi interés sexual" },
          { valor: 1, label: "Estoy menos interesado en el sexo que antes" },
          { valor: 2, label: "Estoy mucho menos interesado en el sexo" },
          { valor: 3, label: "He perdido completamente el interés sexual" },
        ],
      },
    ],
  },
};