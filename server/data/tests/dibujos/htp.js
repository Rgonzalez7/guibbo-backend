module.exports = {
    id: "dibujo-htp",
    nombre: "HTP (House-Tree-Person)",
    tipo: "dibujo",
    version: 1,
    pdfUrl: "/tests/dibujo-htp.pdf",
    configuracion: {
      consignas: [
        { key: "d1", texto: "Dibuja una casa" },
        { key: "d2", texto: "Dibuja un árbol" },
        { key: "d3", texto: "Dibuja una persona" }
      ],
      requerimientos: { formato: "imagen", maxMB: 10 }
    }
  };