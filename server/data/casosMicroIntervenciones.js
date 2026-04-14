// server/data/casosMicroIntervenciones.js

/**
 * Pool de casos fijos para ejercicios de Grabar Voz (MicroIntervenciones).
 * Clave: `${contexto}|${escenario}|${nivel}|${habilidad}`
 *
 * Niveles: basico | intermedio | avanzado
 * Habilidades exploración: preguntas_abiertas | parafrasis | reflejo | validacion | clarificacion | sintesis
 * Habilidades intervención: interpretacion | confrontacion | auto_revelacion | sarcasmo_terapeutico | evocacion_incompleta_guiada
 */

const CASOS = {

  /* =========================================================
     EXPLORACIÓN — PREGUNTAS ABIERTAS
  ========================================================= */
  "clinico|exploracion|basico|preguntas_abiertas": [
    "Últimamente llego a casa y lo único que quiero es estar solo, sin hablar con nadie.",
    "En el trabajo me distraigo fácil, empiezo algo y termino pensando en otra cosa.",
    "Hay momentos en los que me enojo por cosas pequeñas y luego me arrepiento.",
    "Siento que me estoy exigiendo más de lo que realmente puedo manejar.",
    "Cuando alguien me pide ayuda, casi siempre digo que sí aunque no quiera.",
    "En mi familia esperan mucho de mí y a veces no sé cómo manejar eso.",
    "Me cuesta decir lo que pienso cuando algo me molesta.",
    "Últimamente me pasa que evito ver a ciertas personas sin saber muy bien por qué.",
    "Hay días en los que no tengo ganas de hacer nada, aunque tenga cosas pendientes.",
    "Siento que no estoy aprovechando bien mi tiempo.",
    "Cuando tengo que tomar decisiones importantes, termino dudando demasiado.",
    "Me pasa que digo cosas y después siento que no me expresé como quería.",
    "Hay situaciones en las que prefiero quedarme callado para no generar conflicto.",
    "A veces me quedo pensando en conversaciones que ya pasaron.",
    "Siento que me cuesta poner límites con las personas cercanas.",
    "En reuniones sociales suelo sentirme incómodo y no sé bien cómo actuar.",
    "Últimamente me doy cuenta de que me comparo mucho con otros.",
    "Hay momentos en los que siento que estoy haciendo todo en automático.",
    "Cuando algo no me sale bien, me cuesta dejar de darle vueltas.",
    "Siento que me está costando organizarme con mis responsabilidades.",
    "A veces evito hacer cosas porque pienso que no me van a salir bien.",
    "Me pasa que me preocupo por situaciones que todavía ni han pasado.",
    "Hay temas que prefiero no tocar porque sé que me afectan.",
    "Siento que no siempre entiendo por qué reacciono como reacciono.",
    "En ciertas situaciones me cuesta saber qué es lo que realmente quiero.",
    "Hay días en los que todo parece molestarme más de lo normal.",
    "Siento que me cuesta disfrutar los momentos sin estar pensando en otra cosa.",
    "Cuando alguien me critica, me quedo pensando en eso por mucho tiempo.",
    "Últimamente me cuesta desconectarme incluso cuando tengo tiempo libre.",
    "Hay cosas que me gustaría decir, pero termino guardándomelas.",
    "Siento que estoy cargando con muchas cosas al mismo tiempo.",
    "En algunas situaciones me doy cuenta de que reacciono sin pensar mucho.",
    "Hay momentos en los que no sé si estoy tomando las decisiones correctas.",
    "Siento que me está costando mantener la motivación en lo que hago.",
    "Cuando algo me preocupa, me cuesta enfocarme en otras cosas.",
    "Hay veces en las que no entiendo bien lo que estoy sintiendo.",
    "Siento que me cuesta adaptarme a ciertos cambios recientes.",
    "En algunos espacios siento que no termino de encajar del todo.",
    "Hay situaciones que prefiero evitar porque me generan incomodidad.",
    "Siento que me estoy quedando con muchas cosas sin resolver.",
  ],

  "clinico|exploracion|intermedio|preguntas_abiertas": [
    "Últimamente digo que estoy bien, pero en realidad hay cosas que me están afectando más de lo que muestro.",
    "Me pasa que quiero hacer cambios, pero termino haciendo lo mismo de siempre.",
    "Siento que necesito descansar, pero cuando tengo tiempo libre no logro aprovecharlo.",
    "Hay situaciones que evito, aunque sé que enfrentarlas sería lo mejor.",
    "Me doy cuenta de que reacciono fuerte en ciertos momentos, pero no siempre entiendo por qué.",
    "Quiero expresar lo que siento, pero cuando llega el momento me bloqueo.",
    "Siento que debería estar mejor, pero hay algo que no termina de acomodarse.",
    "Me esfuerzo por mantener todo en orden, pero igual siento que se me está saliendo de las manos.",
    "Hay días en los que estoy bien, y otros en los que todo se siente mucho más pesado.",
    "Siento que estoy haciendo lo correcto, pero no me siento satisfecho con eso.",
    "Me cuesta saber si lo que siento es por lo que pasa o por cómo lo interpreto.",
    "A veces pienso que exagero las cosas, pero igual me afectan bastante.",
    "Quiero acercarme más a las personas, pero termino tomando distancia.",
    "Siento que estoy cargando con cosas que no he terminado de procesar.",
    "Hay momentos en los que no sé si estoy reaccionando a lo que pasa ahora o a cosas anteriores.",
    "Me pasa que entiendo lo que debería hacer, pero no logro llevarlo a la práctica.",
    "Siento que me exijo mucho, pero si bajo el ritmo me siento culpable.",
    "Hay cosas que me molestan, pero no siempre logro identificar exactamente qué es.",
    "Me cuesta saber si estoy tomando decisiones por mí o por lo que esperan los demás.",
    "A veces siento que estoy bien, pero algo pequeño cambia mi ánimo por completo.",
    "Quiero dejar de pensar tanto en ciertos temas, pero vuelvo a lo mismo una y otra vez.",
    "Siento que me afecta más de lo que quisiera lo que dicen otras personas.",
    "Hay situaciones que me incomodan, pero no sé si vale la pena enfrentarlas.",
    "Me doy cuenta de que repito patrones, aunque no tenga claro por qué.",
    "Siento que estoy avanzando en algunas cosas, pero estancado en otras.",
    "Hay momentos en los que no sé si confiar en lo que pienso o cuestionarlo.",
    "Me cuesta distinguir entre lo que realmente quiero y lo que creo que debería querer.",
    "Siento que estoy más irritable, pero no logro identificar qué lo está detonando.",
    "A veces hago cosas solo para evitar sentirme mal después.",
    "Siento que me afecta lo que pasa, pero no siempre lo demuestro.",
    "Hay cosas que no digo para evitar problemas, pero igual me siguen dando vueltas.",
    "Me pasa que me adapto a lo que otros necesitan, pero después me siento incómodo.",
    "Siento que algo no está bien, aunque no podría explicarlo con claridad.",
    "A veces quiero cambiar ciertas cosas de mí, pero también siento resistencia a hacerlo.",
    "Hay momentos en los que me siento conectado conmigo, y otros en los que no tanto.",
    "Siento que estoy tomando decisiones rápidas para no pensar demasiado.",
    "Me cuesta saber cuándo insistir y cuándo soltar una situación.",
    "Hay cosas que me afectan más cuando estoy solo que cuando estoy con otros.",
    "Siento que hay temas que evito pensar, aunque sé que siguen ahí.",
    "A veces siento que estoy reaccionando más a lo que imagino que a lo que realmente pasa.",
    // set 2
    "Sé que no es para tanto, pero igual no logro dejar de sentirme así.",
    "Quiero cambiar algunas cosas, aunque al mismo tiempo siento que no es el momento.",
    "Entiendo por qué me pasa, pero eso no hace que deje de afectarme.",
    "A veces digo que no me importa, pero en realidad sí me afecta más de lo que quisiera.",
    "Siento que ya debería haber superado esto, pero sigo en el mismo punto.",
    "Sé que tengo opciones, pero ninguna me termina de convencer del todo.",
    "Hay cosas que evito pensar porque cuando lo hago me desordeno más.",
    "Quiero hablar de esto, pero no sé si realmente estoy listo para hacerlo.",
    "Siento que parte de mí quiere avanzar, pero otra parte me frena.",
    "Entiendo lo que debería hacer, pero no logro conectar con eso en la práctica.",
    "A veces siento que exagero, pero también hay algo que me dice que no es así.",
    "Me digo que no debería importarme, pero igual termino dándole vueltas.",
    "Quiero confiar más en los demás, pero siempre termino dudando.",
    "Siento que repito lo mismo, aunque intento hacerlo diferente.",
    "Hay cosas que minimizo, pero sé que en el fondo sí me afectan.",
    "Siento que si cambio algunas cosas, podría perder algo importante.",
    "Quiero tomar una decisión, pero ninguna opción me deja tranquilo.",
    "Hay momentos en los que entiendo todo, y otros en los que nada tiene sentido.",
    "Siento que estoy bien, pero cualquier cosa pequeña me desestabiliza.",
    "Sé que esto viene de antes, pero no sé qué hacer con eso ahora.",
    "A veces siento que estoy evitando algo, pero no tengo claro qué es.",
    "Quiero dejar de pensar en esto, pero cuando lo intento vuelve con más fuerza.",
    "Siento que debería sentirme diferente, pero no logro cambiar eso.",
    "Hay cosas que no digo porque no quiero complicar más las cosas.",
    "Me pasa que justifico ciertas situaciones, pero igual me generan malestar.",
    "Siento que estoy avanzando, pero al mismo tiempo sigo atascado en lo mismo.",
    "Hay decisiones que tomo rápido para no enfrentar lo que implican.",
    "Siento que hay algo que no estoy viendo del todo claro en lo que me pasa.",
    "Quiero entenderme mejor, pero hay partes que prefiero no tocar.",
    "A veces siento que lo que pienso no coincide con lo que hago.",
    "Siento que me protejo evitando ciertas cosas, pero eso también me limita.",
    "Hay momentos en los que siento claridad, pero no logro sostenerla.",
    "Siento que si profundizo demasiado en esto, podría sentirme peor.",
    "Quiero soltar algunas cosas, pero no sé cómo hacerlo sin afectar otras áreas.",
    "Siento que hay algo que no termino de aceptar en todo esto.",
    "A veces siento que estoy más cómodo en lo conocido, aunque no me haga bien.",
    "Quiero cambiar, pero también siento miedo de lo que venga después.",
    "Siento que me adapto a todo, pero no siempre sé qué quiero realmente.",
    "Hay partes de mí que entiendo, y otras que me cuesta mucho enfrentar.",
    "Siento que estoy evitando algo importante, pero no logro ponerlo en palabras.",
  ],

  /* =========================================================
     EXPLORACIÓN — REFLEJO
  ========================================================= */
  "clinico|exploracion|unico|reflejo": [
    "Últimamente siento que todo me está sobrepasando.",
    "No me siento como antes y eso me inquieta.",
    "Siento que no estoy logrando lo que esperaba de mí.",
    "Hay algo que me tiene incómodo y no logro ubicar bien qué es.",
    "Me frustra darme cuenta de que sigo en lo mismo.",
    "Siento que estoy cargando más de lo que puedo.",
    "No me siento tranquilo ni siquiera cuando descanso.",
    "Hay momentos en los que todo me pesa más de lo normal.",
    "Me incomoda cómo estoy reaccionando últimamente.",
    "Siento que no estoy bien, pero no sé explicar por qué.",
    "Hay algo que no me deja en paz.",
    "Me cuesta entender por qué esto me afecta tanto.",
    "Siento que estoy más sensible de lo normal.",
    "No me gusta sentirme así, pero no sé cómo cambiarlo.",
    "Me frustra no poder manejar esto mejor.",
    "Siento que algo no está encajando en mi vida.",
    "Hay días en los que todo se me hace cuesta arriba.",
    "Me pesa darme cuenta de que no estoy avanzando.",
    "Siento que estoy fallando en algo importante.",
    "Me incomoda sentirme así frente a otros.",
    "Siento que no tengo control sobre esto.",
    "Me cuesta aceptar que esto me esté pasando.",
    "Hay algo que me genera mucha tensión por dentro.",
    "Siento que no estoy siendo suficiente.",
    "Me molesta no poder soltar esto.",
    "Siento que estoy más irritable de lo normal.",
    "Hay algo que me tiene inquieto constantemente.",
    "Me cuesta relajarme aunque lo intente.",
    "Siento que estoy más cansado de lo habitual.",
    "Me incomoda no entender qué me pasa.",
    "Siento que todo me está afectando más de la cuenta.",
    "Hay momentos en los que me siento perdido.",
    "Me cuesta conectar con cómo me sentía antes.",
    "Siento que algo en mí no está bien.",
    "Me frustra no tener claridad.",
    "Siento que esto me está desgastando.",
    "Hay algo que me genera ansiedad constante.",
    "Me cuesta mantener la calma en ciertas situaciones.",
    "Siento que no puedo con todo esto.",
    "Me incomoda cómo me siento últimamente.",
    "Últimamente en el trabajo todo se me acumula y siento que no logro desconectarme ni al llegar a casa.",
    "Aunque estoy rodeado de gente, hay momentos en los que me siento completamente solo.",
    "Intento enfocarme en lo que hago, pero hay algo que me mantiene inquieto por dentro.",
    "Cuando pienso en lo que viene, siento una tensión que no logro soltar.",
    "A veces todo parece estar bien, pero igual siento que algo no encaja.",
    "He estado cumpliendo con todo, pero no me siento tranquilo con eso.",
    "Hay días en los que avanzo, pero igual me queda una sensación extraña.",
    "Aunque intento no pensar mucho en eso, siento que me sigue afectando.",
    "Me doy cuenta de que sigo con lo mismo y eso me genera incomodidad conmigo.",
    "Hay momentos en los que siento que debería estar bien, pero no es así.",
    "Últimamente hago lo que tengo que hacer, pero me siento desconectado de todo.",
    "Aunque no ha pasado nada grave, siento que algo no está bien conmigo.",
    "He tratado de distraerme, pero igual hay algo que me inquieta por dentro.",
    "Cuando estoy solo, siento más fuerte algo que no logro entender.",
    "Hay cosas pequeñas que últimamente me afectan más de lo normal.",
    "Intento mantenerme ocupado, pero igual siento que algo me pesa.",
    "Cuando termina el día, me doy cuenta de que sigo con la misma sensación.",
    "Aunque todo sigue igual, siento que algo cambió en mí.",
    "Hay momentos en los que me siento bien, pero duran poco.",
    "Me pasa que trato de ignorar lo que siento, pero igual vuelve.",
    "He estado evitando pensar en ciertas cosas, pero igual me generan incomodidad.",
    "Aunque intento relajarme, siento que mi cuerpo sigue tenso.",
    "Cuando hablo con otros, trato de estar bien, pero no siempre lo siento así.",
    "Hay días en los que todo me cuesta más, aunque no sepa exactamente por qué.",
    "Siento que hago lo que puedo, pero igual me queda una sensación de insuficiencia.",
    "Aunque trato de mantenerme positivo, hay algo que no termina de calmarse.",
    "Me doy cuenta de que estoy más sensible, aunque no siempre entiendo por qué.",
    "Hay momentos en los que me siento tranquilo, pero algo cambia rápidamente.",
    "Siento que intento avanzar, pero algo en mí no termina de estar en paz.",
    "Aunque no lo demuestro mucho, hay cosas que me están afectando más de lo que parece."
  ],

  /* =========================================================
     EXPLORACIÓN — VALIDACIÓN
  ========================================================= */
  "clinico|exploracion|basico|validacion": [
    "Me sentí muy mal cuando me dijeron eso.",
    "La verdad es que eso me dolió bastante.",
    "Me afectó más de lo que pensé.",
    "Siento que eso fue injusto conmigo.",
    "Me sentí ignorado en ese momento.",
    "Eso me dejó bastante triste.",
    "Me dolió que no tomaran en cuenta mi opinión.",
    "Me sentí muy solo en esa situación.",
    "Eso me generó mucha frustración.",
    "Me sentí mal por cómo me trataron.",
    "Siento que no fue justo lo que pasó.",
    "Me dolió que reaccionaran así conmigo.",
    "Eso me hizo sentir bastante inseguro.",
    "Me sentí incómodo con lo que pasó.",
    "La verdad es que eso me afectó emocionalmente.",
    "Me sentí muy presionado en ese momento.",
    "Eso me generó bastante ansiedad.",
    "Me sentí mal conmigo mismo después de eso.",
    "Me dolió darme cuenta de eso.",
    "Eso me dejó pensando mucho.",
    "Me sentí desplazado en esa situación.",
    "Eso me generó mucha incomodidad.",
    "Me sentí muy frustrado conmigo mismo.",
    "Eso me hizo sentir insuficiente.",
    "Me sentí mal por no haber reaccionado diferente.",
    "Eso me dejó bastante confundido.",
    "Me dolió cómo se dieron las cosas.",
    "Me sentí incómodo con la forma en que me hablaron.",
    "Eso me generó bastante molestia.",
    "Me sentí mal por lo que pasó después.",
    "Eso me dejó con una sensación fea.",
    "Me sentí poco valorado en ese momento.",
    "Eso me hizo sentir vulnerable.",
    "Me sentí mal al ver cómo reaccionaron.",
    "Eso me dejó bastante inquieto.",
    "Me sentí mal por no saber qué hacer.",
    "Eso me generó mucha tensión.",
    "Me sentí afectado por lo que dijeron.",
    "Eso me hizo sentir fuera de lugar.",
    "Me sentí mal al no poder manejar la situación.",
  ],

  "clinico|exploracion|intermedio|validacion": [
    "Sé que no debería sentirme así, pero igual me afecta mucho.",
    "Me siento mal por pensar así, pero no logro evitarlo.",
    "Una parte de mí entiende que no es tan grave, pero otra lo vive muy intenso.",
    "Siento que exagero, pero al mismo tiempo me duele de verdad.",
    "No sé por qué me afecta tanto algo que a otros no les importa.",
    "Me da rabia sentirme así, como si no tuviera sentido.",
    "Sé que debería soltar esto, pero no puedo.",
    "Me siento culpable por sentirme así.",
    "Siento que estoy siendo débil por esto.",
    "No sé si tengo derecho a sentirme así.",
    "Parte de mí quiere dejar esto atrás, pero otra parte no puede.",
    "Me juzgo mucho por cómo reacciono.",
    "Siento que no debería tomármelo tan personal, pero lo hago.",
    "No entiendo por qué esto me sigue afectando.",
    "Me molesta que esto todavía me importe.",
    "Siento que estoy fallando por no poder manejarlo mejor.",
    "Me digo que no es para tanto, pero no lo siento así.",
    "No sé si estoy exagerando o si realmente es importante.",
    "Me siento mal por no poder controlar esto.",
    "Siento que debería ser más fuerte.",
    "Hay momentos en los que lo veo claro, pero luego vuelvo a sentirme igual.",
    "No sé si lo que siento es válido o solo cosa mía.",
    "Me cuesta aceptar que esto me afecte tanto.",
    "Siento que no debería necesitar tanto esto.",
    "Me da vergüenza que esto me duela.",
    "No me gusta sentirme así, pero no sé cómo cambiarlo.",
    "Siento que estoy siendo injusto conmigo mismo, pero no paro.",
    "Sé que no todo es culpa mía, pero igual me siento responsable.",
    "Me cuesta no pensar que hice algo mal.",
    "Siento que debería poder con esto solo.",
    "No sé si estoy reaccionando bien o mal.",
    "Me incomoda sentir esto, como si no fuera correcto.",
    "Siento que no tengo una razón suficiente para estar así.",
    "Me cuesta dejar de culparme por lo que pasó.",
    "Sé que intento entenderlo, pero igual me afecta.",
    "Siento que debería haberlo manejado mejor.",
    "Me cuesta aceptar que esto me haya impactado tanto.",
    "No sé por qué sigo sintiéndome así después de tanto tiempo.",
    "Siento que no debería necesitar ayuda para esto.",
    "Me juzgo por no poder dejar esto atrás.",
  ],

  "clinico|exploracion|avanzado|validacion": [
    "No me gusta admitirlo, pero creo que en el fondo hay algo mal conmigo.",
    "Siento que si la gente supiera realmente cómo soy, no se quedarían.",
    "Hay cosas que he hecho que prefiero no decir en voz alta.",
    "A veces pienso que todo esto es consecuencia de mis propias decisiones.",
    "No sé si quiero hablar de esto porque no me gusta cómo me hace sentir.",
    "Siento que hay partes de mí que no quiero que nadie vea.",
    "No estoy seguro de que merezca sentirme mejor después de lo que pasó.",
    "Hay cosas que sigo repitiendo aunque sé que me hacen daño.",
    "Siento que decepciono a los demás, incluso cuando intento hacerlo bien.",
    "No sé si esto tiene solución o si simplemente soy así.",
    "A veces prefiero no profundizar en esto porque sé que me va a afectar.",
    "Siento que hay algo en mí que no logro cambiar por más que lo intente.",
    "No me gusta reconocer lo mucho que esto me afecta.",
    "Siento que si dejo de exigirme, todo se me va a caer.",
    "Hay momentos en los que me cuestiono quién soy realmente.",
    "Siento que estoy sosteniendo una versión de mí que no sé si es real.",
    "No sé si lo que hago es por mí o por lo que esperan de mí.",
    "A veces siento que no soy suficiente, pero tampoco sé cómo serlo.",
    "Siento que estoy fallando en cosas importantes, aunque nadie me lo diga.",
    "No sé si quiero cambiar esto o si me da miedo lo que implique.",
    "Siento que hay algo que no termino de aceptar de mí mismo.",
    "No estoy seguro de si me estoy siendo honesto en esto.",
    "A veces siento que estoy actuando más que siendo yo.",
    "No sé si lo que siento tiene sentido o si soy yo el problema.",
    "Siento que si dejo de controlar todo, algo va a salir mal.",
    "Hay partes de esta historia que no me gusta recordar.",
    "Siento que me cuesta verme con compasión.",
    "No sé si estoy listo para enfrentar esto como es.",
    "A veces siento que estoy más cómodo evitando esto.",
    "Siento que hay algo que no encaja en mí, pero no sé qué es.",
    "No sé si esto que siento es válido o si estoy exagerando demasiado.",
    "Siento que si hablo de esto, me voy a juzgar más.",
    "No me gusta cómo me veo cuando pienso en esto.",
    "Siento que estoy cargando con algo que no logro soltar.",
    "No sé si lo que hago me ayuda o me mantiene en lo mismo.",
    "A veces siento que estoy atrapado en una versión de mí que no quiero.",
    "No sé si realmente quiero cambiar o solo dejar de sentir esto.",
    "Siento que hay algo que no quiero mirar de frente.",
    "No estoy seguro de poder sostener lo que implicaría enfrentar esto.",
    "Siento que hay algo pendiente conmigo mismo que no sé cómo resolver.",
  ],

  /* =========================================================
     EXPLORACIÓN — CLARIFICACIÓN
  ========================================================= */
  "clinico|exploracion|basico|clarificacion": [
    "Siento que hay algo que no está bien.",
    "Hay cosas que no me terminan de cuadrar.",
    "Últimamente noto algo raro en mí.",
    "Siento que algo cambió, pero no sé qué.",
    "Hay algo que me incomoda, pero no sé exactamente qué.",
    "Es como si algo estuviera fuera de lugar.",
    "No sé, hay algo distinto.",
    "Siento que algo no encaja.",
    "Hay algo que no logro entender.",
    "No sé qué es, pero algo no está bien.",
    "Siento que hay algo que no termino de ver.",
    "Es como una sensación rara.",
    "No sé cómo explicarlo bien.",
    "Hay algo que no me deja tranquilo.",
    "Siento que algo está pasando, pero no sé qué.",
    "No sé, es como algo raro.",
    "Hay algo que no me cierra.",
    "Siento que algo no está en su lugar.",
    "Es como si algo estuviera diferente.",
    "No sé qué es exactamente.",
    "Hay algo que no logro identificar.",
    "Siento que algo no está funcionando como antes.",
    "Es como una sensación difícil de describir.",
    "No sé cómo ponerlo en palabras.",
    "Hay algo que no termino de entender de esto.",
    "Siento que algo está mal, pero no sé qué.",
    "Es como si algo estuviera cambiando.",
    "No sé, hay algo que no está del todo bien.",
    "Siento que algo no está claro.",
    "Hay algo que no logro ubicar.",
    "No sé cómo explicarlo, pero algo pasa.",
    "Es como si algo no estuviera encajando.",
    "Siento que algo está fuera de lugar.",
    "Hay algo que no logro precisar.",
    "No sé qué es, pero hay algo ahí.",
    "Siento que algo no termina de cerrar.",
    "Es como si algo estuviera desajustado.",
    "No sé bien qué es lo que pasa.",
    "Hay algo que no logro definir.",
    "Siento que algo no está como debería.",
  ],

  "clinico|exploracion|intermedio|clarificacion": [
    "Siento que estoy haciendo todo bien, pero igual algo no está funcionando.",
    "No me fue mal, pero tampoco siento que haya sido suficiente.",
    "Quiero cambiar algunas cosas, pero no sé si realmente debería hacerlo.",
    "Siento que me afecta, pero tampoco tanto como para preocuparme.",
    "Hay días en los que estoy bien, pero igual algo se siente raro.",
    "No estoy tan mal, pero tampoco me siento bien del todo.",
    "Siento que avanzo, pero a la vez sigo en lo mismo.",
    "No sé si esto me importa tanto o si solo me lo estoy tomando muy en serio.",
    "Quiero que las cosas sean diferentes, pero tampoco sé cómo deberían ser.",
    "Siento que esto me incomoda, pero no logro ubicar exactamente por qué.",
    "No sé si esto es un problema o si lo estoy haciendo más grande.",
    "Siento que debería hacer algo, pero tampoco sé qué cambiar.",
    "Hay cosas que me afectan, pero no todas por igual.",
    "Siento que me cuesta, pero tampoco es que no pueda.",
    "No sé si esto me está afectando o si solo estoy pensando demasiado.",
    "Siento que esto tiene que ver conmigo, pero no sé en qué exactamente.",
    "No sé si lo que siento es por esto o por otras cosas.",
    "Siento que esto es importante, pero tampoco tanto.",
    "No sé si quiero cambiar esto o solo dejar de sentirme así.",
    "Siento que algo no está bien, pero tampoco sabría decir qué es.",
    "Hay momentos en los que esto me afecta más que otros.",
    "No sé si estoy reaccionando así por esto o por cómo soy.",
    "Siento que esto me incomoda, pero no sé si es por la situación o por mí.",
    "No sé si esto es algo que debería trabajar o simplemente dejar pasar.",
    "Siento que esto me genera algo, pero no sé bien qué.",
    "No sé si esto es nuevo o si siempre ha estado ahí.",
    "Siento que esto me afecta, pero tampoco sé en qué áreas exactamente.",
    "No sé si esto tiene que ver con lo que pasó o con cómo lo estoy viendo.",
    "Siento que esto me molesta, pero no sabría decir exactamente por qué.",
    "No sé si esto es algo puntual o algo más general.",
    "Siento que esto tiene varias partes, pero no logro separarlas.",
    "No sé si esto es por una cosa específica o por varias juntas.",
    "Siento que esto me afecta, pero no de la misma forma siempre.",
    "No sé si esto es algo mío o algo que viene de afuera.",
    "Siento que esto cambia dependiendo del momento.",
    "No sé si esto me incomoda por lo que pasó o por lo que significa.",
    "Siento que esto tiene más fondo, pero no logro verlo claro.",
    "No sé si esto es algo que debería entender mejor o simplemente aceptar.",
    "Siento que esto me mueve algo, pero no sé bien qué es.",
    "No sé si esto es importante o si solo lo estoy sintiendo así.",
  ],

  "clinico|exploracion|avanzado|clarificacion": [
    "Siento que entiendo lo que me pasa, pero a la vez hay algo que no logro ubicar del todo.",
    "No sé si esto que siento es por lo que pasó o por cómo lo estoy interpretando.",
    "Siento que esto me afecta, pero no de la forma en que pensaría.",
    "Hay algo en todo esto que no termino de conectar bien.",
    "Siento que estoy reaccionando a algo, pero no tengo claro a qué exactamente.",
    "No sé si esto tiene más que ver conmigo o con la situación.",
    "Siento que hay varias cosas mezcladas y no logro separarlas.",
    "No sé si esto es una reacción o algo más profundo.",
    "Siento que entiendo una parte, pero hay otra que se me escapa.",
    "No sé si lo que siento viene de ahora o de antes.",
    "Siento que esto tiene sentido en parte, pero no completamente.",
    "No sé si esto es algo puntual o algo que se repite de fondo.",
    "Siento que estoy viendo esto desde varios lugares al mismo tiempo.",
    "No sé si esto es lo que parece o si hay algo más detrás.",
    "Siento que esto me afecta, pero no siempre de la misma manera.",
    "No sé si esto es algo que estoy generando o que viene de afuera.",
    "Siento que esto cambia dependiendo de cómo lo mire.",
    "No sé si esto tiene que ver con una cosa o con varias al mismo tiempo.",
    "Siento que hay algo que no termino de entender de cómo me pasa esto.",
    "No sé si esto es más emocional o más mental.",
    "Siento que esto me afecta, pero no sé en qué nivel exactamente.",
    "No sé si esto es algo que debería analizar más o dejar así.",
    "Siento que esto tiene varias capas, pero no logro ordenarlas.",
    "No sé si esto es algo mío o algo que estoy interpretando.",
    "Siento que esto tiene un fondo, pero no lo veo claro.",
    "No sé si esto es algo reciente o algo que ya venía.",
    "Siento que esto se activa en ciertos momentos, pero no sé cuáles exactamente.",
    "No sé si esto es algo que depende de la situación o de cómo estoy yo.",
    "Siento que esto me genera algo, pero no sé bien desde dónde viene.",
    "No sé si esto es una reacción proporcional o algo más complejo.",
    "Siento que esto tiene sentido, pero no logro explicarlo bien.",
    "No sé si esto es algo que cambia o si siempre ha sido así.",
    "Siento que esto me afecta, pero no logro identificar cómo se da exactamente.",
    "No sé si esto es algo que debería entender mejor o simplemente aceptar.",
    "Siento que esto tiene más de una explicación, pero no sé cuál pesa más.",
    "No sé si esto es algo interno o algo que viene de lo externo.",
    "Siento que esto me pasa, pero no sé cómo se construye.",
    "No sé si esto es algo que depende de mí o de lo que pasó.",
    "Siento que esto tiene partes claras y partes que no.",
    "No sé si esto es algo que estoy viendo bien o no del todo.",
  ],

  /* =========================================================
     EXPLORACIÓN — PARÁFRASIS
  ========================================================= */
  "clinico|exploracion|basico|parafrasis": [
    "En el trabajo me están pidiendo más cosas de las que puedo manejar.",
    "Últimamente estoy durmiendo muy poco y me siento cansado todo el día.",
    "He dejado de ver a mis amigos porque no tengo ganas de salir.",
    "Me cuesta concentrarme cuando tengo muchas cosas pendientes.",
    "Siento que no estoy rindiendo como antes en mis estudios.",
    "He estado discutiendo más seguido con mi pareja por cosas pequeñas.",
    "Me siento presionado por cumplir con todas mis responsabilidades.",
    "Últimamente paso mucho tiempo pensando en errores del pasado.",
    "Siento que no tengo suficiente tiempo para hacer todo lo que debo.",
    "Me cuesta decir que no cuando me piden ayuda.",
    "He estado evitando ciertas situaciones porque me generan incomodidad.",
    "Siento que los demás esperan más de mí de lo que puedo dar.",
    "Me está costando organizar mis tareas diarias.",
    "Siento que no estoy disfrutando las cosas como antes.",
    "Últimamente me siento más distraído de lo normal.",
    "He estado comiendo menos porque no tengo mucho apetito.",
    "Siento que me estoy exigiendo demasiado en todo lo que hago.",
    "Me cuesta relajarme incluso cuando tengo tiempo libre.",
    "He estado posponiendo cosas importantes.",
    "Siento que estoy perdiendo el control de mi rutina.",
    "Me siento agotado al final del día, aunque no haya hecho tanto.",
    "He estado evitando hablar de ciertos temas.",
    "Siento que no estoy cumpliendo con mis propias expectativas.",
    "Me cuesta mantenerme enfocado en una sola tarea.",
    "He estado más irritable de lo normal.",
    "Siento que no tengo claridad sobre lo que quiero.",
    "Me cuesta iniciar tareas que sé que son importantes.",
    "He estado más callado de lo habitual.",
    "Siento que no estoy avanzando como esperaba.",
    "Me cuesta tomar decisiones últimamente.",
    "He estado sintiendo menos motivación para hacer cosas.",
    "Siento que estoy cargando con demasiadas responsabilidades.",
    "Me cuesta disfrutar los momentos sin preocuparme por algo.",
    "He estado más preocupado por el futuro.",
    "Siento que no estoy manejando bien el estrés.",
    "Me cuesta desconectarme de mis pensamientos.",
    "He estado evitando enfrentar algunos problemas.",
    "Siento que no estoy dando lo mejor de mí.",
    "Me cuesta mantener un equilibrio entre trabajo y descanso.",
    "He estado sintiendo que todo me cuesta más esfuerzo.",
  ],

  "clinico|exploracion|intermedio|parafrasis": [
    "Quiero organizarme mejor, pero termino enfocándome en lo urgente y dejando lo importante.",
    "Sé que debería descansar más, pero cuando tengo tiempo termino ocupándome en otras cosas.",
    "Me afecta lo que dicen de mí, aunque intento convencerme de que no debería importarme.",
    "Quiero cambiar algunas cosas, pero no tengo claro por dónde empezar y eso me frena.",
    "Siento que avanzo en algunas áreas, pero en otras sigo igual y eso me confunde.",
    "Me cuesta concentrarme y eso me frustra, aunque sé que podría hacerlo mejor.",
    "He tratado de mejorar, pero termino cayendo en los mismos patrones y eso me desanima.",
    "Quiero decir lo que pienso, pero en el momento termino quedándome callado.",
    "Sé que no debería compararme, pero igual lo hago y me termina afectando.",
    "Me siento cansado, pero aun así sigo sin darme espacios para parar.",
    "Quiero hacer cambios, pero me cuesta sostenerlos en el tiempo y termino abandonándolos.",
    "Siento que tengo claro lo que quiero, pero no logro actuar en función de eso.",
    "Me preocupa lo que piensen, aunque intento mostrar que no me importa.",
    "Quiero avanzar, pero siento que algo me detiene aunque no sé bien qué es.",
    "Siento que hago mucho por otros, pero dejo de lado lo que necesito para mí.",
    "Me gustaría ser más constante, pero pierdo el ritmo y vuelvo a lo mismo.",
    "Sé lo que debería hacer, pero en la práctica termino haciendo lo contrario.",
    "Siento que tengo oportunidades, pero no las aprovecho como me gustaría.",
    "Quiero mejorar, pero me cuesta sostener el esfuerzo y termino bajando el ritmo.",
    "Siento que esto me afecta, pero no siempre de la misma forma y eso me confunde.",
    "Quiero estar tranquilo, pero mi mente sigue activa y no logro detenerla.",
    "Siento que debería estar mejor, pero no logro sentirme así realmente.",
    "Me cuesta decidir, aunque sé que tengo que hacerlo y lo sigo posponiendo.",
    "Quiero soltar esto, pero sigo dándole vueltas constantemente.",
    "Siento que estoy haciendo lo correcto, pero no me siento bien con eso.",
    "Quiero cambiar mi forma de actuar, pero en el momento termino reaccionando igual.",
    "Siento que esto es importante, pero no actúo en consecuencia.",
    "Quiero enfocarme, pero me distraigo fácilmente y pierdo el hilo.",
    "Siento que tengo control en algunas cosas, pero en otras se me va completamente.",
    "Quiero avanzar, pero termino quedándome en el mismo punto.",
    "Siento que podría hacerlo mejor, pero no logro sostener ese nivel.",
    "Quiero organizar mi tiempo, pero termino usándolo en cosas que no son prioridad.",
    "Siento que esto me afecta, pero no logro dimensionar cuánto realmente.",
    "Quiero mejorar mis hábitos, pero no logro mantenerlos en el tiempo.",
    "Siento que estoy cerca de lograrlo, pero algo hace que no termine de llegar.",
    "Quiero tomar decisiones, pero las pospongo y eso me estanca.",
    "Siento que esto depende de mí, pero no logro actuar en consecuencia.",
    "Quiero cambiar, pero no tengo claro cómo hacerlo y eso me frena.",
    "Siento que tengo claridad en algunos momentos, pero luego no la uso.",
    "Quiero avanzar, pero siento que algo en mí me frena constantemente."
  ],

  "clinico|exploracion|avanzado|parafrasis": [
    "Siento que quiero cambiar, pero cuando lo intento termino dudando si realmente eso es lo que quiero o solo lo que debería querer.",
    "Entiendo lo que me pasa, pero a la vez siento que ese entendimiento no me sirve para hacer algo diferente.",
    "Quiero avanzar, pero cada vez que lo intento empiezo a cuestionar si estoy tomando la decisión correcta.",
    "Siento que esto me afecta, pero también pienso que tal vez lo estoy exagerando y no debería darle tanta importancia.",
    "Quiero hacer cambios, pero cuando estoy por hacerlo me pregunto si vale la pena o si voy a terminar igual.",
    "Siento que una parte de mí quiere soltar esto, pero otra siente que necesita seguir ahí para entenderlo.",
    "Quiero confiar en mis decisiones, pero después de tomarlas empiezo a dudar si realmente fueron las correctas.",
    "Siento que esto es importante para mí, pero al mismo tiempo actúo como si no lo fuera.",
    "Quiero dejar esto atrás, pero siento que todavía tiene algo que no termino de resolver.",
    "Siento que esto depende de mí, pero también pienso que hay cosas que no controlo.",
    "Quiero cambiar mi forma de actuar, pero cuando reacciono me doy cuenta de que sigo haciendo lo mismo.",
    "Siento que esto me afecta, pero no logro entender si es por lo que pasó o por cómo lo estoy interpretando.",
    "Quiero tomar decisiones, pero cada opción que veo me genera dudas.",
    "Siento que esto tiene sentido, pero no logro aplicarlo en lo que hago.",
    "Quiero mejorar, pero cuando avanzo siento que vuelvo al mismo punto.",
    "Siento que esto me limita, pero no sé si quiero dejarlo porque también es parte de mí.",
    "Quiero hacer las cosas diferente, pero cuando lo intento me siento incómodo y vuelvo a lo conocido.",
    "Siento que tengo claridad en algunos momentos, pero después la pierdo y dudo de todo.",
    "Quiero avanzar, pero no sé si lo que quiero realmente es avanzar o solo dejar de sentir esto.",
    "Siento que esto me afecta, pero no logro ubicar exactamente cómo.",
    "Quiero cambiar, pero cuando lo pienso más siento que no estoy listo.",
    "Siento que esto es algo que debería trabajar, pero a veces prefiero no profundizar.",
    "Quiero confiar en lo que hago, pero constantemente me cuestiono.",
    "Siento que esto tiene varias partes, pero no logro ordenarlas.",
    "Quiero avanzar, pero no sé si tengo claro hacia dónde.",
    "Siento que esto me influye, pero no sé si es más por mí o por lo que pasó.",
    "Quiero dejar de sentir esto, pero siento que todavía no lo entiendo del todo.",
    "Siento que esto me genera conflicto, pero no logro definir exactamente cuál.",
    "Quiero cambiar, pero no sé si lo estoy haciendo por mí o por otros.",
    "Siento que esto es importante, pero no logro sostenerlo en mis acciones.",
    "Quiero avanzar, pero cada vez que lo intento vuelvo a cuestionarme.",
    "Siento que esto me afecta, pero no sé si es tanto como parece.",
    "Quiero tomar decisiones, pero no logro confiar en ninguna del todo.",
    "Siento que esto tiene fondo, pero no logro verlo con claridad.",
    "Quiero cambiar, pero cuando lo intento me siento inseguro.",
    "Siento que esto me mueve algo, pero no sé qué exactamente.",
    "Quiero avanzar, pero siento que algo en mí se resiste.",
    "Siento que esto es algo mío, pero no sé si siempre ha sido así.",
    "Quiero mejorar, pero no sé si estoy dispuesto a lo que implica.",
    "Siento que esto me afecta, pero no logro explicarlo bien.",
  ],

  /* =========================================================
     EXPLORACIÓN — SÍNTESIS
  ========================================================= */
  "clinico|exploracion|basico|sintesis": [
    "En esta sesión tu paciente ha expresado que se siente muy cansado en el trabajo y que al llegar a casa no tiene energía para nada.",
    "En esta sesión tu paciente ha expresado que quiere hacer ejercicio pero que suele posponerlo por pereza.",
    "En esta sesión tu paciente ha expresado que le cuesta concentrarse en clase y que luego se frustra por no entender.",
    "En esta sesión tu paciente ha expresado que discute con su pareja y luego se siente culpable.",
    "En esta sesión tu paciente ha expresado que quiere ahorrar dinero pero termina gastando en cosas innecesarias.",
    "En esta sesión tu paciente ha expresado que se pone nervioso en reuniones y por eso evita participar.",
    "En esta sesión tu paciente ha expresado que está durmiendo poco y que se siente agotado durante el día.",
    "En esta sesión tu paciente ha expresado que le cuesta decir que no y termina sobrecargándose.",
    "En esta sesión tu paciente ha expresado que quiere cambiar de trabajo pero tiene miedo de no encontrar algo mejor.",
    "En esta sesión tu paciente ha expresado que se distrae fácilmente y luego se atrasa con sus tareas.",
    "En esta sesión tu paciente ha expresado que se enoja con facilidad y luego se arrepiente de lo que dice.",
    "En esta sesión tu paciente ha expresado que quiere estudiar más pero no logra organizar su tiempo.",
    "En esta sesión tu paciente ha expresado que se siente solo y pasa mucho tiempo en redes sociales.",
    "En esta sesión tu paciente ha expresado que le preocupa su futuro y eso le genera ansiedad.",
    "En esta sesión tu paciente ha expresado que evita hablar de sus problemas y luego se siente peor.",
    "En esta sesión tu paciente ha expresado que quiere mejorar su salud pero no logra ser constante.",
    "En esta sesión tu paciente ha expresado que se compara con otros y eso afecta su autoestima.",
    "En esta sesión tu paciente ha expresado que siente presión por cumplir expectativas y eso lo estresa.",
    "En esta sesión tu paciente ha expresado que le cuesta confiar en las personas y por eso se aísla.",
    "En esta sesión tu paciente ha expresado que quiere descansar pero no logra dejar de pensar.",
    "En esta sesión tu paciente ha expresado que se siente inseguro al tomar decisiones y duda constantemente.",
    "En esta sesión tu paciente ha expresado que se molesta por su forma de reaccionar y luego se siente mal consigo mismo.",
    "En esta sesión tu paciente ha expresado que quiere cambiar sus hábitos pero siempre vuelve a lo mismo.",
    "En esta sesión tu paciente ha expresado que se siente desmotivado y eso afecta su rendimiento.",
    "En esta sesión tu paciente ha expresado que evita conflictos y luego acumula malestar.",
    "En esta sesión tu paciente ha expresado que le cuesta expresar lo que siente y eso genera malentendidos.",
    "En esta sesión tu paciente ha expresado que quiere avanzar pero siente que algo lo detiene.",
    "En esta sesión tu paciente ha expresado que se siente agotado emocionalmente y no sabe cómo manejarlo.",
    "En esta sesión tu paciente ha expresado que se preocupa demasiado y eso afecta su sueño.",
    "En esta sesión tu paciente ha expresado que quiere mejorar sus relaciones pero no sabe cómo hacerlo.",
    "En esta sesión tu paciente ha expresado que se frustra cuando las cosas no salen como espera y eso le afecta emocionalmente.",
    "En esta sesión tu paciente ha expresado que evita responsabilidades y luego se estresa por las consecuencias.",
    "En esta sesión tu paciente ha expresado que quiere ser más disciplinado pero no logra mantenerse constante.",
    "En esta sesión tu paciente ha expresado que se siente incómodo en situaciones sociales y prefiere evitarlas.",
    "En esta sesión tu paciente ha expresado que le cuesta desconectarse del trabajo y eso afecta su descanso.",
    "En esta sesión tu paciente ha expresado que quiere cambiar su actitud pero recae en los mismos patrones.",
    "En esta sesión tu paciente ha expresado que se siente abrumado por varias cosas y no logra manejarlas.",
    "En esta sesión tu paciente ha expresado que evita tomar decisiones y luego se arrepiente.",
    "En esta sesión tu paciente ha expresado que quiere sentirse mejor pero no sabe por dónde empezar.",
    "En esta sesión tu paciente ha expresado que le cuesta manejar sus emociones y eso afecta sus relaciones.",
  ],

  "clinico|exploracion|intermedio|sintesis": [
    "En esta sesión tu paciente ha expresado que quiere avanzar en sus estudios, que ha estado procrastinando constantemente y que luego se siente frustrado consigo mismo.",
    "En esta sesión tu paciente ha expresado que se siente cansado en el trabajo, que al llegar a casa no tiene energía y que esto está afectando su relación de pareja.",
    "En esta sesión tu paciente ha expresado que quiere hacer ejercicio, que le cuesta iniciar por pereza y que luego se siente culpable por no hacerlo.",
    "En esta sesión tu paciente ha expresado que le cuesta decir que no, que se sobrecarga de responsabilidades y que termina sintiéndose estresado.",
    "En esta sesión tu paciente ha expresado que quiere confiar en las personas, que tiene miedo de que lo lastimen y que por eso mantiene distancia.",
    "En esta sesión tu paciente ha expresado que se siente solo, que pasa mucho tiempo en redes sociales y que eso no logra hacerlo sentir mejor.",
    "En esta sesión tu paciente ha expresado que quiere organizar mejor su tiempo, que procrastina con frecuencia y que luego se presiona demasiado.",
    "En esta sesión tu paciente ha expresado que le preocupa su futuro, que eso le genera ansiedad y que le cuesta concentrarse en sus tareas.",
    "En esta sesión tu paciente ha expresado que quiere expresar lo que siente, que percibe que no lo entienden y que eso le genera frustración.",
    "En esta sesión tu paciente ha expresado que se siente inseguro al tomar decisiones, que duda constantemente y que termina evitando decidir.",
    "En esta sesión tu paciente ha expresado que quiere descansar, que su mente no deja de pensar y que eso está afectando su sueño.",
    "En esta sesión tu paciente ha expresado que se enoja con facilidad, que reacciona de forma impulsiva y que luego se siente culpable.",
    "En esta sesión tu paciente ha expresado que quiere mejorar su rendimiento académico, que se distrae con facilidad y que se frustra por eso.",
    "En esta sesión tu paciente ha expresado que se compara con otras personas, que se siente inferior y que eso afecta su autoestima.",
    "En esta sesión tu paciente ha expresado que siente presión por cumplir expectativas, que se exige mucho y que se siente agotado.",
    "En esta sesión tu paciente ha expresado que le cuesta confiar, que ha tenido experiencias negativas previas y que eso lo lleva a aislarse.",
    "En esta sesión tu paciente ha expresado que quiere cambiar de trabajo, que siente inseguridad y que teme tomar una mala decisión.",
    "En esta sesión tu paciente ha expresado que evita conflictos, que acumula malestar y que luego se siente desbordado.",
    "En esta sesión tu paciente ha expresado que le cuesta expresar emociones, que guarda lo que siente y que eso genera tensión en sus relaciones.",
    "En esta sesión tu paciente ha expresado que quiere avanzar en su vida, que siente que algo lo detiene y que no logra identificar qué es.",
    "En esta sesión tu paciente ha expresado que se siente emocionalmente agotado, que ha tenido muchas responsabilidades y que no sabe cómo manejarlas.",
    "En esta sesión tu paciente ha expresado que se preocupa constantemente, que anticipa problemas y que eso le afecta el descanso.",
    "En esta sesión tu paciente ha expresado que quiere mejorar sus relaciones, que no sabe cómo comunicarse mejor y que eso le genera frustración.",
    "En esta sesión tu paciente ha expresado que se frustra cuando las cosas no salen como espera, que reacciona emocionalmente y que luego se siente mal.",
    "En esta sesión tu paciente ha expresado que evita responsabilidades, que luego enfrenta las consecuencias y que eso le genera estrés.",
    "En esta sesión tu paciente ha expresado que quiere ser más disciplinado, que inicia cambios pero no los sostiene y que se desmotiva.",
    "En esta sesión tu paciente ha expresado que se siente incómodo en situaciones sociales, que tiende a evitarlas y que eso limita sus relaciones.",
    "En esta sesión tu paciente ha expresado que le cuesta desconectarse del trabajo, que sigue pensando en ello y que no logra descansar.",
    "En esta sesión tu paciente ha expresado que quiere cambiar su actitud, que reconoce patrones repetitivos y que le cuesta modificarlos.",
    "En esta sesión tu paciente ha expresado que se siente abrumado por varias situaciones, que no logra organizarlas y que se siente sobrepasado.",
    "En esta sesión tu paciente ha expresado que evita tomar decisiones, que posterga elecciones importantes y que luego se arrepiente.",
    "En esta sesión tu paciente ha expresado que quiere sentirse mejor, que ha intentado algunas cosas y que no ha visto cambios claros.",
    "En esta sesión tu paciente ha expresado que le cuesta manejar sus emociones, que reacciona intensamente y que eso afecta sus relaciones.",
    "En esta sesión tu paciente ha expresado que quiere tener más control, que siente que las cosas se le salen de las manos y que eso lo angustia.",
    "En esta sesión tu paciente ha expresado que se siente desmotivado, que ha perdido interés en actividades y que eso afecta su rutina.",
    "En esta sesión tu paciente ha expresado que quiere cambiar hábitos, que identifica lo que debería hacer y que no logra sostenerlo.",
    "En esta sesión tu paciente ha expresado que se siente inseguro, que duda de sí mismo y que evita exponerse.",
    "En esta sesión tu paciente ha expresado que quiere mejorar su bienestar, que no sabe por dónde empezar y que eso lo bloquea.",
    "En esta sesión tu paciente ha expresado que se siente frustrado consigo mismo, que no cumple sus expectativas y que se critica constantemente.",
    "En esta sesión tu paciente ha expresado que quiere avanzar, que ha hecho intentos y que siente que no logra progresar como quisiera.",
  ],

  "clinico|exploracion|avanzado|sintesis": [
    "En esta sesión tu paciente comentó que quiere cambiar su forma de actuar, pero que cuando intenta hacerlo comienza a dudar de sí mismo. También expresó que siente que debería hacerlo, aunque no está seguro de querer realmente ese cambio.",
    "En esta sesión tu paciente expresó que entiende lo que le está pasando emocionalmente, pero que ese entendimiento no le está ayudando a hacer algo diferente. Mencionó que eso lo frustra.",
    "En esta sesión tu paciente comentó que quiere dejar una situación atrás, pero que siente que aún hay algo que no termina de resolver. Señaló que eso lo mantiene enganchado.",
    "En esta sesión tu paciente expresó que se siente afectado por lo que está viviendo, pero que a veces piensa que lo está exagerando. También mencionó que eso le genera confusión.",
    "En esta sesión tu paciente comentó que quiere avanzar en su vida, pero que cada vez que lo intenta empieza a cuestionar si está tomando la decisión correcta. Señaló que eso lo hace detenerse.",
    "En esta sesión tu paciente expresó que una parte de él quiere cambiar ciertos hábitos, pero que otra parte prefiere quedarse en lo conocido. Mencionó que eso le genera conflicto interno.",
    "En esta sesión tu paciente comentó que se siente cansado de la situación actual, pero que no está seguro de querer asumir lo que implica cambiarla. Señaló que eso lo deja paralizado.",
    "En esta sesión tu paciente expresó que quiere confiar más en sí mismo, pero que después de tomar decisiones empieza a cuestionarlas. Mencionó que eso afecta su seguridad.",
    "En esta sesión tu paciente comentó que siente que esto depende de él, pero también que hay factores que no puede controlar. Señaló que eso le genera frustración.",
    "En esta sesión tu paciente expresó que quiere dejar de sentir malestar, pero que no sabe si realmente entiende de dónde viene. Mencionó que eso lo confunde.",
    "En esta sesión tu paciente comentó que se siente estancado, pero que no tiene claridad sobre qué cambiar. Señaló que eso le genera incomodidad.",
    "En esta sesión tu paciente expresó que quiere hacer las cosas diferente, pero que cuando lo intenta se siente incómodo y vuelve a lo mismo. Mencionó que eso le frustra.",
    "En esta sesión tu paciente comentó que se siente afectado emocionalmente, pero que no logra identificar exactamente por qué. Señaló que eso lo desconcierta.",
    "En esta sesión tu paciente expresó que quiere tomar decisiones, pero que cada opción le genera dudas. Mencionó que eso lo lleva a no decidir.",
    "En esta sesión tu paciente comentó que siente que esto es importante, pero que no actúa como si lo fuera. Señaló que eso le genera conflicto.",
    "En esta sesión tu paciente expresó que quiere mejorar, pero que no sabe si está dispuesto a sostener el esfuerzo que implica. Mencionó que eso lo detiene.",
    "En esta sesión tu paciente comentó que siente que esto es parte de él, pero que no está seguro de querer que siga siendo así. Señaló que eso le genera ambivalencia.",
    "En esta sesión tu paciente expresó que quiere avanzar, pero que siente que algo interno lo detiene. Mencionó que no logra identificar qué es.",
    "En esta sesión tu paciente comentó que se cuestiona constantemente, incluso cuando cree haber tomado una buena decisión. Señaló que eso afecta su confianza.",
    "En esta sesión tu paciente expresó que quiere cambiar, pero que cuando lo piensa más siente que no está listo para hacerlo. Mencionó que eso le genera tensión interna.",
  ],

  /* =========================================================
     INTERVENCIÓN — INTERPRETACIÓN
  ========================================================= */
  "clinico|intervencion|unico|interpretacion": [
    {
      "contexto": "El paciente creció con un padre que corregía constantemente sus errores y rara vez reconocía sus logros.",
      "frase": "En esos espacios prefiero pasar más desapercibido."
    },
    {
      "contexto": "Durante su infancia, el paciente asumía el rol de evitar discusiones entre sus padres.",
      "frase": "Cuando la conversación cambia de tono, prefiero no seguir por ahí."
    },
    {
      "contexto": "En relaciones anteriores, el paciente fue rechazado cuando expresaba lo que sentía.",
      "frase": "Hay cosas en la relación que no termino de ubicar bien."
    },
    {
      "contexto": "El paciente creció en un entorno donde equivocarse implicaba castigo o burla.",
      "frase": "Hay cosas que prefiero no mover demasiado."
    },
    {
      "contexto": "El paciente solo recibía reconocimiento cuando cumplía expectativas altas.",
      "frase": "Siento que todavía hay algo que no termina de encajar."
    },
    {
      "contexto": "Ha tenido experiencias donde personas cercanas se alejaban sin explicación.",
      "frase": "A veces noto cambios y no termino de entenderlos."
    },
    {
      "contexto": "El paciente ha dependido de la aprobación de otros para sentirse seguro.",
      "frase": "Me da más tranquilidad cuando lo reviso con alguien."
    },
    {
      "contexto": "En su historia, mostrar vulnerabilidad generaba críticas o incomodidad en otros.",
      "frase": "No siempre me siento cómodo mostrándome así."
    },
    {
      "contexto": "El paciente aprendió a controlar sus emociones para evitar consecuencias negativas.",
      "frase": "En teoría no debería importarme tanto… pero igual lo sigo pensando."
    },
    {
      "contexto": "Se ha exigido constantemente para evitar críticas externas.",
      "frase": "Siento que podría ajustarlo un poco más."
    },

    {
      "contexto": "El paciente fue responsabilizado emocionalmente por el bienestar de su familia.",
      "frase": "Siento que si hago las cosas bien, la relación debería estar bien."
    },
    {
      "contexto": "En su adolescencia, fue ridiculizado cuando participaba en público.",
      "frase": "Hoy me tocaba participar más de lo normal, pero no terminé haciéndolo."
    },
    {
      "contexto": "El paciente aprendió que equivocarse generaba rechazo.",
      "frase": "Hay cosas que prefiero no mover demasiado."
    },
    {
      "contexto": "Creció con estándares muy altos que rara vez sentía alcanzar.",
      "frase": "Siento que todavía hay algo que no termina de encajar."
    },
    {
      "contexto": "Ha vivido vínculos donde el otro se retiraba emocionalmente sin explicación.",
      "frase": "Cuando no responden, como que empiezo a darle vueltas a lo mismo."
    },
    {
      "contexto": "Ha tomado decisiones guiado por la opinión de otros durante gran parte de su vida.",
      "frase": "No siempre termino convencido de lo que decido."
    },
    {
      "contexto": "Fue invalidado cuando expresaba emociones intensas.",
      "frase": "No siempre siento que sea buen momento para mostrar eso."
    },
    {
      "contexto": "Ha aprendido que relajarse puede implicar perder el control.",
      "frase": "No me es tan fácil quedarme tranquilo."
    },
    {
      "contexto": "El paciente se ha exigido constantemente para no cometer errores.",
      "frase": "Siempre encuentro algo que podría pulir."
    },
    {
      "contexto": "Ha desarrollado una tendencia a anticipar problemas para evitarlos.",
      "frase": "Prefiero ir midiendo antes de avanzar."
    },

    {
      "contexto": "En su familia, sus emociones eran minimizadas o ignoradas.",
      "frase": "A veces no tengo claro si esto es para tanto."
    },
    {
      "contexto": "El paciente fue castigado por errores pequeños durante su infancia.",
      "frase": "No me siento muy cómodo probando cosas nuevas."
    },
    {
      "contexto": "Ha evitado conflictos para mantener cercanía con otros.",
      "frase": "Siento que no siempre suma entrar en eso."
    },
    {
      "contexto": "Recibía críticas constantes sobre su desempeño académico.",
      "frase": "Recibí comentarios sobre lo que hice y me quedé pensando más de lo esperado."
    },
    {
      "contexto": "Ha experimentado rupturas sin cierre emocional.",
      "frase": "A veces las cosas cambian sin mucho aviso."
    },
    {
      "contexto": "Se ha sentido más seguro cuando otros validan sus decisiones.",
      "frase": "Me deja más tranquilo cuando alguien más lo ve."
    },
    {
      "contexto": "Fue juzgado por expresar emociones en su entorno cercano.",
      "frase": "No siempre siento que sea útil decirlo."
    },
    {
      "contexto": "Ha desarrollado control emocional rígido para evitar consecuencias.",
      "frase": "Hay cosas que para mí deberían ser claras en una relación, pero no siempre se ven así."
    },
    {
      "contexto": "El paciente asocia valor personal con desempeño.",
      "frase": "No me gusta dejar cosas sin cerrar."
    },
    {
      "contexto": "Tiende a anticipar errores para prevenir consecuencias negativas.",
      "frase": "Siempre estoy viendo qué podría pasar."
    },

    {
      "contexto": "Fue comparado constantemente con otros en su infancia.",
      "frase": "Hay personas que siento que encajan mejor que yo en ciertos espacios."
    },
    {
      "contexto": "Evitar desacuerdos fue clave para mantener vínculos en su historia.",
      "frase": "Cuando pasan esas cosas, prefiero no seguir por ahí."
    },
    {
      "contexto": "Fue castigado por tomar decisiones equivocadas.",
      "frase": "Lo he pensado varias veces, pero no termino de moverme."
    },
    {
      "contexto": "Aprendió que el error tenía consecuencias negativas.",
      "frase": "Prefiero no arriesgar demasiado."
    },

    {
      "contexto": "El paciente sufrió abuso sexual en la infancia y nunca habló del tema en su familia.",
      "frase": "No es algo que me aporte mucho pensar, entonces prefiero enfocarme en otras cosas."
    },
    {
      "contexto": "Vivió episodios de violencia física entre sus padres durante su niñez.",
      "frase": "Cuando el ambiente cambia, como que automáticamente busco otra cosa que hacer."
    },
    {
      "contexto": "Fue abandonado emocionalmente por uno de sus cuidadores en etapas tempranas.",
      "frase": "Prefiero no hacerme muchas ideas con la gente, así es más sencillo."
    },
    {
      "contexto": "Creció en un entorno donde el dinero era escaso y generaba constantes conflictos familiares.",
      "frase": "Siempre trato de tener claro lo que entra y lo que sale… no me gusta mover eso mucho."
    },
    {
      "contexto": "Fue educado con creencias religiosas rígidas que asociaban el deseo sexual con culpa.",
      "frase": "Hay temas que prefiero no cuestionar demasiado."
    }
  ],

  /* =========================================================
     INTERVENCIÓN — CONFRONTACIÓN
  ========================================================= */
  "clinico|intervencion|unico|confrontacion": [
     "En un momento comenta que ya no le afecta lo ocurrido, pero más adelante reconoce que sigue dándole vueltas constantemente.",
    "Dice que quiere dejar atrás la situación, pero durante la sesión vuelve varias veces al mismo tema.",
    "Menciona que está tranquilo con su decisión, aunque luego expresa dudas sobre si fue lo correcto.",
    "Se describe como alguien a quien no le afecta la opinión de otros, pero relata que ciertos comentarios le impactaron.",
    "Habla de querer cambiar, pero reconoce que sigue actuando de la misma manera.",
    "Comenta que se siente listo para avanzar, aunque también señala que hay algo que lo frena.",
    "Dice confiar en su pareja, pero menciona situaciones donde sospecha o duda.",
    "Expresa que no le preocupa equivocarse, pero evita situaciones donde podría fallar.",
    "Dice querer enfrentar las cosas, aunque en la práctica ha estado evitándolas.",
    "Menciona que ya superó lo ocurrido, pero reconoce que aún le genera malestar al recordarlo.",
    "Se plantea la idea de priorizarse, pero termina actuando en función de otros.",
    "Se describe como seguro de sí mismo, aunque luego comenta que duda frecuentemente de lo que hace.",
    "Dice querer confiar en las personas, pero mantiene distancia en sus relaciones.",
    "Expresa que quiere mejorar su relación, pero evita conversaciones importantes con su pareja.",
    "Menciona estar motivado, aunque también reconoce falta de energía para actuar.",
    "Dice que no le afecta lo que ocurre en el trabajo, pero comenta que sigue pensando en ello fuera del horario.",
    "Se plantea tomar decisiones por sí mismo, aunque prefiere que otros confirmen o decidan.",
    "Habla de querer mejorar su autoestima, pero se describe con términos descalificadores.",
    "Expresa querer enfrentar sus miedos, aunque tiende a evitarlos.",
    "Menciona sentirse tranquilo, pero también refiere inquietud en distintos momentos.",
    "Dice querer dejar de preocuparse, aunque pasa gran parte del tiempo pensando en posibles problemas.",
    "Habla de avanzar en su vida, pero reconoce sentirse cómodo en su situación actual.",
    "Comenta estar bien solo, aunque menciona sentirse solo con frecuencia.",
    "Expresa querer mejorar en el trabajo, pero no ha hecho cambios en su forma de actuar.",
    "Dice que una situación no le importa, aunque reconoce que le afecta más de lo que esperaba.",
    "Se plantea hacer cambios, pero observa que repite los mismos patrones.",
    "Habla de confiar en sí mismo, pero cuestiona constantemente sus decisiones.",
    "Dice querer dejar de evitar, aunque continúa alejándose de situaciones importantes.",
    "Se describe como estable emocionalmente, pero menciona sentirse afectado en varios momentos.",
    "Expresa querer avanzar, aunque no se siente listo para hacerlo.",
    "Dice que no le importa una persona, pero reconoce que lo que hace le sigue afectando.",
    "Habla de cambiar su forma de pensar, pero mantiene las mismas ideas en distintas situaciones.",
    "Expresa querer sentirse mejor, aunque no ha implementado cambios en su rutina.",
    "Dice querer mejorar sus relaciones, pero mantiene distancia con otros.",
    "Se describe como tranquilo con la situación, aunque la sigue pensando con frecuencia.",
    "Expresa querer exigirse menos, pero siente que si no lo hace las cosas se desordenan.",
    "Dice que lo ocurrido no le afecta, pero reconoce molestia al recordarlo.",
    "Habla de confiar más en otros, pero mantiene desconfianza generalizada.",
    "Expresa querer hacer algo diferente, pero termina actuando de la misma forma.",
    "Menciona que quiere cambiar, aunque señala que le cuesta sostener cualquier intento.",
    "Dice que quiere avanzar, pero nota que algo en él lo mantiene en el mismo lugar.",
    "Expresa que quiere estar mejor, aunque mantiene hábitos que lo afectan.",
    "Habla de querer soltar la situación, pero continúa revisándola mentalmente.",
    "Se describe como alguien decidido, pero evita tomar decisiones importantes.",
    "Expresa querer sentirse en paz, aunque mantiene pensamientos que lo inquietan."
  ],

  /* =========================================================
     INTERVENCIÓN — AUTO REVELACIÓN
  ========================================================= */
  "clinico|intervencion|unico|auto_revelacion": [
    {
      "contexto_paciente": "Está atravesando un divorcio reciente y siente que perdió estabilidad emocional.",
      "contexto_terapeuta": "Ha pasado por un divorcio.",
      "frase_paciente": "Siento que todo se desordenó de golpe."
    },
    {
      "contexto_paciente": "Tiene ansiedad social y evita exponerse en su trabajo.",
      "contexto_terapeuta": "Ha experimentado ansiedad social.",
      "frase_paciente": "Solo pensarlo ya me activa demasiado."
    },
    {
      "contexto_paciente": "Se exige constantemente en su desempeño profesional.",
      "contexto_terapeuta": "Ha trabajado su autoexigencia.",
      "frase_paciente": "Siento que siempre hay algo más que debería hacer."
    },
    {
      "contexto_paciente": "Ha vivido varias rupturas amorosas que afectaron su autoestima.",
      "contexto_terapeuta": "Ha atravesado rupturas significativas.",
      "frase_paciente": "A veces siento que eso se me quedó pegado."
    },
    {
      "contexto_paciente": "Se siente estancado en su vida personal.",
      "contexto_terapeuta": "Ha atravesado etapas de estancamiento.",
      "frase_paciente": "Siento que estoy en pausa hace rato."
    },

    {
      "contexto_paciente": "Tiene miedo a equivocarse y evita tomar decisiones.",
      "contexto_terapeuta": "Ha trabajado el miedo al error.",
      "frase_paciente": "Me cuesta avanzar cuando no tengo todo claro."
    },
    {
      "contexto_paciente": "Tiene dificultad para poner límites en su familia.",
      "contexto_terapeuta": "Ha trabajado el establecimiento de límites.",
      "frase_paciente": "Siento que me cuesta más de lo que debería."
    },
    {
      "contexto_paciente": "Ha vivido rechazo en relaciones anteriores.",
      "contexto_terapeuta": "Ha vivido experiencias similares de rechazo.",
      "frase_paciente": "Hay algo ahí que todavía pesa."
    },
    {
      "contexto_paciente": "Se siente inseguro en su rol laboral.",
      "contexto_terapeuta": "Ha trabajado inseguridad profesional.",
      "frase_paciente": "A veces dudo más de lo que muestro."
    },
    {
      "contexto_paciente": "Tiende a sobrepensar constantemente.",
      "contexto_terapeuta": "Ha trabajado patrones de sobrepensamiento.",
      "frase_paciente": "Mi mente no se apaga fácilmente."
    },

    {
      "contexto_paciente": "Está atravesando una pérdida importante.",
      "contexto_terapeuta": "Ha trabajado procesos de duelo.",
      "frase_paciente": "Hay momentos donde todo se siente más pesado."
    },
    {
      "contexto_paciente": "Depende mucho de la aprobación de otros.",
      "contexto_terapeuta": "Ha trabajado validación externa.",
      "frase_paciente": "Lo que otros piensen sí me mueve más de lo que quisiera."
    },
    {
      "contexto_paciente": "Evita expresar emociones en su familia.",
      "contexto_terapeuta": "Ha trabajado expresión emocional.",
      "frase_paciente": "No siempre me sale mostrar eso."
    },
    {
      "contexto_paciente": "Tiene miedo a quedarse solo.",
      "contexto_terapeuta": "Ha trabajado miedo a la soledad.",
      "frase_paciente": "Esa idea me incomoda más de lo que pensaba."
    },
    {
      "contexto_paciente": "Se siente bloqueado para iniciar proyectos.",
      "contexto_terapeuta": "Ha trabajado bloqueos personales.",
      "frase_paciente": "Siento que me quedo ahí antes de empezar."
    },

    {
      "contexto_paciente": "Tiene dificultad para confiar en sus decisiones.",
      "contexto_terapeuta": "Ha trabajado toma de decisiones.",
      "frase_paciente": "Después de decidir, empiezo a dudar."
    },
    {
      "contexto_paciente": "Se compara constantemente con otros.",
      "contexto_terapeuta": "Ha trabajado comparación social.",
      "frase_paciente": "Termino midiéndome con otros sin darme cuenta."
    },
    {
      "contexto_paciente": "Tiene ansiedad anticipatoria.",
      "contexto_terapeuta": "Ha trabajado ansiedad anticipatoria.",
      "frase_paciente": "Me adelanto a lo que podría pasar."
    },
    {
      "contexto_paciente": "Se siente emocionalmente agotado.",
      "contexto_terapeuta": "Ha atravesado desgaste emocional.",
      "frase_paciente": "Siento que ya no me alcanza igual."
    },
    {
      "contexto_paciente": "Evita conflictos en su relación.",
      "contexto_terapeuta": "Ha trabajado evitación de conflicto.",
      "frase_paciente": "Prefiero dejarlo pasar aunque me quede algo."
    },

    {
      "contexto_paciente": "Se siente perdido respecto a su propósito.",
      "contexto_terapeuta": "Ha atravesado crisis de sentido.",
      "frase_paciente": "No tengo tan claro hacia dónde voy."
    },
    {
      "contexto_paciente": "Tiene miedo a fracasar.",
      "contexto_terapeuta": "Ha trabajado miedo al fracaso.",
      "frase_paciente": "Me detiene pensar en que podría salir mal."
    },
    {
      "contexto_paciente": "Se siente desconectado emocionalmente.",
      "contexto_terapeuta": "Ha trabajado desconexión emocional.",
      "frase_paciente": "No siempre conecto con lo que siento."
    },
    {
      "contexto_paciente": "Tiene dificultad para priorizarse.",
      "contexto_terapeuta": "Ha trabajado priorización personal.",
      "frase_paciente": "Me cuesta ponerme primero."
    },
    {
      "contexto_paciente": "Siente culpa al descansar.",
      "contexto_terapeuta": "Ha trabajado culpa asociada al descanso.",
      "frase_paciente": "Descansar me genera ruido."
    },

    {
      "contexto_paciente": "Tiene miedo a expresar desacuerdo.",
      "contexto_terapeuta": "Ha trabajado asertividad.",
      "frase_paciente": "No siempre digo lo que pienso."
    },
    {
      "contexto_paciente": "Se siente emocionalmente vulnerable.",
      "contexto_terapeuta": "Ha trabajado vulnerabilidad.",
      "frase_paciente": "Siento que me afecta más de lo que quisiera."
    },
    {
      "contexto_paciente": "Tiene dificultad para cerrar ciclos.",
      "contexto_terapeuta": "Ha trabajado procesos de cierre.",
      "frase_paciente": "Me cuesta soltar eso."
    },
    {
      "contexto_paciente": "Se siente inseguro al hablar.",
      "contexto_terapeuta": "Ha trabajado inseguridad comunicativa.",
      "frase_paciente": "Me pasa que me freno antes de decir algo."
    },
    {
      "contexto_paciente": "Siente presión constante.",
      "contexto_terapeuta": "Ha vivido presión sostenida.",
      "frase_paciente": "Siento que no bajo nunca el ritmo."
    },

    {
      "contexto_paciente": "Se siente insuficiente profesionalmente.",
      "contexto_terapeuta": "Ha trabajado inseguridad profesional.",
      "frase_paciente": "Siento que me falta algo."
    },
    {
      "contexto_paciente": "Tiene dificultad para confiar en sí mismo.",
      "contexto_terapeuta": "Ha trabajado autoconfianza.",
      "frase_paciente": "No termino de confiar en lo que hago."
    },
    {
      "contexto_paciente": "Se siente atrapado en su rutina.",
      "contexto_terapeuta": "Ha trabajado estancamiento personal.",
      "frase_paciente": "Todo se repite bastante."
    },
    {
      "contexto_paciente": "Busca aprobación constante.",
      "contexto_terapeuta": "Ha trabajado dependencia de aprobación.",
      "frase_paciente": "Me ayuda cuando alguien lo valida."
    },
    {
      "contexto_paciente": "Tiene pensamientos negativos recurrentes.",
      "contexto_terapeuta": "Ha trabajado pensamiento negativo.",
      "frase_paciente": "Me voy fácil hacia lo negativo."
    },

    {
      "contexto_paciente": "Se siente desconectado de sí mismo.",
      "contexto_terapeuta": "Ha trabajado conexión personal.",
      "frase_paciente": "No me siento tan conectado conmigo."
    },
    {
      "contexto_paciente": "Evita involucrarse emocionalmente.",
      "contexto_terapeuta": "Ha trabajado evitación emocional.",
      "frase_paciente": "Prefiero no meterme tanto."
    },
    {
      "contexto_paciente": "Tiene miedo a equivocarse frente a otros.",
      "contexto_terapeuta": "Ha trabajado exposición al error.",
      "frase_paciente": "Me pesa equivocarme delante de otros."
    },
    {
      "contexto_paciente": "Se siente responsable por todo.",
      "contexto_terapeuta": "Ha trabajado sobre-responsabilidad.",
      "frase_paciente": "Siento que recae en mí."
    },
    {
      "contexto_paciente": "Tiene dificultad para relajarse.",
      "contexto_terapeuta": "Ha trabajado control y relajación.",
      "frase_paciente": "No me es fácil parar."
    }
  ],

  /* =========================================================
     INTERVENCIÓN — SARCASMO TERAPÉUTICO
  ========================================================= */
  "clinico|intervencion|unico|sarcasmo_terapeutico": [
    {
      "contexto": "Paciente masculino, sesión 3, patrón repetitivo con insight.",
      "frase_paciente": "Ya esto parece una suscripción… siempre termino en lo mismo."
    },
    {
      "contexto": "Paciente femenina, sesión intermedia, autosabotaje.",
      "frase_paciente": "Es como si yo misma me metiera la zancadilla justo cuando voy bien."
    },
    {
      "contexto": "Paciente masculino, sesión 2, contradicción.",
      "frase_paciente": "Quiero cambiar… pero parece que tengo piloto automático."
    },
    {
      "contexto": "Paciente femenina, sesión 4, control.",
      "frase_paciente": "Entre más intento tener todo bajo control, más se me desarma."
    },
    {
      "contexto": "Paciente masculino, sesión intermedia, evitación.",
      "frase_paciente": "Evito pensar en eso… pero mi mente no coopera mucho."
    },

    {
      "contexto": "Paciente femenina, sesión 3, patrón relacional.",
      "frase_paciente": "Digo que quiero algo distinto… pero el casting siempre me sale igual."
    },
    {
      "contexto": "Paciente masculino, sesión 3, sobrepensamiento.",
      "frase_paciente": "Pienso tanto que ya debería cobrarle alquiler a los pensamientos."
    },
    {
      "contexto": "Paciente femenina, sesión 2, autoexigencia.",
      "frase_paciente": "Si fuera por mí, nunca me daría un ‘suficiente’."
    },
    {
      "contexto": "Paciente masculino, sesión avanzada, ambivalencia.",
      "frase_paciente": "No me importa… bueno, sí, pero trato de que no se note."
    },
    {
      "contexto": "Paciente femenina, sesión 3, ambivalencia vincular.",
      "frase_paciente": "Quiero acercarme… pero cuando lo hago, me echo para atrás."
    },

    {
      "contexto": "Paciente masculino, sesión 2, ansiedad.",
      "frase_paciente": "Quiero estar tranquilo… pero mi cabeza tiene otros planes."
    },
    {
      "contexto": "Paciente femenina, sesión intermedia, culpa leve racionalizada.",
      "frase_paciente": "Descansar se siente raro… como si estuviera dejando algo pendiente."
    },
    {
      "contexto": "Paciente masculino, sesión 4, procrastinación.",
      "frase_paciente": "Yo creo que si procrastinar fuera deporte, ya estaría en las olimpiadas."
    },
    {
      "contexto": "Paciente femenina, sesión 3, ansiedad.",
      "frase_paciente": "Entre más lo pienso… peor se pone todo."
    },
    {
      "contexto": "Paciente masculino, sesión 2, ambivalencia.",
      "frase_paciente": "No quiero cambiar… pero tampoco quiero seguir así… entonces ahí estoy."
    },

    {
      "contexto": "Paciente femenina, sesión intermedia, apego.",
      "frase_paciente": "Quiero soltar… pero parece que no sé cómo hacerlo sin volver."
    },
    {
      "contexto": "Paciente masculino, sesión 3, hábito disfuncional.",
      "frase_paciente": "Sé que me hace daño… pero también sé que probablemente lo repita."
    },
    {
      "contexto": "Paciente femenina, sesión avanzada, patrón relacional.",
      "frase_paciente": "Siempre termino con el mismo tipo… ya ni sé si es casualidad."
    },
    {
      "contexto": "Paciente masculino, sesión 2, minimización.",
      "frase_paciente": "No es tan grave… solo que no dejo de pensar en eso."
    },
    {
      "contexto": "Paciente femenina, sesión 4, preocupación.",
      "frase_paciente": "Me preparo para problemas que ni han pasado… por si acaso."
    },

    {
      "contexto": "Paciente masculino, sesión intermedia, estancamiento.",
      "frase_paciente": "Quiero avanzar… pero me veo sentado en el mismo lugar."
    },
    {
      "contexto": "Paciente femenina, sesión 3, control.",
      "frase_paciente": "Necesito entender todo… para poder relajarme un poco."
    },
    {
      "contexto": "Paciente masculino, sesión 2, evitación.",
      "frase_paciente": "Evito cosas… y luego me llegan todas juntas."
    },
    {
      "contexto": "Paciente femenina, sesión 4, insight emocional.",
      "frase_paciente": "Me afecta más de lo que me gustaría aceptar."
    },
    {
      "contexto": "Paciente masculino, sesión 3, confianza.",
      "frase_paciente": "Quiero confiar… pero tampoco quiero salir perdiendo."
    },

    {
      "contexto": "Paciente femenina, sesión intermedia, repetición.",
      "frase_paciente": "Siempre digo ‘esta vez es diferente’… y bueno."
    },
    {
      "contexto": "Paciente masculino, sesión 2, rumiación.",
      "frase_paciente": "No quiero pensar en eso… pero vuelve como notificación."
    },
    {
      "contexto": "Paciente femenina, sesión 3, incoherencia.",
      "frase_paciente": "Quiero estar mejor… pero no hago mucho distinto."
    },
    {
      "contexto": "Paciente masculino, sesión 4, bloqueo.",
      "frase_paciente": "Sé qué hacer… pero no sé por qué no lo hago."
    },
    {
      "contexto": "Paciente femenina, sesión 2, ansiedad leve.",
      "frase_paciente": "Me preocupo… incluso cuando no hay mucho de qué."
    },

    {
      "contexto": "Paciente masculino, sesión intermedia, rumiación.",
      "frase_paciente": "Quiero dejar de pensar… pero mi mente no firmó ese acuerdo."
    },
    {
      "contexto": "Paciente femenina, sesión 3, ambivalencia.",
      "frase_paciente": "Me afecta… aunque haga como que no."
    },
    {
      "contexto": "Paciente masculino, sesión 2, evitación.",
      "frase_paciente": "Evito… pero eso no hace que desaparezca."
    },
    {
      "contexto": "Paciente femenina, sesión 4, repetición.",
      "frase_paciente": "Siempre vuelvo al mismo punto… con distinto camino."
    },
    {
      "contexto": "Paciente masculino, sesión intermedia, resistencia.",
      "frase_paciente": "Quiero cambiar… pero parece que no tanto."
    },

    {
      "contexto": "Paciente femenina, sesión 3, ansiedad leve.",
      "frase_paciente": "Me preocupo… hasta por preocuparme."
    },
    {
      "contexto": "Paciente masculino, sesión 2, bloqueo.",
      "frase_paciente": "Quiero avanzar… pero algo me pone freno."
    },
    {
      "contexto": "Paciente femenina, sesión intermedia, patrón.",
      "frase_paciente": "Termino haciendo lo que ya sabía que iba a hacer."
    },
    {
      "contexto": "Paciente masculino, sesión 3, incongruencia.",
      "frase_paciente": "No me gusta cómo me siento… pero tampoco cambio mucho."
    },
    {
      "contexto": "Paciente femenina, sesión 4, dificultad.",
      "frase_paciente": "Quiero cambiar… pero no es tan fácil como suena."
    }
  ],

  /* =========================================================
     INTERVENCIÓN — EVOCACIÓN INCOMPLETA GUIADA
  ========================================================= */
  "clinico|intervencion|unico|evocacion_incompleta_guiada": [
    "Siempre termino con el mismo tipo de persona.",
    "Cuando algo va bien, hago algo y lo arruino.",
    "Quiero estar cerca, pero cuando lo estoy me alejo.",
    "Siempre que me va bien, algo pasa.",
    "Evito las cosas hasta que ya es muy tarde.",
    "Siempre pienso lo peor primero.",
    "Quiero cambiar, pero hago lo mismo.",
    "Me ilusiono rápido y luego me decepciono.",
    "Siempre dejo las cosas para después.",
    "Quiero avanzar, pero algo me detiene.",
    "Siempre vuelvo a lo mismo.",
    "Me cuesta confiar, aunque quiero.",
    "Quiero estar tranquilo, pero no paro de pensar.",
    "Siempre termino dudando de mí.",
    "Sé lo que tengo que hacer, pero no lo hago.",
    "Cuando me siento mal, me aíslo.",
    "Quiero acercarme, pero me alejo.",
    "Siempre me comparo con otros.",
    "Siempre termino sintiéndome igual.",
    "Quiero cambiar, pero no sé cómo.",
    "No quiero sentir esto, pero aparece.",
    "Siempre termino en lo mismo.",
    "Quiero confiar, pero no confío.",
    "Me cuesta soltar las cosas.",
    "Siempre reacciono igual.",
    "Quiero estar bien, pero no hago nada distinto.",
    "Siempre pienso de más.",
    "Cuando me acerco, me asusto.",
    "Quiero cambiar, pero me quedo igual.",
    "Siempre me pasa lo mismo.",
    "Siempre termino dudando.",
    "Quiero avanzar, pero no me muevo.",
    "Siempre me detengo.",
    "Cuando algo va bien, lo arruino.",
    "Quiero soltar, pero no suelto.",
    "Siempre termino igual.",
    "Siempre me pasa lo mismo.",
    "Quiero cambiar, pero no cambio.",
    "Siempre repito lo mismo.",
    "Cuando me siento así, me cierro.",
  ],

};

/**
 * Obtiene el pool de casos para una configuración dada.
 * @param {string} contexto
 * @param {string} escenario
 * @param {string} nivel   - basico | intermedio | avanzado
 * @param {string} habilidad
 * @returns {string[]}
 */
function getCasos(contexto, escenario, nivel, habilidad) {
  const key = `${contexto}|${escenario}|${nivel}|${habilidad}`;
  return CASOS[key] || [];
}

module.exports = { CASOS, getCasos };
