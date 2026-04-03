// server/data/casosInformeClinico.js
// Banco de casos clínicos para el ejercicio "Informe clínico".
// El estudiante recibe uno al azar sin repetir hasta agotar todos.
// Cada caso tiene: id (índice 0-based), titulo, transcripcion.

const CASOS_INFORME_CLINICO = [
  {
    id: 0,
    titulo: "Caso 1 — Ansiedad generalizada",
    transcripcion: `Terapeuta: Buenas tardes. ¿Cómo te has sentido esta semana?
Paciente: Más o menos. Sigo sin dormir bien. Me despierto a las tres de la mañana y ya no puedo volver a dormirme.
Terapeuta: ¿Qué pasa por tu mente cuando te despiertas a esa hora?
Paciente: Empiezo a pensar en el trabajo, en las deudas, en si le pasa algo a mis hijos. No puedo parar.
Terapeuta: ¿Cuánto tiempo llevas con este problema de sueño?
Paciente: Unos ocho meses, más o menos desde que me cambiaron de puesto en el trabajo. Me pusieron a cargo de un equipo y desde entonces todo empeoró.
Terapeuta: ¿Cómo describirías tu nivel de preocupación en general, no solo por el trabajo?
Paciente: Constante. Me preocupo por todo. Por si mi mamá está bien, por si el carro va a fallar, por si mis hijos están haciendo las tareas. Es agotador.
Terapeuta: ¿Has tenido síntomas físicos? Dolores de cabeza, tensión muscular, algo así.
Paciente: Sí, tengo el cuello muy tenso todo el tiempo. Y a veces me duele el estómago antes de reuniones importantes.
Terapeuta: ¿Hay momentos en el día en que te sientas tranquilo?
Paciente: Muy pocos. Tal vez cuando veo televisión por la noche, pero incluso ahí me pongo a revisar el correo del trabajo.
Terapeuta: ¿Has hablado con alguien sobre cómo te sientes, tu pareja, un amigo?
Paciente: No mucho. Mi esposa dice que me ve estresado pero no sabe la magnitud. No quiero preocuparla.
Terapeuta: Entiendo. ¿Cuántos años tienes y a qué te dedicas exactamente?
Paciente: Tengo 38 años. Soy supervisor de ventas en una empresa de distribución. Tengo a cargo ocho personas.
Terapeuta: ¿Cuánto tiempo llevas en esa empresa?
Paciente: Doce años. Antes me gustaba el trabajo, pero ahora siento que no doy abasto.
Terapeuta: ¿Alguna vez has tenido episodios similares en el pasado, o esta es la primera vez?
Paciente: Algo parecido tuve cuando terminé la universidad, pero menos intenso. Se me pasó solo.
Terapeuta: ¿Estás tomando algún medicamento o has consultado con un médico?
Paciente: Fui al médico hace dos meses y me dijo que era estrés. Me recetó algo para dormir pero no lo tomé porque no quiero depender de pastillas.
Terapeuta: ¿Cómo impacta todo esto en tu vida familiar y social?
Paciente: Casi no salgo. Los fines de semana me quedo en casa. Mis amigos han dejado de llamarme porque siempre cancelo.`,
  },
  {
    id: 1,
    titulo: "Caso 2 — Episodio depresivo mayor",
    transcripcion: `Terapeuta: ¿Cómo llegaste aquí hoy?
Paciente: Mi hermana me trajo. Yo no habría venido sola.
Terapeuta: ¿Por qué dice eso?
Paciente: Porque no tengo energía para nada. Salir de la cama ya es un logro.
Terapeuta: ¿Cuánto tiempo llevas sintiéndote así?
Paciente: Desde hace como tres meses. Después de que perdí el trabajo.
Terapeuta: ¿Qué pasó con el trabajo?
Paciente: Me despidieron. Dijeron que era reestructuración pero creo que fue por mí. Soy diseñadora gráfica, llevaba cuatro años ahí.
Terapeuta: ¿Cómo fue eso para usted?
Paciente: Devastador. Ese trabajo era todo para mí. Me sentía útil, capaz. Ahora no soy nada.
Terapeuta: ¿Cómo está su sueño?
Paciente: Duermo demasiado. A veces doce horas y me despierto más cansada. O no duermo nada y me la paso mirando el techo.
Terapeuta: ¿Ha podido comer bien?
Paciente: No. Casi no tengo hambre. He bajado como seis kilos.
Terapeuta: ¿Hay cosas que antes le gustaban y ahora ya no?
Paciente: Todo. Antes pintaba, leía, salía con amigas. Ahora nada me llama la atención. La semana pasada mi mejor amiga cumplió años y no fui.
Terapeuta: ¿Ha tenido pensamientos de hacerse daño o de que sería mejor no estar?
Paciente: A veces pienso que todos estarían mejor sin mí. No he pensado en nada concreto, pero sí siento que soy una carga.
Terapeuta: Gracias por contarme eso. ¿Con quién vive actualmente?
Paciente: Sola. Mis papás viven en otra ciudad.
Terapeuta: ¿Tiene red de apoyo aquí, amistades, familia cerca?
Paciente: Mi hermana, que vive a veinte minutos. Y una amiga, pero siento que ya la canso.
Terapeuta: ¿Cuántos años tiene y cómo describiría su salud en general antes de esto?
Paciente: Tengo 29 años. Antes era activa, hacía ejercicio. Ahora no puedo ni imaginarme salir a caminar.`,
  },
  {
    id: 2,
    titulo: "Caso 3 — Trastorno de pánico",
    transcripcion: `Terapeuta: Cuénteme qué lo trajo a consulta.
Paciente: Hace seis semanas tuve lo que yo creí que era un infarto. Estaba en el supermercado y de repente el corazón se me aceleró, me sudaron las manos, sentí que me iba a desmayar. Llamaron a la ambulancia.
Terapeuta: ¿Qué encontraron en el hospital?
Paciente: Dijeron que el corazón estaba perfecto. Que era ansiedad. Pero yo no les creo del todo.
Terapeuta: ¿Ha vuelto a tener episodios parecidos?
Paciente: Sí, tres veces más. Siempre en lugares públicos. Ya no quiero salir.
Terapeuta: ¿Puede describirme lo que siente durante esos episodios?
Paciente: El corazón se dispara, siento que me falta el aire, me hormiguean las manos y los pies. Siento que voy a morir o que voy a perder la razón.
Terapeuta: ¿Cuánto dura cada episodio?
Paciente: Unos diez minutos, pero se sienten eternos.
Terapeuta: ¿Qué hace cuando empieza uno?
Paciente: Trato de salir del lugar o me siento en el suelo. Llamo a mi esposa.
Terapeuta: ¿Hay lugares que esté evitando ahora?
Paciente: El supermercado, el centro comercial, el transporte público. La semana pasada no fui al trabajo porque me da miedo que me pase algo en el camino.
Terapeuta: ¿Cómo impacta eso en su vida cotidiana?
Paciente: Mucho. Trabajo en ventas y necesito salir. Pero mi jefe ya me preguntó qué me pasa.
Terapeuta: ¿Tiene miedo de que le vuelva a pasar incluso cuando está tranquilo?
Paciente: Todo el tiempo. Estoy pendiente de mi corazón constantemente. Si siento que late un poco más rápido ya me alarmo.
Terapeuta: ¿Cuántos años tiene y tiene antecedentes de salud mental o enfermedades físicas?
Paciente: 34 años. Nunca había tenido nada así. Soy bastante sano, hago ejercicio.
Terapeuta: ¿Hay algo que haya cambiado en su vida antes de que comenzaran estos episodios?
Paciente: Mi papá tuvo un infarto real dos meses antes. Se recuperó, pero fue muy asustador.`,
  },
  {
    id: 3,
    titulo: "Caso 4 — Duelo complicado",
    transcripcion: `Terapeuta: ¿Qué la trae a consulta hoy?
Paciente: Perdí a mi esposo hace ocho meses. Un accidente de tráfico. Y no... no estoy bien.
Terapeuta: Lo siento mucho. ¿Cómo ha sido este tiempo para usted?
Paciente: Un caos. Al principio estaba en piloto automático, organizando el funeral, atendiendo a la gente. Cuando todos se fueron, me derrumbé.
Terapeuta: ¿Cómo está ahora, ocho meses después?
Paciente: Igual o peor. Todo el mundo dice que ya debería estar mejor. Pero yo me levanto y lo primero que pienso es en él. Busco su olor en la ropa.
Terapeuta: ¿Puede contarme cómo era su relación?
Paciente: Llevábamos veintidós años juntos. Era mi mejor amigo. Teníamos planes, íbamos a viajar cuando los hijos fueran grandes.
Terapeuta: ¿Tiene hijos?
Paciente: Dos. Uno de 17 y uno de 14. Trato de estar bien por ellos pero a veces no puedo.
Terapeuta: ¿Hay momentos en que siente que no puede más?
Paciente: Sí. A veces pienso que no tiene sentido seguir. Aunque no haría nada, mis hijos me necesitan.
Terapeuta: ¿Ha podido hablar con alguien de confianza sobre cómo se siente?
Paciente: Con mi hermana algo. Pero siento que la canso. Ya son ocho meses y la gente espera que uno siga adelante.
Terapeuta: ¿Cómo está su sueño, su apetito, su energía?
Paciente: Duermo poco. Como lo justo. Me cuesta hacer las cosas de la casa que antes hacía sin pensar.
Terapeuta: ¿Ha podido retomar actividades que antes disfrutaba?
Paciente: No. Dejé de ir al gimnasio, de ver a mis amigas. La vida se siente vacía.
Terapeuta: ¿Cuántos años tiene y trabaja actualmente?
Paciente: 47 años. Trabajo en administración, teletrabajo. Eso me ha ayudado a no tener que salir mucho.`,
  },
  {
    id: 4,
    titulo: "Caso 5 — Fobia social",
    transcripcion: `Terapeuta: ¿Qué te trajo a consulta?
Paciente: Llevo toda la vida evitando situaciones sociales pero ya no puedo más. Empecé un trabajo nuevo y hay reuniones y no sé cómo manejarlo.
Terapeuta: ¿Qué pasa cuando tienes que estar en una reunión?
Paciente: Me pongo rojo, me tiemblan las manos, siento que todos me miran y que voy a decir algo estúpido. A veces me bloqueo y no puedo hablar.
Terapeuta: ¿Desde cuándo te pasa esto?
Paciente: Siempre, desde la secundaria. Era muy tímido. Mis compañeros se burlaban de que me ponía rojo cuando me preguntaban algo.
Terapeuta: ¿Son solo las reuniones o hay otras situaciones que te generan eso?
Paciente: Comer con gente que no conozco bien. Hablar por teléfono. Entrar a un lugar donde hay mucha gente. Firmar delante de alguien.
Terapeuta: ¿Cómo lo manejas normalmente?
Paciente: Evito lo que puedo. En el trabajo anterior pedía home office siempre. Pero este nuevo empleo requiere presencia.
Terapeuta: ¿Tienes amigos, pareja, vida social?
Paciente: Tengo dos amigos de la infancia. Nada más. Sin pareja, nunca he tenido una relación seria porque conocer a alguien nuevo me paraliza.
Terapeuta: ¿Qué crees que pasaría si la gente te viera ponerte nervioso?
Paciente: Que pensarían que soy raro, incompetente, que no debería estar en ese trabajo.
Terapeuta: ¿Cuántos años tienes?
Paciente: 27 años. Soy ingeniero de sistemas.
Terapeuta: ¿Hay algo que hagas antes de una situación social que te ayude o que empeore las cosas?
Paciente: La anticipo demasiado. Días antes ya estoy pensando en lo que puede salir mal. Y después repaso todo lo que hice mal.`,
  },
  {
    id: 5,
    titulo: "Caso 6 — Trastorno adaptativo por separación",
    transcripcion: `Terapeuta: ¿Qué te trajo aquí?
Paciente: Mi pareja y yo terminamos hace tres meses y no logro superarlo. Mis amigos dicen que ya es mucho tiempo pero yo sigo igual.
Terapeuta: ¿Cuánto tiempo estuvieron juntos?
Paciente: Cuatro años. Vivíamos juntos. El apartamento era de los dos.
Terapeuta: ¿Cómo fue la separación?
Paciente: Ella decidió terminar. Dijo que ya no sentía lo mismo. No hubo una pelea grande, fue de un día para otro casi.
Terapeuta: ¿Cómo te has sentido desde entonces?
Paciente: Al principio no lo podía creer. Después vino una tristeza enorme. Ahora hay días buenos y días en que no quiero levantarme.
Terapeuta: ¿Sigues teniendo contacto con ella?
Paciente: La sigo en redes sociales aunque sé que no debería. La semana pasada vi fotos de ella con otra persona y fue horrible.
Terapeuta: ¿Cómo está afectando esto tu vida diaria?
Paciente: Me cuesta concentrarme en el trabajo. He cometido errores que antes no cometía. Mi jefe me llamó la atención.
Terapeuta: ¿Qué extrañas más de la relación?
Paciente: La compañía. Llegar a casa y que hubiera alguien. Las rutinas que teníamos. Los domingos cocinando juntos.
Terapeuta: ¿Tienes apoyo social, amigos, familia?
Paciente: Sí, pero siento que ya los canso con el tema. Mis amigos dicen que me olvide de ella y siga adelante, pero no es tan fácil.
Terapeuta: ¿Has tenido en algún momento pensamientos de hacerte daño?
Paciente: No, nada de eso. Solo tristeza.
Terapeuta: ¿Cuántos años tienes y a qué te dedicas?
Paciente: 31 años. Trabajo en contabilidad en una empresa mediana.`,
  },
  {
    id: 6,
    titulo: "Caso 7 — Estrés postraumático (accidente laboral)",
    transcripcion: `Terapeuta: ¿Qué lo trae a consulta?
Paciente: Tuve un accidente en el trabajo hace cuatro meses. Una máquina me atrapó la mano. Me operaron, ya está mejor físicamente, pero mentalmente no estoy bien.
Terapeuta: ¿Cómo ha sido la recuperación emocional?
Paciente: Mal. No puedo dejar de ver lo que pasó. Me viene de la nada, en imágenes, como si estuviera pasando de nuevo.
Terapeuta: ¿Con qué frecuencia le pasan esas imágenes?
Paciente: Varias veces al día. Y de noche tengo pesadillas.
Terapeuta: ¿Ha podido volver al trabajo?
Paciente: Fui una semana y no aguanté. Cuando vi la máquina me paralicé. Tuve que salir corriendo.
Terapeuta: ¿Cómo reacciona su cuerpo cuando le vienen esas imágenes o cuando está cerca de algo que le recuerda el accidente?
Paciente: Me suda el cuerpo, se me acelera el corazón, me tiemblan las manos. Es como si mi cuerpo no supiera que ya pasó.
Terapeuta: ¿Ha evitado hablar del accidente o de lo que pasó?
Paciente: Con mi esposa sí hablé un poco al principio. Ahora ya no quiero hablar del tema. No quiero pensar en eso.
Terapeuta: ¿Cómo está su estado de ánimo en general?
Paciente: Irritable. Me enojo fácil con mis hijos por cosas pequeñas. No me reconozco.
Terapeuta: ¿Ha perdido interés en actividades que antes disfrutaba?
Paciente: Jugaba fútbol los sábados. Ya no voy. No tengo ganas de nada.
Terapeuta: ¿Cuántos años tiene y cuánto tiempo llevaba trabajando en esa empresa?
Paciente: 42 años. Quince años en esa empresa, nunca me había pasado algo así.`,
  },
  {
    id: 7,
    titulo: "Caso 8 — Problemas de autoestima y relaciones",
    transcripcion: `Terapeuta: ¿Qué te trajo hoy?
Paciente: Siento que siempre termino en relaciones donde me tratan mal. Y no entiendo por qué me pasa a mí.
Terapeuta: ¿Puedes contarme un poco sobre esas relaciones?
Paciente: La última pareja me era infiel y yo lo sabía pero me quedé. Antes estuve con alguien que me gritaba delante de la gente. Siempre lo justifico.
Terapeuta: ¿Qué pasaba por tu mente cuando justificabas ese comportamiento?
Paciente: Pensaba que yo tenía la culpa de alguna manera. Que si fuera mejor persona, más interesante, más bonita, no me tratarían así.
Terapeuta: ¿Desde cuándo tienes esa sensación de que no eres suficiente?
Paciente: Desde siempre, creo. En mi casa mi papá siempre comparaba a mis hermanos y a mí. Siempre salía perdiendo en la comparación.
Terapeuta: ¿Cómo era esa dinámica en casa?
Paciente: Mi hermano mayor era el inteligente, el exitoso. Yo era la que no terminó la carrera, la que siempre se equivocaba.
Terapeuta: ¿Tienes relaciones de amistad que sientas que son sanas?
Paciente: Una amiga que me quiere mucho. Pero a veces no le creo cuando me dice cosas buenas de mí. Pienso que lo dice por compromiso.
Terapeuta: ¿Cómo te sientes cuando alguien te hace un cumplido?
Paciente: Incómoda. Lo minimizo. Digo "ay, no es para tanto".
Terapeuta: ¿Actualmente estás en una relación?
Paciente: No, terminé hace seis meses. Estoy tratando de estar sola pero me angustia mucho la soledad.
Terapeuta: ¿Cuántos años tienes y a qué te dedicas?
Paciente: 33 años. Soy vendedora en una tienda de ropa. Antes estudiaba psicología pero la dejé.`,
  },
  {
    id: 8,
    titulo: "Caso 9 — Trastorno obsesivo compulsivo",
    transcripcion: `Terapeuta: ¿Qué te trajo a consulta?
Paciente: Tengo pensamientos que no puedo parar. Me toman mucho tiempo del día y ya afectan mi trabajo.
Terapeuta: ¿Puedes describirme esos pensamientos?
Paciente: Son pensamientos de que voy a contaminar a alguien, que toco algo sucio y le paso algo a mi familia. Sé que es irracional pero no puedo evitarlo.
Terapeuta: ¿Qué haces cuando tienes ese pensamiento?
Paciente: Me lavo las manos. Muchas veces. A veces hasta veinte o treinta veces al día. Las tengo irritadas.
Terapeuta: ¿Además del lavado, hay otras cosas que hagas para sentirte mejor?
Paciente: Reviso que las llaves estén cerradas antes de salir. Tres veces siempre. Y el gas. A veces doy vuelta en el camino para verificar.
Terapeuta: ¿Cuánto tiempo del día ocupan estas conductas?
Paciente: Unas tres o cuatro horas si estoy en un día malo. Me hace tarde al trabajo constantemente.
Terapeuta: ¿Hay momentos en que logres resistir el impulso de lavarte o revisar?
Paciente: Si me distraigo mucho puedo aguantar. Pero la angustia se acumula hasta que no aguanto más.
Terapeuta: ¿Desde cuándo tienes esto?
Paciente: Desde los 16 años, pero empeoró hace un año cuando tuve covid. Desde entonces el tema de la contaminación se intensificó.
Terapeuta: ¿Alguien en tu familia sabe lo que está pasando?
Paciente: Mi esposa. Trata de ayudar pero a veces se desespera. Me dice que pare y eso me angustia más.
Terapeuta: ¿Cuántos años tienes?
Paciente: 28 años. Soy maestro de primaria.`,
  },
  {
    id: 9,
    titulo: "Caso 10 — Depresión postparto",
    transcripcion: `Terapeuta: ¿Cómo estás?
Paciente: Mal. No debería estar mal porque tengo un bebé sano y un esposo que me apoya, pero estoy mal.
Terapeuta: ¿Cuándo nació tu bebé?
Paciente: Hace tres meses. Una niña.
Terapeuta: ¿Cómo has estado desde el parto?
Paciente: Las primeras semanas pensé que era el cansancio normal. Pero llevo semanas llorando sin razón, sintiéndome incapaz, pensando que no soy una buena madre.
Terapeuta: ¿Puedes contarme más sobre ese pensamiento de no ser buena madre?
Paciente: A veces cuando ella llora y no sé qué quiere, siento que no debí haber tenido un hijo. Eso me da mucha culpa.
Terapeuta: ¿Has tenido pensamientos de hacerte daño a ti o a tu bebé?
Paciente: No, de hacerle daño a ella jamás. A mí misma a veces pienso que desaparecería y todo sería más fácil, pero no haría nada.
Terapeuta: ¿Tienes apoyo en casa?
Paciente: Mi esposo trabaja pero cuando llega ayuda. Mi mamá viene dos veces por semana. Pero yo me siento sola igual.
Terapeuta: ¿Cómo estás durmiendo?
Paciente: Poco, por la niña. Pero cuando ella duerme yo no puedo. Me quedo pensando que algo le va a pasar.
Terapeuta: ¿Disfrutas de momentos con tu bebé?
Paciente: A veces. Hay momentos en que la veo y me derrito. Pero también hay momentos en que la veo y no siento nada y eso me aterra.
Terapeuta: ¿Tuviste algún antecedente de depresión o ansiedad antes del embarazo?
Paciente: Un episodio depresivo a los 22 años, después de que murió mi papá. Me atendí un tiempo y mejoré.
Terapeuta: ¿Cuántos años tienes?
Paciente: 31 años. Era enfermera pero estoy de licencia.`,
  },
  {
    id: 10,
    titulo: "Caso 11 — Burnout profesional",
    transcripcion: `Terapeuta: ¿Qué lo trajo hoy?
Paciente: Mi médico me dijo que viniera. Me dio una incapacidad de dos semanas por agotamiento. Pero yo no creo que sea para tanto.
Terapeuta: ¿Cómo ha sido su trabajo en los últimos meses?
Paciente: Muy exigente. Soy médico de urgencias. Desde la pandemia no hemos recuperado el ritmo normal. Seguimos con el doble de carga.
Terapeuta: ¿Cuántas horas trabaja por semana aproximadamente?
Paciente: Unas setenta. A veces más si hay emergencias.
Terapeuta: ¿Cómo se siente cuando está en el trabajo?
Paciente: Vacío. Antes me gustaba lo que hacía, sentía que marcaba la diferencia. Ahora solo quiero que el turno termine.
Terapeuta: ¿Ha notado cambios en cómo trata a sus pacientes?
Paciente: Eso es lo que más me preocupa. Me he vuelto más frío. Antes me afectaba cuando perdía un paciente. Ahora ya no tanto y eso me asusta.
Terapeuta: ¿Cómo está fuera del trabajo?
Paciente: Cuando llego a casa no tengo energía para nada. Mi esposa dice que no estoy presente aunque esté ahí.
Terapeuta: ¿Tiene actividades fuera del trabajo que disfrute?
Paciente: Antes corría. Hace seis meses que no salgo a correr.
Terapeuta: ¿Ha pensado en cambiar de especialidad o de trabajo?
Paciente: Muchas veces. Pero estudié tanto para esto. Sería un fracaso.
Terapeuta: ¿Tiene síntomas físicos? Dolor de cabeza, problemas digestivos, algo así.
Paciente: Gastritis crónica. Y migrañas frecuentes.
Terapeuta: ¿Cuántos años tiene?
Paciente: 44 años. Llevo dieciocho en medicina de urgencias.`,
  },
  {
    id: 11,
    titulo: "Caso 12 — Adolescente con ansiedad escolar",
    transcripcion: `Terapeuta: Hola. ¿Cómo estás hoy?
Paciente: Bien. Bueno, más o menos.
Terapeuta: ¿Qué significa más o menos para ti?
Paciente: Esta semana tuve que hacer una exposición en clase y casi no fui al colegio ese día.
Terapeuta: ¿Qué sentiste cuando ibas a exponer?
Paciente: Me puse a llorar en el baño antes de entrar al salón. Me daba pánico que todos se rieran o que me pusiera en blanco.
Terapeuta: ¿Pasó algo durante la exposición?
Paciente: No, salió bien. Pero igual no puedo evitar sentir eso antes.
Terapeuta: ¿Esto te pasa solo con las exposiciones o en otras situaciones del colegio también?
Paciente: Cuando me preguntan algo de sorpresa. Cuando tengo que comer en la cafetería con gente que no conozco. A veces no como nada en el receso para no tener que sentarme con alguien.
Terapeuta: ¿Tienes amigos en el colegio?
Paciente: Dos amigas. Con ellas sí me siento bien. Pero si ellas no están me quedo sola.
Terapeuta: ¿Cómo te sientes con el colegio en general?
Paciente: Me gusta aprender pero el ambiente social me agota. A veces finjo estar enferma para no ir.
Terapeuta: ¿Tus papás saben cómo te sientes?
Paciente: Mi mamá algo sabe. Dice que le pasaba lo mismo de joven y que se le pasó. Pero yo no quiero esperar a que se me pase.
Terapeuta: ¿Cuántos años tienes y en qué año estás?
Paciente: Quince años. Estoy en décimo grado.
Terapeuta: ¿Hay algo en casa que te estrese también o es principalmente el colegio?
Paciente: Mis papás pelean seguido. Eso también me pone nerviosa.`,
  },
  {
    id: 12,
    titulo: "Caso 13 — Insomnio crónico y rumiación",
    transcripcion: `Terapeuta: ¿Qué lo trae a consulta?
Paciente: No puedo dormir. Llevo dos años durmiendo cuatro o cinco horas y ya no puedo más.
Terapeuta: ¿Cómo es una noche típica para usted?
Paciente: Me acuesto a las diez y media. Me quedo mirando el techo hasta las dos o las tres. La mente no para.
Terapeuta: ¿Sobre qué piensa cuando no puede dormir?
Paciente: En todo. En el trabajo, en si tomé bien las decisiones, en conversaciones que tuve hace días. Repaso todo lo que pude haber dicho diferente.
Terapeuta: ¿Esa rumiación ocurre solo de noche o también durante el día?
Paciente: Durante el día estoy ocupado y no tanto. Pero cuando me siento quieto empieza.
Terapeuta: ¿Cómo afecta el mal sueño su funcionamiento diario?
Paciente: Estoy irritable, me cuesta concentrarme. Tengo un cargo gerencial y necesito estar al cien por ciento.
Terapeuta: ¿Ha probado algo para dormir?
Paciente: Melatonina, infusiones, dejar el celular, ejercicio. Nada funciona de forma consistente.
Terapeuta: ¿Hay algo específico que le preocupe actualmente?
Paciente: La empresa está pasando por una fusión. Hay incertidumbre sobre los puestos. Eso me tiene muy tenso aunque trato de no pensarlo.
Terapeuta: ¿Cómo diría que maneja el estrés en general?
Paciente: Mal. Soy de los que guardan todo. No me gusta hablar de mis problemas.
Terapeuta: ¿Tiene pareja, familia con quien hablar?
Paciente: Casado, tres hijos. Pero en casa trato de ser el que tiene todo bajo control.
Terapeuta: ¿Cuántos años tiene?
Paciente: 50 años. Gerente de operaciones en una multinacional.`,
  },
  {
    id: 13,
    titulo: "Caso 14 — Conflicto de identidad en joven adulto",
    transcripcion: `Terapeuta: ¿Qué te trajo hoy?
Paciente: No sé qué quiero hacer con mi vida y eso me tiene muy angustiado. Tengo 24 años y siento que debería tener todo claro.
Terapeuta: ¿Qué estás haciendo actualmente?
Paciente: Trabajo en el negocio de mi papá. Administración. Pero no me gusta.
Terapeuta: ¿Qué sería lo que te gustaría hacer?
Paciente: Arte, diseño, algo creativo. Pero mi familia dice que eso no da dinero y que estoy siendo irresponsable.
Terapeuta: ¿Cómo te sientes trabajando en el negocio de tu papá?
Paciente: Vacío. Hago las cosas bien pero no me importan. Me da miedo volverme como alguien que solo trabaja por trabajar.
Terapeuta: ¿Has podido hablar con tu familia sobre lo que sientes?
Paciente: Con mi mamá algo. Con mi papá no. Él sacrificó mucho para montar ese negocio y siento que no puedo defraudarlo.
Terapeuta: ¿Cómo está tu estado de ánimo en general?
Paciente: Bajo. Me cuesta motivarme. Los fines de semana me quedo en casa sin querer hacer nada.
Terapeuta: ¿Tienes amigos con quienes hablar?
Paciente: Sí, pero la mayoría ya tiene carrera, pareja, rumbo. Siento que me quedé atrás.
Terapeuta: ¿Cómo te ves en cinco años si sigues por el camino actual?
Paciente: Atrapado. Exitoso en papel pero por dentro igual de vacío.
Terapeuta: ¿Hay algo más que te genere angustia además de lo laboral?
Paciente: También estoy descubriendo cosas sobre mi orientación sexual que no he podido hablar con nadie. Eso también me pesa.`,
  },
  {
    id: 14,
    titulo: "Caso 15 — Adicción a pantallas y aislamiento",
    transcripcion: `Terapeuta: ¿Qué te trajo a consulta?
Paciente: Mi mamá me obligó a venir. Dice que paso demasiado tiempo en el computador y que no salgo de mi cuarto.
Terapeuta: ¿Qué piensas tú de eso?
Paciente: Que exagera. Pero también sé que algo no está bien.
Terapeuta: ¿Cuánto tiempo pasas en el computador al día?
Paciente: Unas diez horas. A veces más los fines de semana.
Terapeuta: ¿Qué haces en esas horas?
Paciente: Juego videojuegos en línea principalmente. Tengo amigos virtuales con quienes juego.
Terapeuta: ¿Tienes amigos fuera de línea, personas con quienes salgas?
Paciente: Antes tenía. Pero dejé de contestar los mensajes y dejaron de escribirme.
Terapeuta: ¿Cómo están las cosas en el colegio?
Paciente: Mal. He jalado varias materias. Antes era buen estudiante.
Terapeuta: ¿Qué pasó para que cambiara eso?
Paciente: Cuando entré a la secundaria fue difícil. Me costó adaptarme. Los videojuegos eran más fáciles, ahí sí me sentía bueno en algo.
Terapeuta: ¿Cómo te sientes cuando no puedes jugar?
Paciente: Ansioso, irritable. Pienso en cuándo voy a poder volver.
Terapeuta: ¿Hay algo que disfrutes fuera de los videojuegos?
Paciente: Antes me gustaba dibujar. Ya no lo hago.
Terapeuta: ¿Cómo está la relación con tus papás?
Paciente: Tensa. Mi papá dice que soy un vago. Mi mamá defiende pero también está preocupada.
Terapeuta: ¿Cuántos años tienes?
Paciente: 16 años. Estoy en undécimo.`,
  },
  {
    id: 15,
    titulo: "Caso 16 — Violencia doméstica (victima)",
    transcripcion: `Terapeuta: Gracias por venir. ¿Cómo estás hoy?
Paciente: Nerviosa. No le dije a mi esposo que iba a venir aquí.
Terapeuta: Está bien. Lo que hablemos aquí es confidencial. ¿Qué te motivó a buscar ayuda?
Paciente: La semana pasada me empujó contra la pared delante de mis hijos. Ya había pasado antes pero nunca así de fuerte.
Terapeuta: Lo siento mucho. ¿Estás en un lugar seguro ahora mismo?
Paciente: Sí, esta tarde él está trabajando.
Terapeuta: ¿Desde cuándo ocurren estos episodios?
Paciente: Al principio eran gritos. Después empezó a romper cosas. Hace un año comenzó a empujarme.
Terapeuta: ¿Ha habido golpes más serios?
Paciente: Dos veces me jaló del cabello. Una vez me dio una cachetada.
Terapeuta: ¿Tus hijos han presenciado estos episodios?
Paciente: A veces. Tengo dos niñas de ocho y cinco años. Me duele que lo vean.
Terapeuta: ¿Tienes red de apoyo, familia, alguien de confianza que sepa lo que está pasando?
Paciente: Mi hermana algo sospecha pero no le he dicho todo. Tengo miedo de que si lo saben hagan algo que lo enfurezca más.
Terapeuta: ¿Tienes posibilidad económica de sostenerte si decidieras salir de esa situación?
Paciente: Trabajo medio tiempo. Con eso no alcanza. Él controla la plata.
Terapeuta: ¿Cómo te sientes emocionalmente en este momento?
Paciente: Asustada. Y avergonzada. Siento que debería haberme ido antes.
Terapeuta: No es tu culpa. ¿Cuántos años tienes?
Paciente: 35 años. Llevo doce años casada.`,
  },
  {
    id: 16,
    titulo: "Caso 17 — Problemas de manejo de ira",
    transcripcion: `Terapeuta: ¿Qué te trajo a consulta?
Paciente: Mi jefe me dijo que si no busco ayuda para el tema de mi carácter me va a despedir. Tuve un altercado fuerte con un compañero.
Terapeuta: ¿Qué pasó en ese altercado?
Paciente: Me dijo algo que me pareció una irresponsabilidad y le grité. Casi fue a más.
Terapeuta: ¿Fue la primera vez que algo así pasó en el trabajo?
Paciente: No. Ya había tenido roces antes. Pero esta fue la peor.
Terapeuta: ¿Cómo describes tu carácter en general?
Paciente: Explosivo. Cuando algo me parece injusto o irresponsable no puedo callarlo. Exploto rápido y después me arrepiento.
Terapeuta: ¿Esto ocurre solo en el trabajo?
Paciente: No. Con mi familia también. Mi esposa dice que le tengo miedo a veces aunque nunca le he puesto la mano encima.
Terapeuta: ¿Cómo te sientes después de explotar?
Paciente: Avergonzado. Me disculpo pero el daño ya está hecho.
Terapeuta: ¿Recuerdas desde cuándo eres así?
Paciente: Desde joven. Mi papá era igual. En mi casa gritar era normal.
Terapeuta: ¿Hay situaciones específicas que te disparen más?
Paciente: La incompetencia, la injusticia, cuando siento que alguien no cumple su palabra.
Terapeuta: ¿Has notado señales físicas antes de explotar?
Paciente: El calor en el pecho. Me aprieto las manos. Lo noto pero no lo puedo parar.
Terapeuta: ¿Cuántos años tienes y en qué trabajas?
Paciente: 39 años. Jefe de producción en una planta manufacturera.`,
  },
  {
    id: 17,
    titulo: "Caso 18 — Trastorno de sueño en adulto mayor",
    transcripcion: `Terapeuta: Buenas tardes. ¿Cómo ha estado?
Paciente: Con los achaques de siempre. Lo que más me molesta es que no duermo.
Terapeuta: ¿Cómo es su sueño actualmente?
Paciente: Me quedo dormido en la silla viendo televisión a las ocho de la noche. Pero cuando me voy a acostar no puedo dormir. Me despierto tres o cuatro veces en la noche.
Terapeuta: ¿A qué hora se levanta?
Paciente: A las cuatro o cinco de la mañana ya no puedo seguir acostado. Me levanto aunque esté cansado.
Terapeuta: ¿Qué hace cuando no puede dormir?
Paciente: Me quedo pensando. Pienso en mi esposa que murió hace dos años. En los hijos que no me llaman mucho.
Terapeuta: ¿Me puede contar un poco sobre el fallecimiento de su esposa?
Paciente: Llevábamos 48 años juntos. Fue de un cáncer. Los últimos seis meses los cuidé yo solo. Fue muy duro.
Terapeuta: ¿Cómo está su ánimo en general?
Paciente: Solo. La casa está muy callada. Antes siempre había movimiento.
Terapeuta: ¿Ve seguido a sus hijos o nietos?
Paciente: Uno vive en el exterior. El otro viene una vez al mes más o menos. Los nietos vienen a veces.
Terapeuta: ¿Tiene actividades fuera de casa?
Paciente: Antes iba al club a jugar dominó. Dejé de ir porque sin mi esposa se siente raro.
Terapeuta: ¿Cómo está su salud física?
Paciente: Presión alta controlada, rodilla que duele. Nada grave. El médico dice que para los 74 años estoy bien.`,
  },
  {
    id: 18,
    titulo: "Caso 19 — Crisis existencial en mediana edad",
    transcripcion: `Terapeuta: ¿Qué lo trajo aquí?
Paciente: Cumplí cincuenta años el mes pasado y desde entonces no puedo dejar de pensar en que la vida se me va y no he hecho lo que quería.
Terapeuta: ¿Qué es lo que quería hacer y siente que no ha hecho?
Paciente: Ser escritor. Tengo tres novelas a medias. Siempre las pospongo por el trabajo, la familia, las responsabilidades.
Terapeuta: ¿Cómo es su vida actualmente?
Paciente: Bien en papel. Tengo un buen trabajo de abogado, estoy casado, dos hijos universitarios. Pero me siento vacío.
Terapeuta: ¿Cuándo empezó a sentir ese vacío?
Paciente: Ha sido gradual. Pero el cumpleaños lo detonó. Ver los cincuenta como una línea que cruzas y ya no hay vuelta atrás.
Terapeuta: ¿Cómo está su relación con su esposa?
Paciente: Bien, pero distante. Cada uno vive su vida. Los hijos ya no necesitan tanto. No sabemos muy bien qué somos el uno para el otro ahora.
Terapeuta: ¿Ha hablado con ella sobre lo que siente?
Paciente: Un poco. Ella dice que todo es una crisis de los cincuenta y que se me pasará.
Terapeuta: ¿Hay algo que disfrute actualmente?
Paciente: Leo mucho. Eso sí me sigue gustando. Y mis hijos, cuando los veo.
Terapeuta: ¿Ha tenido pensamientos negativos sobre su vida o futuro?
Paciente: No de hacerme daño. Pero sí de para qué tanto esfuerzo si al final todos morimos.
Terapeuta: ¿Ha consultado antes por algo similar?
Paciente: Nunca. Siempre creí que la terapia era para gente con problemas graves.`,
  },
  {
    id: 19,
    titulo: "Caso 20 — Dificultades académicas y presión familiar",
    transcripcion: `Terapeuta: Hola. ¿Cómo has estado?
Paciente: Más o menos. Tuve parciales esta semana y no me fue bien.
Terapeuta: ¿Qué pasó?
Paciente: Estudié pero en el examen me bloqueé. Se me olvidó todo lo que había estudiado.
Terapeuta: ¿Eso te pasa seguido en los exámenes?
Paciente: Sí. Este semestre ya jalé dos materias. Mis papás no saben.
Terapeuta: ¿Por qué no les has contado?
Paciente: Porque se van a decepcionar. Pagan la universidad con mucho sacrificio. Mi papá trabaja doble turno.
Terapeuta: ¿Cómo te sientes cargando eso solo?
Paciente: Muy mal. A veces no quiero ir a clases. Me paraliza pensar que si entro al salón voy a reprobar de todas formas.
Terapeuta: ¿Hay algo más que esté pasando en tu vida además de lo académico?
Paciente: Sí. Me estoy cuestionando si elegí bien la carrera. Estudio ingeniería pero creo que me gustaba más la música.
Terapeuta: ¿Cómo tomaron tus papás la decisión de estudiar ingeniería?
Paciente: Ellos la propusieron. Decían que tenía buen perfil y que daba trabajo. Yo nunca dije que no.
Terapeuta: ¿Tienes con quién hablar de todo esto, amigos, alguien de confianza?
Paciente: Un amigo algo sabe. Pero tampoco quiero cargarlo.
Terapeuta: ¿Cómo está tu sueño, tu apetito?
Paciente: Duermo poco por el estrés. Como mal, me salto comidas.
Terapeuta: ¿Cuántos años tienes y en qué semestre estás?
Paciente: 20 años. Cuarto semestre de ingeniería civil.`,
  },
  {
    id: 20,
    titulo: "Caso 21 — Hipocondría",
    transcripcion: `Terapeuta: ¿Qué lo trajo a consulta?
Paciente: Estoy convencido de que tengo algo grave y los médicos no me lo están diciendo.
Terapeuta: ¿Qué síntomas tiene?
Paciente: Dolores de cabeza frecuentes, cansancio, a veces mareos. He ido a tres neurólogos y todos dicen que estoy bien.
Terapeuta: ¿Qué cree usted que puede ser?
Paciente: Un tumor, quizás. O alguna enfermedad neurológica. Lo leo en internet y los síntomas coinciden.
Terapeuta: ¿Con qué frecuencia busca sus síntomas en internet?
Paciente: Varias veces al día. Sé que no debería pero no puedo parar.
Terapeuta: ¿Cuánto tiempo lleva con esta preocupación?
Paciente: Unos dos años. Empezó cuando murió un colega de un tumor cerebral repentino. Tenía mi edad.
Terapeuta: ¿Cómo afecta esto su vida diaria?
Paciente: Mucho. Tengo miedo de hacer ejercicio fuerte por si me pasa algo. Evito el estrés. Tengo a mi familia preocupada.
Terapeuta: ¿Cuando le dicen que está bien, qué siente?
Paciente: Alivio por un momento. Pero después pienso que quizás no hicieron los exámenes correctos o que pasaron algo por alto.
Terapeuta: ¿Ha tenido enfermedades físicas graves antes?
Paciente: No. Siempre he sido sano.
Terapeuta: ¿Hay otras áreas de su vida en que sienta miedo o preocupación excesiva?
Paciente: El trabajo también me genera ansiedad. Y la salud de mis hijos.
Terapeuta: ¿Cuántos años tiene?
Paciente: 41 años. Contador público.`,
  },
  {
    id: 21,
    titulo: "Caso 22 — Trastorno alimentario (restricción)",
    transcripcion: `Terapeuta: ¿Cómo estás hoy?
Paciente: Bien. Bueno, físicamente cansada. No comí mucho ayer.
Terapeuta: ¿Puedes contarme cómo es tu alimentación actualmente?
Paciente: Como poco. Soy muy controlada con lo que entra.
Terapeuta: ¿Qué significa poco en un día normal?
Paciente: Una fruta en la mañana, algo pequeño al mediodía. Por la noche nada o muy poco.
Terapeuta: ¿Cuánto pesas actualmente y cuánto mides?
Paciente: Peso 47 kilos y mido 1.65. Sé que es poco pero sigo viéndome con cosas por mejorar.
Terapeuta: ¿Qué ves cuando te miras al espejo?
Paciente: Partes que no me gustan. Los muslos, el abdomen. Aunque la gente dice que estoy delgada.
Terapeuta: ¿Desde cuándo tienes esta relación con la comida?
Paciente: Desde los 16. Empezó con una dieta antes del baile de graduación. Nunca paré.
Terapeuta: ¿Hay momentos en que comes más de lo que quieres y después te sientes mal?
Paciente: A veces. Si como más de lo planeado, me castigo haciendo ejercicio extra.
Terapeuta: ¿Cuánto ejercicio haces?
Paciente: Una hora diaria mínimo. Aunque esté cansada o enferma.
Terapeuta: ¿Cómo afecta esto tu vida social?
Paciente: Evito salidas donde haya comida. No voy a cumpleaños, a cenas. Digo que estoy ocupada.
Terapeuta: ¿Cuántos años tienes?
Paciente: 22 años. Estudio nutrición, paradójicamente.`,
  },
  {
    id: 22,
    titulo: "Caso 23 — Dificultades en crianza (padre solo)",
    transcripcion: `Terapeuta: ¿Qué lo trajo hoy?
Paciente: No sé cómo manejar a mi hijo. Tiene diez años y desde que su madre se fue todo se complicó.
Terapeuta: ¿Cuándo se fue la madre?
Paciente: Hace un año. Decidió irse. Tiene contacto con el niño dos fines de semana al mes.
Terapeuta: ¿Cómo ha reaccionado su hijo a esa situación?
Paciente: Al principio lloró mucho. Ahora tiene rabietas, no me hace caso, saca malas notas. La profesora me llamó tres veces este mes.
Terapeuta: ¿Cómo maneja usted esas rabietas?
Paciente: Mal. A veces le grito y después me siento terrible. Otras veces cedo para que no llore y creo que eso tampoco ayuda.
Terapeuta: ¿Tiene apoyo en la crianza, familia, alguien que lo ayude?
Paciente: Mis papás cuando pueden. Pero trabajo jornada completa y cuando llego a casa estoy agotado.
Terapeuta: ¿Cómo está usted emocionalmente en todo esto?
Paciente: Agotado y con culpa. Siento que soy el culpable de que el niño esté así porque no pude mantener la familia unida.
Terapeuta: ¿Cómo era la relación con su expareja antes de la separación?
Paciente: Mal desde hace tiempo. Peleas constantes. Tal vez el niño está mejor sin esas peleas pero igual lo afectó.
Terapeuta: ¿Ha podido hablar con su hijo sobre lo que pasó?
Paciente: Algo. Pero no sé cómo decirle las cosas sin ponerla mal a ella.
Terapeuta: ¿Cuántos años tiene usted?
Paciente: 38 años. Soy técnico electricista.`,
  },
  {
    id: 23,
    titulo: "Caso 24 — Dependencia emocional",
    transcripcion: `Terapeuta: ¿Qué te trajo a consulta?
Paciente: Terminé mi relación hace dos meses y no puedo funcionar. Sé que era una relación tóxica pero no puedo estar sin él.
Terapeuta: ¿Qué hacía que fuera tóxica?
Paciente: Me controlaba mucho. Revisaba mi teléfono, me decía cómo vestirme, se enojaba si hablaba con mis amigos.
Terapeuta: ¿Y aun así lo extrañas?
Paciente: Muchísimo. Lo llamo y él no contesta. A veces lo espero afuera de su trabajo. Sé que está mal pero no puedo parar.
Terapeuta: ¿Cuánto tiempo estuvieron juntos?
Paciente: Tres años. Era mi primera relación seria.
Terapeuta: ¿Cómo estás en tu día a día desde que terminaron?
Paciente: No como bien, no duermo, no puedo concentrarme en el trabajo. Mi jefa me preguntó si estaba bien.
Terapeuta: ¿Ha pasado algo parecido antes en tu vida, esa sensación de no poder estar sola?
Paciente: Sí. Cuando terminé con mi novio del colegio también fue muy difícil. Estuve meses muy mal.
Terapeuta: ¿Cómo es tu relación con tus papás?
Paciente: Mi papá nos abandonó cuando yo tenía ocho años. Mi mamá trabajaba mucho. Me crie bastante sola.
Terapeuta: ¿Tienes amigas, apoyo?
Paciente: Las alejé cuando estaba con él. Algunas se han acercado ahora que terminamos pero me da pena lo que hice.
Terapeuta: ¿Cuántos años tienes?
Paciente: 26 años. Soy asistente administrativa.`,
  },
  {
    id: 24,
    titulo: "Caso 25 — Estrés académico en universitario",
    transcripcion: `Terapeuta: ¿Cómo has estado esta semana?
Paciente: Mal. Tengo tres entregas para la próxima semana y no he empezado ninguna.
Terapeuta: ¿Qué pasa cuando intentas empezar?
Paciente: Me bloqueo. Me siento a abrir el computador y no pasa nada. Termino viendo videos por horas.
Terapeuta: ¿Eso te pasa seguido?
Paciente: Este semestre empeoró mucho. Antes podía con todo. Ahora no puedo con nada.
Terapeuta: ¿Qué cambió este semestre?
Paciente: Las materias son más difíciles. Y entré a la tesis. Es demasiado al mismo tiempo.
Terapeuta: ¿Cómo duermes?
Paciente: Poco. Me quedo hasta las tres o cuatro de la mañana sin poder dormir. Pienso en todo lo que tengo pendiente.
Terapeuta: ¿Tienes compañeros o amigos con quienes hablar de esto?
Paciente: Mis compañeros también están estresados pero nadie lo admite. Todos fingen que les va bien.
Terapeuta: ¿Cómo está tu vida social fuera del ambiente académico?
Paciente: Casi no hay. Dejé de ir al gimnasio, de ver a mis amigos de bachillerato. Solo estudio o estoy paralizado sin poder estudiar.
Terapeuta: ¿Has pensado en hablar con algún profesor o pedir una extensión?
Paciente: Me da vergüenza. Van a pensar que no sirvo para esto.
Terapeuta: ¿Has tenido pensamientos de abandonar la carrera?
Paciente: Muchas veces. Pero no sé qué haría. Llevo cuatro años ya.
Terapeuta: ¿Cuántos años tienes y qué estudias?
Paciente: 23 años. Medicina. Quinto año.`,
  },
  {
    id: 25,
    titulo: "Caso 26 — Dificultades de pareja (comunicación)",
    transcripcion: `Terapeuta: ¿Qué los trae hoy? (dirigido a ambos)
Paciente 1: Llevamos dos años sin poder hablar sin pelear.
Paciente 2: Cada conversación importante termina en discusión. Ya casi no hablamos de nada importante.
Terapeuta: ¿Pueden darme un ejemplo reciente?
Paciente 1: La semana pasada intenté hablar sobre las finanzas y terminó en grito.
Paciente 2: Porque siempre que tocas ese tema me haces sentir que gasté mal. No me escuchas, me acusas.
Terapeuta: ¿Qué escuchas tú cuando él/ella habla de finanzas?
Paciente 2: Que soy irresponsable. Que no soy suficiente.
Terapeuta: ¿Eso es lo que quieres comunicar?
Paciente 1: No. Quiero hablar del presupuesto pero no sé cómo empezar sin que se defienda.
Terapeuta: ¿Desde cuándo es así la comunicación?
Paciente 1: Después de que nació nuestro segundo hijo. Hace tres años.
Paciente 2: Antes también había problemas pero los ignorábamos.
Terapeuta: ¿Hay áreas en que sí se comunican bien?
Paciente 2: Con los hijos, lo logístico del día a día.
Paciente 1: Cuando no estamos cansados, a veces podemos hablar bien.
Terapeuta: ¿Qué los mantiene juntos?
Paciente 1: Los hijos. Y creo que todavía nos queremos.
Paciente 2: Eso. Pero estamos muy desgastados.
Terapeuta: ¿Cuántos años llevan juntos?
Paciente 1: Ocho años de casados, diez en total.`,
  },
  {
    id: 26,
    titulo: "Caso 27 — Trastorno de conducta en niño (reporte de madre)",
    transcripcion: `Terapeuta: Buenos días. ¿Qué la trajo hoy con su hijo?
Madre: El colegio me llamó porque Miguel pegó a un compañero. No es la primera vez.
Terapeuta: ¿Cuántos años tiene Miguel?
Madre: Ocho años. Está en segundo grado.
Terapeuta: ¿Qué pasó esta vez específicamente?
Madre: Otro niño le quitó un lápiz y Miguel lo empujó y luego le dio un golpe.
Terapeuta: ¿Cómo reacciona Miguel normalmente cuando algo lo frustra?
Madre: Explota. Llora, grita, a veces rompe cosas. En casa también. Si le digo que apague el televisor puede hacer una rabieta de veinte minutos.
Terapeuta: ¿Desde cuándo es así?
Madre: Siempre ha sido intenso. Pero empeoró hace un año cuando nos separamos con su papá.
Terapeuta: ¿Cómo es la relación de Miguel con su papá ahora?
Madre: Lo ve los fines de semana. Cuando vuelve de donde el papá viene muy alterado.
Terapeuta: ¿Hay diferencias en las reglas o el manejo entre su casa y la del papá?
Madre: Muchas. Yo soy más estricta. El papá lo deja hacer de todo. Miguel me dice que en casa del papá no hay límites.
Terapeuta: ¿Cómo está Miguel en lo académico?
Madre: Bien en notas pero los profesores dicen que no respeta turnos, interrumpe, se mueve mucho.
Terapeuta: ¿Duerme bien, come bien?
Madre: El sueño cuesta. Se queda despierto y le cuesta calmarse. Come bien.
Terapeuta: ¿Hay algo positivo que destaque de Miguel que quiera mencionarme?
Madre: Es muy creativo, muy cariñoso cuando está tranquilo. Tiene mucho vocabulario para su edad.`,
  },
  {
    id: 27,
    titulo: "Caso 28 — Ansiedad ante enfermedad crónica",
    transcripcion: `Terapeuta: ¿Qué lo trajo hoy?
Paciente: Me diagnosticaron diabetes tipo 2 hace seis meses y desde entonces no puedo dejar de angustiarme.
Terapeuta: ¿Cómo recibió el diagnóstico?
Paciente: Fue un golpe. Siempre fui sano, nunca tuve nada. Que de repente me dijeran eso fue muy difícil.
Terapeuta: ¿Cómo está manejando la enfermedad físicamente?
Paciente: Bien, el médico dice que el control es bueno. Cambié la dieta, hago ejercicio. Pero mentalmente no estoy bien.
Terapeuta: ¿Qué pensamientos tiene respecto a la diabetes?
Paciente: Que voy a terminar con complicaciones. He leído mucho y sé que puede afectar los riñones, los ojos, los pies. Me imagino perdiendo la vista.
Terapeuta: ¿Con qué frecuencia tiene esos pensamientos?
Paciente: Todos los días. Cada vez que como algo diferente me angustio. Cada vez que me siento raro físicamente pienso que es la diabetes avanzando.
Terapeuta: ¿Cómo afecta eso su vida diaria?
Paciente: Estoy muy pendiente de mi cuerpo. Me mido la glucosa más veces de las que me indicaron. Mi esposa dice que el tema domina todas las conversaciones.
Terapeuta: ¿Ha podido hablar con su médico sobre estos miedos?
Paciente: Algo. Me dice que el control es bueno y que no me anticipe. Pero no me tranquiliza.
Terapeuta: ¿Tiene antecedentes de ansiedad antes del diagnóstico?
Paciente: Un poco siempre fui preocupón pero nunca así de intenso.
Terapeuta: ¿Cuántos años tiene?
Paciente: 55 años. Soy docente universitario.`,
  },
  {
    id: 28,
    titulo: "Caso 29 — Duelo por aborto espontáneo",
    transcripcion: `Terapeuta: Gracias por venir. ¿Cómo estás?
Paciente: Tratando de estar bien. Pasaron cuatro meses y la gente dice que ya debería estar mejor.
Terapeuta: ¿Qué pasó hace cuatro meses?
Paciente: Perdí el embarazo en la semana dieciséis. Ya le habíamos dicho a todos. Ya teníamos nombre.
Terapeuta: Lo siento mucho. ¿Cómo ha sido este tiempo para ti?
Paciente: Un duelo que nadie parece tomar en serio. Mucha gente dijo "ya vendrá otro" como si fuera fácil reemplazarlo.
Terapeuta: ¿Cómo te sentiste cuando decían eso?
Paciente: Incomprendida y sola. Como si lo que perdí no contara porque no había nacido todavía.
Terapeuta: ¿Cómo está tu pareja en todo esto?
Paciente: Él también está triste pero lo maneja diferente. No habla mucho. Volvió al trabajo a la semana. Yo no he podido.
Terapeuta: ¿Cuánto tiempo llevas sin trabajar?
Paciente: Tres meses. Me dieron incapacidad pero ya se venció y no me siento lista.
Terapeuta: ¿Qué sientes cuando piensas en volver a intentar un embarazo?
Paciente: Terror. No sé si podría soportar que pasara de nuevo. Pero tampoco quiero rendirme.
Terapeuta: ¿Tienes apoyo, alguien con quien hablar?
Paciente: Mi mamá. Y una amiga que también tuvo una pérdida. Con ellas sí me siento entendida.
Terapeuta: ¿Cuántos años tienes?
Paciente: 32 años. Soy psicóloga, lo cual hace todo más extraño porque sé lo que me está pasando pero no puedo evitarlo.`,
  },
  {
    id: 29,
    titulo: "Caso 30 — Consumo problemático de alcohol",
    transcripcion: `Terapeuta: ¿Qué lo trajo aquí?
Paciente: Mi esposa me dijo que si no buscaba ayuda se iba. Así que aquí estoy.
Terapeuta: ¿Qué está pasando con el alcohol?
Paciente: Tomo más de lo que debería. Pero creo que ella exagera.
Terapeuta: ¿Cuánto toma en una semana típica?
Paciente: De lunes a viernes una o dos cervezas al llegar del trabajo. Los fines de semana más, unas cinco o seis por día.
Terapeuta: ¿Hay días en que tome más de lo que planeaba?
Paciente: A veces. Si hay reunión social o si el día fue muy pesado.
Terapeuta: ¿Ha intentado reducir o dejar de tomar?
Paciente: Varias veces. Duré tres semanas sin tomar el año pasado. Pero volvió.
Terapeuta: ¿Qué lo llevó a volver?
Paciente: Un problema en el trabajo, estrés. Y en una reunión familiar no pude negarme.
Terapeuta: ¿Cómo afecta el alcohol su vida cotidiana?
Paciente: Mis hijos me ven tomar y eso me preocupa. A veces amanezco con resaca y voy mal al trabajo.
Terapeuta: ¿Ha habido incidentes relacionados con el alcohol, accidentes, problemas legales?
Paciente: Una vez manejé cuando no debía. No pasó nada, pero estuvo cerca.
Terapeuta: ¿Hay algo que esté usando el alcohol para manejar?
Paciente: El estrés del trabajo. Soy gerente y la presión es constante. El trago me desconecta.
Terapeuta: ¿Cuántos años tiene?
Paciente: 46 años. Gerente comercial.`,
  },
];

module.exports = CASOS_INFORME_CLINICO;
