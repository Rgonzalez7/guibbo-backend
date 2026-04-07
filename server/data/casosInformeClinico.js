// server/data/casosInformeClinico.js
// Banco de casos clínicos para el ejercicio "Informe clínico".
// El estudiante recibe uno al azar sin repetir hasta agotar todos.
// Cada caso tiene: id (índice 0-based), titulo, transcripcion.

const CASOS_INFORME_CLINICO = [
  {
    id: 0,
    titulo: "Caso 1",
    transcripcion: `Terapeuta: Antes de empezar, me gustaría conocerte un poco. ¿Cómo te llamas y cuántos años tienes?
Paciente: Me llamo Daniel Rojas, tengo 32 años.

Terapeuta: ¿A qué te dedicas actualmente, Daniel?
Paciente: Soy ingeniero en sistemas, trabajo en una empresa de desarrollo de software.

Terapeuta: Bien. ¿Vives solo o con alguien más?
Paciente: Vivo con mi esposa… tenemos tres años de casados.

Terapeuta: ¿Qué te motivó a venir hoy?
Paciente: Siento que estoy agotado mentalmente… como si no pudiera desconectarme nunca.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Paso todo el día pensando en el trabajo… incluso cuando llego a la casa sigo revisando cosas, siento que si no lo hago algo va a salir mal.

Terapeuta: ¿Desde cuándo te pasa esto?
Paciente: Más o menos desde hace un año… empezó cuando me dieron un ascenso.

Terapeuta: ¿Cómo viviste ese cambio?
Paciente: Al inicio bien… pero luego sentí que ya no podía cometer errores.

Terapeuta: ¿Qué tipo de pensamientos te vienen en esos momentos?
Paciente: Que si fallo, voy a decepcionar a todos… que no soy tan bueno como creen.

Terapeuta: ¿Y eso cómo te hace sentir?
Paciente: Ansioso… tenso todo el tiempo.

Terapeuta: ¿Has notado algo en tu cuerpo?
Paciente: Sí… me cuesta dormir, me despierto varias veces pensando en pendientes… y siento como presión en el pecho.

Terapeuta: ¿Qué haces cuando te sientes así?
Paciente: Trabajo más… reviso todo varias veces… a veces hasta evito delegar porque siento que nadie lo va a hacer bien.

Terapeuta: ¿Cómo ha afectado esto tu vida personal?
Paciente: Mi esposa se queja mucho… dice que no estoy presente.

Terapeuta: ¿Cómo es la relación actualmente?
Paciente: Tensa… discutimos porque ella dice que el trabajo es más importante para mí.

Terapeuta: ¿Y fuera de la pareja, cómo son tus relaciones?
Paciente: Casi no veo a mis amigos… antes salía más.

Terapeuta: Me gustaría entender un poco tu historia. ¿Cómo eras de niño?
Paciente: Muy responsable… siempre quería hacer todo bien.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Mi papá era muy exigente… si sacaba un 90 me preguntaba por qué no fue 100.

Terapeuta: ¿Y cómo te hacía sentir eso?
Paciente: Como que nunca era suficiente.

Terapeuta: ¿En la adolescencia eso cambió o se mantuvo?
Paciente: Igual… era muy aplicado, pero siempre estresado por el rendimiento.

Terapeuta: ¿Tuviste relaciones cercanas en esa etapa?
Paciente: No muchas… me enfocaba más en estudiar.

Terapeuta: ¿Y en la adultez antes de este trabajo cómo eras?
Paciente: Responsable, pero no así… podía desconectarme más.

Terapeuta: ¿Has tenido algún problema médico o psicológico previo?
Paciente: No… nunca he ido a terapia antes.

Terapeuta: ¿Consumes alcohol o alguna otra sustancia?
Paciente: Solo socialmente… nada más.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que si no hago todo perfecto, algo malo va a pasar… y eso no me deja vivir tranquilo.`,
  },
  {
    id: 1,
    titulo: "Caso 2",
    transcripcion: `Terapeuta: Antes de empezar, me gustaría conocerte un poco. ¿Cuál es tu nombre completo y tu edad?
Paciente: Me llamo Laura Jiménez Vargas, tengo 29 años.

Terapeuta: Mucho gusto, Laura. ¿A qué te dedicas actualmente?
Paciente: Soy diseñadora gráfica… trabajo por mi cuenta, desde la casa.

Terapeuta: ¿Vives sola?
Paciente: Sí… bueno, con mi gato nada más.

Terapeuta: ¿Qué te motivó a venir a consulta?
Paciente: Últimamente me siento muy triste… como sin ganas de nada.

Terapeuta: ¿Desde cuándo te has sentido así?
Paciente: Creo que empezó hace como un año… tal vez un poco más.

Terapeuta: ¿Recuerdas si pasó algo importante en ese momento?
Paciente: Sí… terminé una relación de casi cuatro años.

Terapeuta: ¿Cómo fue esa relación para ti?
Paciente: Muy intensa… yo dependía mucho de él.

Terapeuta: ¿A qué te refieres con depender?
Paciente: Como que… todo giraba alrededor de la relación… si él estaba bien, yo estaba bien.

Terapeuta: ¿Y cómo fue la ruptura?
Paciente: Él decidió terminar… dijo que yo era muy demandante emocionalmente.

Terapeuta: ¿Cómo te afectó eso?
Paciente: Muchísimo… sentí que me quedé sin identidad… como si no supiera quién soy sin alguien más.

Terapeuta: ¿Cómo han sido tus días últimamente?
Paciente: Me cuesta levantarme… hay días en que ni siquiera quiero trabajar.

Terapeuta: ¿Y el trabajo cómo lo estás manejando?
Paciente: Cumplo con lo mínimo… pero antes me gustaba mucho lo que hacía.

Terapeuta: ¿Cómo está tu energía durante el día?
Paciente: Muy baja… todo me cuesta.

Terapeuta: ¿Has notado cambios en el sueño?
Paciente: Sí… a veces duermo demasiado, otras veces me cuesta dormirme.

Terapeuta: ¿Y en el apetito?
Paciente: Como por ansiedad… he subido de peso.

Terapeuta: ¿Qué tipo de pensamientos suelen aparecer?
Paciente: Que no soy suficiente… que nadie se va a quedar conmigo… que siempre me van a dejar.

Terapeuta: ¿Cómo te sientes cuando tienes esos pensamientos?
Paciente: Muy triste… y también como desesperada.

Terapeuta: ¿Qué haces cuando te sientes así?
Paciente: Me quedo en la cama… o me distraigo viendo redes por horas.

Terapeuta: ¿Cómo están tus relaciones actualmente?
Paciente: Me he alejado de casi todos… no contesto mensajes.

Terapeuta: ¿Tienes amigos cercanos?
Paciente: Sí… pero ya casi no los veo.

Terapeuta: ¿Y tu familia?
Paciente: Vivo en la misma ciudad que mi mamá, pero no la visito mucho.

Terapeuta: ¿Cómo es tu relación con ella?
Paciente: Distante… siempre ha sido muy ocupada.

Terapeuta: ¿Cómo fue tu infancia?
Paciente: Mis papás se separaron cuando yo tenía 6 años… mi mamá trabajaba mucho, yo pasaba mucho tiempo sola.

Terapeuta: ¿Y tu papá?
Paciente: Muy ausente… lo veía poco.

Terapeuta: ¿Cómo te sentías en esa etapa?
Paciente: Sola… como que tenía que arreglármelas sola.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Buscaba mucho afecto… tuve varias relaciones… me involucraba mucho emocionalmente.

Terapeuta: ¿Cómo eran esas relaciones?
Paciente: Muy intensas… me costaba poner límites.

Terapeuta: ¿Y en la adultez antes de esta última relación?
Paciente: Parecido… siempre he sentido miedo a que me abandonen.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… esta es la primera vez.

Terapeuta: ¿Consumes alcohol o alguna sustancia?
Paciente: No… solo ocasionalmente en reuniones.

Terapeuta: Si tuvieras que resumir lo que te está pasando, ¿cómo lo dirías?
Paciente: Siento que dependo demasiado de las personas… y cuando no están, me derrumbo.`,
  },
  {
    id: 2,
    titulo: "Caso 3",
    transcripcion: `Terapeuta: Para empezar, ¿me puedes decir tu nombre completo y edad?
Paciente: Mauricio Salas Rojas… tengo 38 años.

Terapeuta: Mucho gusto, Mauricio. ¿A qué te dedicas actualmente?
Paciente: Tengo… bueno, tenía un negocio de repuestos de carro… todavía está, pero no como antes.

Terapeuta: ¿A qué te refieres con "no como antes"?
Paciente: He perdido clientes… pero también la economía está mala, ¿verdad? no es solo cosa mía.

Terapeuta: ¿Con quién vives actualmente?
Paciente: Solo… mi esposa se fue hace unos meses.

Terapeuta: ¿Cuánto tiempo estuvieron juntos?
Paciente: Como 10 años… casados 7.

Terapeuta: ¿Qué te trae a consulta?
Paciente: Bueno… realmente yo no quería venir… fue idea de mi hermana.

Terapeuta: ¿Qué te dijo ella?
Paciente: Que tengo un problema… que estoy tomando mucho… pero yo no lo veo así.

Terapeuta: ¿Cómo describirías tu consumo de alcohol?
Paciente: Normal… como cualquiera… tal vez unos tragos en la noche.

Terapeuta: ¿Todos los días?
Paciente: Bueno… sí, casi todos… pero es para relajarme.

Terapeuta: ¿Has intentado dejar de tomar?
Paciente: Sí… una vez… duré como una semana.

Terapeuta: ¿Qué pasó en ese intento?
Paciente: Me ponía muy irritable… no dormía… me desesperaba.

Terapeuta: ¿Qué haces cuando te sientes así?
Paciente: Tomo… y se me pasa.

Terapeuta: ¿Tu esposa mencionaba algo sobre esto?
Paciente: Sí… decía que yo cambiaba… que me ponía agresivo… pero yo no creo que sea para tanto.

Terapeuta: ¿Recuerdas algún episodio específico?
Paciente: Una vez discutimos… pero fue porque ella también me provocó.

Terapeuta: ¿Qué pasó exactamente?
Paciente: Le grité… tal vez golpeé la mesa… pero no le hice nada.

Terapeuta: ¿Ella cómo reaccionó?
Paciente: Se asustó… y después de eso empezó a decir que ya no se sentía segura.

Terapeuta: ¿Cómo te sentiste tú cuando ella se fue?
Paciente: Mal… obviamente… pero también creo que exageró.

Terapeuta: ¿Cómo ha sido tu estado de ánimo desde entonces?
Paciente: He estado… no sé… como vacío… pero tampoco me gusta pensar mucho en eso.

Terapeuta: ¿Qué haces cuando aparecen esas sensaciones?
Paciente: Trabajo… o tomo.

Terapeuta: ¿Cómo está tu sueño?
Paciente: Malo… me duermo tarde… a veces me despierto en la madrugada.

Terapeuta: ¿Y el apetito?
Paciente: Irregular… hay días que ni como.

Terapeuta: ¿Has notado cambios en tu energía?
Paciente: Sí… me siento cansado… sin ganas de nada.

Terapeuta: ¿Cómo está tu negocio actualmente?
Paciente: Ha bajado bastante… he faltado… he perdido clientes.

Terapeuta: ¿A qué crees que se debe eso?
Paciente: La economía… la competencia… aunque sí, tal vez yo no he estado tan enfocado.

Terapeuta: ¿Cómo describirías tus relaciones actualmente?
Paciente: Distantes… casi no veo a nadie.

Terapeuta: ¿Tu familia?
Paciente: Mi hermana es la única que está pendiente… pero también es muy metida.

Terapeuta: ¿Cómo fue tu infancia?
Paciente: Difícil… mi papá tomaba mucho… era agresivo.

Terapeuta: ¿Qué tipo de agresividad recuerdas?
Paciente: Gritos… golpes… especialmente hacia mi mamá.

Terapeuta: ¿Cómo te afectaba eso?
Paciente: Me daba miedo… pero también aprendí que así eran las cosas.

Terapeuta: ¿Tu mamá qué hacía?
Paciente: Aguantaba… siempre justificándolo.

Terapeuta: ¿Cómo eras tú de niño?
Paciente: Callado… trataba de no meterme en problemas.

Terapeuta: ¿Y en la adolescencia?
Paciente: Empecé a salir más… a tomar… creo que desde los 15.

Terapeuta: ¿Cómo eran tus relaciones en esa etapa?
Paciente: Normales… pero sí tenía carácter fuerte.

Terapeuta: ¿Cómo manejas el enojo actualmente?
Paciente: Me cuesta… exploto rápido… pero se me pasa igual de rápido.

Terapeuta: ¿Qué piensas sobre lo que te está pasando actualmente?
Paciente: Siento que todos están exagerando… pero también sé que algo no está bien.

Terapeuta: ¿Qué te gustaría que cambiara?
Paciente: No perder todo… el negocio… mi relación… mi vida.`,
  },
  {
    id: 3,
    titulo: "Caso 4",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y edad?
Paciente: Daniela Vargas Solano… tengo 26 años.

Terapeuta: Mucho gusto, Daniela. ¿A qué te dedicas actualmente?
Paciente: Trabajo en una tienda de ropa… aunque no sé cuánto más voy a durar ahí.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Me cuesta mantener los trabajos… me aburro… o termino peleando con alguien.

Terapeuta: ¿Con quién vives actualmente?
Paciente: Vivo con mi pareja… bueno… no sé si seguimos juntos.

Terapeuta: ¿Qué está pasando en esa relación?
Paciente: Discutimos mucho… es que él no entiende… o sea, dice que soy "intensa".

Terapeuta: ¿Qué te trae hoy a consulta?
Paciente: Siento que todo en mi vida es un desastre… relaciones, trabajo, todo.

Terapeuta: ¿Desde cuándo sientes esto?
Paciente: Desde siempre… pero últimamente peor.

Terapeuta: ¿Qué ha pasado últimamente?
Paciente: Hace unos días discutí con mi pareja… y sentí que me iba a dejar… y… no sé… hice cosas impulsivas.

Terapeuta: ¿Qué tipo de cosas?
Paciente: Le escribí como 30 mensajes seguidos… después lo bloqueé… después fui a buscarlo.

Terapeuta: ¿Cómo te sentías en ese momento?
Paciente: Desesperada… como si me estuviera abandonando… no lo soporto.

Terapeuta: ¿Qué pasó después?
Paciente: Cuando lo vi… me calmé… pero después me dio cólera… y le dije cosas feas.

Terapeuta: ¿Cómo describirías tus emociones en general?
Paciente: Muy intensas… todo lo siento al máximo… o estoy muy feliz o muy mal.

Terapeuta: ¿Cambian rápido?
Paciente: Sí… demasiado… en un mismo día puedo pasar de estar bien a sentirme fatal.

Terapeuta: ¿Qué tipo de pensamientos aparecen cuando te sientes mal?
Paciente: Que nadie me quiere… que me van a dejar… que no valgo nada.

Terapeuta: ¿Qué haces cuando te sientes así?
Paciente: A veces me corto…

Terapeuta: ¿Desde cuándo ocurre eso?
Paciente: Desde los 17… lo dejé un tiempo… pero ha vuelto.

Terapeuta: ¿Qué sientes cuando lo haces?
Paciente: Alivio… como que baja la intensidad.

Terapeuta: ¿Cómo está tu estado de ánimo en general?
Paciente: Inestable… vacío… como si nada llenara.

Terapeuta: ¿A qué te refieres con vacío?
Paciente: Como si no supiera quién soy… cambio mucho dependiendo con quién estoy.

Terapeuta: ¿Cómo son tus relaciones en general?
Paciente: Muy intensas… me entrego demasiado… pero después todo se vuelve un desastre.

Terapeuta: ¿Te ha pasado en relaciones anteriores?
Paciente: Sí… todas terminan mal… o me dejan… o yo termino explotando.

Terapeuta: ¿Cómo reaccionas cuando sientes que alguien se aleja?
Paciente: Me desespero… hago lo que sea para que no se vayan.

Terapeuta: ¿Cómo manejas el enojo?
Paciente: Mal… exploto… digo cosas que después me arrepiento.

Terapeuta: ¿Te ha traído consecuencias eso?
Paciente: Sí… he perdido amistades… trabajos… relaciones.

Terapeuta: ¿Cómo es tu sueño?
Paciente: Irregular… cuando estoy mal casi no duermo.

Terapeuta: ¿Y el apetito?
Paciente: También cambia… a veces como mucho… a veces nada.

Terapeuta: ¿Consumes alcohol u otras sustancias?
Paciente: Sí… cuando salgo… a veces pierdo el control.

Terapeuta: ¿A qué te refieres con perder el control?
Paciente: Tomo demasiado… hago cosas que después no recuerdo bien.

Terapeuta: ¿Cómo fue tu infancia?
Paciente: Complicada… mi mamá era muy cambiante… a veces muy cariñosa, a veces muy fría.

Terapeuta: ¿Y tu papá?
Paciente: No estuvo… se fue cuando yo tenía 5 años.

Terapeuta: ¿Cómo te afectó eso?
Paciente: Siempre sentí que me iban a dejar… que no era suficiente.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Muy inestable… problemas con amigos… con mi mamá… conductas impulsivas.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: Sí… pero dejé de ir… sentía que no me entendían.

Terapeuta: ¿Qué esperas de este proceso?
Paciente: Quiero dejar de sentirme así… de ser tan inestable… de arruinar todo.`,
  },
  {
    id: 4,
    titulo: "Caso 5",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Ricardo Gómez Herrera, tengo 35 años.

Terapeuta: Mucho gusto, Ricardo. ¿A qué te dedicas actualmente?
Paciente: Soy chofer de reparto… trabajo para una empresa de logística.

Terapeuta: ¿Con quién vives?
Paciente: Vivo con mi esposa y mi hija… ella tiene 6 años.

Terapeuta: Bien, Ricardo. ¿Qué te trae hoy a consulta?
Paciente: He estado teniendo problemas para dormir… y también… como que me pongo muy nervioso en ciertas situaciones.

Terapeuta: ¿Desde cuándo te está pasando esto?
Paciente: Desde hace unos meses… tal vez seis o siete.

Terapeuta: ¿Recuerdas si algo pasó en ese momento?
Paciente: Sí… tuve un accidente mientras trabajaba.

Terapeuta: ¿Podrías contarme un poco sobre eso?
Paciente: Fue en carretera… un carro invadió mi carril… traté de esquivarlo pero choqué… no fue tan grave físicamente… pero…

Terapeuta: Tómate tu tiempo.
Paciente: …pero pensé que me iba a morir.

Terapeuta: ¿Qué recuerdas de ese momento?
Paciente: El sonido… el golpe… y como que todo se volvió muy rápido… después me quedé en shock.

Terapeuta: ¿Qué pasó después del accidente?
Paciente: Me llevaron al hospital… no tenía lesiones graves… pero desde ahí no he sido el mismo.

Terapeuta: ¿En qué has notado cambios?
Paciente: Me cuesta manejar… antes era algo normal, ahora me pongo muy tenso.

Terapeuta: ¿Qué sientes cuando estás manejando?
Paciente: Como si fuera a pasar otra vez… me sudan las manos, el corazón se me acelera.

Terapeuta: ¿Te ha pasado en otras situaciones?
Paciente: Sí… con ruidos fuertes… o si veo un accidente en la calle.

Terapeuta: ¿Qué ocurre en esos momentos?
Paciente: Me vienen imágenes… como flashes del accidente.

Terapeuta: ¿Esas imágenes aparecen sin que las busques?
Paciente: Sí… de repente… y me ponen muy mal.

Terapeuta: ¿Cómo duermes actualmente?
Paciente: Mal… me cuesta dormirme… y a veces tengo pesadillas.

Terapeuta: ¿Las pesadillas están relacionadas con el accidente?
Paciente: Sí… sueño que pasa otra vez… o que no logro salir.

Terapeuta: ¿Cómo te sientes al despertar?
Paciente: Agitado… como si realmente hubiera pasado.

Terapeuta: ¿Has notado cambios en tu estado de ánimo?
Paciente: Sí… estoy más irritable… cualquier cosa me altera.

Terapeuta: ¿Cómo ha afectado esto tu vida diaria?
Paciente: He faltado al trabajo… evito manejar cuando puedo…

Terapeuta: ¿Eso ha traído consecuencias?
Paciente: Sí… problemas en el trabajo… mi jefe ya me ha llamado la atención.

Terapeuta: ¿Cómo está tu relación con tu familia?
Paciente: Mi esposa está preocupada… dice que ya no soy el mismo…

Terapeuta: ¿A qué se refiere con eso?
Paciente: Que estoy distante… que ya no juego con mi hija como antes.

Terapeuta: ¿Qué sientes tú respecto a eso?
Paciente: Culpa… pero también me cuesta conectar.

Terapeuta: ¿Qué haces cuando te sientes así?
Paciente: Me encierro… o trato de distraerme viendo televisión.

Terapeuta: ¿Has consumido alcohol u otra sustancia para manejar esto?
Paciente: A veces tomo en la noche… para relajarme y poder dormir.

Terapeuta: ¿Con qué frecuencia?
Paciente: Varias veces por semana… no todos los días, pero sí seguido.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… nunca.

Terapeuta: Me gustaría conocer un poco más de tu historia. ¿Cómo fue tu infancia?
Paciente: Bastante tranquila… crecí con mis dos padres… no hubo problemas grandes.

Terapeuta: ¿Cómo describirías la relación con ellos?
Paciente: Buena… mi papá era estricto, pero presente.

Terapeuta: ¿Y tu adolescencia?
Paciente: Normal… estudiaba, trabajaba… nada fuera de lo común.

Terapeuta: ¿Habías vivido alguna experiencia similar a esta antes?
Paciente: No… nunca algo así.

Terapeuta: ¿Cómo eras antes del accidente en términos emocionales?
Paciente: Tranquilo… no me preocupaba tanto por las cosas.

Terapeuta: Si tuvieras que describir lo que te pasa ahora en una frase, ¿cómo lo dirías?
Paciente: Siento que sigo atrapado en ese momento… como si no hubiera terminado.`,
  },
  {
    id: 5,
    titulo: "Caso 6",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Andrés Castillo Méndez, tengo 31 años.

Terapeuta: Mucho gusto, Andrés. ¿A qué te dedicas actualmente?
Paciente: Soy contador en una empresa… llevo como cuatro años ahí.

Terapeuta: ¿Con quién vives?
Paciente: Vivo solo… me independicé hace unos dos años.

Terapeuta: Bien, Andrés. ¿Qué te trae hoy a consulta?
Paciente: Últimamente siento que no puedo dejar de preocuparme… por todo.

Terapeuta: ¿A qué te refieres con "por todo"?
Paciente: Por el trabajo, por el dinero, por mi salud… incluso por cosas que todavía no han pasado.

Terapeuta: ¿Desde cuándo notas esto?
Paciente: Siempre he sido preocupado… pero en el último año ha empeorado bastante.

Terapeuta: ¿Recuerdas si algo cambió en ese momento?
Paciente: Sí… me dieron más responsabilidades en el trabajo.

Terapeuta: ¿Cómo viviste ese cambio?
Paciente: Al inicio bien… pero luego empecé a sentir que no podía equivocarme.

Terapeuta: ¿Qué pensamientos suelen aparecer cuando te preocupas?
Paciente: Que algo va a salir mal… que voy a cometer un error y todo se va a complicar.

Terapeuta: ¿Te ha pasado realmente algo así?
Paciente: No… o sea, no grave… pero siento que podría pasar.

Terapeuta: ¿Cómo te sientes emocionalmente en esos momentos?
Paciente: Ansioso… como con una sensación constante de alerta.

Terapeuta: ¿Has notado algo en tu cuerpo?
Paciente: Sí… tensión en el cuello, dolor de cabeza… y me cuesta relajarme.

Terapeuta: ¿Cómo está tu sueño?
Paciente: Me cuesta dormir… mi mente no se apaga… empiezo a pensar en todo.

Terapeuta: ¿Qué haces cuando eso pasa?
Paciente: Reviso pendientes… hago listas… trato de organizar todo.

Terapeuta: ¿Eso te ayuda?
Paciente: A veces… pero otras veces me hace pensar más.

Terapeuta: ¿Cómo está tu concentración durante el día?
Paciente: Me distraigo fácil… porque estoy pensando en varias cosas al mismo tiempo.

Terapeuta: ¿Cómo ha afectado esto tu vida diaria?
Paciente: Me canso mucho… siento que mi cabeza no descansa nunca.

Terapeuta: ¿Y tus relaciones?
Paciente: Me dicen que estoy muy tenso… que siempre estoy preocupado.

Terapeuta: ¿Tienes pareja actualmente?
Paciente: No… terminé una relación hace unos meses.

Terapeuta: ¿Tu forma de ser influyó en eso?
Paciente: Sí… ella decía que yo sobrepensaba todo… que no podía disfrutar el momento.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Muy responsable… me preocupaba mucho por hacer las cosas bien.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Mi mamá era muy protectora… siempre anticipaba problemas.

Terapeuta: ¿Y tu papá?
Paciente: Más tranquilo… pero trabajaba mucho.

Terapeuta: ¿Cómo te hacía sentir esa forma de tu mamá?
Paciente: Creo que aprendí a estar alerta todo el tiempo… como esperando que algo saliera mal.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Parecido… me preocupaba mucho por el colegio… por no fallar.

Terapeuta: ¿Tenías dificultades para relajarte en esa etapa?
Paciente: Sí… siempre estaba pensando en lo siguiente.

Terapeuta: ¿Y en la adultez antes de este último año?
Paciente: Era preocupado… pero manejable… ahora siento que se me salió de control.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… casi nada.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No, esta es la primera vez.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi mente no se detiene… siempre está buscando problemas incluso cuando no los hay.`,
  },
  {
    id: 6,
    titulo: "Caso 7",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Javier Solís Hernández, tengo 30 años.

Terapeuta: Mucho gusto, Javier. ¿A qué te dedicas actualmente?
Paciente: Trabajo en el área administrativa de una empresa… más que todo con reportes y cosas así.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con un compañero de apartamento… pero casi no interactuamos mucho.

Terapeuta: Bien, Javier. ¿Qué te trae hoy a consulta?
Paciente: Me cuesta mucho relacionarme con las personas… siento que siempre hago algo mal.

Terapeuta: ¿Desde cuándo notas esa dificultad?
Paciente: Desde hace bastante… pero en el trabajo se ha hecho más evidente.

Terapeuta: ¿Qué pasa específicamente en el trabajo?
Paciente: Evito hablar en reuniones… aunque tenga algo que decir, prefiero quedarme callado.

Terapeuta: ¿Qué pasa por tu mente en esos momentos?
Paciente: Que voy a decir algo tonto… que los demás van a pensar que no sé… que me van a juzgar.

Terapeuta: ¿Te ha pasado que alguien te diga algo así directamente?
Paciente: No… realmente no… pero siento que podría pasar.

Terapeuta: ¿Cómo te sientes emocionalmente en esas situaciones?
Paciente: Muy ansioso… incómodo… como si quisiera salir de ahí.

Terapeuta: ¿Has notado algo en tu cuerpo cuando eso ocurre?
Paciente: Sí… me sudan las manos, siento el corazón rápido… a veces me tiembla la voz.

Terapeuta: ¿Qué haces cuando notas eso?
Paciente: Trato de evitar participar… o preparo mucho lo que voy a decir, pero igual no lo digo.

Terapeuta: ¿Cómo afecta esto tu desempeño laboral?
Paciente: Siento que no avanzo… me quedo en lo mismo porque no me expongo.

Terapeuta: ¿Te han dado retroalimentación en el trabajo?
Paciente: Sí… me dicen que debería participar más… que tengo buenas ideas, pero no las expreso.

Terapeuta: ¿Cómo te sientes cuando te dicen eso?
Paciente: Frustrado… porque sé que tienen razón, pero no puedo hacerlo.

Terapeuta: ¿Cómo son tus relaciones fuera del trabajo?
Paciente: Muy pocas… tengo uno o dos amigos, pero no salgo mucho.

Terapeuta: ¿Te gustaría tener más relaciones sociales?
Paciente: Sí… pero me cuesta mucho dar el paso.

Terapeuta: ¿Has tenido pareja?
Paciente: No… nunca he tenido una relación formal.

Terapeuta: ¿A qué crees que se debe eso?
Paciente: A que siento que no soy interesante… o que no soy suficiente para alguien.

Terapeuta: ¿Ese tipo de pensamiento es frecuente en ti?
Paciente: Sí… constantemente.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Tímido… me costaba hablar con otros niños.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Protectores… especialmente mi mamá.

Terapeuta: ¿En qué sentido?
Paciente: Evitaba que me expusiera mucho… siempre trataba de cuidarme.

Terapeuta: ¿Y tu papá?
Paciente: Más distante… no era muy expresivo.

Terapeuta: ¿Cómo fue tu etapa en el colegio?
Paciente: Difícil… me hacían bromas… no encajaba mucho.

Terapeuta: ¿Cómo te afectó eso?
Paciente: Me volví más reservado… prefería no llamar la atención.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Igual… pocos amigos… evitaba situaciones sociales.

Terapeuta: ¿Intentaste cambiar eso en algún momento?
Paciente: Sí… pero cuando lo hacía y algo salía mal, me sentía peor.

Terapeuta: ¿Qué tipo de cosas pasaban?
Paciente: Decía algo y sentía que la gente se quedaba en silencio… como juzgándome.

Terapeuta: ¿Eso ocurrió realmente o es cómo lo interpretaste?
Paciente: No sé… creo que es más lo que yo siento.

Terapeuta: ¿Cómo te ves a ti mismo actualmente?
Paciente: Como alguien inseguro… que no encaja bien con los demás.

Terapeuta: ¿Qué te gustaría que cambiara?
Paciente: Poder ser más natural… no sentir tanto miedo al interactuar.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… nunca.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… casi nada.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que me bloqueo frente a los demás… como si siempre estuviera en desventaja.`,
  },
  {
    id: 7,
    titulo: "Caso 8",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Sergio Ramírez Quesada, tengo 34 años.

Terapeuta: Mucho gusto, Sergio. ¿A qué te dedicas actualmente?
Paciente: Trabajo como programador en una empresa de tecnología.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Solo… prefiero así.

Terapeuta: Bien, Sergio. ¿Qué te trae hoy a consulta?
Paciente: Me dijeron en el trabajo que debería mejorar mis habilidades sociales… pero no estoy muy seguro de qué significa eso.

Terapeuta: ¿Quién te lo comentó?
Paciente: Mi jefe, en una evaluación de desempeño.

Terapeuta: ¿Qué te dijo específicamente?
Paciente: Que técnicamente hago bien mi trabajo, pero que tengo dificultades para comunicarme con el equipo.

Terapeuta: ¿Cómo entiendes tú eso?
Paciente: No sé… yo digo lo necesario… no entiendo qué más esperan.

Terapeuta: ¿Cómo te sientes en reuniones o interacciones sociales?
Paciente: Incómodo… no sé cuándo intervenir ni qué decir.

Terapeuta: ¿Qué pasa por tu mente en esos momentos?
Paciente: Trato de entender qué esperan los demás… pero no siempre lo logro.

Terapeuta: ¿Te preocupa ser juzgado en esas situaciones?
Paciente: No exactamente… más bien me confunde.

Terapeuta: ¿Te cuesta interpretar lo que las personas quieren decir o sienten?
Paciente: Sí… a veces no entiendo si están bromeando o hablando en serio.

Terapeuta: ¿Te ha pasado que alguien se moleste contigo sin que entiendas por qué?
Paciente: Sí… varias veces… dicen que soy muy directo.

Terapeuta: ¿Puedes darme un ejemplo?
Paciente: Una compañera me pidió opinión sobre un trabajo y le dije que tenía varios errores… después se molestó.

Terapeuta: ¿Cómo te sentiste en ese momento?
Paciente: Confundido… porque solo respondí a lo que me pidió.

Terapeuta: ¿Cómo son tus relaciones personales actualmente?
Paciente: Limitadas… tengo pocos amigos y no los veo mucho.

Terapeuta: ¿Te gustaría tener más contacto social?
Paciente: No estoy seguro… a veces sí, pero también me resulta agotador.

Terapeuta: ¿Has tenido pareja?
Paciente: No… lo he intentado, pero no funciona.

Terapeuta: ¿Qué suele pasar en esas situaciones?
Paciente: Me dicen que soy distante o que no conecto emocionalmente.

Terapeuta: ¿Cómo entiendes eso de conectar emocionalmente?
Paciente: No estoy seguro… sé que debería pasar algo, pero no sé exactamente qué.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Bastante solitario… prefería jugar solo.

Terapeuta: ¿Tenías amigos en la escuela?
Paciente: No muchos… me costaba integrarme.

Terapeuta: ¿Qué era lo que más te costaba?
Paciente: No entendía bien los juegos… o las reglas cambiaban y eso me molestaba.

Terapeuta: ¿Tenías intereses específicos en esa etapa?
Paciente: Sí… me gustaban mucho los trenes… podía pasar horas investigando sobre eso.

Terapeuta: ¿Cómo reaccionabas cuando se interrumpían esas actividades?
Paciente: Me molestaba bastante… no me gustaban los cambios.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Similar… me enfocaba en mis intereses… no en lo social.

Terapeuta: ¿Te costaba adaptarte a cambios en tu rutina?
Paciente: Sí… todavía me cuesta… prefiero tener todo estructurado.

Terapeuta: ¿Cómo es un día típico para ti ahora?
Paciente: Bastante ordenado… hago las mismas cosas en el mismo orden.

Terapeuta: ¿Qué pasa si algo cambia inesperadamente?
Paciente: Me incomoda… pierdo el enfoque.

Terapeuta: ¿Cómo describirías tus emociones?
Paciente: Estables… no cambian mucho… pero tampoco las entiendo bien.

Terapeuta: ¿Te cuesta identificar lo que sientes?
Paciente: Sí… a veces sé que algo está pasando, pero no puedo nombrarlo.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No, nunca.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que entiendo mejor las cosas que tienen lógica… pero no a las personas.`,
  },
  {
    id: 8,
    titulo: "Caso 9",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Andrés Vargas Méndez, tengo 36 años.

Terapeuta: Mucho gusto, Andrés. ¿A qué te dedicas actualmente?
Paciente: Soy vendedor… trabajo en una tienda de electrodomésticos.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi esposa… no tenemos hijos.

Terapeuta: Bien, Andrés. ¿Qué te trae hoy a consulta?
Paciente: Me están dando como ataques… no sé cómo explicarlo… siento que me voy a morir.

Terapeuta: Cuéntame un poco más sobre esos ataques.
Paciente: Empiezan de la nada… el corazón se me acelera muchísimo… siento que no puedo respirar.

Terapeuta: ¿Recuerdas cuándo te pasó por primera vez?
Paciente: Sí… hace como tres meses… estaba en el trabajo.

Terapeuta: ¿Qué ocurrió en ese momento?
Paciente: Estaba atendiendo a un cliente… y de repente sentí un mareo… luego el corazón rapidísimo… pensé que me estaba dando un infarto.

Terapeuta: ¿Qué hiciste en ese momento?
Paciente: Salí corriendo… me llevaron a emergencias.

Terapeuta: ¿Qué te dijeron ahí?
Paciente: Que todo estaba bien… que no era nada cardíaco.

Terapeuta: ¿Cómo te sentiste al escuchar eso?
Paciente: Aliviado… pero al mismo tiempo confundido… porque se siente muy real.

Terapeuta: ¿Te ha vuelto a pasar desde entonces?
Paciente: Sí… varias veces… ya no solo en el trabajo.

Terapeuta: ¿En qué otros momentos te ocurre?
Paciente: En el carro… en el supermercado… incluso en la casa.

Terapeuta: ¿Notas algún patrón o desencadenante?
Paciente: No… eso es lo que me desespera… aparecen de repente.

Terapeuta: ¿Qué pasa por tu mente cuando empiezan los síntomas?
Paciente: Que esta vez sí es algo grave… que me voy a morir… que nadie me va a ayudar a tiempo.

Terapeuta: ¿Cómo reacciona tu cuerpo en esos momentos?
Paciente: Me falta el aire… sudo… me tiemblan las manos… siento que pierdo el control.

Terapeuta: ¿Cuánto duran esos episodios?
Paciente: No sé… tal vez unos minutos… pero se sienten eternos.

Terapeuta: ¿Qué haces cuando empiezan?
Paciente: Trato de salir del lugar… buscar aire… o llamar a alguien.

Terapeuta: ¿Has cambiado algo en tu rutina por esto?
Paciente: Sí… ya casi no salgo solo… evito lugares donde hay mucha gente.

Terapeuta: ¿Cómo ha afectado esto tu trabajo?
Paciente: Bastante… me da miedo que me pase frente a un cliente.

Terapeuta: ¿Te ha pasado en el trabajo recientemente?
Paciente: Sí… y tuve que esconderme en el baño hasta que se me pasara.

Terapeuta: ¿Cómo te sentiste después de eso?
Paciente: Avergonzado… frustrado… como si ya no fuera capaz.

Terapeuta: ¿Cómo está tu relación con tu esposa en este momento?
Paciente: Ella me apoya… pero también está preocupada… no entiende qué me pasa.

Terapeuta: ¿Tú cómo entiendes lo que te está pasando?
Paciente: Siento que hay algo mal en mi cuerpo… aunque los doctores digan que no.

Terapeuta: Antes de estos episodios, ¿habías tenido algo similar?
Paciente: No… nunca así.

Terapeuta: ¿Cómo describirías tu vida antes de que esto comenzara?
Paciente: Normal… trabajaba tranquilo… salía… no pensaba en esto.

Terapeuta: ¿Hubo algún evento importante antes del primer episodio?
Paciente: Sí… la empresa estaba haciendo recortes… había mucha presión.

Terapeuta: ¿Cómo manejaste ese estrés?
Paciente: Me lo guardé… traté de seguir como si nada.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Bastante tranquilo… pero nervioso… me preocupaba mucho por todo.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Mi mamá era muy ansiosa… siempre estaba pendiente de que algo malo pasara.

Terapeuta: ¿Crees que eso influyó en ti?
Paciente: Sí… creo que sí… siempre he sido así, pero nunca tan intenso.

Terapeuta: ¿Cómo es tu estilo de vida actualmente?
Paciente: Más limitado… ya no hago ejercicio… evito salir mucho.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… casi nada.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… esta es la primera vez.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que en cualquier momento mi cuerpo se va a descontrolar y no voy a poder hacer nada para evitarlo.`,
  },
  {
    id: 9,
    titulo: "Caso 10",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Ricardo Jiménez Morales, tengo 42 años.

Terapeuta: Mucho gusto, Ricardo. ¿A qué te dedicas actualmente?
Paciente: Soy contador… trabajo en una empresa privada desde hace años.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi esposa y mi hija… tiene 13 años.

Terapeuta: Bien, Ricardo. ¿Qué te trae hoy a consulta?
Paciente: Estoy cansado… pero no es solo cansancio normal… es como si no me alcanzara la energía para nada.

Terapeuta: ¿Desde cuándo te sientes así?
Paciente: Ya varios meses… tal vez más de medio año.

Terapeuta: ¿Hubo algún cambio en ese momento?
Paciente: No algo específico… solo que el trabajo se volvió más pesado… más responsabilidades.

Terapeuta: ¿Cómo son tus días actualmente?
Paciente: Me levanto sin ganas… voy al trabajo porque tengo que ir… hago lo que me toca, pero todo me cuesta.

Terapeuta: ¿Cómo te sientes emocionalmente durante el día?
Paciente: Irritable… cualquier cosa me molesta… y luego me siento mal por eso.

Terapeuta: ¿Qué tipo de cosas te molestan?
Paciente: Cosas pequeñas… ruido, comentarios, errores… antes no era así.

Terapeuta: ¿Has notado cambios en tu ánimo?
Paciente: No me siento triste como tal… pero tampoco disfruto nada.

Terapeuta: ¿Hay actividades que antes disfrutabas?
Paciente: Sí… ver fútbol, salir con amigos… ahora no me interesa.

Terapeuta: ¿Cómo está tu energía en general?
Paciente: Muy baja… todo me cuesta… incluso cosas simples.

Terapeuta: ¿Cómo está tu sueño?
Paciente: Me duermo, pero me despierto cansado… como si no hubiera descansado.

Terapeuta: ¿Has notado cambios físicos?
Paciente: Sí… dolores en el cuerpo… espalda, cabeza… constantemente.

Terapeuta: ¿Has consultado por eso?
Paciente: Sí… me han hecho exámenes y dicen que todo está bien.

Terapeuta: ¿Cómo interpretas eso?
Paciente: No sé… porque yo sí me siento mal.

Terapeuta: ¿Cómo está tu rendimiento en el trabajo?
Paciente: Cumplo… pero ya no como antes… me cuesta concentrarme.

Terapeuta: ¿Has recibido comentarios al respecto?
Paciente: Sí… que estoy más lento… menos preciso.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Frustrado… siento que estoy fallando.

Terapeuta: ¿Cómo está tu relación con tu familia?
Paciente: Tensa… mi esposa dice que estoy distante… mi hija casi no habla conmigo.

Terapeuta: ¿Qué crees que ha cambiado?
Paciente: Yo… ya no tengo paciencia… ni ganas de compartir.

Terapeuta: ¿Te sientes conectado emocionalmente con ellos?
Paciente: No mucho… es como si estuviera, pero no realmente.

Terapeuta: ¿Has pensado en por qué podría estar pasando esto?
Paciente: Pienso que tal vez es el estrés… pero siento que es más que eso.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Responsable… serio… siempre tratando de hacer las cosas bien.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Exigentes… especialmente mi papá… no le gustaban los errores.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que rendir… que no podía fallar.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Similar… enfocado en estudiar… en cumplir.

Terapeuta: ¿Tenías espacios de disfrute?
Paciente: Pocos… siempre había algo que hacer.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… siento que siempre estoy en modo obligación… nunca descanso realmente.

Terapeuta: ¿Has tenido pensamientos negativos sobre ti mismo últimamente?
Paciente: Sí… siento que ya no soy el mismo… que estoy fallando en todo.

Terapeuta: ¿Has pensado en rendirte o dejar todo?
Paciente: A veces… pero no lo hago… por mi familia.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Que sigo porque tengo responsabilidades… no porque tenga ganas.

Terapeuta: ¿Has tenido pensamientos de hacerte daño?
Paciente: No… pero sí de desaparecer… de no sentir esto.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… casi nada.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… esta es la primera vez.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que estoy viviendo en automático… cumpliendo… pero sin ganas de nada.`,
  },
  {
    id: 10,
    titulo: "Caso 11",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Daniel Rojas Vargas, tengo 38 años.

Terapeuta: Mucho gusto, Daniel. ¿A qué te dedicas actualmente?
Paciente: Trabajo en ventas… en una tienda de ropa.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi pareja… llevamos como cuatro años juntos.

Terapeuta: Bien, Daniel. ¿Qué te trae hoy a consulta?
Paciente: Me cuesta hablar de esto… pero está afectando mi relación.

Terapeuta: Tómate tu tiempo, puedes ir poco a poco.
Paciente: Es algo que tengo desde hace muchos años… y ya no puedo manejarlo igual.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Tengo una forma muy específica de excitarme… y si no está eso, no logro nada.

Terapeuta: ¿Desde cuándo notas eso en ti?
Paciente: Desde adolescente… pero antes no lo veía como problema.

Terapeuta: ¿Qué ha cambiado ahora?
Paciente: Mi pareja… ella no lo entiende… y se ha vuelto un conflicto constante.

Terapeuta: ¿Cómo reacciona ella?
Paciente: Dice que se siente incómoda… que no le gusta… que se siente usada.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Mal… culpable… pero al mismo tiempo no sé cómo cambiarlo.

Terapeuta: ¿Has intentado tener intimidad sin ese estímulo?
Paciente: Sí… pero no funciona… pierdo el interés o no logro mantenerme.

Terapeuta: ¿Eso te genera preocupación?
Paciente: Sí… siento que algo está mal conmigo.

Terapeuta: ¿Esto ha afectado otras áreas de tu vida?
Paciente: Sí… evito ciertas situaciones… incluso discusiones con mi pareja por esto.

Terapeuta: ¿Has hablado abiertamente con ella sobre lo que te pasa?
Paciente: Lo he intentado… pero termina en conflicto.

Terapeuta: ¿Cómo describirías tu relación actualmente?
Paciente: Tensa… distante… esto se ha vuelto un tema central.

Terapeuta: ¿Has tenido otras relaciones antes?
Paciente: Sí… pero más cortas… nunca duraron tanto como esta.

Terapeuta: ¿En esas relaciones también estaba presente esto?
Paciente: Sí… pero no era tan evidente… o no se hablaba tanto.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo fue tu adolescencia?
Paciente: Bastante normal… pero descubrí esto temprano… y se quedó.

Terapeuta: ¿Recuerdas cómo comenzó?
Paciente: Sí… fue algo que se fue repitiendo… y se volvió necesario.

Terapeuta: ¿Cómo te sentías al respecto en ese momento?
Paciente: No lo cuestionaba… solo era así.

Terapeuta: ¿Cuándo empezaste a verlo como problema?
Paciente: Cuando afectó mi relación actual.

Terapeuta: ¿Has intentado cambiar ese patrón?
Paciente: Sí… pero no lo logro… vuelvo a lo mismo.

Terapeuta: ¿Cómo te ves a ti mismo en este momento?
Paciente: Como alguien que no tiene control en esa área… y que está dañando su relación.

Terapeuta: ¿Has recibido atención psicológica antes por esto?
Paciente: No… nunca.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… casi nada.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi forma de vivir la intimidad está afectando mi vida… y no sé cómo cambiarla.`,
  },
  {
    id: 11,
    titulo: "Caso 12",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Laura Fernández Castillo, tengo 35 años.

Terapeuta: Mucho gusto, Laura. ¿A qué te dedicas actualmente?
Paciente: Soy abogada… trabajo en un bufete.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con mi esposo.

Terapeuta: Bien, Laura. ¿Qué te trae hoy a consulta?
Paciente: Me siento muy agotada mentalmente… como si mi cabeza no descansara nunca.

Terapeuta: ¿Desde cuándo te sientes así?
Paciente: Desde hace años… pero últimamente se ha vuelto más intenso.

Terapeuta: ¿Qué ocurre exactamente en tu mente?
Paciente: Pensamientos… que no puedo detener… y tengo que revisarlos una y otra vez.

Terapeuta: ¿A qué tipo de pensamientos te refieres?
Paciente: A cosas que podrían salir mal… errores… consecuencias… escenarios que repaso muchas veces.

Terapeuta: ¿Qué pasa si no los repasas?
Paciente: Me siento muy ansiosa… como si estuviera siendo irresponsable.

Terapeuta: ¿Sientes que algo malo podría pasar?
Paciente: Sí… como si no prever todo fuera un riesgo.

Terapeuta: ¿Esto ocurre solo en el trabajo o en otras áreas también?
Paciente: En todo… decisiones, conversaciones, cosas que dije… todo lo reviso mentalmente.

Terapeuta: ¿Cómo es ese proceso de revisión?
Paciente: Repaso lo que pasó… lo analizo… trato de asegurarme de que estuvo bien… pero nunca es suficiente.

Terapeuta: ¿Cuánto tiempo puedes pasar en eso?
Paciente: Horas… a veces sin darme cuenta.

Terapeuta: ¿Cómo te sientes mientras lo haces?
Paciente: Tensa… pero siento que debo hacerlo.

Terapeuta: ¿Qué pasaría si no lo hicieras?
Paciente: Sentiría que estoy siendo negligente… como si algo malo fuera a pasar por mi culpa.

Terapeuta: ¿Te ha pasado que algo malo ocurra por no revisar lo suficiente?
Paciente: No… realmente no… pero siento que podría pasar.

Terapeuta: ¿Cómo afecta esto tu día a día?
Paciente: Me cansa… me retrasa… me cuesta desconectarme.

Terapeuta: ¿Cómo está tu rendimiento laboral?
Paciente: Es bueno… pero a costa de mucho desgaste.

Terapeuta: ¿Te han hecho comentarios sobre eso?
Paciente: Sí… que soy muy detallista… pero también que me tardo demasiado.

Terapeuta: ¿Cómo son tus relaciones personales?
Paciente: Mi esposo dice que nunca estoy realmente presente… que siempre estoy pensando en algo.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Mal… porque es cierto.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niña?
Paciente: Muy responsable… muy cuidadosa… no me gustaba equivocarme.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Exigentes… especialmente con los estudios… todo tenía que estar perfecto.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que hacer las cosas bien… o algo malo iba a pasar.

Terapeuta: ¿Recuerdas si ya en esa época tenías este tipo de pensamientos?
Paciente: Sí… revisaba tareas muchas veces… me costaba entregarlas.

Terapeuta: ¿Cómo ha evolucionado eso con el tiempo?
Paciente: Se volvió más mental… menos visible… pero más constante.

Terapeuta: ¿Has intentado dejar de hacerlo?
Paciente: Sí… pero no puedo… siento demasiada ansiedad.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… esta es la primera vez.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que si no controlo todo en mi mente, algo malo va a pasar… y va a ser mi culpa.`,
  },
  {
    id: 12,
    titulo: "Caso 13",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Esteban Quesada Mora, tengo 41 años.

Terapeuta: Mucho gusto, Esteban. ¿A qué te dedicas actualmente?
Paciente: Trabajo como gerente en una empresa de logística.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi pareja… bueno, estamos pasando por una situación complicada.

Terapeuta: Bien, Esteban. ¿Qué te trae hoy a consulta?
Paciente: Mi pareja dice que debería venir… que tengo problemas para relacionarme… pero no estoy del todo de acuerdo.

Terapeuta: ¿Qué es lo que ella te señala específicamente?
Paciente: Dice que todo gira alrededor mío… que no la escucho… que minimizo lo que siente.

Terapeuta: ¿Tú cómo percibes eso?
Paciente: Siento que exagera… yo solo trato de hacer las cosas bien.

Terapeuta: ¿Cómo suelen ser las discusiones entre ustedes?
Paciente: Ella se queja… yo trato de explicarle cómo son realmente las cosas… pero se lo toma personal.

Terapeuta: ¿A qué te refieres con "cómo son realmente las cosas"?
Paciente: Que a veces no tiene razón… o que está viendo las cosas de forma emocional, no objetiva.

Terapeuta: ¿Cómo reaccionas cuando ella se muestra emocional?
Paciente: Me incomoda… siento que pierde el control… y alguien tiene que poner orden.

Terapeuta: ¿Te ha dicho cómo se siente cuando ocurre eso?
Paciente: Sí… dice que se siente invalidada… pero no es mi intención.

Terapeuta: ¿Qué sientes tú cuando ella te hace ese tipo de reclamos?
Paciente: Molestia… porque siento que no reconoce todo lo que hago.

Terapeuta: ¿Qué es lo que sientes que no se reconoce?
Paciente: Mi esfuerzo… mi forma de pensar… lo que aporto.

Terapeuta: ¿Te sientes valorado en la relación?
Paciente: No lo suficiente.

Terapeuta: ¿Cómo es tu desempeño laboral?
Paciente: Muy bueno… tengo gente a cargo… y los resultados hablan por sí solos.

Terapeuta: ¿Cómo es tu relación con tu equipo de trabajo?
Paciente: Buena… aunque algunos no están al nivel que deberían.

Terapeuta: ¿Cómo manejas eso?
Paciente: Exijo… porque si no, las cosas no salen bien.

Terapeuta: ¿Cómo reaccionan ellos ante eso?
Paciente: Algunos bien… otros se lo toman personal.

Terapeuta: ¿Te ha pasado que alguien se aleje o tenga conflictos contigo por esto?
Paciente: Sí… pero siento que es porque no toleran la exigencia.

Terapeuta: ¿Cómo son tus relaciones personales fuera de la pareja?
Paciente: Limitadas… no confío fácilmente en la gente.

Terapeuta: ¿Por qué crees que pasa eso?
Paciente: Porque la mayoría no aporta mucho… prefiero rodearme de personas que estén a mi nivel.

Terapeuta: ¿Qué significa para ti que alguien esté a tu nivel?
Paciente: Que tenga criterio… ambición… que no sea conformista.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Destacado… siempre sobresalía en lo académico.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Exigentes… pero también orgullosos cuando hacía las cosas bien.

Terapeuta: ¿Cómo reaccionaban cuando cometías errores?
Paciente: No les gustaba… esperaban más de mí.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que mantener cierto nivel… no bajar.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Similar… enfocado en destacar… en ser mejor que los demás.

Terapeuta: ¿Cómo te relacionabas con otros en esa etapa?
Paciente: Tenía amigos… pero no muchos cercanos.

Terapeuta: ¿Te resultaba fácil conectar emocionalmente con otros?
Paciente: No especialmente… no lo veía necesario.

Terapeuta: ¿Cómo describirías tus emociones actualmente?
Paciente: Estables… no soy de perder el control.

Terapeuta: ¿Te cuesta identificar o expresar emociones?
Paciente: No… simplemente no creo que sea útil hacerlo todo el tiempo.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… nunca lo consideré necesario.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Socialmente… nada fuera de lo normal.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que los demás tienen expectativas poco realistas de cómo debería ser yo… cuando en realidad estoy haciendo las cosas bien.`,
  },
  {
    id: 13,
    titulo: "Caso 14",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Andrea Chaves Rodríguez, tengo 37 años.

Terapeuta: Mucho gusto, Andrea. ¿A qué te dedicas actualmente?
Paciente: Soy enfermera… trabajo en un hospital.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola… antes vivía con mi mamá.

Terapeuta: Bien, Andrea. ¿Qué te trae hoy a consulta?
Paciente: Han pasado ya dos años… pero siento que no logro seguir adelante.

Terapeuta: ¿A qué te refieres con eso?
Paciente: A que sigo sintiendo como si todo se hubiera detenido… desde que mi mamá falleció.

Terapeuta: Lamento mucho tu pérdida. ¿Qué fue lo que ocurrió?
Paciente: Fue un cáncer… fue rápido… en pocos meses todo cambió.

Terapeuta: ¿Cómo viviste ese proceso?
Paciente: Estuve con ella todo el tiempo… prácticamente dejé todo para cuidarla.

Terapeuta: ¿Cómo fue para ti asumir ese rol?
Paciente: No lo pensé mucho… era lo que tenía que hacer.

Terapeuta: ¿Cómo fue el momento de su fallecimiento?
Paciente: Muy duro… estaba ahí… pero sentí que no hice lo suficiente.

Terapeuta: ¿Sigues pensando eso actualmente?
Paciente: Sí… constantemente… siento que pude haber hecho más.

Terapeuta: ¿Qué tipo de pensamientos aparecen?
Paciente: Que si hubiera actuado diferente… si hubiera notado algo antes… tal vez ella estaría aquí.

Terapeuta: ¿Cómo te hacen sentir esos pensamientos?
Paciente: Culpa… mucha culpa.

Terapeuta: ¿Cómo es tu día a día actualmente?
Paciente: Trabajo… pero fuera de eso no hago mucho.

Terapeuta: ¿Cómo te sientes en el trabajo?
Paciente: Funciono… pero evito ciertos casos… especialmente pacientes con cáncer.

Terapeuta: ¿Qué ocurre cuando te enfrentas a esos casos?
Paciente: Me siento abrumada… como si reviviera todo.

Terapeuta: ¿Cómo manejas eso?
Paciente: Trato de evitarlo… o de salir de la situación.

Terapeuta: ¿Cómo son tus relaciones personales actualmente?
Paciente: Me he alejado… no tengo muchas ganas de ver a nadie.

Terapeuta: ¿Por qué crees que pasa eso?
Paciente: Siento que nadie entiende… y tampoco quiero hablar del tema.

Terapeuta: ¿Hay momentos en los que sientas alivio o disfrute?
Paciente: Muy pocos… casi ninguno.

Terapeuta: ¿Qué actividades disfrutabas antes?
Paciente: Salir con amigas… viajar… ahora no me interesa.

Terapeuta: ¿Cómo está tu energía en general?
Paciente: Baja… todo me cuesta más.

Terapeuta: ¿Cómo está tu sueño?
Paciente: Irregular… a veces me cuesta dormir… otras veces duermo mucho.

Terapeuta: ¿Tienes recuerdos recurrentes sobre tu mamá o su enfermedad?
Paciente: Sí… muchas veces… sobre todo los últimos días.

Terapeuta: ¿Qué sientes cuando aparecen esos recuerdos?
Paciente: Tristeza… pero también culpa.

Terapeuta: ¿Sientes que has podido aceptar su muerte?
Paciente: No… es como si una parte de mí siguiera esperando que no sea real.

Terapeuta: ¿Has conservado objetos o espacios relacionados con ella?
Paciente: Sí… su cuarto está igual… no he podido cambiar nada.

Terapeuta: ¿Qué significa eso para ti?
Paciente: Es lo único que me queda… si lo cambio, siento que la pierdo más.

Terapeuta: ¿Has recibido apoyo emocional en este proceso?
Paciente: No realmente… he tratado de manejarlo sola.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No… esta es la primera vez.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi vida siguió… pero yo me quedé en ese momento.`,
  },
  {
    id: 14,
    titulo: "Caso 15",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Valeria Méndez Salazar, tengo 29 años.

Terapeuta: Mucho gusto, Valeria. ¿A qué te dedicas actualmente?
Paciente: Trabajo en marketing… en una agencia.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola… pero paso mucho tiempo con mi pareja.

Terapeuta: Bien, Valeria. ¿Qué te trae hoy a consulta?
Paciente: Siento que mis relaciones siempre terminan igual… y no entiendo por qué.

Terapeuta: ¿A qué te refieres con que terminan igual?
Paciente: Empiezo bien… todo fluye… pero después me empiezo a sentir insegura… y todo se complica.

Terapeuta: ¿Qué tipo de inseguridad aparece?
Paciente: Miedo a que la persona se aleje… a que deje de quererme.

Terapeuta: ¿Eso ocurre aunque no haya señales claras?
Paciente: Sí… a veces no pasa nada, pero igual lo siento.

Terapeuta: ¿Qué haces cuando aparece ese miedo?
Paciente: Busco contacto… escribo… pregunto si todo está bien.

Terapeuta: ¿Cómo suele reaccionar tu pareja ante eso?
Paciente: Al inicio bien… pero luego se cansa… dice que es demasiado.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Peor… siento que lo estoy perdiendo.

Terapeuta: ¿Qué haces en ese momento?
Paciente: Insisto más… trato de arreglarlo… pero termina alejándose más.

Terapeuta: ¿Notas algún patrón en eso?
Paciente: Sí… es como un ciclo… entre más miedo tengo, más lo provoco.

Terapeuta: ¿Cómo es tu relación actual?
Paciente: Estamos bien… pero yo siento que en cualquier momento algo va a cambiar.

Terapeuta: ¿Tu pareja te ha dado motivos concretos para pensar eso?
Paciente: No realmente… pero a veces responde menos… o está ocupado… y eso me activa.

Terapeuta: ¿Qué pasa por tu mente en esos momentos?
Paciente: Que ya no le importo igual… que está perdiendo interés… que va a irse.

Terapeuta: ¿Cómo te sientes emocionalmente cuando eso ocurre?
Paciente: Ansiosa… angustiada… como si necesitara resolverlo ya.

Terapeuta: ¿Qué haces con esa emoción?
Paciente: No puedo quedarme tranquila… tengo que hacer algo… escribirle, llamarlo, aclarar.

Terapeuta: ¿Qué pasa si decides no hacer nada?
Paciente: Me siento peor… como si estuviera ignorando algo importante.

Terapeuta: ¿Cómo te sientes cuando finalmente recibes respuesta?
Paciente: Aliviada… pero por poco tiempo.

Terapeuta: ¿Luego vuelve la sensación?
Paciente: Sí… con cualquier cosa.

Terapeuta: ¿Cómo son tus relaciones fuera de la pareja?
Paciente: Más estables… pero tampoco me gusta sentirme distante de la gente cercana.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo era tu relación con tus padres?
Paciente: Mi mamá era muy cariñosa… pero también cambiante… a veces muy cercana, otras distante.

Terapeuta: ¿Cómo vivías eso?
Paciente: Confuso… nunca sabía cómo iba a estar.

Terapeuta: ¿Y tu papá?
Paciente: Más ausente… trabajaba mucho.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que buscar atención… asegurarme de que me quisieran.

Terapeuta: ¿Recuerdas sentir miedo a que te dejaran o se alejaran?
Paciente: Sí… bastante.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… siento que es lo mismo… pero en mis relaciones.

Terapeuta: ¿Cómo te ves a ti misma en una relación?
Paciente: Entregada… pero también dependiente… como si necesitara al otro para estar tranquila.

Terapeuta: ¿Has intentado cambiar ese patrón?
Paciente: Sí… trato de controlarme… pero no lo logro del todo.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… nada relevante.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que necesito a la otra persona para sentirme segura… y eso termina alejándola.`,
  },
  {
    id: 15,
    titulo: "Caso 16",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Daniela Rojas Pineda, tengo 33 años.

Terapeuta: Mucho gusto, Daniela. ¿A qué te dedicas actualmente?
Paciente: Soy diseñadora gráfica… trabajo freelance.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola.

Terapeuta: Bien, Daniela. ¿Qué te trae hoy a consulta?
Paciente: He tenido problemas con mis amistades… siento que algo no está bien, pero no sé exactamente qué.

Terapeuta: Cuéntame un poco más sobre eso.
Paciente: Siento que la gente cambia conmigo… que al inicio todo bien, pero luego se alejan o actúan diferente.

Terapeuta: ¿Te ha pasado con varias personas?
Paciente: Sí… con varias… por eso siento que no es coincidencia.

Terapeuta: ¿Qué interpretas cuando alguien actúa diferente contigo?
Paciente: Que hice algo mal… o que ya no quieren estar conmigo.

Terapeuta: ¿Sueles preguntar directamente qué ocurre?
Paciente: A veces… pero no siempre me dicen algo claro.

Terapeuta: ¿Qué pasa en tu mente cuando no tienes claridad?
Paciente: Empiezo a pensar… a analizar todo… lo que dije, lo que hice… si algo estuvo mal.

Terapeuta: ¿Qué tipo de conclusiones sueles sacar?
Paciente: Que probablemente ya no les agrado… o que están hablando mal de mí.

Terapeuta: ¿Tienes evidencia directa de eso?
Paciente: No… pero lo siento así.

Terapeuta: ¿Cómo te hace sentir esa interpretación?
Paciente: Ansiosa… insegura… como si tuviera que hacer algo para arreglarlo.

Terapeuta: ¿Qué haces en esos momentos?
Paciente: Escribo… trato de aclarar… o a veces me alejo primero.

Terapeuta: ¿Qué pasa después de eso?
Paciente: A veces se enfría la relación… otras veces todo sigue, pero yo ya no me siento igual.

Terapeuta: ¿Te ha pasado que después te des cuenta de que no era como pensabas?
Paciente: Sí… varias veces… pero igual en el momento lo siento real.

Terapeuta: ¿Cómo afecta esto tus relaciones actuales?
Paciente: Me cuesta confiar… siempre estoy como alerta.

Terapeuta: ¿Qué significa para ti una amistad cercana?
Paciente: Que la persona esté… que sea constante… que no cambie.

Terapeuta: ¿Qué pasa si notas cambios en esa constancia?
Paciente: Me desestabiliza… siento que algo está mal.

Terapeuta: ¿Cómo reaccionas emocionalmente?
Paciente: Me angustio… empiezo a sobrepensar todo.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eran tus relaciones en la infancia?
Paciente: Cambiantes… tenía amigas, pero muchas veces se alejaban… o cambiaban de grupo.

Terapeuta: ¿Cómo vivías eso?
Paciente: Me dolía mucho… no entendía por qué pasaba.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Mi mamá era cercana… pero también crítica… señalaba mucho lo que hacía mal.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que hacerlo bien… para que no me rechazaran.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… siento que si no hago todo bien, las personas se van a alejar.

Terapeuta: ¿Cómo te ves a ti misma en las relaciones?
Paciente: Atenta… pendiente… pero también insegura.

Terapeuta: ¿Has intentado cambiar esto?
Paciente: Sí… trato de no pensar tanto… pero no lo logro.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que siempre estoy tratando de entender si los demás siguen queriendo estar conmigo… y eso me desgasta.`,
  },
  {
    id: 16,
    titulo: "Caso 17",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Sofía Araya Calderón, tengo 34 años.

Terapeuta: Mucho gusto, Sofía. ¿A qué te dedicas actualmente?
Paciente: Soy arquitecta… trabajo en una firma.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola.

Terapeuta: Bien, Sofía. ¿Qué te trae hoy a consulta?
Paciente: No estoy durmiendo bien… y ya está afectando todo.

Terapeuta: ¿Desde cuándo tienes dificultades para dormir?
Paciente: Desde hace varios meses… tal vez unos ocho o nueve.

Terapeuta: ¿Qué ocurre exactamente cuando intentas dormir?
Paciente: Me acuesto… pero mi mente no se apaga… empiezo a pensar en todo.

Terapeuta: ¿Qué tipo de pensamientos aparecen?
Paciente: Pendientes del trabajo… cosas que hice en el día… lo que tengo que hacer mañana… todo junto.

Terapeuta: ¿Cuánto tiempo tardas en dormirte?
Paciente: A veces más de una hora… incluso dos.

Terapeuta: ¿Te despiertas durante la noche?
Paciente: Sí… y cuando me despierto, vuelvo a pensar… y cuesta dormirme otra vez.

Terapeuta: ¿Cómo te sientes al día siguiente?
Paciente: Cansada… irritable… me cuesta concentrarme.

Terapeuta: ¿Cómo ha afectado esto tu trabajo?
Paciente: Estoy más lenta… cometo errores que antes no cometía.

Terapeuta: ¿Qué haces cuando no logras dormir?
Paciente: Me quedo en la cama… reviso el celular… trato de distraerme.

Terapeuta: ¿Eso te ayuda?
Paciente: No mucho… pero no sé qué más hacer.

Terapeuta: ¿Tomas café u otras bebidas estimulantes?
Paciente: Sí… bastante… sobre todo en la tarde para compensar el cansancio.

Terapeuta: ¿Cómo son tus horarios de sueño?
Paciente: Irregulares… a veces me acuesto tarde por trabajo.

Terapeuta: ¿Haces alguna actividad antes de dormir?
Paciente: Trabajo en la computadora… o reviso el celular.

Terapeuta: ¿Cómo te sientes emocionalmente respecto a dormir?
Paciente: Ansiosa… porque sé que necesito dormir, pero siento que no voy a poder.

Terapeuta: ¿Qué pasa por tu mente cuando no logras dormir?
Paciente: Que al día siguiente voy a estar peor… que no voy a rendir… que todo se va a acumular.

Terapeuta: ¿Notas que eso aumenta tu activación?
Paciente: Sí… entre más pienso eso, menos puedo dormir.

Terapeuta: ¿Cómo era tu sueño antes de que empezara esto?
Paciente: Normal… no tenía problemas.

Terapeuta: ¿Hubo algún cambio en tu vida antes de que iniciara?
Paciente: Sí… más carga laboral… proyectos más exigentes.

Terapeuta: ¿Cómo manejaste ese aumento de demanda?
Paciente: Trabajando más… llevándome trabajo a la casa.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras en cuanto a responsabilidad y exigencia?
Paciente: Bastante exigente… me gusta hacer las cosas bien.

Terapeuta: ¿Cómo eran tus padres contigo en ese aspecto?
Paciente: También exigentes… valoraban mucho el rendimiento.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que cumplir… que no podía fallar.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… siento que no puedo desconectarme… como si siempre tuviera que estar pendiente.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No… solo café.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi cuerpo quiere descansar… pero mi mente no me deja.`,
  },
  {
    id: 17,
    titulo: "Caso 18",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Mariana Salazar Rojas, tengo 32 años.

Terapeuta: Mucho gusto, Mariana. ¿A qué te dedicas actualmente?
Paciente: Soy diseñadora de interiores… trabajo por proyectos.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola.

Terapeuta: Bien, Mariana. ¿Qué te trae hoy a consulta?
Paciente: Me cuesta sostenerme… siento que no soy constante.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Hay momentos en los que estoy muy enfocada… saco mucho trabajo… y luego me cuesta mantener ese ritmo.

Terapeuta: ¿Cómo son esos momentos en los que estás más enfocada?
Paciente: Me siento clara… con muchas ideas… avanzo rápido… como si todo encajara.

Terapeuta: ¿Qué notas en tu energía en esos momentos?
Paciente: Alta… pero no lo veo como algo raro… más bien productivo.

Terapeuta: ¿Cómo son tus rutinas en esos periodos?
Paciente: Me involucro en varios proyectos… trabajo más horas… pero no me pesa tanto.

Terapeuta: ¿Cómo está tu descanso en esos momentos?
Paciente: Duermo menos… pero no me afecta tanto en el momento.

Terapeuta: ¿Qué pasa después de esos periodos?
Paciente: Me cuesta volver a arrancar… como si me quedara sin impulso.

Terapeuta: ¿Cómo te sientes en esos momentos?
Paciente: Desganada… sin claridad… todo se siente más pesado.

Terapeuta: ¿Qué pasa con tu trabajo ahí?
Paciente: Me atraso… me cuesta concentrarme… procrastino más.

Terapeuta: ¿Cómo interpretas ese cambio?
Paciente: Que soy desordenada… que no logro mantener disciplina.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?
Paciente: Que debería poder hacerlo mejor… que no estoy aprovechando mi potencial.

Terapeuta: ¿Cómo te sientes emocionalmente ahí?
Paciente: Frustrada… un poco desmotivada… pero no diría que deprimida.

Terapeuta: ¿Notas que estos cambios se repiten en el tiempo?
Paciente: Sí… es como por etapas… pero no sé por qué pasa.

Terapeuta: ¿Cómo afecta esto tus proyectos?
Paciente: Algunos los hago muy bien… otros los dejo a medias o los entrego tarde.

Terapeuta: ¿Te han dado retroalimentación por esto?
Paciente: Sí… que tengo mucho talento, pero que soy inconsistente.

Terapeuta: ¿Cómo son tus decisiones en los momentos en los que estás más activa?
Paciente: Tomo más decisiones… me meto en más cosas… a veces acepto más trabajo del que debería.

Terapeuta: ¿Y luego qué pasa con eso?
Paciente: Después me abruma… y me cuesta sostenerlo.

Terapeuta: ¿Cómo son tus relaciones personales?
Paciente: Variables… hay momentos en los que estoy muy presente… y otros en los que me desconecto.

Terapeuta: ¿Qué te dicen las personas cercanas?
Paciente: Que a veces estoy muy "arriba"… y otras muy apagada… pero yo no lo veo tan así.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Esto te ha pasado desde hace tiempo?
Paciente: Sí… desde hace varios años… pero lo veía como parte de mi forma de ser.

Terapeuta: ¿Cómo eras en la adolescencia?
Paciente: Similar… tenía etapas en las que hacía muchas cosas… y otras en las que me costaba todo.

Terapeuta: ¿Cómo eran tus padres contigo?
Paciente: Mi mamá era más emocional… mi papá más exigente.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que rendir… pero también que era cambiante.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Socialmente… nada fuera de lo normal.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que tengo potencial… pero no logro sostener una versión estable de mí misma.`,
  },
  {
    id: 18,
    titulo: "Caso 19",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Paula Vargas Jiménez, tengo 28 años.

Terapeuta: Mucho gusto, Paula. ¿A qué te dedicas actualmente?
Paciente: Soy nutricionista… trabajo en consulta privada.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con una amiga.

Terapeuta: Bien, Paula. ¿Qué te trae hoy a consulta?
Paciente: Me cuesta relajarme… siento que siempre tengo que estar en control.

Terapeuta: ¿En qué áreas sientes más esa necesidad de control?
Paciente: En varias… pero especialmente en mi rutina… alimentación… ejercicio… horarios.

Terapeuta: ¿Cómo es un día típico para ti?
Paciente: Bastante estructurado… tengo todo planificado… comidas, entrenamientos, trabajo.

Terapeuta: ¿Qué pasa si algo se sale de ese plan?
Paciente: Me incomoda… siento que pierdo el orden.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?
Paciente: Que debería haberlo hecho mejor… que no debí salirme… que pierdo disciplina.

Terapeuta: ¿Cómo te sientes emocionalmente cuando eso ocurre?
Paciente: Ansiosa… molesta conmigo misma.

Terapeuta: ¿Cómo es tu relación con la comida actualmente?
Paciente: Cuido mucho lo que como… trato de hacerlo lo más limpio posible.

Terapeuta: ¿Qué significa para ti "comer limpio"?
Paciente: Comer bien… saludable… evitar cosas que no aporten.

Terapeuta: ¿Te permites comer cosas fuera de ese esquema?
Paciente: Prefiero no hacerlo… no lo necesito.

Terapeuta: ¿Qué pasa si lo haces?
Paciente: Me siento incómoda… como si hubiera hecho algo mal.

Terapeuta: ¿Esa sensación dura mucho tiempo?
Paciente: Sí… puede durar todo el día… incluso más.

Terapeuta: ¿Qué haces cuando sientes eso?
Paciente: Trato de compensar… ordenarme más al día siguiente.

Terapeuta: ¿A qué te refieres con compensar?
Paciente: Volver a mi rutina… ser más estricta.

Terapeuta: ¿Cómo es tu relación con tu cuerpo?
Paciente: Bien… aunque siempre siento que puede mejorar.

Terapeuta: ¿En qué sentido mejorar?
Paciente: Más definida… más en forma… más alineada con lo que debería ser.

Terapeuta: ¿Qué pasa si sientes que no estás en ese estándar?
Paciente: Me frustro… siento que estoy fallando.

Terapeuta: ¿Cómo impacta esto tu vida social?
Paciente: A veces evito salidas… sobre todo si implican comida.

Terapeuta: ¿Por qué?
Paciente: Porque no puedo controlar lo que hay… y prefiero evitarlo.

Terapeuta: ¿Cómo son tus relaciones personales?
Paciente: Bien… aunque algunas personas dicen que soy muy rígida.

Terapeuta: ¿Qué opinas tú de eso?
Paciente: Que soy disciplinada… no rígida.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo era la alimentación en tu casa cuando eras niña?
Paciente: Era importante… mi mamá cuidaba mucho eso… hablaba mucho de comer bien.

Terapeuta: ¿Cómo eran los comentarios hacia ti?
Paciente: Decía que debía cuidarme… que era importante verme bien… que eso abría puertas.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que mantener cierto estándar.

Terapeuta: ¿Cómo fue tu adolescencia en relación con tu cuerpo?
Paciente: Siempre estuve pendiente… tratando de mantenerme.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… creo que siempre he sido así… pero ahora es más intenso.

Terapeuta: ¿Has intentado ser más flexible con esto?
Paciente: Sí… pero me genera mucha incomodidad.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que si pierdo el control en lo que hago… especialmente con mi cuerpo… algo no está bien en mí.`,
  },
  {
    id: 19,
    titulo: "Caso 20",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Diego Herrera León, tengo 35 años.

Terapeuta: Mucho gusto, Diego. ¿A qué te dedicas actualmente?
Paciente: Trabajo en ventas… en una empresa de tecnología.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi pareja.

Terapeuta: Bien, Diego. ¿Qué te trae hoy a consulta?
Paciente: La verdad no estoy muy seguro… mi pareja insiste en que venga.

Terapeuta: ¿Qué te ha dicho ella?
Paciente: Que soy muy cambiante… que tomo decisiones sin pensar… pero yo no lo veo tan así.

Terapeuta: ¿Cómo describirías tú la situación?
Paciente: Siento que a veces me dejo llevar… pero tampoco es algo grave.

Terapeuta: ¿A qué te refieres con "dejarte llevar"?
Paciente: A hacer cosas en el momento… sin pensarlo tanto.

Terapeuta: ¿Puedes darme algún ejemplo?
Paciente: Comprar cosas que no tenía planeadas… salir sin avisar… ese tipo de cosas.

Terapeuta: ¿Eso ha generado algún problema?
Paciente: A veces discusiones… sobre todo por dinero.

Terapeuta: ¿Cómo manejas el dinero normalmente?
Paciente: Bien… bueno… más o menos… a veces gasto más de lo que debería.

Terapeuta: ¿Qué ocurre en esos momentos?
Paciente: Veo algo… me gusta… y lo compro… después pienso si lo necesitaba o no.

Terapeuta: ¿Cómo te sientes después de hacerlo?
Paciente: Al inicio bien… luego un poco incómodo… pero se me pasa.

Terapeuta: ¿Te ha pasado algo similar en otras áreas?
Paciente: Sí… con decisiones… a veces digo cosas o hago cosas sin pensar en las consecuencias.

Terapeuta: ¿Cómo reaccionan los demás ante eso?
Paciente: Algunos se molestan… dicen que soy impulsivo.

Terapeuta: ¿Tú cómo lo interpretas?
Paciente: Que exageran… solo soy espontáneo.

Terapeuta: ¿Has tenido consecuencias más importantes por esto?
Paciente: Bueno… he tenido problemas en el trabajo… por no seguir ciertos procesos.

Terapeuta: ¿Qué tipo de problemas?
Paciente: Cierro ventas rápido… pero a veces sin revisar todo… y luego hay errores.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Frustrado… porque sé que puedo hacerlo mejor.

Terapeuta: ¿Te ha pasado con otras cosas, como discusiones o reacciones emocionales?
Paciente: Sí… a veces respondo rápido… y luego me arrepiento.

Terapeuta: ¿Qué tipo de cosas dices?
Paciente: Comentarios fuertes… sin pensar cómo van a caer.

Terapeuta: ¿Cómo te sientes después de eso?
Paciente: Mal… pero en el momento no lo filtro.

Terapeuta: ¿Has intentado controlar eso?
Paciente: Sí… pero me cuesta… es como automático.

Terapeuta: ¿Cómo son tus rutinas en general?
Paciente: Irregulares… me cuesta sostener hábitos.

Terapeuta: ¿Te ha pasado con proyectos personales?
Paciente: Sí… empiezo cosas con ganas… pero luego las dejo.

Terapeuta: ¿Cómo interpretas eso?
Paciente: Que me aburro rápido… o pierdo interés.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo eras de niño?
Paciente: Inquieto… me costaba quedarme quieto… me metía en problemas por hacer cosas sin pensar.

Terapeuta: ¿Cómo reaccionaban tus padres ante eso?
Paciente: Me regañaban bastante… decían que tenía que pensar antes de actuar.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que controlarme… pero no siempre lo lograba.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Puede ser… creo que siempre he sido así.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Socialmente… a veces más de la cuenta.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que hago las cosas en el momento… y luego tengo que lidiar con las consecuencias.`,
  },
  {
    id: 20,
    titulo: "Caso 21",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Fernanda Castillo Vega, tengo 31 años.

Terapeuta: Mucho gusto, Fernanda. ¿A qué te dedicas actualmente?
Paciente: Trabajo como asistente administrativa.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con mi pareja.

Terapeuta: Bien, Fernanda. ¿Qué te trae hoy a consulta?
Paciente: Siento que me cuesta estar tranquila cuando estoy sola… como que necesito estar con alguien.

Terapeuta: ¿Desde cuándo notas eso?
Paciente: Desde hace tiempo… pero ahora lo siento más.

Terapeuta: ¿Qué ocurre cuando estás sola?
Paciente: Me pongo inquieta… empiezo a pensar muchas cosas… y prefiero evitarlo.

Terapeuta: ¿Qué tipo de pensamientos aparecen?
Paciente: Que algo podría pasar… o que no estoy bien… o que necesito hablar con alguien.

Terapeuta: ¿Qué haces en esos momentos?
Paciente: Busco a alguien… llamo a mi pareja… o a una amiga.

Terapeuta: ¿Cómo es tu relación actual de pareja?
Paciente: Es buena… él me apoya mucho.

Terapeuta: ¿En qué sentido te apoya?
Paciente: Me orienta… me ayuda a tomar decisiones… me dice qué es mejor.

Terapeuta: ¿Cómo te sientes con eso?
Paciente: Tranquila… porque siento que él sabe mejor que yo.

Terapeuta: ¿Te cuesta tomar decisiones por tu cuenta?
Paciente: Sí… incluso cosas pequeñas… prefiero consultarlo.

Terapeuta: ¿Qué pasaría si tuvieras que decidir sin consultarlo?
Paciente: Me sentiría insegura… como si pudiera equivocarme.

Terapeuta: ¿Cómo reaccionas cuando no estás de acuerdo con él?
Paciente: Trato de no generar conflicto… al final cedo.

Terapeuta: ¿Por qué crees que haces eso?
Paciente: No me gusta sentir que puedo perder la relación.

Terapeuta: ¿Ese miedo es frecuente en ti?
Paciente: Sí… bastante.

Terapeuta: ¿Te ha pasado en relaciones anteriores?
Paciente: Sí… siempre trato de mantener la relación… aunque no esté del todo bien.

Terapeuta: ¿Qué te hace quedarte en esas situaciones?
Paciente: Sentir que es mejor eso… que estar sola.

Terapeuta: ¿Cómo te sientes contigo misma cuando estás sola?
Paciente: Insegura… como si no supiera qué hacer.

Terapeuta: ¿Cómo son tus relaciones fuera de la pareja?
Paciente: Cercanas… pero también dependo mucho de ellas para sentirme bien.

Terapeuta: Me gustaría conocer un poco más tu historia. ¿Cómo era tu infancia?
Paciente: Bastante protegida… siempre había alguien pendiente de mí.

Terapeuta: ¿Quién estaba más presente en ese cuidado?
Paciente: Mi mamá principalmente… era muy cercana.

Terapeuta: ¿Cómo era esa cercanía?
Paciente: Ella estaba en todo… en lo que hacía, en lo que decidía… siempre opinaba.

Terapeuta: ¿Qué tipo de cosas decidía por ti?
Paciente: Desde cosas simples… como qué ponerme… hasta decisiones más importantes como actividades o amistades.

Terapeuta: ¿Cómo reaccionabas tú ante eso?
Paciente: No lo cuestionaba… más bien me sentía tranquila de que alguien supiera qué hacer.

Terapeuta: ¿Recuerdas momentos en los que intentaras decidir por tu cuenta?
Paciente: Sí… pero si me equivocaba, lo señalaban bastante… entonces prefería no hacerlo.

Terapeuta: ¿Quién lo señalaba más?
Paciente: Mi mamá… pero también otros familiares… decían que debía aprender, pero al mismo tiempo no me dejaban mucho espacio.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que no era muy buena tomando decisiones… que necesitaba ayuda.

Terapeuta: ¿Y tu papá qué rol tenía?
Paciente: Más distante… pero apoyaba lo que decía mi mamá.

Terapeuta: ¿Tenías espacios para actuar de manera independiente?
Paciente: No muchos… siempre había supervisión o guía.

Terapeuta: ¿Cómo fueron tus relaciones en la escuela?
Paciente: Buscaba amigas cercanas… me apegaba mucho… me costaba cuando se alejaban.

Terapeuta: ¿Qué sentías cuando eso pasaba?
Paciente: Ansiedad… como si me quedara sola… como si algo estuviera mal en mí.

Terapeuta: ¿Cómo manejabas esas situaciones?
Paciente: Trataba de acercarme más… de no perder la relación.

Terapeuta: ¿Notas alguna relación entre eso y lo que te pasa ahora?
Paciente: Sí… es bastante parecido.

Terapeuta: ¿Has intentado ser más independiente actualmente?
Paciente: Sí… pero me genera mucha ansiedad… siento que no lo hago bien.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: No.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que necesito a alguien que me acompañe y me diga que estoy haciendo las cosas bien… porque sola no confío en mí.`,
  },
  {
    id: 21,
    titulo: "Caso 22",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Andrés Mora Salazar, tengo 34 años.

Terapeuta: Mucho gusto, Andrés. ¿A qué te dedicas actualmente?
Paciente: Soy diseñador gráfico… trabajo de forma independiente.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo solo desde hace unos dos años.

Terapeuta: Bien, Andrés. ¿Qué te trae hoy a consulta?
Paciente: Siento que me cuesta organizarme… como que todo se me acumula.

Terapeuta: ¿A qué te refieres con eso?
Paciente: Empiezo cosas… pero no siempre las termino… o las dejo para después.

Terapeuta: ¿Eso ha afectado tu trabajo?
Paciente: Sí… a veces entrego tarde… o hago todo a última hora.

Terapeuta: ¿Qué pasa en esos momentos?
Paciente: Me cuesta empezar… pero cuando empiezo, me enfoco mucho… aunque ya voy tarde.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Frustrado… porque sé que podría hacerlo mejor.

Terapeuta: ¿Te pasa solo con el trabajo?
Paciente: No… también con cosas de la casa… pagos… citas… se me olvidan.

Terapeuta: ¿Sueles olvidar cosas importantes?
Paciente: Sí… bastante… aunque intente anotarlas.

Terapeuta: ¿Cómo es tu concentración en general?
Paciente: Depende… si algo me interesa mucho, me meto de lleno… pero si no, me cuesta demasiado.

Terapeuta: ¿Te distraes con facilidad?
Paciente: Sí… cualquier cosa me saca de lo que estoy haciendo.

Terapeuta: ¿Cómo organizas tus tareas?
Paciente: Intento hacer listas… pero no siempre las sigo.

Terapeuta: ¿Te ha pasado esto desde hace mucho tiempo?
Paciente: Sí… desde que recuerdo.

Terapeuta: Me gustaría conocer un poco tu etapa escolar. ¿Cómo eras en la escuela?
Paciente: Me costaba poner atención… los profesores decían que me distraía mucho.

Terapeuta: ¿Cómo eran tus notas?
Paciente: Irregulares… en materias que me gustaban me iba bien… en otras muy mal.

Terapeuta: ¿Te decían algo sobre tu comportamiento en clase?
Paciente: Sí… que hablaba mucho… que no terminaba las tareas… que me levantaba.

Terapeuta: ¿Terminabas los trabajos escolares?
Paciente: A veces… muchas veces los dejaba incompletos o los hacía rápido al final.

Terapeuta: ¿Recibías apoyo en casa con eso?
Paciente: Sí… mi mamá trataba de ayudarme… pero también se frustraba conmigo.

Terapeuta: ¿Qué tipo de comentarios recuerdas?
Paciente: Que era inteligente pero que no me esforzaba… que era desordenado.

Terapeuta: ¿Cómo te hacían sentir esos comentarios?
Paciente: Como que había algo malo en mí… pero no sabía qué era.

Terapeuta: ¿Te costaba seguir instrucciones?
Paciente: Sí… sobre todo si eran largas… me perdía en el proceso.

Terapeuta: ¿Qué pasaba en el colegio?
Paciente: Más o menos igual… sobrevivía… pero siempre al límite.

Terapeuta: ¿Alguna vez alguien sugirió evaluación psicológica?
Paciente: No… solo decían que tenía que poner más de mi parte.

Terapeuta: ¿Cómo eran tus relaciones sociales en esa etapa?
Paciente: Bien… tenía amigos… pero también era un poco impulsivo.

Terapeuta: ¿A qué te refieres con impulsivo?
Paciente: Decía cosas sin pensar… o interrumpía… pero nada grave.

Terapeuta: ¿Eso te sigue pasando ahora?
Paciente: Sí… un poco… sobre todo cuando estoy emocionado con algo.

Terapeuta: ¿Cómo manejas el tiempo actualmente?
Paciente: Mal… siento que se me va… subestimo cuánto duran las cosas.

Terapeuta: ¿Te cuesta priorizar?
Paciente: Sí… hago lo que me llama la atención en el momento.

Terapeuta: ¿Has intentado cambiar eso?
Paciente: Sí… pero no logro sostenerlo.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Alcohol ocasionalmente… nada más.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que sé lo que tengo que hacer… pero me cuesta organizarme y sostenerlo… como si siempre estuviera un paso atrás.`,
  },
  {
    id: 22,
    titulo: "Caso 23",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Valeria Rojas Jiménez, tengo 29 años.

Terapeuta: Mucho gusto, Valeria. ¿A qué te dedicas actualmente?
Paciente: Soy nutricionista, trabajo en una clínica privada desde hace unos tres años. Atiendo pacientes principalmente con temas de control de peso y hábitos alimenticios. Me gusta lo que hago, pero últimamente he sentido que me cuesta confiar en mis propias decisiones dentro del trabajo.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo sola desde hace un año. Antes vivía con una compañera, pero decidí mudarme porque quería más independencia. Aunque siendo honesta, a veces me cuesta… hay momentos en los que me siento insegura estando sola, como que no sé si estoy haciendo las cosas bien en general.

Terapeuta: Bien, Valeria. ¿Qué te trae hoy a consulta?
Paciente: Siento que últimamente estoy muy insegura, pero no es algo nuevo… es como si siempre hubiera estado ahí, solo que ahora lo noto más. Me pasa mucho en el trabajo, cuando tengo que tomar decisiones con pacientes o cuando siento que alguien podría evaluarme.

Terapeuta: ¿En qué situaciones notas más esa inseguridad?
Paciente: Por ejemplo, cuando tengo que ajustar un plan alimenticio y no estoy completamente segura, aunque tenga la base teórica… empiezo a pensar que tal vez otro profesional lo haría mejor o que yo estoy pasando algo por alto. Entonces termino revisando todo varias veces o incluso consultando con colegas, aunque no sea necesario.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?
Paciente: Pienso cosas como "seguro estoy olvidando algo importante", "esto no está lo suficientemente bien", o "alguien más lo haría mejor que yo". Es como una sensación constante de que lo que hago no es suficiente, aunque objetivamente no haya pasado nada malo.

Terapeuta: ¿Cómo reaccionas ante esos pensamientos?
Paciente: Me vuelvo más cuidadosa de lo normal… reviso una y otra vez, trato de anticiparme a posibles errores. A veces incluso postergo decisiones porque quiero estar completamente segura, pero nunca siento que lo estoy del todo.

Terapeuta: ¿Qué ocurre si no puedes confirmar con alguien?
Paciente: Me quedo con mucha inquietud… sigo pensando en eso después, como repasando si hice algo mal. Me cuesta soltarlo.

Terapeuta: ¿Cómo es la retroalimentación que recibes en tu trabajo?
Paciente: En general es buena… mis pacientes suelen estar satisfechos, y mis supervisores no me han señalado problemas importantes. Pero aun así, cuando me dicen algo positivo, siento que es porque no han visto todo o porque simplemente están siendo amables.

Terapeuta: ¿Te cuesta reconocer lo que haces bien?
Paciente: Sí… siento que lo que hago bien es lo mínimo esperado. No lo veo como algo destacable, sino como algo que debería ser así.

Terapeuta: ¿Cómo te sientes cuando cometes un error?
Paciente: Me afecta bastante… incluso si es algo pequeño, le doy muchas vueltas. Me cuesta dejarlo pasar. Siento que ese error dice algo de mí, como que no soy tan capaz como debería.

Terapeuta: ¿Qué tipo de cosas te dices en esos momentos?
Paciente: Me digo que debí haberlo hecho mejor, que cómo no lo vi antes, que debería ser más cuidadosa. A veces incluso me comparo con otros profesionales.

Terapeuta: ¿Cómo son tus relaciones interpersonales?
Paciente: Trato de llevarme bien con todos… soy bastante cuidadosa con lo que digo para no incomodar. Me cuesta expresar desacuerdo porque siento que puedo generar conflicto o que la otra persona se moleste conmigo.

Terapeuta: ¿Qué haces cuando no estás de acuerdo con alguien?
Paciente: Generalmente me quedo callada o trato de suavizar lo que pienso. Prefiero adaptarme antes que confrontar.

Terapeuta: ¿Cómo te sientes después de eso?
Paciente: A veces frustrada… como que no fui del todo honesta, pero al mismo tiempo siento que era lo mejor para evitar problemas.

Terapeuta: ¿En relaciones de pareja cómo te has sentido?
Paciente: He tendido a esforzarme mucho por que la relación funcione… estar pendiente de la otra persona, cuidar lo que digo, tratar de no fallar.

Terapeuta: ¿Qué pasa contigo en ese proceso?
Paciente: Siento que a veces me dejo de lado… pero no sé hacerlo diferente. Me cuesta poner límites o priorizar lo que yo necesito.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo era tu relación con tus padres?
Paciente: Mi mamá era muy exigente, pero no en el sentido de gritar o algo así… más bien era constante. Siempre había algo que mejorar. Si sacaba una buena nota, me decía que podía haber sido mejor, o me preguntaba por qué no había sido perfecta.

Terapeuta: ¿Cómo vivías eso?
Paciente: Al inicio trataba de hacerlo mejor… pero con el tiempo empecé a sentir que nunca era suficiente. Como que no importaba cuánto me esforzara, siempre había algo más.

Terapeuta: ¿Y tu papá?
Paciente: Era más tranquilo, pero también distante emocionalmente. No era alguien que expresara mucho reconocimiento o afecto.

Terapeuta: ¿Recibías reconocimiento cuando hacías algo bien?
Paciente: No mucho… era más como que "eso es lo que tienes que hacer". No se celebraba tanto.

Terapeuta: ¿Cómo te hacía sentir eso?
Paciente: Que tenía que seguir esforzándome… como si lo que hacía nunca fuera suficiente por sí solo.

Terapeuta: ¿Cómo era tu desempeño en la escuela?
Paciente: Bueno… siempre fui responsable, cumplía con todo, pero con mucha presión interna. Me angustiaba equivocarme o no alcanzar lo esperado.

Terapeuta: ¿Cómo reaccionabas ante los errores en esa etapa?
Paciente: Me afectaban mucho… podía quedarme pensando en eso por días.

Terapeuta: ¿Recibías comparaciones?
Paciente: Sí… con otros compañeros o incluso con familiares. Eso me hacía sentir que tenía que alcanzar un estándar más alto.

Terapeuta: ¿Cómo eran tus relaciones con compañeros?
Paciente: Buenas, pero siempre tratando de encajar, de no hacer nada que pudiera generar rechazo.

Terapeuta: ¿Notas alguna relación entre esa etapa y lo que te pasa ahora?
Paciente: Sí… es muy parecido… como si siguiera funcionando con esa misma lógica de que tengo que hacerlo todo bien para estar tranquila.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que siempre tengo que hacerlo mejor… y aun cuando lo hago bien, no logro sentirme satisfecha conmigo misma.`,
  },
  {
    id: 23,
    titulo: "Caso 24",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Daniel Vargas Quesada, tengo 37 años.

Terapeuta: Mucho gusto, Daniel. ¿A qué te dedicas actualmente?
Paciente: Trabajo como supervisor en una empresa de logística. Llevo ya varios años ahí, aunque últimamente he sentido bastante presión por resultados y manejo de equipo.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi esposa y mi hijo, tiene 6 años.

Terapeuta: Bien, Daniel. ¿Qué te trae hoy a consulta?
Paciente: Últimamente he tenido discusiones en casa… principalmente por temas económicos. Mi esposa dice que no estoy siendo ordenado con el dinero, que a veces tomo decisiones sin pensar mucho en las consecuencias.

Terapeuta: ¿Cómo lo ves tú?
Paciente: Siento que sí, tal vez he sido un poco desordenado… pero tampoco creo que sea algo fuera de lo normal. Es más como momentos en los que me dejo llevar.

Terapeuta: ¿A qué te refieres con "dejarte llevar"?
Paciente: A tomar decisiones rápidas… a veces gasto en cosas que no estaban planificadas, o hago movimientos de dinero sin pensarlo demasiado.

Terapeuta: ¿Eso ocurre con frecuencia?
Paciente: No todo el tiempo… pero sí ha pasado varias veces en los últimos meses.

Terapeuta: ¿Qué tipo de gastos o decisiones sueles tomar en esos momentos?
Paciente: A veces compro cosas innecesarias… o uso dinero que estaba destinado para otra cosa. También me ha pasado que trato de "recuperar" dinero cuando siento que perdí en alguna decisión.

Terapeuta: ¿Qué quieres decir con "recuperar"?
Paciente: Como que si tomo una mala decisión económica, busco una forma rápida de compensarlo… como equilibrar la situación.

Terapeuta: ¿Cómo lo haces generalmente?
Paciente: Buscando oportunidades… a veces en línea… cosas que pueden generar dinero rápido.

Terapeuta: ¿Puedes darme un ejemplo?
Paciente: Apuestas deportivas… o cosas así. No es que lo haga siempre… pero sí cuando siento que puedo ganar.

Terapeuta: ¿Con qué frecuencia participas en eso?
Paciente: Depende… hay semanas en que no lo hago… y otras en que sí varias veces.

Terapeuta: ¿Qué sientes cuando participas en eso?
Paciente: Al inicio emoción… como adrenalina… y la sensación de que puedo lograr algo rápido.

Terapeuta: ¿Y después?
Paciente: Depende… si gano me siento bien, como que tomé una buena decisión… pero si pierdo, me queda esa sensación de que puedo recuperarlo.

Terapeuta: ¿Sueles intentar recuperar lo que pierdes?
Paciente: Sí… no siempre, pero muchas veces sí. Es como que no me gusta quedarme con la pérdida.

Terapeuta: ¿Eso ha generado problemas en tu vida?
Paciente: Sí… sobre todo con mi esposa. Hemos tenido discusiones porque a veces uso dinero que no debería.

Terapeuta: ¿Cómo te hace sentir eso?
Paciente: Mal… porque sé que afecta la dinámica en la casa… pero al mismo tiempo siento que puedo manejarlo.

Terapeuta: ¿Has intentado dejar de hacerlo?
Paciente: Sí… varias veces… y lo logro por un tiempo… pero luego vuelvo.

Terapeuta: ¿Qué suele pasar antes de volver?
Paciente: Estrés… o sentir que necesito resolver algo rápido… o simplemente ver una oportunidad.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Recuerdas cuándo empezaste a involucrarte en este tipo de actividades?
Paciente: Creo que desde adolescente… no era igual que ahora, pero sí había cosas similares.

Terapeuta: ¿Qué tipo de cosas?
Paciente: Jugábamos con amigos… apuestas pequeñas… juegos de cartas, fútbol… cosas así. Era más como diversión.

Terapeuta: ¿Cómo te sentías en esos momentos?
Paciente: Me gustaba… era emocionante… sentía que tenía buena intuición.

Terapeuta: ¿Ganabas con frecuencia?
Paciente: Algunas veces sí… y eso me hacía sentir que era bueno en eso.

Terapeuta: ¿Cómo reaccionabas cuando perdías?
Paciente: Me molestaba… pero también sentía que podía recuperarlo en la siguiente.

Terapeuta: ¿Tus padres sabían de esto?
Paciente: No mucho… o no le daban importancia… lo veían como cosas de jóvenes.

Terapeuta: ¿Cómo era tu entorno familiar en esa etapa?
Paciente: Normal… aunque mi papá también era de tomar riesgos… no necesariamente con apuestas, pero sí con decisiones económicas.

Terapeuta: ¿Eso influía en ti?
Paciente: Puede ser… lo veía como algo normal… tomar decisiones rápidas para ganar más.

Terapeuta: ¿Cómo evolucionó eso en la adultez?
Paciente: Al inicio no era tan frecuente… pero con el tiempo, especialmente cuando tuve más acceso a plataformas en línea, se volvió más fácil.

Terapeuta: ¿Notas alguna diferencia entre antes y ahora?
Paciente: Sí… ahora hay más dinero involucrado… y más consecuencias.

Terapeuta: ¿Cómo impacta esto en tu día a día?
Paciente: A veces estoy pensando en eso… en oportunidades… en recuperar… en no perder.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Alcohol ocasionalmente… nada más.

Terapeuta: ¿Has recibido atención psicológica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que a veces tomo decisiones buscando mejorar la situación rápido… pero termino complicándola más.`,
  },
  {
    id: 24,
    titulo: "Caso 25",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Mariana Solís Hernández, tengo 33 años.

Terapeuta: Mucho gusto, Mariana. ¿A qué te dedicas actualmente?
Paciente: Trabajo como encargada en una tienda de ropa en un centro comercial. Llevo ahí unos cuatro años. Es un trabajo que me gusta en cierta forma, porque tengo contacto con personas, pero también es demandante… hay presión por ventas, por resultados, y últimamente siento que me cuesta más manejarlo emocionalmente.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con mi pareja… llevamos casi cinco años juntos. Al inicio todo era bastante diferente… más tranquilo, más ligero, pero con el tiempo siento que la dinámica ha cambiado, aunque no sé exactamente en qué momento.

Terapeuta: Bien, Mariana. ¿Qué te trae hoy a consulta?
Paciente: He estado sintiéndome muy cansada emocionalmente… como desgastada. Me cuesta concentrarme, me siento más sensible, lloro con facilidad… y en la casa las cosas se han vuelto más tensas. No es que siempre estén mal, pero cuando hay discusiones, se vuelven muy intensas.

Terapeuta: ¿Qué tipo de discusiones han estado teniendo?
Paciente: A veces empiezan por cosas pequeñas… como gastos, tareas de la casa, o incluso comentarios que uno hace sin mala intención. Pero siento que en él hay una reacción muy fuerte… como que se enoja rápido, y la situación escala más de lo que debería.

Terapeuta: ¿Qué pasa cuando la situación escala?
Paciente: Él levanta la voz, se altera mucho… su tono cambia completamente. Yo trato de mantenerme tranquila, de no responder igual, porque siento que si lo hago empeora todo. Pero a veces, aunque trate de calmarlo, es como si ya estuviera enojado y nada lo sacara de ahí.

Terapeuta: ¿Cómo reaccionas tú en esos momentos?
Paciente: Me pongo muy tensa… como en alerta. Empiezo a pensar qué decir y qué no decir… trato de no hacerlo sentir atacado, de no empeorar las cosas. Muchas veces prefiero quedarme callada, aunque sienta que tengo algo que decir.

Terapeuta: ¿Qué ocurre cuando intentas explicarte?
Paciente: A veces lo interpreta como que me estoy justificando o que no estoy entendiendo lo que él dice. Entonces siento que cualquier cosa que diga puede ser malinterpretada, y eso me hace cerrarme más.

Terapeuta: ¿Cómo te sientes después de esas situaciones?
Paciente: Me siento muy confundida… y culpable. Empiezo a darle vueltas a lo que pasó, pensando si dije algo mal, si pude haberlo manejado diferente. A veces me cuesta dormir después de una discusión, porque sigo repasando todo.

Terapeuta: ¿Te ha pasado sentir miedo en esos momentos?
Paciente: Sí… aunque me cuesta decirlo así directamente. No es miedo constante, pero sí hay momentos en los que siento una tensión fuerte en el cuerpo, como si estuviera esperando que algo pase.

Terapeuta: ¿Ha habido momentos en los que la situación haya pasado de lo verbal?
Paciente: …sí… algunas veces. No es algo que pase siempre, pero ha ocurrido.

Terapeuta: ¿Puedes contarme un poco más sobre eso?
Paciente: Han sido momentos en los que la discusión se sale de control… él puede empujarme, o sujetarme fuerte de los brazos. Una vez me jaló del brazo cuando yo estaba tratando de irme a otra habitación. No es algo que pase todos los días, pero cuando pasa… es muy impactante.

Terapeuta: ¿Cómo interpretas esos momentos?
Paciente: Siento que pierde el control… que se deja llevar por el enojo. Pero también veo que después se arrepiente mucho, se calma, me pide perdón… entonces me quedo con esa idea de que no es algo que él quiera hacer.

Terapeuta: ¿Qué ocurre después de esos episodios?
Paciente: Generalmente viene una etapa más tranquila… él se muestra más atento, más cariñoso, como si quisiera compensar lo que pasó. Y en esos momentos yo siento que tal vez sí puede cambiar, que fue solo un momento.

Terapeuta: ¿Cómo te hace sentir ese ciclo?
Paciente: Es confuso… porque hay momentos en los que me siento bien con él, donde todo parece normal, incluso bonito. Y luego pasan estas situaciones y me siento muy mal, pero después vuelve la calma… y no sé cómo integrar todo eso.

Terapeuta: ¿Has hablado de esto con alguien más?
Paciente: No realmente… me cuesta mucho. Siento vergüenza, y también siento que si lo cuento, la gente lo va a ver solo como algo negativo, y no van a entender que también hay cosas buenas.

Terapeuta: ¿Qué es lo que sientes que no entenderían?
Paciente: Que no todo es malo… que él también me apoya en otras cosas, que se preocupa por mí… que no es siempre así. Me cuesta verlo como algo completamente negativo.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo era tu entorno familiar en la infancia?
Paciente: Era un ambiente… tenso en ciertos momentos. Mi papá tenía un carácter fuerte, era muy explosivo. Había días normales, tranquilos, pero también momentos en los que se enojaba y todo cambiaba muy rápido.

Terapeuta: ¿Qué pasaba cuando él se enojaba?
Paciente: Gritaba mucho, golpeaba puertas, cosas… y en algunas ocasiones empujaba a mi mamá. No era algo constante, pero sí lo suficiente como para que uno lo recordara.

Terapeuta: ¿Cómo vivías tú esas situaciones?
Paciente: Me ponía muy nerviosa… sentía esa misma tensión que ahora siento a veces. Pero también, después de que pasaba, todo volvía a la normalidad. Como si nada hubiera ocurrido.

Terapeuta: ¿Se hablaba de lo que ocurría?
Paciente: No… nunca. Era como una regla implícita… no mencionar eso.

Terapeuta: ¿Cómo reaccionaba tu mamá?
Paciente: Ella trataba de calmarlo, de no hacerlo enojar más. Era muy cuidadosa con lo que decía. Y después actuaba como si todo estuviera bien.

Terapeuta: ¿Qué aprendiste tú de esas dinámicas?
Paciente: Creo que aprendí a evitar el conflicto… a cuidar lo que digo… a tratar de mantener la calma para que las cosas no escalen. También a normalizar que después de algo fuerte, todo puede seguir como si nada.

Terapeuta: ¿Recibías afecto o validación emocional en casa?
Paciente: No mucho… era más cumplir, portarse bien, no dar problemas. No recuerdo que se hablara mucho de emociones.

Terapeuta: ¿Cómo eran tus relaciones en la adolescencia?
Paciente: Yo era bastante tranquila… trataba de agradar, de encajar, de no generar conflictos. Me costaba decir que no o expresar desacuerdo.

Terapeuta: ¿Y en relaciones de pareja anteriores?
Paciente: He tenido relaciones donde también me adapto mucho… donde priorizo que la relación funcione, incluso si eso implica ceder o dejar de lado lo que yo siento.

Terapeuta: ¿Notas alguna relación entre eso y lo que estás viviendo ahora?
Paciente: Sí… siento que hay algo parecido. Como si repitiera esa forma de manejar las cosas… de justificar, de esperar que todo mejore si yo hago las cosas bien.

Terapeuta: ¿Qué te dices a ti misma cuando ocurren estos episodios?
Paciente: Me digo que tal vez yo pude haber evitado que escalara, que tal vez dije algo que no debía… o que pude haber manejado mejor la situación.

Terapeuta: ¿Qué sientes que necesitas en este momento?
Paciente: Entender qué está pasando… porque sé que algo no está bien, pero al mismo tiempo no logro verlo completamente claro. Es como si una parte de mí lo justificara y otra parte se sintiera muy incómoda.`,
  },
  {
    id: 25,
    titulo: "Caso 26",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Esteban Quesada Ríos, tengo 36 años.

Terapeuta: Mucho gusto, Esteban. ¿A qué te dedicas actualmente?
Paciente: Trabajo de forma independiente, haciendo trabajos de mantenimiento, reparaciones, cosas así. No tengo un horario fijo, porque prefiero organizarme según cómo me voy sintiendo en el día… hay días en los que estoy más enfocado y otros en los que necesito más espacio para estar conmigo mismo, pensar, orar, como procesar ciertas cosas que voy percibiendo.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo solo desde hace unos tres años. Antes vivía con mi hermana, pero sentía que necesitaba más silencio… más control sobre mi espacio. A veces, cuando hay mucho ruido o muchas personas, me cuesta concentrarme en lo que estoy tratando de entender internamente.

Terapeuta: Bien, Esteban. ¿Qué te trae hoy a consulta?
Paciente: No es que yo haya sentido la necesidad directa de venir… más bien fue por comentarios de algunas personas cercanas. Me dicen que me he aislado mucho, que paso demasiado tiempo solo, que estoy muy metido en mis pensamientos. Yo no lo percibo como algo negativo, pero sí me hizo cuestionarme si hay algo que debería observar con más detalle.

Terapeuta: ¿A qué se refieren con que estás "muy metido en tus pensamientos"?
Paciente: A que paso bastante tiempo reflexionando, tratando de entender lo que ocurre a mi alrededor… pero no solo lo evidente, sino lo que hay detrás. Siento que muchas cosas no son casuales, que hay patrones, señales… que si uno está atento, puede captar ciertos mensajes que no son tan obvios para todos.

Terapeuta: ¿Qué tipo de mensajes sientes que puedes captar?
Paciente: Es difícil explicarlo sin que suene extraño… pero a veces estoy pensando en algo, en una decisión o en una situación, y de pronto aparece algo externo que se relaciona… una frase en la radio, un número, una conversación ajena. No lo veo como coincidencia, sino como algo que tiene un sentido, aunque no siempre lo entienda en el momento.

Terapeuta: ¿Puedes darme un ejemplo más concreto?
Paciente: Sí… por ejemplo, hace unos días estaba pensando si debía aceptar un trabajo, y justo cuando iba caminando escuché a alguien decir "no todo lo que parece bueno lo es". Fue una frase suelta, pero para mí tuvo mucho peso, como si fuera una advertencia. No tomé la decisión de inmediato, pero lo sentí como algo que debía considerar.

Terapeuta: ¿Cómo interpretas esas experiencias en general?
Paciente: Como una forma de guía… no creo que todo sea literal, pero sí simbólico. Siento que hay una conexión entre lo que uno vive internamente y lo que ocurre afuera. Como si el entorno reflejara cosas que uno necesita ver o entender.

Terapeuta: ¿Has compartido estas experiencias con otras personas?
Paciente: Sí, pero con cuidado… porque no todos lo entienden. Algunas personas me han dicho que estoy sobreinterpretando las cosas, que son coincidencias. Pero para mí no se siente así, hay algo más… como una coherencia interna.

Terapeuta: ¿Cómo te hace sentir que otros no lo comprendan?
Paciente: A veces me hace sentir un poco aislado… como si estuviera en una frecuencia distinta. No necesariamente me molesta, pero sí me hace ser más reservado con lo que comparto.

Terapeuta: ¿Cómo son tus relaciones actualmente?
Paciente: Bastante limitadas. Tengo contacto con algunas personas, pero no relaciones profundas. Me cuesta conectar en conversaciones cotidianas, siento que muchas veces los temas son superficiales o no tienen mucho sentido para mí.

Terapeuta: ¿Te gustaría tener relaciones más cercanas?
Paciente: Sí… pero al mismo tiempo siento que sería difícil encontrar personas que entiendan cómo veo las cosas. Entonces termino prefiriendo la soledad, porque ahí me siento más cómodo.

Terapeuta: ¿Cómo te sientes en situaciones sociales?
Paciente: Inquieto… no tanto por miedo, sino porque siento que no encajo del todo. Me cuesta seguir el ritmo de las conversaciones, o entender por qué ciertas cosas son importantes para otros.

Terapeuta: ¿Has tenido experiencias perceptivas inusuales?
Paciente: Sí… en algunas ocasiones he sentido como presencias. No es que vea algo claramente, pero sí una sensación muy definida de que hay algo más ahí.

Terapeuta: ¿Cómo describirías esa sensación?
Paciente: Es como una percepción… una mezcla entre intuición y sensación corporal. No siempre ocurre, pero cuando pasa, es bastante clara.

Terapeuta: ¿Cómo interpretas eso?
Paciente: Como algo espiritual… no lo veo como algo negativo o amenazante. Más bien como una forma de conexión con algo que no es visible para todos.

Terapeuta: Me gustaría conocer un poco tu historia. ¿Cómo fue tu infancia?
Paciente: Bastante solitaria en lo emocional… aunque vivía con mi familia, siempre sentí que estaba más en mi mundo.

Terapeuta: ¿Cómo era tu relación con tus padres?
Paciente: Mi mamá era creyente, pero de una forma más estructurada, más tradicional. Mi papá era distante, poco expresivo, casi no hablaba de emociones.

Terapeuta: ¿Te sentías comprendido por ellos?
Paciente: No realmente… sentía que lo que yo pensaba o percibía no encajaba mucho con lo que ellos veían como normal.

Terapeuta: ¿Cómo era tu experiencia en la escuela?
Paciente: Difícil… tenía pocos amigos. Me costaba integrarme, y cuando hablaba, a veces decía cosas que los demás no entendían o que les parecían raras.

Terapeuta: ¿Qué tipo de cosas?
Paciente: Comentarios sobre conexiones entre eventos, o interpretaciones más profundas de cosas simples. Para mí tenían sentido, pero los demás no lo veían así.

Terapeuta: ¿Cómo reaccionaban los demás?
Paciente: Algunos se burlaban… otros simplemente se alejaban. Con el tiempo aprendí a hablar menos de esas cosas.

Terapeuta: ¿Cómo te hizo sentir eso?
Paciente: Más aislado… como que había algo en mí que no encajaba.

Terapeuta: ¿Notas relación entre esa etapa y tu situación actual?
Paciente: Sí… creo que siempre he sido así, solo que ahora lo acepto más.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que percibo conexiones y significados que otros no ven… y eso me ha llevado a estar más solo, no porque quiera aislarme completamente, sino porque no siempre encuentro dónde encajar.`,
  },
  {
    id: 26,
    titulo: "Caso 27",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Luis Fernando Araya Gómez, tengo 28 años.

Terapeuta: Mucho gusto, Luis. ¿A qué te dedicas actualmente?
Paciente: Trabajo en un call center desde hace unos dos años. Es un trabajo bastante estructurado, con horarios fijos y tareas repetitivas. Antes me sentía cómodo con eso, porque sabía exactamente qué hacer, pero en los últimos meses se me ha hecho más difícil seguir el ritmo. Me cuesta concentrarme en las llamadas, pierdo el hilo de lo que estoy diciendo, y a veces tengo que esforzarme mucho para mantenerme enfocado en algo tan simple como una conversación.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo con mi mamá. Siempre he vivido con ella, pero antes no lo veía como un problema, incluso estaba considerando independizarme. Sin embargo, en estos últimos meses lo he dejado de lado porque no me he sentido del todo estable… siento que no estoy funcionando como antes, y eso me genera inseguridad para asumir más responsabilidades.

Terapeuta: Bien, Luis. ¿Qué te trae hoy a consulta?
Paciente: He estado sintiendo cosas que me cuesta explicar… no es algo constante, pero sí lo suficiente como para preocuparme. Es como si mi forma de percibir lo que pasa a mi alrededor estuviera cambiando. Hay momentos en los que siento que las cosas tienen un significado distinto, como si hubiera algo más detrás de lo que está pasando.

Terapeuta: ¿Desde cuándo comenzaste a notar estos cambios?
Paciente: Diría que hace unos cuatro o cinco meses… al inicio era muy leve, casi no le presté atención. Solo era como una sensación rara, difícil de describir, pero con el tiempo se ha vuelto más frecuente y más evidente.

Terapeuta: ¿A qué te refieres con que las cosas tienen un significado distinto?
Paciente: A que a veces siento que ciertas situaciones están relacionadas conmigo de alguna forma… como si lo que ocurre alrededor tuviera que ver conmigo, aunque no tenga lógica.

Terapeuta: ¿Puedes darme un ejemplo más detallado?
Paciente: Sí… por ejemplo, hace unas semanas estaba en el trabajo y escuché a unos compañeros riéndose. No estaban hablando conmigo, ni siquiera estaban cerca, pero sentí por un momento que se estaban riendo de algo relacionado conmigo. No escuché mi nombre ni nada concreto, pero la sensación fue muy clara… como si yo estuviera involucrado de alguna manera.

Terapeuta: ¿Qué hiciste en ese momento?
Paciente: Me quedé pensando en eso… traté de escuchar mejor, de confirmar si realmente hablaban de mí, pero no encontré nada concreto. Luego traté de decirme que probablemente no tenía sentido, pero la sensación no desapareció de inmediato.

Terapeuta: ¿Te ha pasado en otros contextos?
Paciente: Sí… no solo con personas. A veces con cosas más generales… como escuchar algo en la televisión o ver un mensaje en redes sociales y sentir que tiene un significado dirigido hacia mí, aunque racionalmente sé que no debería ser así.

Terapeuta: ¿Cómo te hace sentir esa experiencia?
Paciente: Confundido… es como si una parte de mí tratara de explicarlo de forma lógica, pero otra parte lo sintiera muy real en el momento. Eso me genera mucha duda… porque no sé en cuál confiar.

Terapeuta: ¿Has notado cambios en tu percepción, como sonidos o sensaciones?
Paciente: Sí… algo que me ha inquietado bastante es que, en algunas ocasiones, cuando estoy solo, siento como si escuchara mi nombre. No es una voz clara como alguien hablándome directamente, es más como una impresión auditiva… como si alguien me llamara a lo lejos.

Terapeuta: ¿Qué haces cuando ocurre eso?
Paciente: Me detengo de inmediato… trato de ubicar de dónde viene el sonido, reviso si hay alguien cerca, pero no hay nada. Después trato de seguir con lo que estaba haciendo, pero me quedo con una sensación rara… como si algo no encajara.

Terapeuta: ¿Con qué frecuencia ocurre?
Paciente: Ha pasado varias veces en el último mes… no todos los días, pero sí lo suficiente como para que ya no lo vea como algo aislado.

Terapeuta: ¿Has notado cambios en tu forma de pensar?
Paciente: Sí… me cuesta organizar ideas. Antes podía seguir una línea de pensamiento sin problema, pero ahora es como si me desviara o perdiera el hilo. A veces empiezo a pensar en algo y termino en otra cosa completamente distinta sin darme cuenta.

Terapeuta: ¿Cómo ha sido tu estado emocional en este tiempo?
Paciente: Más plano… no me siento triste exactamente, pero sí como desconectado. Cosas que antes disfrutaba ya no me generan lo mismo. También me siento más cansado, como si todo me requiriera más esfuerzo.

Terapeuta: ¿Cómo han cambiado tus relaciones?
Paciente: Me he aislado un poco… no porque haya decidido hacerlo, sino porque me cuesta interactuar como antes. A veces estoy en una conversación y me desconecto, o no sé bien qué decir. Eso me hace evitar ciertos espacios.

Terapeuta: Me gustaría conocer más sobre tu historia. ¿Cómo fue tu infancia?
Paciente: Fue bastante estable en general. Crecí con mi mamá, que siempre ha sido muy presente. Mi papá no estuvo mucho… se separaron cuando yo era pequeño.

Terapeuta: ¿Cómo era tu relación con tu mamá?
Paciente: Cercana… ella siempre ha sido muy protectora, muy pendiente de mí. Tal vez incluso un poco sobreprotectora.

Terapeuta: ¿Cómo era tu funcionamiento en la escuela?
Paciente: Normal… no tenía problemas importantes. Era más bien tranquilo, un poco reservado, pero tenía amigos y podía concentrarme bien en las clases.

Terapeuta: ¿Cómo fue tu adolescencia?
Paciente: Igual… bastante estable. Tenía mi grupo de amigos, salía, hacía actividades normales. No recuerdo haber tenido dificultades como las que estoy teniendo ahora.

Terapeuta: ¿Cuándo comenzaste a notar cambios más claros en tu forma de ser o funcionar?
Paciente: Creo que hace unos seis meses empecé a sentirme más desconectado… primero fue la concentración, luego la sensación rara de que algo no estaba bien, y después comenzaron estas experiencias más específicas.

Terapeuta: ¿Ha habido algún evento importante en ese periodo?
Paciente: Más presión en el trabajo… y también he estado pensando mucho en mi futuro, en independizarme… pero no sé si eso explique todo.

Terapeuta: ¿Consumes alcohol u otra sustancia?
Paciente: Alcohol ocasionalmente… pero no en exceso. No consumo otras sustancias.

Terapeuta: ¿Has recibido atención psicológica o psiquiátrica antes?
Paciente: No.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi mente no está funcionando como antes… como si estuviera interpretando cosas de una forma distinta, y eso me genera mucha confusión porque no sé qué es real y qué no.`,
  },
  {
    id: 27,
    titulo: "Caso 28",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Laura Méndez Solano, tengo 32 años.

Terapeuta: Mucho gusto, Laura. ¿A qué te dedicas actualmente?
Paciente: Soy contadora en una empresa mediana, llevo unos cinco años trabajando ahí. Es un puesto que implica bastante responsabilidad porque manejo información financiera, reportes, cierres contables… cosas donde un error puede tener consecuencias importantes. Siempre me ha gustado ser ordenada y detallista, pero últimamente siento que ya no es solo eso… es como si mi mente no pudiera desconectarse nunca de la idea de que algo podría salir mal.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con mi esposo desde hace tres años. Él es bastante tranquilo, incluso a veces demasiado relajado en comparación conmigo. Eso hace que yo note más mis propias reacciones, porque para mí muchas cosas requieren anticiparse y prevenir, y para él no necesariamente.

Terapeuta: Bien, Laura. ¿Qué te trae hoy a consulta?
Paciente: Siento que no puedo dejar de preocuparme… y no es una preocupación puntual, es constante. Es como si mi mente estuviera siempre activa, pensando en posibles problemas, escenarios negativos, cosas que podrían salir mal, incluso cuando no hay una razón concreta en ese momento.

Terapeuta: ¿Desde cuándo notas esto con mayor intensidad?
Paciente: Siempre he sido una persona preocupada, desde niña… pero en los últimos dos años ha aumentado mucho. Antes podía manejarlo mejor, ahora siento que me sobrepasa, que no tengo control sobre esos pensamientos.

Terapeuta: ¿Cómo son esos pensamientos cuando aparecen?
Paciente: Son como cadenas… empiezo con algo pequeño, por ejemplo, "¿y si cometí un error en un informe?", y eso se convierte en "¿y si ese error genera un problema?", "¿y si eso afecta mi trabajo?", "¿y si pierdo credibilidad?", y así sigue… como una escalera que no se detiene.

Terapeuta: ¿Puedes darme un ejemplo reciente con más detalle?
Paciente: Sí… hace unos días entregué un informe financiero que había revisado varias veces. Objetivamente estaba bien, pero después de enviarlo empecé a pensar que tal vez había omitido un dato. Intenté tranquilizarme, pero en lugar de eso empecé a reconstruir mentalmente todo el informe, tratando de recordar cada detalle. Me costó dormir esa noche, me despertaba pensando en lo mismo… al día siguiente revisé todo de nuevo y no había ningún error, pero la sensación de duda fue muy intensa mientras duró.

Terapeuta: ¿Qué pasa cuando intentas detener esos pensamientos?
Paciente: Es como si no respondieran a la lógica. Yo puedo decirme "ya revisaste", "todo está bien", pero la mente sigue generando nuevas posibilidades. Es como si necesitara certeza absoluta, y eso nunca llega.

Terapeuta: ¿Cómo se manifiesta esto en tu cuerpo?
Paciente: Siento mucha tensión… especialmente en el cuello y los hombros, como si estuviera cargando algo todo el tiempo. También me cuesta relajarme, incluso cuando no estoy haciendo nada. En las noches es peor, porque es cuando mi mente tiene más espacio para pensar, y ahí aparecen más preocupaciones. A veces siento el corazón acelerado o una sensación de inquietud interna, como si algo estuviera por pasar, aunque no haya nada concreto.

Terapeuta: ¿Cómo ha afectado esto tu vida diaria?
Paciente: Me cansa mucho… siento que estoy en un estado de alerta constante. Incluso en momentos tranquilos, mi mente busca algo por lo cual preocuparse. Me cuesta disfrutar las cosas porque siempre hay una parte de mí anticipando problemas.

Terapeuta: ¿Cómo son tus relaciones actualmente?
Paciente: En general son buenas, pero creo que mi forma de preocuparme influye. A veces necesito confirmar cosas varias veces, pedir tranquilidad, asegurarme de que todo está bien. Mi esposo es paciente, pero sé que para él puede ser agotador también.

Terapeuta: ¿Qué tipo de cosas le consultas o confirmas?
Paciente: Desde cosas pequeñas, como si cerré bien la puerta o si hice algo correctamente, hasta cosas más grandes, como decisiones que ya tomé pero sigo cuestionando.

Terapeuta: Me gustaría conocer más sobre tu historia. ¿Cómo era tu infancia?
Paciente: Era una niña muy responsable… incluso más de lo esperado para mi edad. Me preocupaba mucho por hacer las cosas bien, por no equivocarme.

Terapeuta: ¿Cómo era el ambiente en casa?
Paciente: Mi mamá era bastante ansiosa… siempre anticipando problemas, revisando todo, asegurándose de que nada saliera mal. Recuerdo que siempre estaba pendiente de posibles riesgos, incluso en cosas pequeñas.

Terapeuta: ¿Cómo influía eso en ti?
Paciente: Creo que aprendí a ver el mundo de esa forma… como un lugar donde siempre hay algo que puede salir mal y que hay que estar preparado.

Terapeuta: ¿Cómo se manejaban los errores en casa?
Paciente: Se les daba importancia… no era castigo fuerte, pero sí había una sensación de que no debía pasar. Había mucho énfasis en hacerlo bien desde el inicio.

Terapeuta: ¿Cómo era tu experiencia en la escuela?
Paciente: Académicamente me iba muy bien, pero con mucha presión interna. Revisaba todo varias veces, me costaba entregar trabajos porque siempre sentía que podían mejorar.

Terapeuta: ¿Cómo reaccionabas ante los errores en esa etapa?
Paciente: Me afectaban bastante… podía quedarme pensando en eso por días, como si fuera algo que decía mucho de mí.

Terapeuta: ¿Notas relación entre esa etapa y lo que vives ahora?
Paciente: Sí… siento que es la misma forma de pensar, pero ahora más intensa y extendida a todas las áreas de mi vida.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que mi mente está siempre anticipando problemas… como si nunca pudiera relajarse del todo, y eso me agota física y mentalmente.`,
  },
  {
    id: 28,
    titulo: "Caso 29",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Gabriel Herrera Solano, tengo 27 años.

Terapeuta: Mucho gusto, Gabriel. ¿A qué te dedicas actualmente?
Paciente: Soy profesor de inglés en un instituto privado. Llevo como tres años trabajando ahí. Me gusta bastante porque siento que es un espacio donde puedo ser más natural, más yo, pero aun así últimamente he estado cargando mucha tensión y siento que ya me está afectando en varias áreas de mi vida.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Vivo solo desde hace un año, pero mi familia está bastante presente en mi vida, sobre todo mi mamá. Mi papá también, aunque con él la relación siempre ha sido distinta… más tensa, más medida.

Terapeuta: Bien, Gabriel. ¿Qué te trae hoy a consulta?
Paciente: Me siento agotado emocionalmente. Siento que llevo mucho tiempo sosteniendo una parte de mí en silencio, como si viviera dividido entre lo que muestro y lo que realmente soy. No es algo nuevo, pero en los últimos meses se ha vuelto más pesado… más difícil de sostener.

Terapeuta: ¿A qué te refieres con vivir dividido?
Paciente: A que hay cosas de mí que en ciertos espacios no oculto tanto, pero con mi familia sí… especialmente con mi papá. Y eso me genera una tensión constante, como si siempre tuviera que estar pensando qué digo, cómo lo digo, qué no mostrar, cómo comportarme para que no sospeche ciertas cosas o para no provocar una reacción que no sé si podría manejar.

Terapeuta: ¿Qué es lo que sientes que no puedes expresar con él?
Paciente: Que soy gay. Lo he sabido desde hace bastante tiempo, no es una duda en mí. Con algunas amistades muy cercanas puedo ser más abierto, pero con mi familia, y especialmente con mi papá, es algo que he mantenido guardado.

Terapeuta: ¿Qué es lo que te genera más miedo de que él lo sepa?
Paciente: El rechazo… pero no solo un rechazo directo, sino todo lo que podría venir con eso. Me preocupa perder la relación, aunque nunca haya sido una relación profundamente cercana. También me preocupa decepcionarlo, confirmar algo que siento que él vería como un fracaso o como algo incorrecto.

Terapeuta: ¿Qué te hace pensar que podría reaccionar así?
Paciente: Por comentarios que ha hecho durante años. Nunca me ha dicho algo directamente sobre mí, porque claramente no lo sabe, pero sí ha hecho comentarios sobre otras personas, sobre cómo "los hombres tienen que ser hombres", sobre lo que él considera correcto o incorrecto. Son comentarios que quizás para otros pasan rápido, pero para mí se han ido quedando acumulados. Cada vez que decía algo así, yo sentía que me estaba diciendo indirectamente que no había espacio para ser yo delante de él.

Terapeuta: ¿Cómo te afecta eso actualmente?
Paciente: Me genera mucha ansiedad anticipatoria. A veces ni siquiera tiene que pasar algo concreto; basta con pensar en una reunión familiar, en una conversación, en que me pregunten por pareja o por planes futuros… y ya empiezo a sentirme tenso. Es como si siempre estuviera calculando el riesgo emocional de lo que digo.

Terapeuta: ¿Cómo se manifiesta esa ansiedad en ti?
Paciente: Tensión en el cuerpo, sobre todo en el pecho y el estómago. A veces me cuesta dormir cuando sé que voy a verlos, porque empiezo a imaginar conversaciones, posibles reacciones, escenarios. También me pasa que después de ciertos encuentros familiares me quedo drenado, como si hubiera pasado horas sosteniendo una actuación.

Terapeuta: ¿Tu madre sabe?
Paciente: Sí. Ella lo sabe desde hace unos dos años. No fue una conversación fácil, pero reaccionó mejor de lo que yo esperaba. No diría que fue totalmente libre de conflicto, porque al inicio le costó procesarlo, pero al menos hubo disposición a escuchar, a tratar de entender, a no perder el vínculo conmigo.

Terapeuta: ¿Y cómo ha sido eso para ti?
Paciente: Un alivio parcial. Me hizo sentir menos solo, pero no resolvió el conflicto principal, porque el miedo más grande siempre ha sido mi papá. Incluso con mi mamá, aunque me acepta más, a veces siento que también vive con miedo de cómo lo tomaría él. Entonces el tema se queda como algo que existe, pero que no se nombra demasiado.

Terapeuta: ¿Cómo describirías tu relación con tu padre?
Paciente: Distante, pero no ausente. Él siempre estuvo en casa, cumplió con lo suyo, trabajó, sostuvo económicamente muchas cosas. Pero emocionalmente nunca fue alguien cercano. Era una figura más de autoridad, de orden, de expectativa. Yo crecí sintiendo que con él había una forma correcta de ser hombre, de comportarse, de hablar… y que cualquier desviación de eso podía generar juicio o desaprobación.

Terapeuta: ¿Cómo era él contigo en la infancia?
Paciente: Exigente, pero no necesariamente agresivo todo el tiempo. Más bien era firme, rígido, poco expresivo. No recuerdo muchas muestras de afecto espontáneo. Más bien sentía que el reconocimiento venía si uno cumplía, si se comportaba, si respondía a lo que él esperaba.

Terapeuta: ¿Qué tipo de cosas esperaba?
Paciente: Que yo fuera fuerte, correcto, que no fuera "delicado", que no me desviara de ciertas ideas de masculinidad. Recuerdo comentarios pequeños, aparentemente sin mucha importancia, pero que en mí pegaban fuerte. Si veía algo en mí que él consideraba muy sensible o muy distinto, lo señalaba. No siempre de forma brutal, pero sí con ese tono de corrección, como diciendo "eso no".

Terapeuta: ¿Cómo te hacía sentir eso de niño?
Paciente: Vigilado. Como si hubiese algo en mí que necesitaba esconder o ajustar. En ese momento yo no entendía todo con claridad, pero sí sentía que había partes de mí que no eran bienvenidas. Entonces me fui volviendo muy observador de cómo hablar, cómo moverme, cómo responder.

Terapeuta: ¿Y tu madre qué papel tenía en esa dinámica?
Paciente: Mi mamá era más cálida, más cercana, pero también más complaciente con él. No era alguien que lo confrontara mucho. Más bien trataba de mantener la paz. Entonces yo crecí con esa mezcla: por un lado ella me daba más contención, pero por otro lado también aprendí que ciertas cosas era mejor no decirlas para no alterar el equilibrio de la casa.

Terapeuta: ¿Cómo fue tu etapa escolar?
Paciente: En la escuela fui un niño aplicado, tranquilo, más bien reservado. Nunca fui particularmente conflictivo. Me iba bien académicamente, y creo que eso también fue una forma de compensar… de sentir que si cumplía en otras áreas, tal vez no iba a ser tan observado en lo demás.

Terapeuta: ¿Cómo fueron tus relaciones con compañeros?
Paciente: Complicadas en ciertos momentos. No siempre sufrí rechazo abierto, pero sí hubo etapas en las que me sentía diferente. Aprendí a leer mucho el ambiente, a detectar qué cosas podían volverse motivo de burla o señalamiento, entonces trataba de adaptarme. Había una parte de mí muy espontánea que se fue volviendo más contenida con los años.

Terapeuta: ¿En qué momento empezaste a reconocer con más claridad tu orientación sexual?
Paciente: En la adolescencia, aunque honestamente creo que desde antes había señales internas. Solo que en la adolescencia ya fue más evidente para mí. Y lejos de sentirse liberador, en ese momento se sintió angustiante, porque fue como confirmar algo que yo intuía que iba a ser difícil de sostener dentro de mi familia.

Terapeuta: ¿Cómo viviste esa adolescencia internamente?
Paciente: Con mucha soledad. Por fuera yo seguía funcionando: estudiaba, cumplía, tenía amistades. Pero por dentro había mucho miedo, mucha vergüenza, mucho esfuerzo por parecer "normal" según lo que se esperaba. Me volví muy bueno ocultando. Aprendí a editar lo que decía, lo que sentía, incluso las personas de las que hablaba.

Terapeuta: ¿Llegaste a compartirlo con alguien en esa etapa?
Paciente: No. En ese momento no sentía que tuviera un lugar seguro para hacerlo. Todo eso se quedó muy guardado. Creo que por muchos años mi estrategia fue simplemente rendir, adaptarme y esperar que esa parte de mí pudiera mantenerse invisible.

Terapeuta: ¿Cómo ha impactado eso en tus relaciones afectivas?
Paciente: Muchísimo. Me ha costado vivirlas con libertad. Incluso cuando he tenido vínculos importantes, siempre está esta sensación de fragmentación, de que una parte de mi vida no puede tocar a la otra. Eso genera culpa, tristeza y también cierta dificultad para comprometerme completamente, porque siempre está el miedo de llegar al punto en que tendría que hablar con mi familia o tomar postura frente a ellos.

Terapeuta: ¿Cómo te ves a ti mismo actualmente en relación con esto?
Paciente: Cansado de esconderme, pero todavía con mucho miedo. Hay una parte de mí que quiere vivir con más coherencia, dejar de fragmentarme, dejar de sentir que tengo que manejar dos versiones de mí. Pero hay otra parte que sigue sintiendo que decir la verdad podría romper algo muy importante, aunque ese vínculo no sea del todo sano o cercano.

Terapeuta: ¿Qué es lo que más te duele de esta situación?
Paciente: Sentir que para poder conservar cierta paz familiar tengo que sacrificar autenticidad. Y también me duele que el miedo más grande no sea hacia un extraño, sino hacia mi propio padre. Como si la persona de la que uno debería poder esperar al menos un lugar seguro, fuera justamente la que más temor genera.

Terapeuta: ¿Has pensado en decirlo próximamente?
Paciente: Sí, muchas veces. Lo pienso, imagino conversaciones, incluso a veces siento que ya no quiero seguir sosteniendo esto. Pero luego me paralizo. No tanto porque dude de quién soy, sino porque temo profundamente las consecuencias emocionales de abrir esa puerta.

Terapeuta: ¿Qué te gustaría lograr con este proceso terapéutico?
Paciente: Me gustaría entender mejor qué me pasa, dejar de vivir con tanta tensión y, sobre todo, sentir que puedo tomar decisiones desde un lugar más libre y menos gobernado por el miedo. No sé todavía qué voy a hacer respecto a mi papá, pero sí sé que no quiero seguir viviendo sintiendo que una parte esencial de mí tiene que esconderse.`,
  },
  {
    id: 29,
    titulo: "Caso 30",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Andrea Vargas Castillo, tengo 34 años.

Terapeuta: Mucho gusto, Andrea. ¿A qué te dedicas actualmente?
Paciente: Soy enfermera en un hospital público. Llevo casi diez años trabajando ahí. Es un trabajo que siempre me ha gustado porque siento que puedo ayudar, pero también es bastante exigente emocionalmente… y últimamente siento que ya no logro desconectarme ni siquiera cuando salgo del turno.

Terapeuta: ¿Vives sola o con alguien más?
Paciente: Vivo con mi hermana menor. Antes vivía con mi mamá, pero falleció hace unos tres años. Desde entonces muchas cosas cambiaron… no solo en la dinámica de la casa, sino también en cómo me percibo a mí misma.

Terapeuta: ¿Qué te trae hoy a consulta?
Paciente: Me siento constantemente culpable… pero no es algo puntual, es como una sensación que está casi todo el tiempo. A veces tiene un motivo claro, otras veces aparece sin que haya pasado nada concreto. Es como si mi mente siempre encontrara una razón para hacerme sentir que hice algo mal o que debería haber hecho algo diferente.

Terapeuta: ¿Puedes darme un ejemplo reciente?
Paciente: Sí… hace unos días estaba en el trabajo y una paciente se complicó. Yo hice lo que correspondía, seguí los protocolos, incluso el médico me dijo que actué bien. Pero aun así, cuando salí del turno, no podía dejar de pensar en si hubiera podido hacer algo más rápido, algo distinto… si tal vez yo fallé en algún momento. Me fui a dormir pensando en eso y al día siguiente seguía dándole vueltas.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?
Paciente: Pensamientos como "debiste haberlo hecho mejor", "si hubieras estado más atenta esto no pasaba", "tal vez no eres tan buena como crees". Es como si automáticamente asumiera que hay algo que hice mal, incluso cuando no hay evidencia clara de eso.

Terapeuta: ¿Cómo te hace sentir eso emocionalmente?
Paciente: Muy pesada… como si cargara algo encima todo el tiempo. También tristeza, pero sobre todo esa sensación de no estar tranquila conmigo misma. Como si nunca fuera suficiente lo que hago.

Terapeuta: ¿Y en tu cuerpo?
Paciente: Siento tensión en el pecho, como una presión constante. A veces suspiro mucho sin darme cuenta. Y me cuesta relajarme, incluso cuando estoy en casa. Es como si mi cuerpo no terminara de soltar.

Terapeuta: Mencionaste que esto no siempre tiene un motivo claro. ¿Cómo es cuando aparece sin razón aparente?
Paciente: Es como un fondo… como si siempre hubiera algo pendiente, algo que debería haber hecho mejor en algún momento. A veces recuerdo cosas del pasado, decisiones, momentos específicos, y empiezo a analizarlos otra vez, como si pudiera encontrar una forma en la que debí actuar diferente.

Terapeuta: ¿Qué tipo de recuerdos suelen aparecer?
Paciente: Muchos tienen que ver con mi mamá… especialmente con su enfermedad antes de fallecer.

Terapeuta: Cuéntame más sobre eso.
Paciente: Mi mamá estuvo enferma varios años. Yo era la que más estaba pendiente de ella, la acompañaba a citas, le ayudaba con medicamentos… pero también trabajaba mucho, entonces no siempre podía estar presente.

Terapeuta: ¿Qué sientes cuando recuerdas esa etapa?
Paciente: Que no hice suficiente… que pude haber estado más, haber sido más paciente, haberle dado más tiempo. Hay momentos específicos que se me vienen a la cabeza, como días en los que estaba cansada y no le presté tanta atención, o cuando me irritaba porque ya estaba agotada.

Terapeuta: ¿Qué te dices a ti misma cuando piensas en eso?
Paciente: Que fallé como hija… que, aunque hice muchas cosas, lo que no hice pesa más. Es como si mi mente ignorara todo lo que sí hice y se quedara solo con lo que faltó.

Terapeuta: ¿Hay algo en particular que te genere más culpa respecto a ella?
Paciente: Sí… el día que falleció yo no estaba con ella. Había estado en el hospital toda la semana, pero ese día específicamente me fui a descansar porque estaba agotada. Y fue justo ese día…

Terapeuta: ¿Cómo has procesado eso desde entonces?
Paciente: No sé si lo he procesado realmente. Lo pienso mucho. A veces intento decirme que era lógico que necesitara descansar, que no podía estar ahí todo el tiempo… pero hay otra parte de mí que dice que debí haber estado, que como hija tenía que estar ahí en ese momento.

Terapeuta: ¿Qué emoción predomina cuando piensas en eso?
Paciente: Culpa… muy fuerte. Es como si ese momento definiera todo lo demás, como si invalidara todo lo que hice antes.

Terapeuta: ¿Cómo era tu relación con tu mamá?
Paciente: Muy cercana. Ella era una persona muy cariñosa, muy entregada. Siempre estaba pendiente de nosotros, incluso cuando estaba enferma. Creo que en parte por eso siento que yo tenía que responder igual, o incluso más.

Terapeuta: ¿Cómo era el manejo de los errores en tu familia cuando eras niña?
Paciente: Había bastante exigencia… no tanto castigo físico, pero sí una expectativa alta de hacer las cosas bien. Mi mamá era más comprensiva, pero mi papá era más crítico. Si algo salía mal, se señalaba. Entonces uno aprendía que equivocarse no era algo neutro, sino algo que tenía consecuencias.

Terapeuta: ¿Cómo reaccionabas tú ante los errores?
Paciente: Me afectaban mucho. Siempre trataba de compensar, de hacerlo mejor la siguiente vez, de no repetirlos. Me costaba soltar cuando algo salía mal.

Terapeuta: ¿Notas alguna relación entre esa forma de funcionar y lo que te pasa ahora?
Paciente: Sí… es como si nunca hubiera dejado de exigirme. Solo que ahora esa exigencia es interna, constante, y mucho más dura.

Terapeuta: ¿Cómo ha afectado esto tus relaciones actuales?
Paciente: Me cuesta relajarme con otros. A veces siento que tengo que estar pendiente de no fallar, de no incomodar, de hacer lo correcto. Incluso en cosas pequeñas, si siento que hice algo mal, me quedo pensando en eso mucho tiempo.

Terapeuta: ¿Te permites reconocer lo que haces bien?
Paciente: Muy poco… es como si no tuviera el mismo peso. Lo bueno pasa rápido, pero lo malo se queda.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Siento que vivo con una especie de deuda emocional constante… como si siempre hubiera algo que corregir, algo que debí haber hecho mejor, y no logro sentir que estoy en paz conmigo misma, aunque racionalmente sé que no todo depende de mí.`,
  },
  {
    id: 30,
    titulo: "Caso 31",
    transcripcion: `Terapeuta: Para comenzar, ¿me puedes decir tu nombre completo y tu edad?
Paciente: Me llamo Esteban Rojas Calderón, tengo 35 años.

Terapeuta: Mucho gusto, Esteban. ¿A qué te dedicas actualmente?
Paciente: Soy desarrollador de software. Trabajo de forma remota para una empresa extranjera. Paso la mayor parte del tiempo en casa, trabajando o en proyectos personales.

Terapeuta: ¿Vives solo o con alguien más?
Paciente: Solo. Desde hace varios años. Nunca me ha generado mayor problema… de hecho, me resulta más cómodo así.

Terapeuta: Bien, Esteban. ¿Qué te trae hoy a consulta?
Paciente: No es algo muy claro… no siento que haya un problema puntual. Más bien fue una sugerencia de mi hermana. Ella dice que soy demasiado aislado, que debería "abrirme más", relacionarme más… pero honestamente no lo veo como algo necesario. Vine más que todo para entender si realmente hay algo que no estoy viendo.

Terapeuta: ¿Tú percibes tu forma de relacionarte como un problema?
Paciente: No particularmente. Funciono bien en mi trabajo, cumplo con mis responsabilidades, tengo estabilidad económica… no siento que mi vida esté desorganizada. Lo que pasa es que parece que para otras personas eso no es suficiente si no hay cierto nivel de interacción social constante.

Terapeuta: ¿Cómo describirías tu vida social actualmente?
Paciente: Bastante limitada, si lo comparamos con lo que se considera "normal". Tengo algunos conocidos, colegas con los que interactúo por trabajo, y una o dos personas con las que hablo ocasionalmente. Pero no tengo un círculo social activo ni lo busco.

Terapeuta: ¿Eso te genera malestar en algún momento?
Paciente: No realmente. Más bien lo contrario… cuando hay demasiada interacción social me siento saturado, como si tuviera que invertir energía en algo que no me resulta natural. Prefiero actividades solitarias, donde no tenga que estar constantemente respondiendo o ajustándome a otras personas.

Terapeuta: ¿Qué tipo de actividades disfrutas?
Paciente: Programar, leer, ver contenido específico sobre temas que me interesan, como tecnología o filosofía. También disfruto estar en silencio, sin necesidad de estímulos constantes.

Terapeuta: ¿Cómo experimentas las emociones en general?
Paciente: Están… pero no son muy intensas. No suelo tener cambios emocionales fuertes. Las cosas que a otros parecen afectarles mucho, a mí me generan una reacción más bien neutra. No es que no entienda lo que pasa, simplemente no lo vivo con la misma intensidad.

Terapeuta: ¿Cómo reaccionas ante situaciones emocionalmente significativas, como pérdidas o conflictos?
Paciente: Las proceso de manera interna, pero sin mucha expresión externa. Por ejemplo, cuando falleció mi abuelo, recuerdo que todos estaban muy afectados, llorando… yo entendía la situación, pero no sentí esa necesidad de expresar emocionalmente lo que estaba pasando. Más bien me retiré un poco, lo pensé, y seguí con mis actividades.

Terapeuta: ¿Cómo interpretaron los demás esa reacción?
Paciente: Algunos pensaron que era frialdad o indiferencia. Pero no era eso… simplemente no me surge esa forma de expresar las cosas.

Terapeuta: ¿Has tenido relaciones de pareja?
Paciente: Sí, pero pocas y no muy duraderas.

Terapeuta: ¿Qué crees que ha influido en eso?
Paciente: Supongo que mi forma de ser. Las otras personas suelen esperar más cercanía, más interacción emocional, más presencia… y para mí eso puede volverse demandante. No es que no entienda lo que esperan, es que no me nace de forma natural responder a eso constantemente.

Terapeuta: ¿Te gustaría tener una relación más cercana con alguien?
Paciente: No es una prioridad. No siento una necesidad fuerte de compañía. A veces pienso que podría ser interesante, pero no algo indispensable para sentirme completo.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo era tu infancia?
Paciente: Bastante estructurada. Mi papá era una persona muy enfocada en el trabajo, poco expresiva emocionalmente. Mi mamá era más presente, pero también respetaba mucho el espacio individual. No recuerdo una dinámica muy afectiva en términos expresivos… más bien funcional.

Terapeuta: ¿Qué quieres decir con funcional?
Paciente: Que se cumplían las responsabilidades, había orden, estabilidad… pero no necesariamente había mucha demostración emocional. No era una familia conflictiva, pero tampoco particularmente cercana en lo afectivo.

Terapeuta: ¿Cómo eras tú de niño?
Paciente: Tranquilo, bastante independiente. No tenía muchos amigos cercanos, pero tampoco me generaba conflicto. Prefería jugar solo o hacer actividades que no implicaran mucha interacción.

Terapeuta: ¿Tus padres cómo interpretaban eso?
Paciente: Como algo normal. Nunca me presionaron demasiado para socializar más. Creo que en ese sentido hubo bastante permisividad para que yo funcionara a mi manera.

Terapeuta: ¿Cómo fue tu etapa escolar?
Paciente: Académicamente buena. No tenía problemas en el rendimiento. Socialmente, era más bien reservado. Tenía compañeros con los que interactuaba, pero no desarrollaba vínculos muy cercanos.

Terapeuta: ¿Alguna vez sentiste deseo de tener relaciones más profundas en esa etapa?
Paciente: No particularmente. Veía cómo otros formaban grupos muy cercanos, pero no sentía la necesidad de integrarme de esa forma. Me resultaba suficiente con interacciones más superficiales o funcionales.

Terapeuta: ¿Cómo describirías tu mundo interno?
Paciente: Más activo de lo que parece desde afuera. Pienso mucho, analizo cosas, tengo intereses bastante definidos. Solo que no siento la necesidad de compartirlo constantemente con otros.

Terapeuta: ¿Sientes que los demás te entienden?
Paciente: No necesariamente, pero tampoco es algo que me preocupe demasiado.

Terapeuta: ¿Y qué piensas de lo que tu hermana menciona sobre ti?
Paciente: Entiendo su punto, porque desde su perspectiva la conexión emocional y social es muy importante. Pero no estoy seguro de que lo que ella considera necesario sea algo que yo necesite en la misma medida.

Terapeuta: Si tuvieras que resumir lo que te pasa, ¿cómo lo dirías?
Paciente: Diría que funciono bien en mi vida, pero desde una forma más aislada de lo que la mayoría espera. No siento un malestar claro por eso, pero sí noto que hay una diferencia entre cómo vivo yo y lo que los demás consideran una vida "completa".`,
  },
];

module.exports = CASOS_INFORME_CLINICO;
