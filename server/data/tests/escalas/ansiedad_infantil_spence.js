// Escala de Ansiedad Infantil de Spence
module.exports = {
    id: "ansi-inf-spence",
    nombre: "Escala de Ansiedad Infantil de Spence",
    tipo: "escala",
    version: 1,
    pdfUrl: "/tests/ansi-inf-spence.pdf",
    configuracion: {
      items: [
        { 
            key: "i1", 
            texto: "Hay cosas que me preocupan", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i2", 
            texto: "Me da miedo la oscuridad", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i3", 
            texto: "Cuando tengo un problema noto una sensación extraña en el estómago", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i4", 
            texto: "Tengo miedo", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i5", 
            texto: "Tendría miedo si me quedara solo en casa", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i6", 
            texto: "Me da miedo hacer un examen", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i7", 
            texto: "Me da miedo usar aseos públicos", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i8", 
            texto: "Me preocupo cuando estoy lejos de mis padres", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i9", 
            texto: "Tengo miedo de hacer el ridículo delante de la gente", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i10", 
            texto: "Me preocupa hacer mal el trabajo de la escuela", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i11", 
            texto: "Soy popular entre los niños y niñas de mi edad", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i12", 
            texto: "Me preocupa que algo malo le suceda a alguien de mi familia", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i13", 
            texto: "De repente siento que no puedo respirar sin motivo", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i14", 
            texto: "Necesito comprobar varias veces que he hecho bien las cosas (como apagar la luz, o cerrar la puerta con llave)", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i15", 
            texto: "Me da miedo dormir solo", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i16", 
            texto: "Estoy nervioso o tengo miedo por las mañanas antes de ir al colegio", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i17", 
            texto: "Soy bueno en los deportes", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i18", 
            texto: "Me dan miedo los perros", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i19", 
            texto: "No puedo dejar de pensar en cosas malas o tontas", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i20", 
            texto: "Cuando tengo un problema mi corazón late muy fuerte", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i21", 
            texto: "De repente empiezo a temblar sin motivo", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i22", 
            texto: "Me preocupa que algo malo pueda pasarme", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        { 
            key: "i23", 
            texto: "Me da miedo ir al médico o al dentista", 
            opciones: [
                {valor: 0, label: "Nunca"},
                {valor: 1, label: "A veces"},
                {valor: 2, label: "Muchas veces"},
                {valor: 3, label: "Siempre"}
            ] 
        },
        
      ],
      scoring: {
        metodo: "suma",
        interpretacion: [
          { rango: [0, 5], etiqueta: "Mínimo" },
          { rango: [6, 10], etiqueta: "Leve" },
          { rango: [11, 15], etiqueta: "Moderado" },
          { rango: [16, 20], etiqueta: "Severo" }
        ]
      }
    }
  };
