// server/data/casosInformeClinico.js
// Banco de casos clínicos para el ejercicio "Informe clínico".
// El estudiante recibe uno al azar sin repetir hasta agotar todos.
// Cada caso tiene: id (índice 0-based), titulo, transcripcion.

const CASOS_INFORME_CLINICO = [
  {
    id: 0,
    titulo: "Caso 1",
    transcripcion: `Terapeuta: Antes de profundizar en el motivo de consulta, necesito registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?
Paciente: Me llamo Daniel Rojas, tengo 32 años.

Terapeuta: ¿Podrías indicarme un número de teléfono y un correo electrónico de contacto?
Paciente: Sí. Mi número es 7148-3265 y mi correo es daniel.rojas32@example.com.

Terapeuta: ¿Cuál es tu nivel educativo?
Paciente: Tengo un bachillerato universitario en Ingeniería en Sistemas.

Terapeuta: ¿A qué te dedicas actualmente?
Paciente: Soy ingeniero en sistemas, trabajo en una empresa de desarrollo de software.

Terapeuta: ¿Cuál es tu estado civil y con quién vives actualmente?
Paciente: Estoy casado y vivo con mi esposa… tenemos tres años de casados.

Terapeuta: Daniel, ¿qué fue lo que te llevó a buscar ayuda precisamente en este momento?
Paciente: Siento que estoy agotado mentalmente… como si no pudiera desconectarme nunca.

Terapeuta: Cuando hablás de agotamiento mental, ¿cómo lo experimentás en tu vida cotidiana?
Paciente: Paso todo el día pensando en el trabajo… incluso cuando llego a la casa sigo revisando cosas, siento que si no lo hago algo va a salir mal.

Terapeuta: ¿Desde cuándo empezaste a notar que esto se había vuelto difícil de manejar?
Paciente: Más o menos desde hace un año… empezó cuando me dieron un ascenso.

Terapeuta: ¿Qué cambió para vos a partir de ese ascenso?
Paciente: Al inicio bien… pero luego sentí que ya no podía cometer errores.

Terapeuta: Cuando aparece la posibilidad de equivocarte, ¿qué pensamientos suelen surgir?
Paciente: Que si fallo, voy a decepcionar a todos… que no soy tan bueno como creen.

Terapeuta: ¿Qué emociones acompañan esos pensamientos?
Paciente: Ansiedad… y mucha tensión, casi todo el tiempo.

Terapeuta: ¿Has identificado manifestaciones físicas cuando te sentís de esa manera?
Paciente: Sí… me cuesta dormir, me despierto varias veces pensando en pendientes… y siento como presión en el pecho.

Terapeuta: Cuando aparecen esas sensaciones y pensamientos, ¿cómo tratás de manejarlos?
Paciente: Trabajo más… reviso todo varias veces… a veces hasta evito delegar porque siento que nadie lo va a hacer bien.

Terapeuta: ¿Qué efecto tiene esa forma de manejarlo a corto plazo?
Paciente: Siento un poco de alivio… como que tengo más control.

Terapeuta: ¿Y a largo plazo qué consecuencias has notado?
Paciente: Termino más cansado… y siempre aparece algo nuevo que revisar.

Terapeuta: ¿Cómo ha impactado esta situación en tu vida fuera del trabajo?
Paciente: Mi esposa se queja mucho… dice que no estoy presente.

Terapeuta: ¿Cómo describirías la relación con ella actualmente?
Paciente: Tensa… discutimos porque ella dice que el trabajo es más importante para mí.

Terapeuta: ¿Qué ocurre en vos cuando intentás descansar o compartir tiempo con ella?
Paciente: Me cuesta concentrarme… siento que debería estar haciendo algo del trabajo.

Terapeuta: Además de tu esposa, ¿con qué otras personas contás como red de apoyo?
Paciente: Antes veía más a mis amigos, pero ahora casi no salgo con ellos.

Terapeuta: ¿Cómo era tu vida social antes de que esta situación aumentara?
Paciente: Salía más… podía distraerme y disfrutar sin estar pensando tanto en pendientes.

Terapeuta: Para comprender mejor cómo se ha construido esta forma de exigirte, me gustaría conocer un poco de tu historia. Cuando pensás en tu infancia, ¿cómo recordás esa etapa?
Paciente: Era muy responsable… siempre quería hacer todo bien.

Terapeuta: ¿Cómo describirías la relación con tus padres durante esos años?
Paciente: Mi mamá era más tranquila, pero mi papá era muy exigente… si sacaba un 90 me preguntaba por qué no fue 100.

Terapeuta: ¿Cómo vivías vos ese tipo de exigencia?
Paciente: Sentía que nunca era suficiente… que siempre podía haber hecho algo mejor.

Terapeuta: ¿Qué aprendiste sobre vos mismo a partir de esas experiencias?
Paciente: Creo que aprendí que tenía que hacer las cosas muy bien para que estuvieran satisfechos conmigo.

Terapeuta: ¿Cómo se manifestó eso durante tu adolescencia?
Paciente: Se mantuvo igual… era muy aplicado, pero siempre estaba estresado por el rendimiento.

Terapeuta: ¿Qué lugar ocupaban las amistades y otras actividades en esa etapa?
Paciente: No tenía muchas relaciones cercanas… me enfocaba más en estudiar.

Terapeuta: ¿Te permitías descansar o disfrutar sin sentir que estabas descuidando alguna responsabilidad?
Paciente: No mucho… sentía que siempre había algo más que podía hacer.

Terapeuta: Antes de recibir el ascenso, ¿cómo manejabas las responsabilidades en tu vida adulta?
Paciente: Era responsable, pero no así… podía desconectarme más.

Terapeuta: ¿Qué diferencia notás entre aquella forma de ser responsable y lo que ocurre actualmente?
Paciente: Antes podía terminar el trabajo y dejarlo ahí… ahora siento que nunca es suficiente.

Terapeuta: ¿Tenés actualmente alguna condición médica importante o recibís tratamiento farmacológico?
Paciente: No. En general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Has recibido anteriormente atención psicológica o psiquiátrica?
Paciente: No… esta es la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?
Paciente: Que yo sepa no… en mi familia nunca se ha hablado mucho de esos temas.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?
Paciente: Tomo alcohol solo socialmente… no fumo ni consumo otras sustancias.

Terapeuta: ¿Cómo es tu relación con el apetito? 
Paciente: El apetito está más o menos igual… pero me siento cansado y a veces me cuesta concentrarme porque estoy pensando en muchas cosas a la vez.

Terapeuta: Comprendo estasdificultades, cuéntame  ¿cómo han marchado tus responsabilidades laborales? 
Paciente: Sí, las cumplo… pero a costa de trabajar más horas y revisar todo demasiadas veces.

Terapeuta: ¿Qué significado tendría para vos cometer un error en el trabajo?
Paciente: Sentiría que confirmé que no soy tan capaz como los demás creen… y que los decepcioné.

Terapeuta: ¿Qué tan posible considerás que tus estándares personales estén contribuyendo a este malestar?
Paciente: Creo que bastante… sé que me exijo demasiado, pero me cuesta detenerme.

Terapeuta: ¿Qué te gustaría lograr a través de este proceso?
Paciente: Quisiera volver a sentir tranquilidad… poder hacer bien mi trabajo sin sentir que todo depende de que sea perfecto.

Terapeuta: Si tuvieras que resumir en tus propias palabras lo que estás viviendo, ¿cómo lo describirías?
Paciente: Siento que si no hago todo perfecto, algo malo va a pasar… y eso no me deja vivir tranquilo.`,
  },
{
  titulo: "Caso 2",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Laura Jiménez Vargas, tengo 29 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7235-4819 y mi correo es laura.jimenez29@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitaria en Diseño Gráfico.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy diseñadora gráfica… trabajo por mi cuenta, desde la casa.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera… vivo sola, bueno, con mi gato nada más.

Terapeuta: Laura, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Últimamente me siento muy triste… como sin ganas de nada.

Terapeuta: ¿Desde cuándo venís sintiéndote de esa manera?

Paciente: Creo que empezó hace como un año… tal vez un poco más.

Terapeuta: ¿Recordás si ocurrió algo importante en tu vida alrededor de ese momento?

Paciente: Sí… terminé una relación de casi cuatro años.

Terapeuta: Si pensás en esa relación, ¿qué lugar ocupaba en tu vida en ese momento?

Paciente: Muy intensa… yo dependía mucho de él.

Terapeuta: Cuando decís que dependías mucho de él, ¿cómo se veía eso en la vida diaria?

Paciente: Como que… todo giraba alrededor de la relación… si él estaba bien, yo estaba bien.

Terapeuta: ¿Cómo viviste esa ruptura?

Paciente: Él decidió terminar… dijo que yo era muy demandante emocionalmente.

Terapeuta: ¿Qué impacto tuvo esa separación en vos?

Paciente: Muchísimo… sentí que me quedé sin identidad… como si no supiera quién soy sin alguien más.

Terapeuta: ¿Cómo describirías la forma en que todo esto ha afectado tu vida desde entonces?

Paciente: Me cuesta levantarme… hay días en que ni siquiera quiero trabajar.

Terapeuta: ¿Cómo ha influido esta situación en tu trabajo?

Paciente: Cumplo con lo mínimo… pero antes me gustaba mucho lo que hacía.

Terapeuta: Además de la tristeza, ¿qué otros cambios has notado en vos durante este tiempo?

Paciente: Tengo muy poca energía… todo me cuesta.

Terapeuta: ¿Has observado cambios en aspectos como el sueño o el apetito?

Paciente: Sí… a veces duermo demasiado, otras veces me cuesta dormirme… y como por ansiedad, he subido de peso.

Terapeuta: Cuando aparecen esos momentos difíciles, ¿qué suele pasar por tu mente?

Paciente: Que no soy suficiente… que nadie se va a quedar conmigo… que siempre me van a dejar.

Terapeuta: Cuando esos pensamientos aparecen, ¿qué suele pasar con vos emocionalmente?

Paciente: Me siento muy triste… y también como desesperada.

Terapeuta: ¿Cómo solés afrontar esos momentos cuando la tristeza o la desesperación aparecen?

Paciente: Me quedo en la cama… o me distraigo viendo redes por horas.

Terapeuta: ¿De qué manera todo esto ha influido en la relación con las personas que son importantes para vos?

Paciente: Me he alejado de casi todos… no contesto mensajes.

Terapeuta: En este momento, cuando necesitás apoyo, ¿hay alguien con quien sintás que podés contar?

Paciente: Sí… tengo amigos cercanos… pero casi no los veo.

Terapeuta: ¿Y cómo ha sido el contacto con tu familia durante este tiempo?

Paciente: Vivo en la misma ciudad que mi mamá, pero casi no la visito.

Terapeuta: ¿Cómo describirías la relación que has tenido con ella?

Paciente: Distante… siempre ha sido muy ocupada.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Mis papás se separaron cuando yo tenía 6 años… mi mamá trabajaba mucho, yo pasaba mucho tiempo sola.

Terapeuta: ¿Y qué lugar ocupaba tu papá en ese momento de tu vida?

Paciente: Muy ausente… lo veía poco.

Terapeuta: ¿Cómo creés que esas experiencias marcaron la forma en que empezaste a relacionarte con otras personas?

Paciente: Sola… como que tenía que arreglármelas sola.

Terapeuta: Al llegar a la adolescencia, ¿cómo solían ser tus relaciones con otras personas?

Paciente: Buscaba mucho afecto… tuve varias relaciones… me involucraba mucho emocionalmente.

Terapeuta: ¿Cómo describirías esas relaciones?

Paciente: Muy intensas… me costaba poner límites.

Terapeuta: Mirando tus relaciones antes de esta última, ¿sentís que esa forma de vincularte ya venía repitiéndose?

Paciente: Sí… siempre he sentido mucho miedo a que me abandonen.

Terapeuta: Antes de finalizar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Esta es la primera vez que buscás apoyo psicológico o atención psiquiátrica?

Paciente: Sí… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha atravesado dificultades emocionales importantes o ha recibido atención psicológica o psiquiátrica?

Paciente: Que yo sepa no.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante que conozca?

Paciente: Solo tomo alcohol ocasionalmente en reuniones… no consumo otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente en tu vida a partir de este proceso?

Paciente: Me gustaría dejar de sentir que necesito a alguien para estar bien… quisiera aprender a sentirme suficiente por mí misma.

Terapeuta: Si tuvieras que resumir en pocas palabras lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que dependo demasiado de las personas… y cuando no están, me derrumbo.`,
  },
{
  id: 3,
  titulo: "Caso 4",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Daniela Vargas Solano… tengo 26 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7228-4617 y mi correo es daniela.vargas26@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé el bachillerato y después estudié un técnico en ventas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en una tienda de ropa… aunque no sé cuánto más voy a durar ahí.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja… bueno… no sé si seguimos juntos.

Terapeuta: ¿Qué suele pasar para que sintás que te cuesta mantener un trabajo?

Paciente: Me aburro… o termino peleando con alguien.

Terapeuta: Daniela, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que todo en mi vida es un desastre… relaciones, trabajo, todo.

Terapeuta: ¿Sentís que esta forma de vivir las cosas ha estado presente desde hace mucho tiempo o hubo un momento en que empezó a intensificarse?

Paciente: Desde siempre… pero últimamente peor.

Terapeuta: ¿Qué ocurrió recientemente que te hizo sentir que todo se salió de control?

Paciente: Hace unos días discutí con mi pareja… y sentí que me iba a dejar… y… no sé… hice cosas impulsivas.

Terapeuta: Cuando hablás de actuar impulsivamente, ¿qué fue exactamente lo que ocurrió?

Paciente: Le escribí como 30 mensajes seguidos… después lo bloqueé… después fui a buscarlo.

Terapeuta: ¿Qué estaba pasando dentro de vos mientras hacías todo eso?

Paciente: Desesperada… como si me estuviera abandonando… no lo soporto.

Terapeuta: ¿Y qué ocurrió cuando finalmente lo viste?

Paciente: Cuando lo vi… me calmé… pero después me dio cólera… y le dije cosas feas.

Terapeuta: Si tuvieras que describir cómo suelen ser tus emociones, ¿qué dirías?

Paciente: Muy intensas… todo lo siento al máximo… o estoy muy feliz o muy mal.

Terapeuta: ¿Sentís que esos cambios emocionales ocurren con rapidez?

Paciente: Sí… demasiado… en un mismo día puedo pasar de estar bien a sentirme fatal.

Terapeuta: Cuando aparecen esos momentos difíciles, ¿qué suele pasar por tu mente?

Paciente: Que nadie me quiere… que me van a dejar… que no valgo nada.

Terapeuta: ¿Cómo reaccionás habitualmente cuando aparecen esos pensamientos?

Paciente: A veces me corto…

Terapeuta: ¿Desde cuándo empezaste a hacerte daño?

Paciente: Desde los 17… lo dejé un tiempo… pero ha vuelto.

Terapeuta: ¿Qué sentís que cambia en vos después de hacerlo?

Paciente: Alivio… como que baja la intensidad.

Terapeuta: Más allá de esos momentos, ¿cómo describirías tu estado de ánimo en el día a día?

Paciente: Inestable… vacío… como si nada llenara.

Terapeuta: Cuando hablás de sentirte vacía, ¿cómo es esa experiencia para vos?

Paciente: Como si no supiera quién soy… cambio mucho dependiendo con quién estoy.

Terapeuta: ¿Cómo suelen ser tus relaciones con las personas que son importantes para vos?

Paciente: Muy intensas… me entrego demasiado… pero después todo se vuelve un desastre.

Terapeuta: Mirando tus relaciones anteriores, ¿sentís que este patrón se ha repetido con el tiempo?

Paciente: Sí… todas terminan mal… o me dejan… o yo termino explotando.

Terapeuta: ¿Qué suele pasar dentro de vos cuando percibís que alguien se está alejando?

Paciente: Me desespero… hago lo que sea para que no se vayan.

Terapeuta: ¿Y cómo acostumbrás manejar el enojo cuando aparece?

Paciente: Exploto… digo cosas que después me arrepiento.

Terapeuta: ¿Qué consecuencias ha tenido eso en distintas áreas de tu vida?

Paciente: He perdido amistades… trabajos… relaciones.

Terapeuta: En este último tiempo, ¿has notado cambios en el sueño o en el apetito?

Paciente: Sí… cuando estoy mal casi no duermo… y con la comida también cambio… a veces como mucho… otras veces nada.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué es lo primero que recordás de esa etapa?

Paciente: Complicada… mi mamá era muy cambiante… a veces muy cariñosa, a veces muy fría.

Terapeuta: ¿Y qué lugar ocupó tu papá durante esos años?

Paciente: No estuvo… se fue cuando yo tenía 5 años.

Terapeuta: Mirando esa etapa hoy, ¿cómo creés que esas experiencias influyeron en la forma en que te relacionás con las personas?

Paciente: Siempre sentí que me iban a dejar… que no era suficiente.

Terapeuta: ¿Cómo recordás la adolescencia?

Paciente: Muy inestable… problemas con amigos… con mi mamá… conductas impulsivas.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… físicamente estoy sana y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: Sí… fui a terapia un tiempo… pero dejé de ir porque sentía que no me entendían.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha atravesado dificultades emocionales importantes o ha recibido atención psicológica o psiquiátrica?

Paciente: No estoy segura… nunca se ha hablado mucho de eso en mi familia.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: Sí… cuando salgo tomo alcohol y a veces pierdo el control.

Terapeuta: ¿Qué significa para vos perder el control?

Paciente: Tomo demasiado… hago cosas que después no recuerdo bien.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente en tu vida a partir de este proceso?

Paciente: Quiero dejar de sentirme así… de ser tan inestable… de arruinar todo.`,
}, 
{
  id: 4,
  titulo: "Caso 5",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Ricardo Gómez Herrera, tengo 35 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7236-5184 y mi correo es ricardo.gomez35@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé el colegio y luego obtuve la licencia para transporte de carga.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy chofer de reparto… trabajo para una empresa de logística.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casado y vivo con mi esposa y mi hija… ella tiene 6 años.

Terapeuta: Ricardo, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: He estado teniendo problemas para dormir… y también… como que me pongo muy nervioso en ciertas situaciones.

Terapeuta: ¿Desde cuándo venís experimentando estos cambios?

Paciente: Desde hace unos meses… tal vez seis o siete.

Terapeuta: Mirando hacia atrás, ¿recordás si ocurrió algún acontecimiento importante alrededor de ese momento?

Paciente: Sí… tuve un accidente mientras trabajaba.

Terapeuta: Si te sentís cómodo, ¿podrías contarme un poco sobre lo que ocurrió ese día?

Paciente: Fue en carretera… un carro invadió mi carril… traté de esquivarlo pero choqué… no fue tan grave físicamente… pero...

Terapeuta: Tómate tu tiempo.

Paciente: ...pero pensé que me iba a morir.

Terapeuta: ¿Qué es lo que recordás con más claridad de ese momento?

Paciente: El sonido… el golpe… y como que todo se volvió muy rápido… después me quedé en shock.

Terapeuta: ¿Cómo fue el proceso después del accidente?

Paciente: Me llevaron al hospital… no tenía lesiones graves… pero desde ahí no he sido el mismo.

Terapeuta: ¿De qué manera sentís que tu vida cambió a partir de ese momento?

Paciente: Me cuesta manejar… antes era algo normal, ahora me pongo muy tenso.

Terapeuta: ¿Qué suele pasar en vos cuando tenés que conducir?

Paciente: Como si fuera a pasar otra vez… me sudan las manos, el corazón se me acelera.

Terapeuta: ¿Has notado que esa reacción aparezca también en otras situaciones?

Paciente: Sí… con ruidos fuertes… o si veo un accidente en la calle.

Terapeuta: ¿Qué experimentás cuando ocurre eso?

Paciente: Me vienen imágenes… como flashes del accidente.

Terapeuta: ¿Sentís que esos recuerdos aparecen sin buscarlos?

Paciente: Sí… de repente… y me ponen muy mal.

Terapeuta: ¿Cómo ha sido tu descanso desde entonces?

Paciente: Mal… me cuesta dormirme… y a veces tengo pesadillas.

Terapeuta: ¿Esas pesadillas suelen estar relacionadas con el accidente?

Paciente: Sí… sueño que pasa otra vez… o que no logro salir.

Terapeuta: ¿Cómo te sentís cuando despertás después de esas noches?

Paciente: Agitado… como si realmente hubiera pasado.

Terapeuta: Además de esto, ¿qué otros cambios has notado en tu estado de ánimo o en tu forma de reaccionar?

Paciente: Estoy más irritable… cualquier cosa me altera.

Terapeuta: ¿Cómo ha impactado todo esto en tu vida cotidiana?

Paciente: He faltado al trabajo… evito manejar cuando puedo.

Terapeuta: ¿Qué consecuencias ha tenido eso para vos?

Paciente: Sí… problemas en el trabajo… mi jefe ya me ha llamado la atención.

Terapeuta: ¿Y cómo ha repercutido esta situación en tu familia?

Paciente: Mi esposa está preocupada… dice que ya no soy el mismo.

Terapeuta: ¿Qué cambios percibe ella en vos?

Paciente: Dice que estoy distante… que ya no juego con mi hija como antes.

Terapeuta: ¿Cómo vivís vos esos cambios?

Paciente: Me da culpa… pero también me cuesta conectar con ellas.

Terapeuta: Cuando te sentís así, ¿cómo solés manejarlo?

Paciente: Me encierro… o trato de distraerme viendo televisión.

Terapeuta: ¿Has recurrido al alcohol u otra sustancia para intentar sentirte mejor o poder descansar?

Paciente: A veces tomo en la noche… para relajarme y poder dormir.

Terapeuta: ¿Con qué frecuencia ocurre eso?

Paciente: Varias veces por semana… no todos los días, pero sí seguido.

Terapeuta: Me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… fuera del accidente, mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Bastante tranquila… crecí con mis dos padres… no hubo problemas grandes.

Terapeuta: ¿Cómo describirías la relación que tenías con ellos?

Paciente: Buena… mi papá era estricto, pero presente.

Terapeuta: ¿Y cómo recordás la adolescencia?

Paciente: Normal… estudiaba, trabajaba… nada fuera de lo común.

Terapeuta: Antes del accidente, ¿habías vivido alguna experiencia que te hiciera sentir algo parecido?

Paciente: No… nunca algo así.

Terapeuta: Si comparás cómo eras antes del accidente con cómo te sentís hoy, ¿qué diferencia notás en vos?

Paciente: Antes era tranquilo… ahora vivo como si algo malo fuera a pasar otra vez.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Quisiera volver a sentirme tranquilo… dejar de vivir como si siguiera atrapado en ese accidente.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que sigo atrapado en ese momento… como si nunca hubiera terminado.`,
},
{
  id: 5,
  titulo: "Caso 6",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Andrés Castillo Méndez, tengo 31 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7248-6153 y mi correo es andres.castillo31@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Contaduría Pública.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy contador en una empresa… llevo como cuatro años ahí.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo… me independicé hace unos dos años.

Terapeuta: Andrés, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Últimamente siento que no puedo dejar de preocuparme… por todo.

Terapeuta: Cuando decís "por todo", ¿cómo se refleja eso en tu día a día?

Paciente: Por el trabajo, por el dinero, por mi salud… incluso por cosas que todavía no han pasado.

Terapeuta: ¿Desde cuándo notás que esas preocupaciones empezaron a ocupar tanto espacio en tu vida?

Paciente: Siempre he sido preocupado… pero en el último año ha empeorado bastante.

Terapeuta: Mirando hacia atrás, ¿recordás si ocurrió algún cambio importante alrededor de ese momento?

Paciente: Sí… me dieron más responsabilidades en el trabajo.

Terapeuta: ¿Cómo viviste ese cambio?

Paciente: Al inicio bien… pero luego empecé a sentir que no podía equivocarme.

Terapeuta: Cuando las preocupaciones aparecen, ¿qué suele pasar por tu mente?

Paciente: Que algo va a salir mal… que voy a cometer un error y todo se va a complicar.

Terapeuta: ¿Ha ocurrido alguna situación que confirme esos temores o sentís que es más una posibilidad que anticipás?

Paciente: No… o sea, no grave… pero siento que podría pasar.

Terapeuta: ¿Cómo te sentís emocionalmente cuando aparecen esos pensamientos?

Paciente: Ansioso… como con una sensación constante de alerta.

Terapeuta: ¿Has notado que esa preocupación también se manifieste físicamente?

Paciente: Sí… tensión en el cuello, dolor de cabeza… y me cuesta relajarme.

Terapeuta: ¿Cómo ha sido tu descanso durante este último tiempo?

Paciente: Me cuesta dormir… mi mente no se apaga… empiezo a pensar en todo.

Terapeuta: Cuando eso ocurre, ¿qué acostumbrás hacer para intentar tranquilizarte?

Paciente: Reviso pendientes… hago listas… trato de organizar todo.

Terapeuta: ¿Sentís que esas estrategias realmente te ayudan?

Paciente: A veces… pero otras veces me hacen pensar todavía más.

Terapeuta: ¿Cómo ha influido todo esto en tu capacidad para concentrarte durante el día?

Paciente: Me distraigo fácil… porque estoy pensando en varias cosas al mismo tiempo.

Terapeuta: ¿Qué impacto ha tenido esto en tu rutina diaria?

Paciente: Me canso mucho… siento que mi cabeza no descansa nunca.

Terapeuta: ¿Y cómo ha influido en la relación con las personas cercanas?

Paciente: Me dicen que estoy muy tenso… que siempre estoy preocupado.

Terapeuta: ¿Tenés pareja actualmente?

Paciente: No… terminé una relación hace unos meses.

Terapeuta: ¿Sentís que esta forma de preocuparte influyó en esa relación?

Paciente: Sí… ella decía que yo sobrepensaba todo… que no podía disfrutar el momento.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Muy responsable… me preocupaba mucho por hacer las cosas bien.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Mi mamá era muy protectora… siempre anticipaba problemas.

Terapeuta: ¿Y cómo era la relación con tu papá?

Paciente: Más tranquilo… pero trabajaba mucho.

Terapeuta: Mirando esa etapa hoy, ¿cómo creés que influyó esa forma de crecer en la manera en que enfrentás las situaciones actualmente?

Paciente: Creo que aprendí a estar alerta todo el tiempo… como esperando que algo saliera mal.

Terapeuta: ¿Cómo recordás la adolescencia?

Paciente: Parecido… me preocupaba mucho por el colegio… por no fallar.

Terapeuta: ¿Te resultaba fácil relajarte o desconectarte en esa etapa?

Paciente: No… siempre estaba pensando en lo siguiente.

Terapeuta: Antes de este último año, ¿cómo describirías tu forma habitual de manejar las preocupaciones?

Paciente: Era preocupado… pero manejable… ahora siento que se me salió de control.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… casi no consumo alcohol y no uso otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente en tu vida a partir de este proceso?

Paciente: Me gustaría dejar de vivir con tanta preocupación… sentir que puedo disfrutar las cosas sin estar esperando que ocurra algo malo.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi mente no se detiene… siempre está buscando problemas incluso cuando no los hay.`,
},
  {
  id: 6,
  titulo: "Caso 7",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Javier Solís Hernández, tengo 30 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7261-4839 y mi correo es javier.solis30@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Administración de Empresas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en el área administrativa de una empresa… más que todo con reportes y cosas así.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero. Vivo con un compañero de apartamento… pero casi no interactuamos mucho.

Terapeuta: Javier, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me cuesta mucho relacionarme con las personas… siento que siempre hago algo mal.

Terapeuta: ¿Desde cuándo notás que esa dificultad empezó a afectar tu vida?

Paciente: Desde hace bastante… pero en el trabajo se ha hecho más evidente.

Terapeuta: ¿Qué suele ocurrir en el trabajo cuando tenés que interactuar con otras personas?

Paciente: Evito hablar en reuniones… aunque tenga algo que decir, prefiero quedarme callado.

Terapeuta: Cuando estás en esas situaciones, ¿qué suele pasar por tu mente?

Paciente: Que voy a decir algo tonto… que los demás van a pensar que no sé… que me van a juzgar.

Terapeuta: ¿Te ha ocurrido que alguien te lo diga directamente o sentís que es algo que anticipás?

Paciente: No… realmente no… pero siento que podría pasar.

Terapeuta: ¿Cómo te sentís emocionalmente cuando eso sucede?

Paciente: Muy ansioso… incómodo… como si quisiera salir de ahí.

Terapeuta: ¿Has notado que esa ansiedad también se manifieste físicamente?

Paciente: Sí… me sudan las manos, siento el corazón rápido… a veces me tiembla la voz.

Terapeuta: Cuando empezás a sentir esas reacciones, ¿cómo acostumbrás manejar la situación?

Paciente: Trato de evitar participar… o preparo mucho lo que voy a decir, pero igual no lo digo.

Terapeuta: ¿Qué impacto ha tenido esto en tu desempeño laboral?

Paciente: Siento que no avanzo… me quedo en lo mismo porque no me expongo.

Terapeuta: ¿Qué tipo de retroalimentación has recibido por parte de tus compañeros o superiores?

Paciente: Me dicen que debería participar más… que tengo buenas ideas, pero no las expreso.

Terapeuta: ¿Cómo recibís esos comentarios?

Paciente: Frustrado… porque sé que tienen razón, pero no puedo hacerlo.

Terapeuta: ¿Y fuera del trabajo cómo describirías tus relaciones con otras personas?

Paciente: Muy pocas… tengo uno o dos amigos, pero no salgo mucho.

Terapeuta: ¿Te gustaría que esa parte de tu vida fuera diferente?

Paciente: Sí… pero me cuesta mucho dar el paso.

Terapeuta: ¿Has tenido alguna relación de pareja?

Paciente: No… nunca he tenido una relación formal.

Terapeuta: ¿Qué creés que ha dificultado que eso ocurra?

Paciente: Siento que no soy interesante… o que no soy suficiente para alguien.

Terapeuta: ¿Esos pensamientos suelen aparecer con frecuencia cuando interactuás con otras personas?

Paciente: Sí… constantemente.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Era muy tímido… me costaba hablar con otros niños.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Eran protectores… especialmente mi mamá.

Terapeuta: ¿De qué manera sentís que esa protección influyó en vos?

Paciente: Evitaba que me expusiera mucho… siempre trataba de cuidarme.

Terapeuta: ¿Y cómo era la relación con tu papá?

Paciente: Más distante… no era muy expresivo.

Terapeuta: ¿Cómo recordás tu etapa escolar?

Paciente: Difícil… me hacían bromas… no encajaba mucho.

Terapeuta: ¿Qué efecto tuvo eso en la forma en que empezaste a relacionarte con otras personas?

Paciente: Me volví más reservado… prefería no llamar la atención.

Terapeuta: ¿Cómo fue la adolescencia para vos en ese aspecto?

Paciente: Igual… pocos amigos… evitaba situaciones sociales.

Terapeuta: ¿En algún momento intentaste enfrentar ese miedo?

Paciente: Sí… pero cuando lo hacía y algo salía mal, me sentía peor.

Terapeuta: ¿Qué tipo de situaciones recordás?

Paciente: Decía algo y sentía que la gente se quedaba en silencio… como juzgándome.

Terapeuta: Mirando esas situaciones hoy, ¿sentís que realmente ocurrió así o que pudo haber sido tu interpretación?

Paciente: No sé… creo que es más lo que yo siento.

Terapeuta: Si tuvieras que describirte actualmente, ¿cómo dirías que sos?

Paciente: Como alguien inseguro… que no encaja bien con los demás.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… casi no consumo alcohol y no uso otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente en tu vida a partir de este proceso?

Paciente: Me gustaría poder relacionarme con más tranquilidad… sentirme seguro al hablar con otras personas y dejar de pensar que siempre me están juzgando.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que me bloqueo frente a los demás… como si siempre estuviera en desventaja.`,
},
{
  id: 7,
  titulo: "Caso 8",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Sergio Ramírez Quesada, tengo 34 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7284-5196 y mi correo es sergio.ramirez34@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Ingeniería en Sistemas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo como programador en una empresa de tecnología.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo… prefiero así.

Terapeuta: Sergio, ¿qué ocurrió para que decidieras venir a consulta en este momento?

Paciente: Me dijeron en el trabajo que debería mejorar mis habilidades sociales… pero no estoy muy seguro de qué significa eso.

Terapeuta: ¿Quién te hizo ese comentario?

Paciente: Mi jefe, durante una evaluación de desempeño.

Terapeuta: ¿Qué fue lo que te comentó específicamente?

Paciente: Que técnicamente hago bien mi trabajo, pero que tengo dificultades para comunicarme con el equipo.

Terapeuta: ¿Cómo interpretaste vos esa observación?

Paciente: No sé… yo digo lo necesario… no entiendo qué más esperan.

Terapeuta: Cuando participás en reuniones o conversaciones con otras personas, ¿cómo suele ser esa experiencia para vos?

Paciente: Incómodo… no sé cuándo intervenir ni qué decir.

Terapeuta: ¿Qué suele pasar por tu mente en esos momentos?

Paciente: Trato de entender qué esperan los demás… pero no siempre lo logro.

Terapeuta: ¿Sentís que el malestar viene más por miedo a ser evaluado o porque te cuesta comprender lo que ocurre en la interacción?

Paciente: Más bien porque me confunde… no siempre entiendo lo que esperan de mí.

Terapeuta: ¿Te resulta difícil interpretar lo que las personas quieren decir o cómo se sienten?

Paciente: Sí… a veces no entiendo si están bromeando o hablando en serio.

Terapeuta: ¿Te ha ocurrido que alguien se moleste con vos sin que logrés entender qué pasó?

Paciente: Sí… varias veces… dicen que soy muy directo.

Terapeuta: ¿Recordás alguna situación que te venga a la mente?

Paciente: Una compañera me pidió opinión sobre un trabajo y le dije que tenía varios errores… después se molestó.

Terapeuta: ¿Cómo entendiste vos lo que ocurrió en ese momento?

Paciente: Me confundió… porque solo respondí a lo que me pidió.

Terapeuta: ¿Cómo describirías actualmente tus relaciones con otras personas?

Paciente: Limitadas… tengo pocos amigos y casi no los veo.

Terapeuta: ¿Te gustaría que esa parte de tu vida fuera diferente?

Paciente: No estoy seguro… a veces sí, pero también me resulta agotador.

Terapeuta: ¿Has tenido alguna relación de pareja?

Paciente: No… lo he intentado, pero no funciona.

Terapeuta: ¿Qué suele pasar cuando intentás establecer ese tipo de relación?

Paciente: Me dicen que soy distante o que no conecto emocionalmente.

Terapeuta: ¿Qué entendés vos cuando alguien habla de conectar emocionalmente?

Paciente: No estoy seguro… sé que debería pasar algo, pero no sé exactamente qué.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Bastante solitario… prefería jugar solo.

Terapeuta: ¿Cómo era para vos relacionarte con otros niños en la escuela?

Paciente: No tenía muchos amigos… me costaba integrarme.

Terapeuta: ¿Qué era lo que más te resultaba difícil?

Paciente: No entendía bien los juegos… o las reglas cambiaban y eso me molestaba.

Terapeuta: ¿Había temas o actividades que llamaran especialmente tu atención?

Paciente: Sí… me gustaban mucho los trenes… podía pasar horas investigando sobre eso.

Terapeuta: ¿Cómo reaccionabas cuando tenías que interrumpir esas actividades o cambiar lo que habías planeado?

Paciente: Me molestaba bastante… no me gustaban los cambios.

Terapeuta: ¿Cómo recordás la adolescencia?

Paciente: Muy parecida… me enfocaba en mis intereses… no tanto en lo social.

Terapeuta: ¿Actualmente seguís sintiendo que necesitás mantener una rutina bastante estructurada?

Paciente: Sí… todavía me cuesta… prefiero tener todo organizado.

Terapeuta: ¿Cómo suele ser un día normal para vos?

Paciente: Bastante ordenado… hago las mismas cosas en el mismo orden.

Terapeuta: ¿Qué ocurre cuando algo cambia de forma inesperada?

Paciente: Me incomoda… pierdo el enfoque.

Terapeuta: ¿Cómo describirías la forma en que experimentás o expresás tus emociones?

Paciente: Son bastante estables… pero muchas veces no logro entender exactamente lo que siento.

Terapeuta: ¿Te resulta difícil ponerle nombre a lo que estás sintiendo?

Paciente: Sí… a veces sé que algo está pasando, pero no puedo identificar qué es.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría entender mejor a las personas… y que relacionarme con ellas no fuera tan complicado.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que entiendo mejor las cosas que tienen lógica… pero no a las personas.`,
},
{
  id: 8,
  titulo: "Caso 9",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Andrés Vargas Méndez, tengo 36 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7268-5431 y mi correo es andres.vargas36@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé el bachillerato y luego estudié una carrera técnica en ventas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy vendedor… trabajo en una tienda de electrodomésticos.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casado… vivo con mi esposa… no tenemos hijos.

Terapeuta: Andrés, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me están dando como ataques… no sé cómo explicarlo… siento que me voy a morir.

Terapeuta: Contame un poco más sobre esos episodios. ¿Cómo suelen comenzar?

Paciente: Empiezan de la nada… el corazón se me acelera muchísimo… siento que no puedo respirar.

Terapeuta: ¿Recordás cuándo ocurrió el primero?

Paciente: Sí… hace como tres meses… estaba en el trabajo.

Terapeuta: ¿Qué estaba pasando en ese momento?

Paciente: Estaba atendiendo a un cliente… y de repente sentí un mareo… luego el corazón rapidísimo… pensé que me estaba dando un infarto.

Terapeuta: ¿Qué hiciste cuando sentiste eso?

Paciente: Salí corriendo… me llevaron a emergencias.

Terapeuta: ¿Qué encontraron los médicos después de valorarte?

Paciente: Me dijeron que todo estaba bien… que no era nada cardíaco.

Terapeuta: ¿Cómo interpretaste vos ese resultado?

Paciente: Me sentí aliviado… pero también confundido… porque lo que siento es muy real.

Terapeuta: ¿Desde ese primer episodio te ha vuelto a ocurrir?

Paciente: Sí… varias veces… ya no solo en el trabajo.

Terapeuta: ¿En qué otras situaciones te ha pasado?

Paciente: En el carro… en el supermercado… incluso en la casa.

Terapeuta: ¿Has logrado identificar algún patrón o sentís que aparecen sin previo aviso?

Paciente: No… eso es lo que me desespera… aparecen de repente.

Terapeuta: Cuando los síntomas comienzan, ¿qué suele pasar por tu mente?

Paciente: Que esta vez sí es algo grave… que me voy a morir… que nadie me va a ayudar a tiempo.

Terapeuta: Además del miedo, ¿qué notás que ocurre en tu cuerpo durante esos momentos?

Paciente: Me falta el aire… sudo… me tiemblan las manos… siento que pierdo el control.

Terapeuta: Aproximadamente, ¿cuánto duran esos episodios?

Paciente: No sé… tal vez unos minutos… pero se sienten eternos.

Terapeuta: ¿Qué acostumbrás hacer cuando empiezan?

Paciente: Trato de salir del lugar… buscar aire… o llamar a alguien.

Terapeuta: ¿Sentís que eso ha cambiado la forma en que organizás tu vida?

Paciente: Sí… ya casi no salgo solo… evito lugares donde hay mucha gente.

Terapeuta: ¿Cómo ha repercutido esto en tu trabajo?

Paciente: Bastante… me da miedo que me pase frente a un cliente.

Terapeuta: ¿Te ha ocurrido recientemente mientras trabajabas?

Paciente: Sí… tuve que esconderme en el baño hasta que se me pasara.

Terapeuta: ¿Cómo te sentiste después de esa experiencia?

Paciente: Avergonzado… frustrado… como si ya no fuera capaz.

Terapeuta: ¿Cómo ha vivido tu esposa todo lo que está pasando?

Paciente: Ella me apoya… pero también está preocupada… no entiende qué me pasa.

Terapeuta: ¿Vos qué explicación te das de todo esto?

Paciente: Siento que hay algo mal en mi cuerpo… aunque los doctores digan que no.

Terapeuta: Antes de que aparecieran estos episodios, ¿habías vivido algo parecido?

Paciente: No… nunca así.

Terapeuta: Si comparás cómo era tu vida antes con cómo es ahora, ¿qué diferencias notás?

Paciente: Antes trabajaba tranquilo… salía… hacía ejercicio… ahora casi todo gira alrededor del miedo de que vuelva a pasar.

Terapeuta: Mirando hacia atrás, ¿recordás si antes del primer episodio estabas atravesando alguna situación de mucho estrés?

Paciente: Sí… la empresa estaba haciendo recortes… había mucha presión.

Terapeuta: ¿Cómo acostumbrabas manejar ese tipo de presión?

Paciente: Me lo guardaba… trataba de seguir como si nada.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Bastante tranquilo… pero nervioso… me preocupaba mucho por todo.

Terapeuta: ¿Cómo describirías la forma en que tus padres manejaban las preocupaciones o los problemas?

Paciente: Mi mamá era muy ansiosa… siempre estaba pendiente de que algo malo pasara.

Terapeuta: Mirando eso hoy, ¿sentís que influyó en la manera en que enfrentás las situaciones actualmente?

Paciente: Sí… creo que sí… siempre he sido así, pero nunca tan intenso.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… casi no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría volver a sentirme tranquilo… poder salir, trabajar y hacer mi vida sin estar esperando que vuelva a pasar otro episodio.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que en cualquier momento mi cuerpo se va a descontrolar y no voy a poder hacer nada para evitarlo.`,
},
  {
  id: 9,
  titulo: "Caso 10",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Ricardo Jiménez Morales, tengo 42 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7295-6148 y mi correo es ricardo.jimenez42@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Contaduría Pública.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy contador… trabajo en una empresa privada desde hace años.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casado y vivo con mi esposa y mi hija… ella tiene 13 años.

Terapeuta: Ricardo, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Estoy cansado… pero no es solo cansancio normal… es como si no me alcanzara la energía para nada.

Terapeuta: ¿Desde cuándo venís sintiéndote de esa manera?

Paciente: Ya varios meses… tal vez más de medio año.

Terapeuta: Mirando hacia atrás, ¿recordás si ocurrió algún cambio importante cuando empezaste a notar todo esto?

Paciente: No algo específico… solo que el trabajo se volvió más pesado… más responsabilidades.

Terapeuta: ¿Cómo describirías un día normal para vos actualmente?

Paciente: Me levanto sin ganas… voy al trabajo porque tengo que ir… hago lo que me toca, pero todo me cuesta.

Terapeuta: ¿Cómo ha sido tu estado de ánimo durante este tiempo?

Paciente: Irritable… cualquier cosa me molesta… y luego me siento mal por eso.

Terapeuta: ¿Qué tipo de situaciones notás que te afectan más?

Paciente: Cosas pequeñas… ruido, comentarios, errores… antes no era así.

Terapeuta: Además de la irritabilidad, ¿sentís que ha cambiado la forma en que disfrutás las cosas?

Paciente: Sí… no me siento triste como tal… pero tampoco disfruto nada.

Terapeuta: ¿Hay actividades que antes disfrutabas y que ahora ya no te generan el mismo interés?

Paciente: Sí… ver fútbol, salir con amigos… ahora no me interesa.

Terapeuta: ¿Cómo describirías tu nivel de energía durante el día?

Paciente: Muy baja… todo me cuesta… incluso cosas simples.

Terapeuta: ¿Cómo ha sido tu descanso en los últimos meses?

Paciente: Me duermo, pero me despierto cansado… como si no hubiera descansado.

Terapeuta: ¿Has notado algún otro cambio físico que te haya llamado la atención?

Paciente: Sí… dolores en el cuerpo… espalda, cabeza… constantemente.

Terapeuta: ¿Llegaste a consultar por esos síntomas?

Paciente: Sí… me han hecho exámenes y dicen que todo está bien.

Terapeuta: ¿Cómo interpretás vos esos resultados?

Paciente: No sé… porque yo sí me siento mal.

Terapeuta: ¿Qué impacto ha tenido todo esto en tu trabajo?

Paciente: Cumplo… pero ya no como antes… me cuesta concentrarme.

Terapeuta: ¿Has recibido algún comentario sobre esos cambios?

Paciente: Sí… que estoy más lento… menos preciso.

Terapeuta: ¿Cómo te hacen sentir esos comentarios?

Paciente: Frustrado… siento que estoy fallando.

Terapeuta: ¿Y cómo ha repercutido esta situación en tu vida familiar?

Paciente: Tensa… mi esposa dice que estoy distante… mi hija casi no habla conmigo.

Terapeuta: ¿Qué cambios sentís que ellos han notado en vos?

Paciente: Que ya no tengo paciencia… ni ganas de compartir.

Terapeuta: ¿Cómo vivís vos esa distancia con ellos?

Paciente: Es difícil… es como si estuviera presente, pero al mismo tiempo desconectado.

Terapeuta: ¿Qué explicación te das de todo lo que has venido experimentando?

Paciente: Pienso que tal vez es el estrés… pero siento que es más que eso.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Responsable… serio… siempre tratando de hacer las cosas bien.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Eran exigentes… especialmente mi papá… no le gustaban los errores.

Terapeuta: ¿Qué aprendiste de esas experiencias mientras crecías?

Paciente: Que tenía que rendir… que no podía fallar.

Terapeuta: ¿Cómo recordás tu adolescencia?

Paciente: Similar… enfocado en estudiar… en cumplir.

Terapeuta: ¿Sentís que en esa etapa había espacio para descansar o disfrutar?

Paciente: Poco… siempre había algo que hacer.

Terapeuta: Mirando tu historia, ¿encontrás alguna relación entre esa forma de vivir y cómo te sentís actualmente?

Paciente: Sí… siento que siempre estoy en modo obligación… nunca descanso realmente.

Terapeuta: En este último tiempo, ¿cómo ha cambiado la forma en que te ves a vos mismo?

Paciente: Siento que ya no soy el mismo… que estoy fallando en todo.

Terapeuta: En los momentos más difíciles, ¿has sentido deseos de renunciar a todo o de que las cosas simplemente se detengan?

Paciente: A veces… pero sigo adelante por mi familia.

Terapeuta: ¿Qué significa para vos seguir adelante por ellos?

Paciente: Que sigo porque tengo responsabilidades… no porque tenga ganas.

Terapeuta: En algún momento, ¿has llegado a pensar en hacerte daño o en que preferirías no seguir sintiendo todo esto?

Paciente: No he pensado en hacerme daño… pero sí he deseado desaparecer… dejar de sentirme así.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… casi no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría volver a disfrutar las cosas… sentir que tengo energía y que realmente estoy viviendo, no solo cumpliendo con mis responsabilidades.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que estoy viviendo en automático… cumpliendo… pero sin ganas de nada.`,
},
{
  id: 10,
  titulo: "Caso 11",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Daniel Rojas Vargas, tengo 38 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7238-5149 y mi correo es daniel.rojas38@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé el bachillerato y después estudié administración comercial.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en ventas… en una tienda de ropa.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja… llevamos como cuatro años juntos.

Terapeuta: Daniel, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me cuesta hablar de esto… pero está afectando mi relación.

Terapeuta: Tómate tu tiempo. Podemos ir hablando de esto al ritmo que te sintás cómodo.

Paciente: Es algo que tengo desde hace muchos años… y ya no puedo manejarlo igual.

Terapeuta: ¿Qué es lo que ha empezado a preocuparte de esa situación?

Paciente: Tengo una forma muy específica de excitarme… y si no está eso, no logro nada.

Terapeuta: ¿Desde cuándo notás que esa forma de experimentar la intimidad está presente en tu vida?

Paciente: Desde adolescente… pero antes no lo veía como un problema.

Terapeuta: ¿Qué cambió para que ahora decidieras buscar ayuda?

Paciente: Mi pareja… ella no lo entiende… y se ha vuelto un conflicto constante.

Terapeuta: ¿Cómo ha reaccionado ella frente a esta situación?

Paciente: Dice que se siente incómoda… que no le gusta… que se siente usada.

Terapeuta: ¿Cómo vivís vos esas reacciones?

Paciente: Mal… culpable… pero al mismo tiempo no sé cómo cambiarlo.

Terapeuta: ¿Has intentado mantener relaciones íntimas sin que esté presente ese estímulo?

Paciente: Sí… pero no funciona… pierdo el interés o no logro mantenerme.

Terapeuta: ¿Qué significado tiene eso para vos?

Paciente: Me preocupa… siento que algo está mal conmigo.

Terapeuta: Además de la relación de pareja, ¿sentís que esto ha afectado otras áreas de tu vida?

Paciente: Sí… evito ciertas situaciones… incluso terminamos discutiendo mucho por este tema.

Terapeuta: ¿Han podido conversar abiertamente sobre lo que te ocurre?

Paciente: Lo he intentado… pero casi siempre termina en conflicto.

Terapeuta: ¿Cómo describirías actualmente la relación con tu pareja?

Paciente: Tensa… distante… esto se ha vuelto un tema central.

Terapeuta: Antes de esta relación, ¿habías tenido otras parejas?

Paciente: Sí… varias… pero ninguna duró tanto como esta.

Terapeuta: Mirando esas relaciones anteriores, ¿sentís que este patrón ya estaba presente?

Paciente: Sí… siempre estuvo… solo que antes no se hablaba tanto.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu adolescencia, ¿qué recordás de esa etapa?

Paciente: Bastante normal… fue ahí donde descubrí esto… y con el tiempo se volvió algo habitual.

Terapeuta: ¿Cómo fue evolucionando esa experiencia conforme pasaron los años?

Paciente: Se fue repitiendo cada vez más… hasta que terminé sintiendo que la necesitaba.

Terapeuta: En ese momento de tu vida, ¿cómo interpretabas esa situación?

Paciente: No la cuestionaba… simplemente pensaba que era mi forma de vivir la sexualidad.

Terapeuta: ¿Cuándo comenzaste a percibir que podía tratarse de una dificultad?

Paciente: Cuando empezó a afectar mi relación actual.

Terapeuta: ¿Has intentado modificar ese patrón por tu cuenta?

Paciente: Sí… varias veces… pero siempre termino volviendo a lo mismo.

Terapeuta: ¿Cómo te hace sentir darte cuenta de eso?

Paciente: Me frustra… siento que no tengo control en esa parte de mi vida.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… casi no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría poder vivir mi intimidad de una forma más libre… sin sentir que esto controle mi relación.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi forma de vivir la intimidad está afectando mi vida… y no sé cómo cambiarla.`,
},
{
  id: 11,
  titulo: "Caso 12",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Laura Fernández Castillo, tengo 35 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7247-6185 y mi correo es laura.fernandez35@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Derecho.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy abogada… trabajo en un bufete.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casada y vivo con mi esposo.

Terapeuta: Laura, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me siento muy agotada mentalmente… como si mi cabeza no descansara nunca.

Terapeuta: ¿Desde cuándo venís sintiéndote de esa manera?

Paciente: Desde hace años… pero últimamente se ha vuelto más intenso.

Terapeuta: Cuando decís que tu cabeza no descansa, ¿cómo describirías lo que ocurre?

Paciente: Son pensamientos… que no puedo detener… y tengo que revisarlos una y otra vez.

Terapeuta: ¿Qué tipo de pensamientos suelen aparecer?

Paciente: Cosas que podrían salir mal… errores… consecuencias… escenarios que repaso muchas veces.

Terapeuta: Cuando esos pensamientos aparecen, ¿qué sentís que necesitás hacer?

Paciente: Revisarlos… analizarlos una y otra vez hasta sentir que todo tiene sentido.

Terapeuta: ¿Qué ocurre si intentás no hacerlo?

Paciente: Me siento muy ansiosa… como si estuviera siendo irresponsable.

Terapeuta: ¿Qué es lo que temés que pueda pasar?

Paciente: Que algo salga mal… porque no pensé suficiente las cosas.

Terapeuta: ¿Estos pensamientos aparecen únicamente en el trabajo o también en otras áreas de tu vida?

Paciente: En todo… decisiones, conversaciones, cosas que dije… todo lo reviso mentalmente.

Terapeuta: ¿Cómo suele ser ese proceso de revisión?

Paciente: Repaso lo que pasó… lo analizo… trato de asegurarme de que estuvo bien… pero nunca es suficiente.

Terapeuta: Aproximadamente, ¿cuánto tiempo podés pasar haciendo eso?

Paciente: Horas… a veces sin darme cuenta.

Terapeuta: Mientras lo hacés, ¿cómo te sentís?

Paciente: Muy tensa… pero siento que debo hacerlo.

Terapeuta: ¿Y cuando terminás de revisar, sentís alivio?

Paciente: Solo por un momento… después vuelve la duda.

Terapeuta: Mirando hacia atrás, ¿ha ocurrido alguna vez aquello que tanto temías por no revisar lo suficiente?

Paciente: No… realmente no… pero sigo sintiendo que podría pasar.

Terapeuta: ¿Cómo ha impactado todo esto en tu vida cotidiana?

Paciente: Me cansa… me retrasa… me cuesta desconectarme.

Terapeuta: ¿Cómo ha influido en tu trabajo?

Paciente: Mi rendimiento es bueno… pero a costa de mucho desgaste.

Terapeuta: ¿Qué tipo de comentarios has recibido?

Paciente: Me dicen que soy muy detallista… pero también que me tardo demasiado.

Terapeuta: ¿Y cómo ha repercutido esta situación en tu vida personal?

Paciente: Mi esposo dice que nunca estoy realmente presente… que siempre estoy pensando en algo.

Terapeuta: ¿Cómo vivís vos esa situación?

Paciente: Me hace sentir mal… porque sé que tiene razón.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Siempre fui muy responsable… muy cuidadosa… no me gustaba equivocarme.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Eran exigentes… especialmente con los estudios… todo tenía que estar perfecto.

Terapeuta: ¿Qué aprendiste de esa forma de crecer?

Paciente: Sentía que tenía que hacer las cosas bien… o algo malo podía pasar.

Terapeuta: ¿Recordás si ya en esa época aparecía esta necesidad de revisar las cosas?

Paciente: Sí… revisaba las tareas muchas veces… me costaba entregarlas.

Terapeuta: ¿Cómo sentís que ese patrón ha cambiado con el paso de los años?

Paciente: Ahora casi todo ocurre en mi cabeza… ya no se nota tanto por fuera… pero por dentro nunca se detiene.

Terapeuta: ¿Has intentado dejar de hacerlo?

Paciente: Sí… pero cuando lo intento la ansiedad aumenta muchísimo.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría dejar de vivir revisándolo todo… poder confiar más en mis decisiones y descansar mentalmente.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que si no controlo todo en mi mente, algo malo va a pasar… y va a ser mi culpa.`,
},
{
  id: 12,
  titulo: "Caso 13",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Esteban Quesada Mora, tengo 41 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7234-6187 y mi correo es esteban.quesada41@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciado en Administración de Empresas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo como gerente en una empresa de logística.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja… aunque estamos pasando por una situación complicada.

Terapeuta: Esteban, ¿qué ocurrió para que decidieras venir a consulta en este momento?

Paciente: Mi pareja dice que debería venir… que tengo problemas para relacionarme… pero no estoy del todo de acuerdo.

Terapeuta: ¿Qué aspectos de la relación son los que ella suele señalar con más frecuencia?

Paciente: Dice que todo gira alrededor mío… que no la escucho… que minimizo lo que siente.

Terapeuta: ¿Cómo entendés vos esos comentarios?

Paciente: Siento que exagera… yo solo trato de hacer las cosas bien.

Terapeuta: Cuando surgen desacuerdos entre ustedes, ¿cómo suelen desarrollarse?

Paciente: Ella se queja… yo trato de explicarle cómo son realmente las cosas… pero se lo toma personal.

Terapeuta: Cuando decís "cómo son realmente las cosas", ¿a qué te referís?

Paciente: A que muchas veces no tiene razón… o está viendo las cosas desde la emoción y no desde la lógica.

Terapeuta: ¿Qué suele pasar en vos cuando ella expresa emociones intensas?

Paciente: Me incomoda… siento que pierde el control… y alguien tiene que poner orden.

Terapeuta: ¿Ella te ha expresado cómo se siente cuando eso ocurre?

Paciente: Sí… dice que se siente invalidada… pero nunca ha sido mi intención.

Terapeuta: ¿Y vos cómo te sentís cuando recibís ese tipo de reclamos?

Paciente: Molesto… porque siento que no reconoce todo lo que hago por la relación.

Terapeuta: ¿Qué aspectos sentís que no son valorados?

Paciente: Mi esfuerzo… mi forma de pensar… todo lo que aporto.

Terapeuta: En términos generales, ¿sentís que recibís el reconocimiento que merecés?

Paciente: No… definitivamente no lo suficiente.

Terapeuta: ¿Cómo describirías tu desempeño profesional?

Paciente: Muy bueno… tengo gente a cargo… y los resultados hablan por sí solos.

Terapeuta: ¿Cómo suelen ser tus relaciones con las personas que trabajan con vos?

Paciente: En general buenas… aunque algunos no están al nivel que deberían.

Terapeuta: ¿Cómo manejás esas situaciones?

Paciente: Exijo bastante… porque si uno baja el nivel, las cosas salen mal.

Terapeuta: ¿Cómo suelen reaccionar las personas cuando reciben esa exigencia?

Paciente: Algunos lo entienden… otros se lo toman personal.

Terapeuta: ¿Te ha pasado que alguna relación laboral o personal se deteriore por esa forma de actuar?

Paciente: Sí… pero creo que es porque muchas personas no toleran que les digan las cosas como son.

Terapeuta: ¿Cómo describirías tus relaciones fuera del ámbito laboral y de la pareja?

Paciente: Bastante limitadas… no confío fácilmente en la gente.

Terapeuta: ¿Qué hace que una persona gane tu confianza?

Paciente: Que tenga criterio… ambición… que realmente aporte algo.

Terapeuta: ¿Qué significa para vos que alguien "aporte"?

Paciente: Que tenga objetivos… que quiera superarse… que no sea conformista.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿qué recordás de esa etapa?

Paciente: Siempre destaqué… sobre todo en lo académico.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Eran exigentes… pero también reconocían cuando hacía las cosas bien.

Terapeuta: ¿Cómo reaccionaban cuando cometías algún error?

Paciente: Esperaban más de mí… no les gustaba que bajara el nivel.

Terapeuta: ¿Qué aprendiste de esas experiencias mientras crecías?

Paciente: Que uno siempre tiene que mantenerse por encima del promedio.

Terapeuta: ¿Cómo recordás tu adolescencia?

Paciente: Muy enfocada en destacar… en ser mejor que los demás.

Terapeuta: ¿Cómo eran tus relaciones con otros jóvenes en esa etapa?

Paciente: Tenía amigos… pero pocos realmente cercanos.

Terapeuta: ¿Te resultaba sencillo hablar de lo que sentías con otras personas?

Paciente: No especialmente… nunca le vi mucha utilidad a eso.

Terapeuta: ¿Cómo describirías actualmente la manera en que manejás tus emociones?

Paciente: Bastante estable… no soy de perder el control.

Terapeuta: ¿Considerás que expresar las emociones tiene algún valor en las relaciones?

Paciente: Sí, pero creo que muchas personas exageran la importancia que les dan.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca lo consideré necesario.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: Tomo alcohol socialmente… nada fuera de lo normal.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que ocurriera como resultado de este proceso?

Paciente: Me gustaría entender por qué esto está afectando tanto mi relación… si realmente hay algo que deba cambiar.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que los demás tienen expectativas poco realistas de cómo debería ser yo… cuando en realidad estoy haciendo las cosas bien.`,
},
{
  id: 13,
  titulo: "Caso 14",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Andrea Chaves Rodríguez, tengo 37 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7243-5198 y mi correo es andrea.chaves37@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Enfermería.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy enfermera… trabajo en un hospital.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo sola… antes vivía con mi mamá.

Terapeuta: Andrea, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Han pasado ya dos años… pero siento que no logro seguir adelante.

Terapeuta: ¿Qué significa para vos sentir que no has podido seguir adelante?

Paciente: Siento que todo se detuvo… desde que mi mamá falleció.

Terapeuta: Lamento mucho tu pérdida. Si te parece bien, ¿podrías contarme un poco sobre lo que ocurrió?

Paciente: Fue un cáncer… fue rápido… en pocos meses todo cambió.

Terapeuta: ¿Cómo viviste ese proceso mientras la acompañabas?

Paciente: Estuve con ella todo el tiempo… prácticamente dejé todo para cuidarla.

Terapeuta: ¿Cómo fue para vos asumir ese papel de cuidadora?

Paciente: No lo pensé mucho… era lo que tenía que hacer.

Terapeuta: ¿Cómo recordás el momento en que ella falleció?

Paciente: Muy duro… estaba ahí… pero sentí que no hice lo suficiente.

Terapeuta: Cuando recordás ese momento hoy, ¿qué pensamientos aparecen con más frecuencia?

Paciente: Que pude haber hecho más… que tal vez algo habría sido diferente.

Terapeuta: ¿Cómo te hacen sentir esos pensamientos?

Paciente: Mucha culpa… siento que fallé.

Terapeuta: ¿Cómo describirías un día normal para vos actualmente?

Paciente: Trabajo… pero fuera de eso no hago mucho.

Terapeuta: ¿Cómo ha sido para vos continuar trabajando después de todo lo ocurrido?

Paciente: Funciono… pero evito ciertos casos… especialmente pacientes con cáncer.

Terapeuta: ¿Qué suele pasar cuando tenés que atender a un paciente con ese diagnóstico?

Paciente: Me siento abrumada… como si reviviera todo otra vez.

Terapeuta: ¿Cómo reaccionás cuando eso ocurre?

Paciente: Trato de evitar la situación… o busco que alguien más continúe.

Terapeuta: ¿Cómo ha cambiado tu vida fuera del trabajo desde la muerte de tu mamá?

Paciente: Me he alejado de la gente… no tengo muchas ganas de ver a nadie.

Terapeuta: ¿Qué sentís que hace más difícil acercarte a otras personas?

Paciente: Siento que nadie entiende lo que estoy viviendo… y tampoco quiero hablar del tema.

Terapeuta: ¿Hay momentos en los que lográs disfrutar alguna actividad como antes?

Paciente: Muy pocos… casi ninguno.

Terapeuta: ¿Qué cosas disfrutabas antes de esta pérdida?

Paciente: Salir con amigas… viajar… ahora no me interesa.

Terapeuta: ¿Cómo describirías tu nivel de energía en este momento?

Paciente: Bajo… todo me cuesta más.

Terapeuta: ¿Cómo ha sido tu descanso durante este tiempo?

Paciente: Irregular… a veces me cuesta dormir… otras veces duermo mucho.

Terapeuta: ¿Los recuerdos de tu mamá aparecen con frecuencia durante el día?

Paciente: Sí… muchas veces… sobre todo recuerdo sus últimos días.

Terapeuta: ¿Qué emociones aparecen cuando llegan esos recuerdos?

Paciente: Tristeza… pero sobre todo culpa.

Terapeuta: Cuando pensás en la muerte de tu mamá, ¿sentís que has podido integrarla como parte de tu historia o sigue sintiéndose difícil de aceptar?

Paciente: No… es como si una parte de mí siguiera esperando que no fuera real.

Terapeuta: ¿Hay objetos, lugares o pertenencias de ella que hayas preferido mantener exactamente igual?

Paciente: Sí… su cuarto sigue exactamente igual… no he podido cambiar nada.

Terapeuta: ¿Qué representa ese espacio para vos?

Paciente: Es lo único que me queda de ella… siento que si lo cambio, la voy a perder otra vez.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Antes de la enfermedad de tu mamá, ¿cómo describirías la relación que tenían?

Paciente: Éramos muy unidas… ella era la persona más importante en mi vida.

Terapeuta: ¿Contabas con otras personas cercanas además de ella?

Paciente: Sí… tenía amigas y otros familiares… pero con nadie tenía una relación tan cercana.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta es la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría recordar a mi mamá sin sentir tanta culpa… y volver a disfrutar mi vida sin sentir que la estoy dejando atrás.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi vida siguió… pero yo me quedé en ese momento.`,
},
{
  id: 14,
  titulo: "Caso 15",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Valeria Méndez Salazar, tengo 29 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7264-5187 y mi correo es valeria.mendez29@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitaria en Mercadeo.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en marketing… en una agencia.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera. Vivo sola… aunque paso mucho tiempo con mi pareja.

Terapeuta: Valeria, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que mis relaciones siempre terminan igual… y no entiendo por qué.

Terapeuta: ¿Qué suele ocurrir para que sintás que todas siguen el mismo patrón?

Paciente: Empiezo bien… todo fluye… pero después me empiezo a sentir insegura… y todo se complica.

Terapeuta: ¿Cómo describirías esa inseguridad?

Paciente: Empiezo a pensar que la otra persona se va a alejar… o que va a dejar de quererme.

Terapeuta: ¿Esas preocupaciones aparecen incluso cuando no hay señales claras de que algo esté pasando?

Paciente: Sí… muchas veces no ha pasado nada… pero igual siento que algo cambió.

Terapeuta: Cuando aparecen esos pensamientos, ¿qué acostumbrás hacer?

Paciente: Busco contacto… le escribo… le pregunto si todo está bien.

Terapeuta: ¿Cómo suele reaccionar tu pareja cuando eso ocurre?

Paciente: Al principio bien… pero después se cansa… dice que necesito demasiada seguridad.

Terapeuta: ¿Cómo te sentís cuando recibís esa respuesta?

Paciente: Peor… siento que justamente lo estoy perdiendo.

Terapeuta: ¿Qué hacés normalmente en esos momentos?

Paciente: Insisto más… trato de arreglar las cosas… pero al final él termina alejándose más.

Terapeuta: Si mirás tus relaciones anteriores, ¿sentís que ese mismo patrón se ha repetido?

Paciente: Sí… siempre pasa algo parecido.

Terapeuta: ¿Cómo describirías la relación que tenés actualmente?

Paciente: Estamos bien… pero yo vivo con la sensación de que en cualquier momento algo va a cambiar.

Terapeuta: ¿Tu pareja te ha dado motivos concretos para pensar eso?

Paciente: No realmente… pero si tarda en responder o está ocupado, mi cabeza empieza a imaginar cosas.

Terapeuta: ¿Qué suele pasar por tu mente en esos momentos?

Paciente: Que ya no le importo igual… que está perdiendo el interés… que me va a dejar.

Terapeuta: ¿Cómo reaccionás emocionalmente cuando aparecen esos pensamientos?

Paciente: Me pongo muy ansiosa… angustiada… siento que necesito resolverlo de inmediato.

Terapeuta: ¿Qué hacés con esa ansiedad?

Paciente: No puedo quedarme tranquila… tengo que escribirle, llamarlo o asegurarme de que todo esté bien.

Terapeuta: ¿Qué ocurre si intentás esperar antes de buscar ese contacto?

Paciente: Me siento mucho peor… como si estuviera ignorando algo importante.

Terapeuta: ¿Y qué sentís cuando finalmente recibís una respuesta?

Paciente: Mucho alivio… pero dura muy poco.

Terapeuta: ¿Después vuelve la preocupación?

Paciente: Sí… con cualquier cosa vuelve otra vez.

Terapeuta: ¿Cómo describirías tus relaciones con amigos o familiares?

Paciente: Son más estables… pero tampoco me gusta sentirme distante de las personas que quiero.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿cómo recordás la relación con tus padres?

Paciente: Mi mamá era muy cariñosa… pero también muy cambiante… a veces muy cercana y otras muy distante.

Terapeuta: ¿Cómo vivías vos esos cambios?

Paciente: Me confundían… nunca sabía cómo iba a reaccionar.

Terapeuta: ¿Y cómo era la relación con tu papá?

Paciente: Más ausente… trabajaba mucho.

Terapeuta: ¿Cómo te hacía sentir esa ausencia?

Paciente: Que tenía que buscar atención… asegurarme de que me quisieran.

Terapeuta: ¿Recordás haber sentido miedo a que las personas importantes se alejaran de vos desde esa época?

Paciente: Sí… bastante.

Terapeuta: Mirando tu historia, ¿sentís que ese miedo se parece a lo que vivís actualmente en tus relaciones?

Paciente: Sí… siento que es exactamente lo mismo.

Terapeuta: ¿Cómo te describirías cuando estás dentro de una relación de pareja?

Paciente: Muy entregada… pero también muy dependiente… como si necesitara a la otra persona para sentirme tranquila.

Terapeuta: ¿Has intentado cambiar esa forma de relacionarte?

Paciente: Sí… trato de controlarme… pero al final termino haciendo lo mismo.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría poder sentirme segura en una relación sin depender todo el tiempo de que la otra persona me tranquilice.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que necesito a la otra persona para sentirme segura… y eso termina alejándola.`,
},
{
  id: 15,
  titulo: "Caso 16",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Daniela Rojas Pineda, tengo 33 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7256-4189 y mi correo es daniela.rojas33@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitaria en Diseño Gráfico.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy diseñadora gráfica… trabajo como freelance.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo sola.

Terapeuta: Daniela, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: He tenido problemas con mis amistades… siento que algo no está bien, pero no sé exactamente qué.

Terapeuta: Contame un poco más. ¿Qué suele ocurrir en esas relaciones?

Paciente: Siento que la gente cambia conmigo… al principio todo está bien, pero después se alejan o empiezan a actuar diferente.

Terapeuta: ¿Sentís que eso se ha repetido con varias personas?

Paciente: Sí… con varias… por eso siento que no puede ser coincidencia.

Terapeuta: Cuando percibís ese cambio, ¿qué suele pasar por tu mente?

Paciente: Que hice algo mal… o que ya no quieren estar conmigo.

Terapeuta: ¿Acostumbrás preguntar directamente qué está pasando?

Paciente: A veces… pero muchas veces me dicen que no pasa nada.

Terapeuta: ¿Y qué ocurre cuando no encontrás una explicación clara?

Paciente: Empiezo a darle vueltas… reviso lo que dije, lo que hice… trato de encontrar qué hice mal.

Terapeuta: ¿A qué conclusiones llegás normalmente?

Paciente: Que probablemente ya no les agrado… o que están hablando mal de mí.

Terapeuta: ¿Ha ocurrido alguna vez que después descubrás que esas conclusiones no eran ciertas?

Paciente: Sí… varias veces… pero en el momento se sienten completamente reales.

Terapeuta: ¿Cómo te sentís emocionalmente cuando aparecen esas ideas?

Paciente: Muy ansiosa… insegura… siento que tengo que hacer algo antes de que sea demasiado tarde.

Terapeuta: ¿Qué acostumbrás hacer en esos momentos?

Paciente: Les escribo… trato de aclarar las cosas… o a veces me alejo primero para evitar que me lastimen.

Terapeuta: ¿Qué suele pasar después de eso?

Paciente: A veces la relación realmente se enfría… otras veces sigue igual, pero yo ya no logro sentirme tranquila.

Terapeuta: ¿Cómo ha influido esto en la forma en que te relacionás actualmente con otras personas?

Paciente: Me cuesta confiar… siempre estoy pendiente de cualquier cambio.

Terapeuta: ¿Qué representa para vos una amistad cercana?

Paciente: Que la persona esté… que sea constante… que no desaparezca de un momento a otro.

Terapeuta: ¿Qué ocurre cuando percibís algún cambio en esa constancia?

Paciente: Me desestabiliza… inmediatamente pienso que hice algo mal.

Terapeuta: ¿Cómo reaccionás emocionalmente cuando eso pasa?

Paciente: Me angustio… empiezo a sobrepensar absolutamente todo.

Terapeuta: ¿Qué efecto tiene todo esto en tu bienestar diario?

Paciente: Me desgasta muchísimo… siento que nunca logro relajarme del todo.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. Cuando pensás en tu infancia, ¿cómo recordás tus relaciones con otros niños?

Paciente: Eran cambiantes… tenía amigas, pero muchas veces se alejaban… o cambiaban de grupo.

Terapeuta: ¿Cómo vivías vos esas situaciones?

Paciente: Me dolían mucho… nunca entendía por qué pasaban.

Terapeuta: ¿Cómo describirías la forma en que tu mamá se relacionaba con vos?

Paciente: Era muy cercana… pero también muy crítica… siempre encontraba algo que podía hacer mejor.

Terapeuta: ¿Cómo te hacían sentir esos comentarios?

Paciente: Que tenía que hacerlo todo bien… porque si no, las personas podían dejar de quererme.

Terapeuta: Mirando tu historia, ¿sentís que existe alguna relación entre esas experiencias y lo que vivís actualmente?

Paciente: Sí… siento que siempre tengo miedo de que las personas se alejen si cometo algún error.

Terapeuta: ¿Cómo te describirías dentro de una relación cercana?

Paciente: Muy atenta… muy pendiente de la otra persona… pero también muy insegura.

Terapeuta: ¿Has intentado cambiar esta forma de reaccionar?

Paciente: Sí… trato de no pensar tanto… pero no lo logro.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Me gustaría preguntarte también por el consumo de alcohol u otras sustancias. ¿Hay algo en ese sentido que considerés importante mencionar?

Paciente: No… no consumo alcohol ni otras sustancias.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría poder confiar más en las personas… dejar de interpretar que todo significa que me van a rechazar.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que siempre estoy tratando de entender si los demás siguen queriendo estar conmigo… y eso me desgasta.`,
},
{
  id: 16,
  titulo: "Caso 17",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Sofía Araya Calderón, tengo 34 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7258-6142 y mi correo es sofia.araya34@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Arquitectura.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy arquitecta… trabajo en una firma.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo sola.

Terapeuta: Sofía, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: No estoy durmiendo bien… y ya está afectando todo.

Terapeuta: ¿Desde cuándo venís teniendo estas dificultades para dormir?

Paciente: Desde hace varios meses… tal vez unos ocho o nueve.

Terapeuta: Cuando llega la hora de acostarte, ¿qué suele ocurrir?

Paciente: Me acuesto… pero mi mente no se apaga… empiezo a pensar en todo.

Terapeuta: ¿Qué tipo de pensamientos aparecen con más frecuencia?

Paciente: Pendientes del trabajo… cosas que hice durante el día… lo que tengo que hacer mañana… todo al mismo tiempo.

Terapeuta: Aproximadamente, ¿cuánto tiempo tardás en quedarte dormida?

Paciente: A veces más de una hora… incluso dos.

Terapeuta: ¿Tu sueño se mantiene durante la noche o también se interrumpe?

Paciente: Me despierto varias veces… y cuando pasa, vuelvo a pensar en todo y me cuesta dormirme otra vez.

Terapeuta: ¿Cómo suele ser el día siguiente después de una noche así?

Paciente: Me siento cansada… irritable… me cuesta concentrarme.

Terapeuta: ¿Qué impacto ha tenido esto en tu desempeño laboral?

Paciente: Estoy más lenta… cometo errores que antes no cometía.

Terapeuta: Cuando notás que no lográs dormir, ¿qué acostumbrás hacer?

Paciente: Me quedo en la cama… reviso el celular… trato de distraerme.

Terapeuta: ¿Sentís que eso realmente te ayuda a dormir?

Paciente: No mucho… pero no sé qué más hacer.

Terapeuta: ¿Cómo es tu consumo de café u otras bebidas con cafeína durante el día?

Paciente: Bastante… especialmente en la tarde para compensar el cansancio.

Terapeuta: ¿Cómo describirías tus horarios para acostarte y levantarte?

Paciente: Bastante irregulares… muchas veces me acuesto tarde porque sigo trabajando.

Terapeuta: ¿Qué actividades solés realizar durante la última hora antes de dormir?

Paciente: Trabajo en la computadora… o reviso el celular.

Terapeuta: ¿Cómo te sentís cuando llega la hora de acostarte?

Paciente: Ansiosa… porque sé que necesito dormir, pero siento que no voy a poder.

Terapeuta: Cuando pasan los minutos y seguís despierta, ¿qué pensamientos aparecen?

Paciente: Que al día siguiente voy a estar peor… que no voy a rendir… que todo se va a acumular.

Terapeuta: ¿Sentís que esos pensamientos hacen todavía más difícil dormir?

Paciente: Sí… entre más pienso en eso, más despierta me siento.

Terapeuta: Antes de que comenzaran estas dificultades, ¿cómo era tu sueño?

Paciente: Normal… nunca había tenido problemas.

Terapeuta: Mirando hacia atrás, ¿recordás si ocurrió algún cambio importante antes de que esto empezara?

Paciente: Sí… aumentó mucho la carga de trabajo… empezaron proyectos más exigentes.

Terapeuta: ¿Cómo respondiste a ese aumento de responsabilidades?

Paciente: Trabajando más horas… llevándome trabajo para la casa.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo te describirías en relación con la responsabilidad y la exigencia personal?

Paciente: Siempre he sido bastante exigente… me gusta hacer las cosas muy bien.

Terapeuta: ¿Cómo describirías la forma en que tus padres manejaban esos temas?

Paciente: También eran exigentes… valoraban mucho el rendimiento.

Terapeuta: ¿Qué aprendiste de esa forma de crecer?

Paciente: Que siempre había que cumplir… que no podía fallar.

Terapeuta: Mirando tu situación actual, ¿sentís que esa forma de exigirte influye en lo que está pasando con tu sueño?

Paciente: Sí… siento que nunca logro desconectarme… como si siempre tuviera algo pendiente.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: Además del café, ¿consumís alcohol u otras sustancias?

Paciente: No… únicamente café.

Terapeuta: Para ir cerrando por hoy, ¿qué te gustaría que fuera diferente a partir de este proceso?

Paciente: Me gustaría volver a dormir tranquila… sentir que puedo descansar sin que mi cabeza siga trabajando toda la noche.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi cuerpo quiere descansar… pero mi mente no me deja.`,
},
{
  id: 17,
  titulo: "Caso 18",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Mariana Salazar Rojas, tengo 32 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7238-6174 y mi correo es mariana.salazar32@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Diseño de Interiores.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy diseñadora de interiores… trabajo por proyectos.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo sola.

Terapeuta: Mariana, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me cuesta sostenerme… siento que no soy constante.

Terapeuta: ¿Qué significa para vos sentir que no sos constante?

Paciente: Hay momentos en los que estoy muy enfocada… saco muchísimo trabajo… y luego me cuesta mantener ese ritmo.

Terapeuta: Contame un poco sobre esos períodos en los que te sentís diferente.

Paciente: Me siento muy clara… con muchas ideas… avanzo rapidísimo… como si todo encajara.

Terapeuta: ¿Qué cambios notás en tu nivel de energía durante esos días?

Paciente: Muchísima energía… siento que puedo hacer muchas cosas al mismo tiempo.

Terapeuta: ¿Cómo influye eso en la cantidad de actividades o proyectos que aceptás?

Paciente: Acepto más proyectos… hago más planes… siento que puedo con todo.

Terapeuta: ¿Cómo suele ser tu descanso durante esos períodos?

Paciente: Duermo unas cuatro o cinco horas… pero al día siguiente igual me siento llena de energía.

Terapeuta: ¿Las personas cercanas han notado algún cambio cuando estás así?

Paciente: Sí… dicen que hablo más rápido… que ando con demasiadas ideas… pero yo solo siento que estoy inspirada.

Terapeuta: ¿Cómo vivís vos esos momentos?

Paciente: Me gustan… siento que esa es la versión de mí que más produce.

Terapeuta: ¿Qué suele pasar después de esos períodos?

Paciente: Es como si se apagara el motor… me cuesta muchísimo volver a arrancar.

Terapeuta: ¿Cómo te sentís entonces?

Paciente: Sin impulso… todo se siente pesado… me cuesta decidir hasta cosas simples.

Terapeuta: ¿Cómo repercute eso en tu trabajo?

Paciente: Me atraso… procrastino… me cuesta concentrarme.

Terapeuta: ¿Qué explicación te das de esos cambios?

Paciente: Pienso que soy desordenada… que no tengo disciplina.

Terapeuta: ¿Qué pensamientos aparecen durante esas etapas?

Paciente: Que debería poder mantener el mismo ritmo… que estoy desperdiciando mi potencial.

Terapeuta: ¿Cómo describirías tu estado de ánimo durante esos momentos?

Paciente: Más apagada… frustrada… pero no diría que deprimida.

Terapeuta: ¿Has notado si estos cambios se repiten con cierta frecuencia?

Paciente: Sí… desde hace años… siempre vuelven.

Terapeuta: ¿Cómo afectan esos cambios tus proyectos?

Paciente: Algunos salen muy bien… otros los dejo a medias o los entrego tarde.

Terapeuta: ¿Qué comentarios has recibido de clientes o compañeros?

Paciente: Que tengo mucho talento… pero que nunca saben con cuál versión de mí se van a encontrar.

Terapeuta: Durante esos períodos de mayor energía, ¿te ha pasado que aceptás más compromisos de los que después podés sostener?

Paciente: Sí… muchas veces digo que sí a todo… y después me siento completamente sobrepasada.

Terapeuta: ¿Cómo han sido tus relaciones personales a lo largo de estos cambios?

Paciente: También cambian… hay épocas en las que quiero salir con todo el mundo… y otras en las que desaparezco.

Terapeuta: ¿Qué suelen decirte las personas cercanas?

Paciente: Que a veces estoy muy "arriba"... con muchísima energía… y después muy apagada.

Terapeuta: Mirando hacia atrás, ¿desde cuándo recordás este patrón?

Paciente: Desde hace varios años… incluso en la universidad ya me pasaba.

Terapeuta: ¿Cómo recordás tu adolescencia?

Paciente: Bastante parecida… tenía temporadas donde hacía mil cosas… y otras donde todo me costaba muchísimo.

Terapeuta: ¿Cómo describirías la forma en que tus padres te educaban?

Paciente: Mi mamá era más emocional… mi papá bastante exigente.

Terapeuta: ¿Cómo te hacía sentir eso?

Paciente: Que tenía que rendir… pero también sentía que yo cambiaba mucho.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: Sí… mi mamá recibió tratamiento por depresión hace varios años.

Terapeuta: ¿Cómo ha sido tu consumo de alcohol u otras sustancias?

Paciente: Solo alcohol socialmente… nada más.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso terapéutico?

Paciente: Me gustaría encontrar un equilibrio… dejar de sentir que paso de un extremo al otro.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que tengo mucho potencial… pero no logro sostener una versión estable de mí misma.`,
},
  {
  id: 18,
  titulo: "Caso 19",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Paula Vargas Jiménez, tengo 28 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7267-5193 y mi correo es paula.vargas28@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Nutrición.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy nutricionista… trabajo en consulta privada.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo con una amiga.

Terapeuta: Paula, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me cuesta relajarme… siento que siempre tengo que estar en control.

Terapeuta: ¿En qué aspectos de tu vida notás más esa necesidad de control?

Paciente: En varias cosas… pero sobre todo en mi rutina… la alimentación… el ejercicio… los horarios.

Terapeuta: ¿Cómo describirías un día normal para vos?

Paciente: Muy estructurado… tengo prácticamente todo planificado… comidas, entrenamientos, trabajo… casi todo.

Terapeuta: ¿Qué suele pasar cuando algo no sale como lo habías planeado?

Paciente: Me incomoda mucho… siento que perdí el orden.

Terapeuta: ¿Qué pensamientos aparecen en esos momentos?

Paciente: Que debí organizarme mejor… que no debí salirme del plan… que estoy perdiendo disciplina.

Terapeuta: ¿Cómo reaccionás emocionalmente cuando eso sucede?

Paciente: Me siento ansiosa… molesta conmigo misma.

Terapeuta: ¿Cómo describirías actualmente tu relación con la alimentación?

Paciente: La cuido muchísimo… trato de comer lo más limpio posible.

Terapeuta: ¿Qué significa para vos comer "limpio"?

Paciente: Comer saludable… evitar alimentos que siento que no aportan nada.

Terapeuta: ¿Te permitís salir de ese esquema de vez en cuando?

Paciente: Prefiero no hacerlo… siento que no lo necesito.

Terapeuta: ¿Qué ocurre cuando por alguna razón sí lo hacés?

Paciente: Me siento incómoda… como si hubiera hecho algo incorrecto.

Terapeuta: ¿Cuánto suele durar esa sensación?

Paciente: A veces todo el día… incluso hasta el día siguiente.

Terapeuta: ¿Qué hacés normalmente cuando te sentís así?

Paciente: Intento compensarlo… vuelvo a mi rutina siendo todavía más estricta.

Terapeuta: ¿Qué significa para vos compensar?

Paciente: Recuperar el control… hacer las cosas mejor al día siguiente.

Terapeuta: ¿Cómo describirías la relación que tenés con tu cuerpo?

Paciente: En general bien… aunque siempre siento que podría mejorar.

Terapeuta: ¿Qué significa para vos "mejorar"?

Paciente: Estar más definida… más en forma… más cerca de cómo creo que debería verme.

Terapeuta: ¿Qué ocurre cuando sentís que no alcanzás ese estándar?

Paciente: Me frustro… siento que estoy fallando.

Terapeuta: ¿Cómo ha influido todo esto en tu vida social?

Paciente: A veces evito salidas… especialmente si implican comida.

Terapeuta: ¿Qué hace que prefirás evitarlas?

Paciente: Que no puedo controlar exactamente qué voy a comer… y eso me genera mucha incomodidad.

Terapeuta: ¿Cómo describirías tus relaciones personales?

Paciente: En general son buenas… aunque varias personas me dicen que soy muy rígida.

Terapeuta: ¿Cómo interpretás vos ese comentario?

Paciente: Yo diría que soy disciplinada… no rígida.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo recordás la alimentación en tu casa cuando eras niña?

Paciente: Era un tema importante… mi mamá hablaba mucho sobre comer bien y cuidar el cuerpo.

Terapeuta: ¿Qué tipo de mensajes recordás recibir sobre vos misma?

Paciente: Me decía que debía cuidarme… que verme bien era importante… que eso abría oportunidades.

Terapeuta: ¿Cómo te hacían sentir esos comentarios?

Paciente: Que tenía que mantener cierto estándar.

Terapeuta: ¿Cómo fue tu adolescencia en relación con tu cuerpo y tu alimentación?

Paciente: Siempre estuve pendiente… haciendo ejercicio… tratando de mantenerme.

Terapeuta: Mirando tu historia, ¿sentís que existe relación entre esas experiencias y lo que vivís actualmente?

Paciente: Sí… creo que siempre he sido así… pero con los años se volvió mucho más intenso.

Terapeuta: ¿Has intentado ser más flexible con estas reglas que te imponés?

Paciente: Sí… pero cuando lo intento me siento muy incómoda.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: ¿Consumís alcohol u otras sustancias?

Paciente: No… ninguna.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso terapéutico?

Paciente: Me gustaría sentir que puedo disfrutar más las cosas… sin estar pensando todo el tiempo en si estoy haciendo lo correcto.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que si pierdo el control en lo que hago… especialmente con mi cuerpo… algo no está bien en mí.`,
},
{
  id: 19,
  titulo: "Caso 20",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Diego Herrera León, tengo 35 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7263-5146 y mi correo es diego.herrera35@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Administración de Empresas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en ventas… en una empresa de tecnología.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja.

Terapeuta: Diego, ¿qué ocurrió para que decidieras venir a consulta en este momento?

Paciente: La verdad no estaba muy convencido… mi pareja insistió en que viniera.

Terapeuta: ¿Qué es lo que ella suele señalar?

Paciente: Dice que soy muy cambiante… que tomo decisiones sin pensar… pero yo no lo veo tan grave.

Terapeuta: ¿Cómo describirías vos esa forma de actuar?

Paciente: Siento que muchas veces simplemente hago lo que me nace en el momento.

Terapeuta: ¿Podrías darme un ejemplo reciente?

Paciente: Hace poco compré una computadora bastante cara sin haberlo planeado… después me di cuenta de que realmente no la necesitaba.

Terapeuta: ¿Cómo suelen ser ese tipo de decisiones?

Paciente: Muy rápidas… primero actúo… después pienso.

Terapeuta: ¿Qué consecuencias han tenido esas decisiones?

Paciente: Principalmente discusiones con mi pareja… sobre todo por dinero.

Terapeuta: ¿Cómo manejás normalmente tus finanzas?

Paciente: En general bien… aunque cuando veo algo que me gusta me cuesta detenerme.

Terapeuta: ¿Qué sentís justo antes de tomar una decisión impulsiva?

Paciente: Como muchas ganas de hacerlo… siento que si no lo hago en ese momento voy a perder la oportunidad.

Terapeuta: ¿Y cómo te sentís después?

Paciente: Al principio satisfecho… después un poco incómodo… cuando veo las consecuencias.

Terapeuta: Además del dinero, ¿en qué otras áreas notás que actuás impulsivamente?

Paciente: En conversaciones… decisiones del trabajo… a veces acepto cosas sin pensarlo bien.

Terapeuta: ¿Cómo reaccionan las personas cercanas?

Paciente: Muchos dicen que debería pensar más antes de actuar.

Terapeuta: ¿Cómo interpretás esos comentarios?

Paciente: Que exageran un poco… aunque reconozco que a veces tienen razón.

Terapeuta: ¿Qué tipo de consecuencias has tenido en el trabajo?

Paciente: Cierro ventas rápido… pero algunas veces omito revisar detalles importantes y después aparecen problemas.

Terapeuta: ¿Qué ocurre cuando eso pasa?

Paciente: Me frustro… porque sé que habría podido evitarlo.

Terapeuta: ¿También te ocurre en discusiones o cuando experimentás emociones intensas?

Paciente: Sí… respondo muy rápido… digo cosas que después me arrepiento de haber dicho.

Terapeuta: ¿Qué suele pasar por tu mente en ese momento?

Paciente: Realmente no pienso mucho… simplemente reacciono.

Terapeuta: ¿Has intentado cambiar esa forma de responder?

Paciente: Sí… pero me cuesta mucho frenarme.

Terapeuta: ¿Cómo describirías tus rutinas diarias?

Paciente: Bastante irregulares… me cuesta mantener hábitos por mucho tiempo.

Terapeuta: ¿Eso también ocurre con proyectos personales?

Paciente: Sí… empiezo muy motivado… pero después pierdo el interés.

Terapeuta: ¿Cómo interpretás vos ese patrón?

Paciente: Que me aburro rápido… siempre necesito algo diferente.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo recordás tu infancia?

Paciente: Siempre fui muy inquieto… me metía en problemas por hacer cosas sin pensar.

Terapeuta: ¿Qué tipo de comentarios recibías de tus padres o profesores?

Paciente: Que debía pensar antes de actuar… que era impulsivo… que me costaba esperar.

Terapeuta: ¿Cómo te hacía sentir eso?

Paciente: Que intentaba controlarme… pero muchas veces no lo lograba.

Terapeuta: Mirando tu historia, ¿sentís que esta forma de actuar ha estado presente durante gran parte de tu vida?

Paciente: Sí… creo que siempre he sido así.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud en general. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: ¿Cómo ha sido tu consumo de alcohol u otras sustancias?

Paciente: Tomo alcohol socialmente… algunas veces más de la cuenta… pero no consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso?

Paciente: Me gustaría aprender a detenerme antes de actuar… no seguir metiéndome en problemas por decisiones del momento.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que hago las cosas en el momento… y después tengo que lidiar con las consecuencias.`,
},
{
  id: 20,
  titulo: "Caso 21",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Fernanda Castillo Vega, tengo 31 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7254-8361 y mi correo es fernanda.castillo31@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitaria en Administración.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo como asistente administrativa.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja.

Terapeuta: Fernanda, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que me cuesta estar tranquila cuando estoy sola… como que necesito estar con alguien.

Terapeuta: ¿Desde cuándo venís notando que eso te ocurre?

Paciente: Desde hace bastante tiempo… pero últimamente lo siento mucho más.

Terapeuta: ¿Qué suele pasar cuando te encontrás sola?

Paciente: Me pongo muy inquieta… empiezo a pensar muchas cosas… y prefiero evitar estar así.

Terapeuta: ¿Qué tipo de pensamientos aparecen?

Paciente: Que algo podría pasar… que no voy a saber qué hacer… o que necesito hablar con alguien.

Terapeuta: ¿Qué acostumbrás hacer cuando aparece esa sensación?

Paciente: Busco a alguien… llamo a mi pareja… o a una amiga.

Terapeuta: ¿Cómo describirías tu relación de pareja actualmente?

Paciente: Es buena… él me apoya mucho.

Terapeuta: ¿De qué manera sentís que te apoya?

Paciente: Me orienta… me ayuda a tomar decisiones… normalmente sabe qué es lo mejor.

Terapeuta: ¿Cómo te sentís cuando él toma ese papel?

Paciente: Tranquila… siento que él decide mejor que yo.

Terapeuta: ¿Te resulta difícil tomar decisiones por tu cuenta?

Paciente: Sí… incluso decisiones pequeñas… prefiero preguntarle.

Terapeuta: ¿Qué sentís cuando tenés que decidir sin consultar a alguien?

Paciente: Mucha inseguridad… siento que voy a equivocarme.

Terapeuta: Cuando no estás de acuerdo con tu pareja, ¿qué suele pasar?

Paciente: Normalmente cedo… prefiero evitar discutir.

Terapeuta: ¿Qué hace que prefirás ceder?

Paciente: Me da miedo generar conflictos… o que la relación se dañe.

Terapeuta: ¿Ese temor a perder a las personas importantes ha estado presente en otras relaciones?

Paciente: Sí… también me pasó en relaciones anteriores.

Terapeuta: ¿Qué te llevaba a permanecer en esas relaciones incluso cuando no te sentías completamente bien?

Paciente: Sentía que era mejor eso… que quedarme sola.

Terapeuta: ¿Cómo te sentís con vos misma cuando no tenés a alguien cerca?

Paciente: Insegura… como si no supiera qué hacer.

Terapeuta: ¿Cómo son tus relaciones con amistades o familiares?

Paciente: Cercanas… pero también dependo bastante de ellas para sentirme tranquila.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo describirías tu infancia?

Paciente: Bastante protegida… siempre había alguien pendiente de mí.

Terapeuta: ¿Quién ocupaba principalmente ese rol?

Paciente: Mi mamá… estaba pendiente de todo.

Terapeuta: ¿Cómo era esa forma de cuidarte?

Paciente: Opinaba sobre casi todo… lo que hacía… las decisiones que tomaba.

Terapeuta: ¿Qué tipo de decisiones acostumbraba tomar por vos?

Paciente: Desde la ropa… hasta actividades o amistades.

Terapeuta: ¿Cómo vivías vos esa dinámica?

Paciente: Me sentía tranquila… pensaba que ella sabía qué era lo mejor.

Terapeuta: ¿Recordás haber intentado tomar decisiones por tu cuenta?

Paciente: Sí… pero cuando me equivocaba lo señalaban mucho.

Terapeuta: ¿Quién lo hacía con mayor frecuencia?

Paciente: Principalmente mi mamá… aunque otros familiares también.

Terapeuta: ¿Cómo te hacía sentir eso?

Paciente: Que no era buena decidiendo… que necesitaba que alguien me guiara.

Terapeuta: ¿Qué papel tenía tu papá en esa dinámica?

Paciente: Era más distante… generalmente apoyaba lo que decía mi mamá.

Terapeuta: ¿Sentís que tuviste oportunidades para desarrollar independencia?

Paciente: No muchas… casi siempre había alguien diciéndome qué hacer.

Terapeuta: ¿Cómo fueron tus relaciones durante la escuela y la adolescencia?

Paciente: Me apegaba mucho a mis amigas… me costaba cuando alguna se alejaba.

Terapeuta: ¿Qué experimentabas cuando eso ocurría?

Paciente: Mucha ansiedad… sentía que algo estaba mal conmigo.

Terapeuta: ¿Cómo reaccionabas ante esa situación?

Paciente: Trataba de acercarme más… hacía todo lo posible para no perder la relación.

Terapeuta: Mirando tu historia, ¿sentís que existe relación entre esas experiencias y lo que vivís actualmente?

Paciente: Sí… siento que es exactamente el mismo patrón.

Terapeuta: ¿Has intentado desarrollar mayor independencia?

Paciente: Sí… pero me genera muchísima ansiedad… siento que no lo hago bien.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: No que yo sepa.

Terapeuta: ¿Consumís alcohol u otras sustancias?

Paciente: No.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso terapéutico?

Paciente: Me gustaría confiar más en mí… sentir que puedo tomar decisiones sin depender siempre de alguien.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que necesito a alguien que me acompañe y me diga que estoy haciendo las cosas bien… porque sola no confío en mí.`,
},
{
  id: 21,
  titulo: "Caso 22",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Andrés Mora Salazar, tengo 34 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7265-8437 y mi correo es andres.mora34@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Diseño Gráfico.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy diseñador gráfico… trabajo de forma independiente.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo desde hace unos dos años.

Terapeuta: Andrés, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que me cuesta organizarme… como que todo se me acumula.

Terapeuta: ¿Qué significa para vos que todo se te acumula?

Paciente: Empiezo cosas… pero no siempre las termino… o las dejo para después.

Terapeuta: ¿Cómo ha afectado eso tu trabajo?

Paciente: A veces entrego proyectos tarde… o termino haciéndolos a última hora.

Terapeuta: Cuando finalmente empezás una tarea, ¿qué suele pasar?

Paciente: Me concentro muchísimo… pero generalmente ya voy tarde.

Terapeuta: ¿Cómo te hace sentir esa situación?

Paciente: Frustrado… porque sé que podría hacerlo mejor.

Terapeuta: ¿Esto ocurre únicamente en el trabajo?

Paciente: No… también con cosas de la casa… pagos… citas… se me olvidan.

Terapeuta: ¿Sentís que olvidás con frecuencia asuntos importantes aunque intentés organizarlos?

Paciente: Sí… bastante… aunque haga listas o ponga recordatorios.

Terapeuta: ¿Cómo describirías tu capacidad para mantener la atención?

Paciente: Depende… si algo me interesa mucho puedo pasar horas haciéndolo… pero si no me interesa me cuesta muchísimo concentrarme.

Terapeuta: ¿Te distraés fácilmente?

Paciente: Sí… cualquier cosa hace que pierda el hilo.

Terapeuta: ¿Cómo intentás organizar tus tareas?

Paciente: Hago listas… uso aplicaciones… pero después termino ignorándolas.

Terapeuta: Mirando hacia atrás, ¿recordás desde cuándo te ocurre esto?

Paciente: Desde que tengo memoria.

Terapeuta: Me gustaría conocer un poco tu etapa escolar. ¿Cómo eras cuando estabas en la escuela?

Paciente: Me costaba mucho poner atención… los profesores siempre decían que me distraía.

Terapeuta: ¿Cómo eran tus calificaciones?

Paciente: Muy variables… en lo que me gustaba me iba muy bien… en lo demás bastante mal.

Terapeuta: ¿Qué comentarios recibías sobre tu comportamiento?

Paciente: Que hablaba mucho… que no terminaba las tareas… que me levantaba del asiento.

Terapeuta: ¿Cómo manejabas los trabajos escolares?

Paciente: Muchas veces los dejaba incompletos… o los hacía corriendo al final.

Terapeuta: ¿Cómo reaccionaba tu familia ante eso?

Paciente: Mi mamá trataba de ayudarme… pero terminaba frustrándose.

Terapeuta: ¿Qué solían decirte?

Paciente: Que era inteligente… pero desordenado… que no me esforzaba lo suficiente.

Terapeuta: ¿Cómo te hacían sentir esos comentarios?

Paciente: Sentía que había algo malo en mí… pero nunca entendía qué era.

Terapeuta: ¿Te costaba seguir instrucciones largas o con varios pasos?

Paciente: Sí… me perdía fácilmente en el proceso.

Terapeuta: ¿Cómo fue la etapa del colegio?

Paciente: Muy parecida… siempre sentía que sobrevivía apenas.

Terapeuta: ¿Alguna vez alguien sugirió una evaluación psicológica o neuropsicológica?

Paciente: No… simplemente me decían que tenía que poner más de mi parte.

Terapeuta: ¿Cómo eran tus relaciones con otras personas?

Paciente: Bastante buenas… tenía amigos… aunque era impulsivo para hablar.

Terapeuta: ¿En qué sentido impulsivo?

Paciente: Interrumpía mucho… respondía antes de que terminaran de hablar… o decía cosas sin pensar.

Terapeuta: ¿Eso sigue ocurriendo actualmente?

Paciente: Sí… especialmente cuando un tema me entusiasma.

Terapeuta: ¿Cómo describirías tu manejo del tiempo?

Paciente: Muy malo… siempre creo que tengo más tiempo del que realmente tengo.

Terapeuta: ¿Te cuesta decidir qué tarea hacer primero?

Paciente: Sí… termino haciendo la que me llama más la atención… no la más importante.

Terapeuta: ¿Has intentado cambiar esa forma de organizarte?

Paciente: Muchas veces… pero nunca logro mantenerlo.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha presentado dificultades parecidas o ha recibido atención por algún problema relacionado con la atención, el aprendizaje o la salud mental?

Paciente: Mi papá siempre ha sido muy despistado y desordenado… aunque nunca fue evaluado.

Terapeuta: ¿Consumís alcohol u otras sustancias?

Paciente: Solo alcohol ocasionalmente… nada más.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso?

Paciente: Me gustaría poder organizarme mejor… terminar las cosas a tiempo y dejar de sentir que siempre voy atrasado.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que sé perfectamente lo que tengo que hacer… pero me cuesta muchísimo organizarme y sostenerlo… como si siempre estuviera un paso atrás.`,
},
{
  id: 22,
  titulo: "Caso 23",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Valeria Rojas Jiménez, tengo 29 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7236-9148 y mi correo es valeria.rojas29@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Nutrición.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy nutricionista. Trabajo en una clínica privada desde hace unos tres años. Atiendo principalmente pacientes con control de peso y hábitos alimenticios. Me gusta mucho lo que hago, pero últimamente he sentido que me cuesta confiar en mis propias decisiones dentro del trabajo.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo sola desde hace aproximadamente un año. Antes compartía apartamento con una compañera.

Terapeuta: Valeria, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que últimamente estoy muy insegura, pero no es algo nuevo… es como si siempre hubiera estado ahí, solo que ahora lo noto más. Me pasa mucho cuando tengo que tomar decisiones importantes o cuando siento que alguien podría evaluarme.

Terapeuta: ¿En qué situaciones notás más esa inseguridad?

Paciente: Por ejemplo, cuando tengo que ajustar un plan alimenticio y no estoy completamente segura, aunque tenga la base teórica… empiezo a pensar que tal vez otro profesional lo haría mejor o que yo estoy pasando algo por alto.

Terapeuta: ¿Qué suele pasar cuando tenés que tomar una decisión y no tenés la posibilidad de consultarla con alguien?

Paciente: Me quedo con mucha inquietud… sigo pensando si elegí bien o si pasé algo por alto. Incluso después de decidir, continúo repasándolo mentalmente.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?

Paciente: Pienso cosas como "seguro estoy olvidando algo importante", "esto no está lo suficientemente bien", o "alguien más lo haría mejor que yo". Es una sensación constante de que lo que hago nunca es suficiente.

Terapeuta: ¿Cómo reaccionás ante esos pensamientos?

Paciente: Me vuelvo mucho más cuidadosa… reviso una y otra vez, trato de anticiparme a posibles errores. Incluso postergo decisiones porque quiero estar completamente segura.

Terapeuta: ¿Cómo es la retroalimentación que recibís en tu trabajo?

Paciente: En general es buena. Mis pacientes suelen estar satisfechos y mis supervisores nunca me han señalado problemas importantes.

Terapeuta: ¿Cómo recibís esos comentarios positivos?

Paciente: Me cuesta creerlos. Pienso que quizá no han visto todos mis errores o simplemente están siendo amables.

Terapeuta: ¿Te cuesta reconocer tus propios logros?

Paciente: Muchísimo. Lo que hago bien me parece simplemente lo mínimo que debería hacer.

Terapeuta: ¿Qué impacto tienen para vos los errores, incluso cuando son pequeños?

Paciente: Me afectan muchísimo… puedo pasar días pensando en ellos. Siento que un error demuestra que no soy tan capaz como los demás creen.

Terapeuta: ¿Qué tipo de cosas te decís cuando eso ocurre?

Paciente: Que debí haberlo hecho mejor… que cómo no lo vi antes… que debería ser más cuidadosa. También me comparo mucho con otros profesionales.

Terapeuta: ¿Cómo son tus relaciones con otras personas?

Paciente: Trato de llevarme bien con todos. Soy muy cuidadosa con lo que digo para no incomodar.

Terapeuta: ¿Qué suele pasar cuando no estás de acuerdo con alguien?

Paciente: Normalmente me quedo callada o trato de suavizar mi opinión. Prefiero adaptarme antes que generar conflicto.

Terapeuta: ¿Cómo te sentís después de hacerlo?

Paciente: A veces frustrada… como si no hubiera sido completamente honesta conmigo misma.

Terapeuta: ¿Cómo han sido tus relaciones de pareja?

Paciente: Siempre trato de esforzarme muchísimo para que la relación funcione. Estoy pendiente de la otra persona y trato de no fallar.

Terapeuta: ¿Qué ocurre con vos en ese proceso?

Paciente: Muchas veces termino dejándome de lado. Me cuesta poner límites o priorizar mis propias necesidades.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo era la relación con tus padres?

Paciente: Mi mamá era muy exigente. Nunca gritaba ni era agresiva, pero siempre encontraba algo que podía hacerse mejor.

Terapeuta: ¿Cómo vivías esa exigencia?

Paciente: Al principio trataba de esforzarme más, pero con el tiempo sentía que nunca era suficiente.

Terapeuta: ¿Y cómo era la relación con tu papá?

Paciente: Era más tranquilo, pero bastante distante emocionalmente. No expresaba mucho reconocimiento.

Terapeuta: ¿Recibías reconocimiento cuando hacías algo bien?

Paciente: Muy poco. Más bien era como "eso era lo que tenías que hacer".

Terapeuta: ¿Cómo te hacía sentir eso?

Paciente: Que siempre tenía que seguir esforzándome… como si nunca alcanzara el nivel esperado.

Terapeuta: ¿Cómo fue tu desempeño durante la escuela y el colegio?

Paciente: Siempre fui muy responsable y sacaba buenas notas, pero vivía con mucha presión. Me angustiaba muchísimo equivocarme.

Terapeuta: ¿Cómo reaccionabas cuando cometías un error en esa etapa?

Paciente: Me afectaba mucho… podía quedarme pensando en eso durante varios días.

Terapeuta: ¿Recibías comparaciones con otras personas?

Paciente: Sí… con compañeros y con familiares. Sentía que siempre tenía que alcanzar un estándar más alto.

Terapeuta: ¿Cómo eran tus relaciones con tus compañeros?

Paciente: Buenas, pero siempre tratando de encajar y de no hacer nada que pudiera generar rechazo.

Terapeuta: Mirando tu historia, ¿sentís que existe relación entre esas experiencias y lo que vivís actualmente?

Paciente: Sí… siento que sigo funcionando con la misma idea de que tengo que hacerlo perfecto para sentirme tranquila.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No. En general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… esta sería la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien ha recibido atención psicológica o psiquiátrica o ha atravesado dificultades importantes relacionadas con su salud mental?

Paciente: Mi mamá siempre fue muy ansiosa, aunque nunca recibió tratamiento.

Terapeuta: ¿Cómo ha sido tu consumo de alcohol u otras sustancias?

Paciente: Solo tomo alcohol ocasionalmente en reuniones. No consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso terapéutico?

Paciente: Me gustaría confiar más en mis capacidades, dejar de sentir que nunca es suficiente y poder equivocarme sin castigarme tanto.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que siempre tengo que hacerlo mejor… y aun cuando lo hago bien, no logro sentirme satisfecha conmigo misma.`,
},
{
  id: 23,
  titulo: "Caso 24",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Daniel Vargas Quesada, tengo 37 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7268-4315 y mi correo es daniel.vargas37@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Administración de Empresas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo como supervisor en una empresa de logística. Llevo varios años ahí, aunque últimamente he sentido bastante presión por los resultados y el manejo del equipo.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casado y vivo con mi esposa y mi hijo de seis años.

Terapeuta: Daniel, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Últimamente he tenido muchas discusiones con mi esposa por temas económicos. Ella dice que no estoy manejando bien el dinero.

Terapeuta: ¿Cómo entendés vos esa situación?

Paciente: Creo que sí he tomado algunas malas decisiones… pero siento que muchas veces puedo recuperarlas.

Terapeuta: ¿Qué tipo de decisiones económicas suelen generar esos conflictos?

Paciente: A veces compro cosas que no tenía planeadas… o uso dinero destinado para otras cosas.

Terapeuta: Mencionabas que después intentás recuperar ese dinero. ¿Qué significa eso para vos?

Paciente: Buscar una forma rápida de volver a tenerlo… como compensar la pérdida.

Terapeuta: ¿Cómo acostumbrás hacerlo?

Paciente: Principalmente con apuestas deportivas por internet.

Terapeuta: ¿Con qué frecuencia participás en apuestas actualmente?

Paciente: Depende… hay semanas en que no entro… pero otras puedo apostar varios días seguidos.

Terapeuta: ¿Qué experimentás antes de hacer una apuesta?

Paciente: Mucha emoción… siento que esta vez sí puedo ganar… como si fuera una buena oportunidad.

Terapeuta: ¿Qué ocurre cuando ganás?

Paciente: Me siento muy satisfecho… como que tomé la decisión correcta.

Terapeuta: ¿Y qué pasa cuando perdés?

Paciente: Me cuesta aceptar la pérdida… inmediatamente empiezo a pensar cómo recuperarla.

Terapeuta: ¿Te ha pasado apostar nuevamente con la intención específica de recuperar lo perdido?

Paciente: Sí… muchas veces. Me cuesta quedarme con la idea de haber perdido.

Terapeuta: ¿Alguna vez terminaste apostando más dinero del que habías pensado inicialmente?

Paciente: Sí… varias veces. Empiezo con poco y termino poniendo mucho más.

Terapeuta: ¿Qué consecuencias ha tenido esto en tu vida personal o familiar?

Paciente: Principalmente discusiones con mi esposa… incluso hemos tenido problemas para cumplir algunos pagos porque usé dinero que estaba destinado para otras cosas.

Terapeuta: ¿Cómo te hace sentir eso?

Paciente: Me siento culpable… porque sé que los afecta… pero al mismo tiempo siento que puedo solucionarlo si logro recuperar el dinero.

Terapeuta: ¿Has intentado dejar de apostar?

Paciente: Sí… varias veces. Lo logro durante algunas semanas… pero después vuelvo.

Terapeuta: ¿Qué suele ocurrir antes de volver a apostar?

Paciente: Mucho estrés… preocupación por dinero… o simplemente veo una oportunidad y siento que no debería dejarla pasar.

Terapeuta: Cuando intentás dejar de apostar, ¿qué tan difícil resulta?

Paciente: Bastante difícil… sigo pensando en hacerlo… reviso resultados deportivos… me cuesta dejar de darle vueltas.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Recordás cuándo comenzaste a involucrarte en este tipo de actividades?

Paciente: Desde adolescente. Empezó con apuestas pequeñas entre amigos.

Terapeuta: ¿Qué era lo que más te atraía en ese momento?

Paciente: La emoción… competir… sentir que podía ganar.

Terapeuta: ¿Cómo reaccionabas cuando perdías?

Paciente: Siempre quería otra oportunidad para recuperar lo perdido.

Terapeuta: ¿Cómo era el ambiente en tu familia respecto al dinero o al riesgo?

Paciente: Mi papá también era de tomar riesgos económicos. No apostaba, pero hacía inversiones muy impulsivas.

Terapeuta: ¿Sentís que eso influyó en tu forma de ver el dinero?

Paciente: Sí… crecí viendo que asumir riesgos era una forma normal de ganar más.

Terapeuta: ¿Cómo ha evolucionado esto durante la adultez?

Paciente: Al principio era ocasional… pero desde que existen las plataformas en línea se volvió mucho más frecuente.

Terapeuta: ¿Cómo ha impactado esto otras áreas de tu vida?

Paciente: A veces estoy trabajando y sigo pensando en apuestas… en resultados… o en cómo recuperar dinero.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No… en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No… nunca.

Terapeuta: Pensando en tu familia, ¿recordás si alguien recibió atención psicológica o psiquiátrica o tuvo problemas relacionados con adicciones?

Paciente: No que yo sepa.

Terapeuta: ¿Cómo ha sido tu consumo de alcohol u otras sustancias?

Paciente: Solo alcohol ocasionalmente… no consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso?

Paciente: Me gustaría dejar de sentir que siempre tengo que recuperar lo perdido y volver a manejar el dinero con tranquilidad.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que siempre creo que la siguiente oportunidad va a resolver el problema… pero termino complicándolo más.`,
},
{
  id: 24,
  titulo: "Caso 25",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Mariana Solís Hernández, tengo 33 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7248-6135 y mi correo es mariana.solis33@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitaria en Administración.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo como encargada en una tienda de ropa en un centro comercial. Llevo ahí unos cuatro años. Es un trabajo que me gusta porque tengo contacto con personas, aunque últimamente la presión me está costando mucho manejarla.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Vivo con mi pareja. Llevamos casi cinco años juntos.

Terapeuta: Mariana, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me he sentido muy cansada emocionalmente... como desgastada. Me cuesta concentrarme, lloro con facilidad y siento que en la casa las cosas cada vez son más tensas.

Terapeuta: ¿Qué suele ocurrir cuando aparecen esas tensiones?

Paciente: Generalmente empiezan por cosas pequeñas... gastos, tareas de la casa o comentarios sin mala intención.

Terapeuta: ¿Cómo reacciona tu pareja cuando eso ocurre?

Paciente: Se enoja muy rápido... levanta la voz... cambia completamente el tono. Siento que cualquier cosa puede hacerlo molestarse más.

Terapeuta: ¿Cómo reaccionás vos en esos momentos?

Paciente: Me pongo muy tensa... trato de pensar muy bien qué decir para no empeorar las cosas. Muchas veces prefiero quedarme callada.

Terapeuta: ¿Qué ocurre cuando intentás explicar tu punto de vista?

Paciente: Muchas veces siente que me estoy justificando o que no lo estoy entendiendo. Entonces termino cerrándome más.

Terapeuta: ¿Cómo te sentís después de esas discusiones?

Paciente: Muy confundida... y con mucha culpa. Paso horas pensando qué hice mal o qué pude haber dicho diferente.

Terapeuta: ¿Has llegado a sentir miedo durante esas situaciones?

Paciente: Sí... no siempre... pero hay momentos en los que siento mucha tensión... como si estuviera esperando que algo ocurra.

Terapeuta: ¿En alguna ocasión la situación ha pasado de lo verbal?

Paciente: Sí... algunas veces.

Terapeuta: ¿Podés contarme un poco más?

Paciente: Me ha empujado... me ha sujetado muy fuerte de los brazos... una vez me jaló cuando intenté irme a otra habitación.

Terapeuta: ¿Con qué frecuencia ha ocurrido algo así?

Paciente: No pasa todos los días... pero ya ha ocurrido varias veces durante la relación.

Terapeuta: ¿Cómo interpretás esos episodios?

Paciente: Siento que pierde el control... pero también veo que después se arrepiente muchísimo.

Terapeuta: ¿Qué suele pasar después?

Paciente: Cambia completamente... se muestra cariñoso... atento... me pide perdón... promete que no volverá a pasar.

Terapeuta: ¿Cómo te hace sentir ese cambio?

Paciente: Me da esperanza... siento que tal vez ahora sí va a cambiar.

Terapeuta: ¿Cómo describirías ese ciclo que viven?

Paciente: Muy confuso... porque hay momentos en los que realmente somos felices... y otros donde todo cambia muy rápido.

Terapeuta: ¿Has hablado de esto con alguien cercano?

Paciente: No... me da mucha vergüenza. Además siento que la gente solo vería lo malo y no entendería que él también tiene cosas buenas.

Terapeuta: ¿Qué sentís que los demás no comprenderían?

Paciente: Que él también me cuida... me apoya... que no todo el tiempo es así.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo describirías el ambiente en el que creciste?

Paciente: Había épocas tranquilas... pero cuando mi papá se enojaba todo cambiaba.

Terapeuta: ¿Qué ocurría cuando él perdía el control?

Paciente: Gritaba... golpeaba puertas... algunas veces empujaba a mi mamá.

Terapeuta: ¿Cómo vivías vos esas situaciones?

Paciente: Me ponía muy nerviosa... pero después todo volvía a la normalidad... como si nunca hubiera pasado.

Terapeuta: ¿Se hablaba de lo ocurrido?

Paciente: Nunca... era como si estuviera prohibido mencionarlo.

Terapeuta: ¿Cómo reaccionaba tu mamá?

Paciente: Trataba de calmarlo... evitaba hacerlo enojar... y después actuaba como si nada hubiera pasado.

Terapeuta: Mirando tu historia, ¿qué sentís que aprendiste de esa dinámica?

Paciente: A evitar conflictos... a cuidar mucho lo que digo... y a pensar que después de algo muy fuerte todo puede volver a estar bien.

Terapeuta: ¿Cómo eran las muestras de afecto o la expresión de emociones en tu familia?

Paciente: Muy pocas... era más importante portarse bien y no generar problemas.

Terapeuta: ¿Cómo fueron tus relaciones durante la adolescencia?

Paciente: Siempre trataba de agradar... me costaba mucho decir que no o expresar desacuerdo.

Terapeuta: ¿Y en tus relaciones de pareja?

Paciente: Casi siempre termino adaptándome mucho... priorizando que la relación funcione antes que mis propias necesidades.

Terapeuta: ¿Sentís que existe relación entre esa historia y lo que estás viviendo actualmente?

Paciente: Sí... siento que repito la misma forma de manejar las cosas... esperando que todo mejore si yo hago las cosas bien.

Terapeuta: ¿Qué suele decirte tu diálogo interno cuando ocurren estos episodios?

Paciente: Que tal vez yo pude evitarlo... que dije algo incorrecto... que si hubiera actuado diferente él no se habría enojado.

Terapeuta: Antes de terminar, me gustaría conocer un poco sobre tu salud. ¿Hay alguna enfermedad importante o tratamiento médico que considerés relevante mencionar?

Paciente: No... en general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No... esta sería la primera vez.

Terapeuta: Pensando en tu familia, ¿recordás si alguien recibió atención psicológica o psiquiátrica?

Paciente: No que yo sepa.

Terapeuta: ¿Consumís alcohol u otras sustancias?

Paciente: No.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso?

Paciente: Me gustaría entender qué está pasando, dejar de sentirme culpable todo el tiempo y poder tomar decisiones pensando también en mi bienestar.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que una parte de mí sabe que algo no está bien... pero otra sigue esperando que todo cambie y vuelva a estar bien.`,
},
{
  id: 25,
  titulo: "Caso 26",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Esteban Quesada Ríos, tengo 36 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7281-5643 y mi correo es esteban.quesada36@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé el bachillerato de secundaria y después hice varios cursos técnicos relacionados con mantenimiento.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo de forma independiente haciendo mantenimiento y reparaciones. No tengo un horario fijo porque prefiero organizarme según cómo me voy sintiendo durante el día. Hay días en los que necesito más tiempo para reflexionar, orar o procesar ciertas cosas.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo desde hace unos tres años.

Terapeuta: Esteban, ¿qué ha estado pasando en tu vida para que decidieras venir a consulta?

Paciente: No fue una decisión completamente mía. Algunas personas cercanas me dijeron que me estoy aislando demasiado y que paso mucho tiempo metido en mis pensamientos.

Terapeuta: ¿Cómo entendés vos esos comentarios?

Paciente: Yo no siento que sea algo malo. Más bien necesito esos espacios para comprender mejor muchas cosas que percibo.

Terapeuta: ¿Qué tipo de cosas sentís que necesitás comprender?

Paciente: Siento que muchas cosas no son casualidad. Hay patrones, conexiones y señales que para otras personas pasan desapercibidas.

Terapeuta: ¿Podrías darme un ejemplo?

Paciente: Hace poco estaba pensando si aceptar un trabajo y escuché a alguien decir: "No todo lo que parece bueno lo es". Sentí que esa frase era una especie de advertencia para mí.

Terapeuta: ¿Cómo interpretás experiencias como esa?

Paciente: Como una guía. No creo que sean simples coincidencias.

Terapeuta: ¿Estas experiencias ocurren con frecuencia?

Paciente: Sí... varias veces al mes.

Terapeuta: ¿Has compartido estas experiencias con otras personas?

Paciente: Algunas veces, pero normalmente prefiero no hacerlo porque la mayoría piensa que exagero o que estoy imaginando cosas.

Terapeuta: ¿Cómo te hace sentir que reaccionen así?

Paciente: Más reservado... siento que no todos pueden entender esa forma de percibir las cosas.

Terapeuta: ¿Cómo describirías actualmente tus relaciones personales?

Paciente: Bastante limitadas. Tengo conocidos, pero pocas personas realmente cercanas.

Terapeuta: ¿Te gustaría tener vínculos más cercanos?

Paciente: Sí... aunque también siento que sería difícil encontrar personas que comprendan cómo veo el mundo.

Terapeuta: ¿Cómo te sentís en reuniones sociales?

Paciente: Incómodo. No tanto por nervios, sino porque siento que las conversaciones suelen ser muy superficiales.

Terapeuta: ¿Has tenido alguna experiencia perceptiva que te haya llamado especialmente la atención?

Paciente: Sí. En algunas ocasiones siento presencias... no veo a nadie claramente, pero tengo una sensación muy fuerte de que hay algo allí.

Terapeuta: ¿Cómo describirías esa experiencia?

Paciente: Es como una intuición muy intensa... una sensación corporal difícil de explicar.

Terapeuta: ¿Esas experiencias te generan miedo?

Paciente: No. Más bien siento curiosidad o respeto.

Terapeuta: ¿Escuchás voces cuando no hay nadie presente o ves cosas que otras personas no ven?

Paciente: No... voces no. Es más una sensación o una percepción interna.

Terapeuta: ¿Estas experiencias interfieren con tu trabajo o tus actividades diarias?

Paciente: No directamente, aunque a veces me distraigo tratando de entender su significado.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo fue tu infancia?

Paciente: Bastante solitaria emocionalmente. Siempre sentí que vivía más en mi mundo.

Terapeuta: ¿Cómo era la relación con tus padres?

Paciente: Mi mamá era muy creyente, pero de una forma tradicional. Mi papá era distante y poco expresivo.

Terapeuta: ¿Sentías que te comprendían?

Paciente: No mucho. Sentía que mi manera de pensar era diferente.

Terapeuta: ¿Cómo fue tu experiencia durante la escuela?

Paciente: Difícil. Tenía pocos amigos y muchas veces decía cosas que los demás consideraban extrañas.

Terapeuta: ¿Cómo reaccionaban ellos?

Paciente: Algunos se burlaban y otros simplemente dejaban de hablarme.

Terapeuta: ¿Cómo te hizo sentir eso?

Paciente: Más aislado... como si nunca terminara de encajar.

Terapeuta: Mirando tu historia, ¿sentís que esa sensación de ser diferente ha estado presente durante gran parte de tu vida?

Paciente: Sí. Creo que siempre he visto el mundo de una forma distinta.

Terapeuta: Antes de terminar, quisiera conocer un poco sobre tu salud. ¿Tenés alguna enfermedad importante o recibís tratamiento médico actualmente?

Paciente: No. En general mi salud ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No... esta sería la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: Un tío recibió tratamiento psiquiátrico hace muchos años, pero nunca supe exactamente por qué.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?

Paciente: Tomo alcohol muy ocasionalmente y no consumo otras sustancias.

Terapeuta: ¿Qué esperás obtener de este proceso terapéutico?

Paciente: Entender mejor si estas experiencias forman parte de quién soy o si hay algo que necesito trabajar para relacionarme mejor con las personas.

Terapeuta: Si tuvieras que resumir en pocas palabras lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que percibo conexiones y significados que otras personas no ven, y eso hace que muchas veces me sienta diferente y solo.`,
},
{
  id: 26,
  titulo: "Caso 27",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Luis Fernando Araya Gómez, tengo 28 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7285-4176 y mi correo es luis.araya28@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Terminé un técnico en Servicio al Cliente después del colegio.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Trabajo en un call center desde hace unos dos años. Es un trabajo bastante estructurado, pero en los últimos meses me cuesta mantener la concentración durante las llamadas.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo con mi mamá.

Terapeuta: Luis, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: He estado sintiendo cosas que me cuesta explicar... siento que mi forma de percibir lo que pasa a mi alrededor ha cambiado.

Terapeuta: ¿Desde cuándo comenzaste a notar esos cambios?

Paciente: Hace unos cuatro o cinco meses. Al principio eran muy leves, pero poco a poco se han vuelto más frecuentes.

Terapeuta: ¿Cómo describirías esos cambios?

Paciente: Es como si algunas cosas tuvieran un significado especial para mí... como si hubiera mensajes escondidos.

Terapeuta: ¿Podrías darme un ejemplo?

Paciente: Hace unas semanas escuché a unos compañeros riéndose. No estaban hablando conmigo, pero sentí que se estaban riendo de algo relacionado conmigo.

Terapeuta: ¿Lograste confirmar que realmente hablaban de vos?

Paciente: No... traté de averiguar, pero nunca encontré nada que lo confirmara.

Terapeuta: ¿Te ha ocurrido algo parecido en otros lugares?

Paciente: Sí... viendo televisión o leyendo publicaciones en internet. A veces siento que ciertos mensajes tienen que ver conmigo.

Terapeuta: Cuando eso ocurre, ¿qué pensás después?

Paciente: Una parte de mí sabe que probablemente no tenga sentido... pero otra parte siente que sí puede ser verdad.

Terapeuta: ¿Cómo te hace sentir esa incertidumbre?

Paciente: Muy confundido... porque ya no sé cuándo confiar en lo que pienso.

Terapeuta: Además de eso, ¿has notado cambios en tu percepción?

Paciente: Sí... algunas veces siento que escucho mi nombre cuando estoy solo.

Terapeuta: ¿Cómo es esa experiencia?

Paciente: No es una voz clara... es más como si alguien me llamara a lo lejos.

Terapeuta: ¿Qué hacés cuando ocurre?

Paciente: Me detengo, reviso si hay alguien cerca, pero nunca encuentro a nadie.

Terapeuta: ¿Con qué frecuencia sucede?

Paciente: Varias veces durante el último mes.

Terapeuta: ¿Has notado cambios en tu forma de pensar?

Paciente: Sí... me cuesta seguir una idea. Empiezo hablando de algo y termino pensando en otra cosa completamente distinta.

Terapeuta: ¿Cómo ha afectado eso tu trabajo?

Paciente: Me distraigo más. A veces tengo que pedir que repitan información porque pierdo el hilo de la conversación.

Terapeuta: ¿Has recibido comentarios en el trabajo sobre esos cambios?

Paciente: Sí. Mi supervisor me dijo que últimamente parezco distraído y que antes era mucho más preciso.

Terapeuta: ¿Cómo describirías tu estado de ánimo durante estos meses?

Paciente: No diría que estoy triste... más bien me siento apagado, como desconectado.

Terapeuta: ¿Has dejado de disfrutar actividades que antes te gustaban?

Paciente: Sí. Antes jugaba videojuegos con amigos y salía más. Ahora casi no tengo ganas.

Terapeuta: ¿Cómo han cambiado tus relaciones?

Paciente: Me he ido aislando. Me cuesta seguir conversaciones y prefiero quedarme en la casa.

Terapeuta: ¿Cómo ha reaccionado tu familia ante estos cambios?

Paciente: Mi mamá dice que me nota diferente... más callado y encerrado.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo fue tu infancia?

Paciente: Bastante estable. Mi mamá siempre estuvo muy pendiente de mí.

Terapeuta: ¿Cómo era tu relación con ella?

Paciente: Muy cercana. Siempre ha sido bastante protectora.

Terapeuta: ¿Cómo fue tu funcionamiento durante la escuela y la adolescencia?

Paciente: Bastante normal. Tenía amigos, estudiaba bien y nunca tuve problemas como estos.

Terapeuta: Mirando hacia atrás, ¿sentís que estos cambios aparecieron de forma relativamente reciente?

Paciente: Sí. Antes me sentía completamente diferente.

Terapeuta: ¿Recordás algún acontecimiento importante antes de que comenzaran estos cambios?

Paciente: Más presión en el trabajo y muchas preocupaciones sobre independizarme.

Terapeuta: Antes de terminar, quisiera conocer un poco sobre tu salud. ¿Tenés alguna enfermedad importante o recibís tratamiento médico actualmente?

Paciente: No. En general mi salud ha sido buena y no tomo medicamentos.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No... nunca.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: Sí... un tío por parte de mi papá estuvo internado hace muchos años por un problema psiquiátrico, pero nunca me explicaron exactamente qué tenía.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?

Paciente: Tomo alcohol ocasionalmente. No consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar con este proceso?

Paciente: Quisiera entender qué me está pasando y volver a sentir que puedo confiar en mi propia mente.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi mente ya no interpreta las cosas igual que antes... y eso me asusta porque no sé qué parte de lo que percibo es real.`,
},
  {
  id: 27,
  titulo: "Caso 28",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Laura Méndez Solano, tengo 32 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7241-6895 y mi correo es laura.mendez32@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Contaduría Pública.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy contadora en una empresa mediana desde hace cinco años. Manejo información financiera y cierres contables. Siempre me ha gustado ser ordenada y detallista, pero últimamente siento que mi mente no logra desconectarse de la idea de que algo podría salir mal.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy casada y vivo con mi esposo desde hace tres años.

Terapeuta: Laura, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Siento que no puedo dejar de preocuparme. Mi mente siempre está imaginando posibles problemas, incluso cuando todo parece estar bien.

Terapeuta: ¿Desde cuándo notás que esto aumentó de intensidad?

Paciente: Siempre he sido preocupada, pero desde hace unos dos años siento que ya no puedo controlar esos pensamientos.

Terapeuta: ¿Cómo suelen desarrollarse esas preocupaciones?

Paciente: Empiezan con algo pequeño y terminan convirtiéndose en una cadena enorme de posibles consecuencias.

Terapeuta: ¿Podrías darme un ejemplo reciente?

Paciente: Hace unos días envié un informe financiero. Lo había revisado varias veces, pero después pensé que tal vez había cometido un error. Pasé casi toda la noche repasándolo mentalmente y al día siguiente volví a revisarlo. Al final no tenía ningún error.

Terapeuta: ¿Qué pasa cuando intentás convencerte de que todo está bien?

Paciente: Funciona por unos minutos, pero después aparece una nueva duda.

Terapeuta: ¿Qué sentís físicamente cuando eso ocurre?

Paciente: Mucha tensión en el cuello y los hombros, inquietud, el corazón acelerado y dificultad para relajarme, especialmente por las noches.

Terapeuta: ¿Cómo ha afectado esto tu vida cotidiana?

Paciente: Me siento agotada. Es como vivir en estado de alerta todo el tiempo.

Terapeuta: ¿Cómo ha influido esto en tu trabajo?

Paciente: Sigo cumpliendo, pero me toma mucho más tiempo terminar las tareas porque reviso todo demasiadas veces.

Terapeuta: ¿Has recibido comentarios en el trabajo sobre esto?

Paciente: Sí. Mi jefe me dice que mi trabajo es bueno, pero que a veces me tardo demasiado en entregar los informes.

Terapeuta: ¿Cómo son actualmente tus relaciones personales?

Paciente: Son buenas, aunque creo que mi forma de preocuparme termina afectando a quienes viven conmigo.

Terapeuta: ¿De qué manera?

Paciente: Le pregunto muchas veces a mi esposo si todo está bien o si cree que hice algo correctamente. Busco mucha tranquilidad.

Terapeuta: ¿Qué ocurre si no obtenés esa confirmación?

Paciente: Me quedo pensando en eso durante horas.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo era tu infancia?

Paciente: Siempre fui una niña muy responsable y perfeccionista.

Terapeuta: ¿Cómo era el ambiente en casa?

Paciente: Mi mamá era bastante ansiosa. Siempre estaba anticipando problemas y revisándolo todo.

Terapeuta: ¿Cómo influyó eso en vos?

Paciente: Creo que aprendí a ver el mundo como un lugar donde siempre hay algo que puede salir mal.

Terapeuta: ¿Cómo se manejaban los errores en tu familia?

Paciente: No había castigos fuertes, pero sí mucha importancia a no equivocarse.

Terapeuta: ¿Cómo fue tu experiencia durante la escuela?

Paciente: Me iba muy bien académicamente, pero revisaba los trabajos muchas veces antes de entregarlos.

Terapeuta: ¿Cómo reaccionabas cuando cometías un error?

Paciente: Me costaba mucho dejar de pensar en eso. Podía pasar varios días dándole vueltas.

Terapeuta: Mirando tu historia, ¿sentís relación entre esa forma de funcionar y lo que vivís actualmente?

Paciente: Sí. Es exactamente la misma forma de pensar, solo que ahora se ha extendido a casi todos los aspectos de mi vida.

Terapeuta: Antes de terminar, quisiera conocer un poco sobre tu salud. ¿Tenés alguna enfermedad importante o recibís tratamiento médico actualmente?

Paciente: No. Mi salud en general ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No... esta es la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: Mi mamá siempre ha sido muy ansiosa, aunque nunca recibió tratamiento.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?

Paciente: Tomo alcohol solo de forma social y no consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar con este proceso terapéutico?

Paciente: Me gustaría aprender a confiar más en mí misma y poder descansar sin que mi mente esté buscando problemas todo el tiempo.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que mi mente nunca deja de anticipar problemas y eso me mantiene agotada física y emocionalmente.`,
},
{
  id: 28,
  titulo: "Caso 29",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Gabriel Herrera Solano, tengo 27 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7234-8165 y mi correo es gabriel.herrera27@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Enseñanza del Inglés.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy profesor de inglés en un instituto privado. Llevo unos tres años trabajando ahí y disfruto mucho enseñar, aunque últimamente siento que toda esta situación emocional me está afectando también en el trabajo.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo desde hace aproximadamente un año.

Terapeuta: Gabriel, ¿qué ha estado pasando en tu vida para que decidieras buscar ayuda en este momento?

Paciente: Me siento agotado emocionalmente. Es como si llevara muchos años viviendo dos versiones de mí mismo.

Terapeuta: ¿A qué te referís con vivir dos versiones de vos mismo?

Paciente: Hay personas con las que puedo ser quien realmente soy, pero con mi familia, especialmente con mi papá, siento que tengo que esconder una parte muy importante de mí.

Terapeuta: ¿Qué es lo que sentís que no podés expresar delante de él?

Paciente: Que soy gay.

Terapeuta: ¿Desde cuándo tenés claridad sobre eso?

Paciente: Desde hace varios años. Nunca ha sido una duda para mí.

Terapeuta: ¿Qué es lo que más temés que ocurra si él llega a saberlo?

Paciente: Que me rechace... que me vea como una decepción... o que la relación termine rompiéndose por completo.

Terapeuta: ¿Qué experiencias te hacen pensar que esa reacción podría ocurrir?

Paciente: Durante muchos años hizo comentarios sobre cómo debía ser un hombre, sobre personas homosexuales y sobre lo que él considera correcto. Nunca hablaba de mí directamente, pero yo sentía que esos mensajes también iban dirigidos hacia mí.

Terapeuta: ¿Cómo ha impactado eso en tu vida cotidiana?

Paciente: Vivo anticipando situaciones. Antes de una reunión familiar empiezo a pensar qué puedo decir, qué no puedo decir, cómo comportarme.

Terapeuta: ¿Cómo se manifiesta esa tensión en vos?

Paciente: Mucha tensión en el pecho y el estómago. Me cuesta dormir antes de ver a mi familia y después termino completamente agotado.

Terapeuta: ¿Tu mamá conoce esta parte de tu vida?

Paciente: Sí. Hace unos dos años se lo conté.

Terapeuta: ¿Cómo reaccionó?

Paciente: Mejor de lo que esperaba. Le costó procesarlo al principio, pero nunca me rechazó.

Terapeuta: ¿Cómo describirías actualmente la relación con tu papá?

Paciente: Distante. Siempre fue un padre responsable, pero emocionalmente muy rígido.

Terapeuta: ¿Cómo fue crecer con esa figura?

Paciente: Sentía que existía una única manera correcta de ser hombre y que cualquier diferencia podía ser motivo de crítica.

Terapeuta: ¿Cómo te hacía sentir eso cuando eras niño?

Paciente: Vigilado. Como si constantemente tuviera que controlar cómo hablaba, cómo actuaba o cómo me expresaba.

Terapeuta: ¿Qué papel tenía tu mamá dentro de esa dinámica familiar?

Paciente: Era mucho más cálida, pero evitaba confrontar a mi papá. Siempre trataba de mantener la paz.

Terapeuta: ¿Cómo fue tu experiencia durante la escuela y la adolescencia?

Paciente: Siempre fui responsable y buen estudiante, pero internamente me sentía muy solo. Aprendí a ocultar muchas partes de mí para evitar rechazo.

Terapeuta: ¿Cómo ha impactado todo esto en tus relaciones de pareja?

Paciente: Muchísimo. Siempre llega un momento donde siento que mi vida está dividida y eso termina afectando la relación.

Terapeuta: ¿Cómo te ves actualmente frente a esta situación?

Paciente: Muy cansado de esconderme, pero todavía con mucho miedo.

Terapeuta: Antes de terminar, quisiera conocer un poco sobre tu salud. ¿Tenés alguna enfermedad importante o recibís tratamiento médico actualmente?

Paciente: No. Mi salud física ha sido buena y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No... esta sería la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: No que yo sepa.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?

Paciente: Tomo alcohol solo de manera ocasional y no consumo otras sustancias.

Terapeuta: ¿Qué esperás que pueda cambiar a partir de este proceso terapéutico?

Paciente: Me gustaría dejar de vivir con tanto miedo y poder tomar decisiones pensando en mi bienestar y no únicamente en las expectativas de los demás.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que he pasado demasiados años escondiendo una parte esencial de quién soy y ya no quiero seguir viviendo dividido.`,
},
{
  id: 29,
  titulo: "Caso 30",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Andrea Vargas Castillo, tengo 34 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7245-1839 y mi correo es andrea.vargas34@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy licenciada en Enfermería.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy enfermera en un hospital público. Llevo casi diez años trabajando ahí. Es un trabajo que siempre me ha gustado porque siento que puedo ayudar, pero también es bastante exigente emocionalmente… y últimamente siento que ya no logro desconectarme ni siquiera cuando salgo del turno.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltera y vivo con mi hermana menor.

Terapeuta: Andrea, ¿qué ha estado pasando para que decidieras buscar ayuda en este momento?

Paciente: Me siento constantemente culpable… pero no es algo puntual, es como una sensación que está casi todo el tiempo.

Terapeuta: ¿Puedes darme un ejemplo reciente?

Paciente: Sí… hace unos días una paciente se complicó. Yo hice todo lo que correspondía, incluso el médico me dijo que actué bien, pero no podía dejar de pensar que tal vez pude haber hecho algo más.

Terapeuta: ¿Qué tipo de pensamientos aparecen en esos momentos?

Paciente: "Debiste haberlo hecho mejor", "si hubieras estado más atenta esto no pasaba", "tal vez no eres tan buena como crees".

Terapeuta: ¿Cómo te hacen sentir esos pensamientos?

Paciente: Muy pesada… como si cargara algo encima todo el tiempo. También tristeza y mucha culpa.

Terapeuta: ¿Qué notas en tu cuerpo cuando eso ocurre?

Paciente: Mucha tensión en el pecho, suspiro constantemente y siento que nunca termino de relajarme.

Terapeuta: Mencionaste que a veces la culpa aparece incluso sin un motivo claro. ¿Cómo sucede eso?

Paciente: Es como un fondo permanente… siempre encuentro algo del pasado que podría haber hecho diferente.

Terapeuta: ¿Qué tipo de recuerdos aparecen con mayor frecuencia?

Paciente: Muchos tienen que ver con mi mamá y con su enfermedad antes de fallecer.

Terapeuta: Cuéntame un poco sobre esa etapa.

Paciente: Ella estuvo enferma durante varios años. Yo era quien más la acompañaba, pero también trabajaba mucho y no siempre podía estar presente.

Terapeuta: ¿Qué sientes cuando recuerdas ese periodo?

Paciente: Que no hice suficiente… que pude haber estado más tiempo con ella.

Terapeuta: ¿Hay algún momento específico que vuelva con frecuencia?

Paciente: Sí… el día que falleció. Yo no estaba con ella porque me había ido a descansar después de varios días acompañándola.

Terapeuta: ¿Qué significado tiene eso para vos hoy?

Paciente: Que fallé como hija… aunque racionalmente sé que estaba agotada.

Terapeuta: ¿Has podido hablar de esa culpa con alguien?

Paciente: No mucho… siento que los demás me dicen que no fue mi culpa, pero yo no logro creerlo del todo.

Terapeuta: ¿Cómo era tu relación con tu mamá?

Paciente: Muy cercana. Ella siempre estaba pendiente de nosotros y siento que yo debía responder de la misma manera.

Terapeuta: ¿Cómo era el ambiente en tu casa cuando eras niña?

Paciente: Había bastante exigencia. Mi mamá era comprensiva, pero mi papá era muy crítico cuando uno cometía errores.

Terapeuta: ¿Cómo reaccionabas vos cuando te equivocabas?

Paciente: Me afectaba muchísimo. Siempre intentaba compensar y hacerlo perfecto la siguiente vez.

Terapeuta: ¿Notas alguna relación entre esa forma de funcionar y lo que te ocurre actualmente?

Paciente: Sí… siento que esa exigencia nunca desapareció. Ahora está dentro de mí.

Terapeuta: ¿Cómo ha impactado esto tus relaciones personales?

Paciente: Siempre estoy pendiente de no fallar, de no incomodar a los demás. Si siento que hice algo mal, puedo pasar días pensando en eso.

Terapeuta: ¿Te cuesta reconocer las cosas que haces bien?

Paciente: Muchísimo. Lo bueno dura poco en mi cabeza… los errores permanecen mucho más tiempo.

Terapeuta: Antes de finalizar, quisiera conocer un poco sobre tu salud. ¿Tenés alguna enfermedad importante o recibís tratamiento médico actualmente?

Paciente: No. Mi salud física en general ha sido buena.

Terapeuta: ¿Has recibido atención psicológica o psiquiátrica anteriormente?

Paciente: No… esta sería la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: No que yo conozca.

Terapeuta: ¿Consumís alcohol, tabaco u otra sustancia?

Paciente: Tomo alcohol ocasionalmente en reuniones familiares, pero nada más.

Terapeuta: ¿Qué esperás conseguir con este proceso terapéutico?

Paciente: Me gustaría dejar de sentir que todo depende de mí y poder tratarme con un poco más de compasión.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Siento que vivo con una deuda emocional constante… como si siempre hubiera algo que corregir y nunca pudiera sentir que hice suficiente.`,
},
{
  id: 30,
  titulo: "Caso 31",
  transcripcion: `Terapeuta: Antes de comenzar, me gustaría registrar algunos datos generales. ¿Cuál es tu nombre completo y cuántos años tienes?

Paciente: Me llamo Esteban Rojas Calderón, tengo 35 años.

Terapeuta: ¿Me podrías brindar un número de teléfono y un correo electrónico de contacto?

Paciente: Claro. Mi número es 7284-1652 y mi correo es esteban.rojas35@example.com.

Terapeuta: ¿Cuál fue el último grado académico que completaste?

Paciente: Soy bachiller universitario en Ingeniería en Sistemas.

Terapeuta: ¿A qué te dedicas actualmente?

Paciente: Soy desarrollador de software. Trabajo de forma remota para una empresa extranjera. Paso la mayor parte del tiempo en casa, trabajando o en proyectos personales.

Terapeuta: ¿Cuál es tu estado civil y con quién vivís actualmente?

Paciente: Estoy soltero y vivo solo desde hace varios años.

Terapeuta: Esteban, ¿qué hizo que decidieras venir a consulta en este momento?

Paciente: No es algo muy claro… no siento que haya un problema puntual. Más bien fue una sugerencia de mi hermana. Ella dice que soy demasiado aislado y que debería relacionarme más.

Terapeuta: ¿Vos cómo percibís esa preocupación que ella tiene?

Paciente: Entiendo por qué lo dice, pero honestamente no siento que eso sea un problema para mí.

Terapeuta: ¿Cómo describirías actualmente tu forma de relacionarte con otras personas?

Paciente: Bastante limitada si la comparo con la mayoría. Hablo con colegas por trabajo y con una o dos personas de vez en cuando, pero no busco tener un círculo social grande.

Terapeuta: ¿Eso te genera algún tipo de malestar o sensación de soledad?

Paciente: No. De hecho, cuando tengo demasiada interacción social termino sintiéndome saturado.

Terapeuta: ¿Qué tipo de actividades disfrutás cuando tenés tiempo para vos?

Paciente: Programar, leer, investigar sobre tecnología o filosofía… y simplemente estar tranquilo.

Terapeuta: ¿Cómo describirías la manera en que experimentás tus emociones?

Paciente: Están ahí, pero no suelen ser muy intensas. Generalmente reacciono de una forma bastante estable.

Terapeuta: ¿Qué suele pasar cuando vivís situaciones importantes, como pérdidas o conflictos?

Paciente: Las proceso internamente. No soy de expresar mucho lo que siento.

Terapeuta: ¿Podrías darme un ejemplo?

Paciente: Cuando falleció mi abuelo. Todos estaban muy afectados, llorando… yo entendía lo que estaba pasando, pero preferí estar solo y seguir con mis actividades después.

Terapeuta: ¿Cómo reaccionaron las personas cercanas ante eso?

Paciente: Algunos pensaron que era indiferente, pero simplemente esa no es mi manera de expresar las cosas.

Terapeuta: ¿Has tenido relaciones de pareja?

Paciente: Sí, pero pocas y ninguna ha durado mucho.

Terapeuta: ¿Qué pensás que ha influido en eso?

Paciente: Las otras personas suelen esperar más cercanía emocional de la que me nace ofrecer naturalmente.

Terapeuta: ¿Sentís que te gustaría construir una relación más cercana con alguien?

Paciente: No especialmente. Si ocurre está bien, pero no siento que sea una necesidad.

Terapeuta: Me gustaría conocer un poco más sobre tu historia. ¿Cómo era el ambiente en tu casa cuando crecías?

Paciente: Bastante tranquilo y organizado. Mi papá era muy enfocado en el trabajo y poco expresivo. Mi mamá era más cercana, pero respetaba mucho mi espacio.

Terapeuta: ¿Cómo describirías la relación con ellos durante tu infancia?

Paciente: Buena. Cumplían con todo, pero no éramos muy demostrativos emocionalmente.

Terapeuta: ¿Cómo eras vos cuando eras niño?

Paciente: Bastante independiente. Prefería jugar solo y eso nunca me molestó.

Terapeuta: ¿Cómo fue tu experiencia durante la escuela?

Paciente: Me iba bien académicamente. Tenía compañeros, pero nunca sentí la necesidad de tener amistades muy cercanas.

Terapeuta: ¿En algún momento deseaste integrarte más socialmente?

Paciente: No realmente. Veía que otros disfrutaban eso, pero yo estaba cómodo como estaba.

Terapeuta: ¿Cómo describirías tu mundo interno?

Paciente: Muy activo. Pienso mucho, analizo cosas y tengo intereses muy específicos, aunque no siento necesidad de compartirlos constantemente.

Terapeuta: ¿Sentís que las personas suelen comprenderte?

Paciente: No siempre, pero tampoco me preocupa demasiado.

Terapeuta: Antes de finalizar, quisiera conocer un poco sobre tu salud. ¿Tenés actualmente alguna enfermedad importante o recibís algún tratamiento médico?

Paciente: No. En general gozo de buena salud y no tomo medicamentos de forma permanente.

Terapeuta: ¿Habías recibido anteriormente atención psicológica o psiquiátrica?

Paciente: No, esta sería la primera vez.

Terapeuta: ¿Conocés antecedentes de problemas psicológicos o psiquiátricos en tu familia?

Paciente: No que yo sepa.

Terapeuta: ¿Cómo es actualmente tu consumo de alcohol, tabaco u otras sustancias?

Paciente: Muy ocasional. Tomo algo en reuniones sociales, pero no fumo ni consumo otras sustancias.

Terapeuta: ¿Qué esperás obtener de este proceso terapéutico?

Paciente: Principalmente entender si mi forma de vivir realmente representa un problema o simplemente es diferente a la de otras personas.

Terapeuta: Si tuvieras que resumir en una frase lo que estás viviendo, ¿cómo lo describirías?

Paciente: Diría que funciono bien en mi vida, pero desde una forma más aislada de lo que la mayoría espera. No siento un malestar claro por eso, aunque reconozco que mi manera de relacionarme es distinta.`,
},
];

module.exports = CASOS_INFORME_CLINICO;
