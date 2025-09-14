// /data/tests/vf/esc_evi_mal_soc.js
module.exports = {
    id: "esc_evi_mal_soc",
    nombre: "Escala de evitación y malestar social (SAD)",
    tipo: "vf",
    version: 1,
    pdfUrl: "/tests/esc_evi_mal_soc.pdf",
    configuracion: {
      items: [
        { key: "i1", texto: "Me siento tranquilo/a incluso en situaciones sociales no habituales." },
        { key: "i2", texto: "Procuro evitar las situaciones que me obligan a mostrarme muy sociable." },
        { key: "i3", texto: "Me resulta fácil estar tranquilo/a cuando estoy entre desconocidos." },
        { key: "i4", texto: "No siento ningún deseo especial de evitar a la gente." },
        { key: "i5", texto: "A menudo me ponen muy nervioso/a las reuniones sociales." },
        { key: "i6", texto: "Generalmente me siento tranquilo/a y cómodo/a en las reuniones sociales." },
        { key: "i7", texto: "Suelo estar tranquilo/a cuando hablo con una persona del sexo contrario." },
        { key: "i8", texto: "Procuro no dirigir la palabra a las personas a menos que las conozca bien." },
        { key: "i9", texto: "Si se me presenta la ocasión de conocer a gente nueva, suelo aprovecharla." },
        { key: "i10", texto: "A menudo estoy tenso/a y atemorizado/a en reuniones informales en las que están presentes personas de los dos sexos." },
        { key: "i11", texto: "Suelen inspirarme temor las personas, a no ser que las conozca bien." },
        { key: "i12", texto: "Suelo estar tranquilo/a cuando estoy entre un grupo de personas a las que no conozco." },
        { key: "i13", texto: "Siento a menudo la necesidad de alejarme de la gente." },
        { key: "i14", texto: "Suelo sentirme incómodo/a cuando estoy con un grupo de personas a las que no conozco." },
        { key: "i15", texto: "Suelo estar tranquilo/a en compañía de una persona a la que acabo de conocer." },
        { key: "i16", texto: "El hecho de que me presenten a gente desconocida me causa temor e inquietud." },
        { key: "i17", texto: "No me importa entrar en una sala llena de desconocidos." },
        { key: "i18", texto: "No me gustaría abandonar mi silla para unirme a un grupo amplio de gente." },
        { key: "i19", texto: "Cuando mis superiores quieren hablar conmigo, les hablo sin ningún problema." },
        { key: "i20", texto: "A menudo me siento muy nervioso/a cuando estoy con un grupo de gente." },
        { key: "i21", texto: "Tiendo a apartarme de la gente." },
        { key: "i22", texto: "No me preocupa hablar con la gente en fiestas y reuniones." },
        { key: "i23", texto: "Casi nunca me siento a gusto en un grupo amplio de gente." },
        { key: "i24", texto: "A menudo invento excusas para evitar compromisos sociales." },
        { key: "i25", texto: "A veces asumo la responsabilidad de presentar a dos personas." },
        { key: "i26", texto: "He intentado evitar actos sociales muy formales." },
        { key: "i27", texto: "Suelo respetar todos los compromisos sociales que se me presentan." },
        { key: "i28", texto: "Me resulta fácil estar relajado/a en compañía de otras personas." },
      ],
      // Opcional: mapea valor para scoring
      opciones: [
        { valor: true, label: "Verdadero" },
        { valor: false, label: "Falso" }
      ],
      scoring: { metodo: "custom" } // si luego quieres puntuar VF
    }
  };