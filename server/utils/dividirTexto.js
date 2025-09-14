// utils/dividirTexto.js
const dividirTextoEnBloques = (texto, maxLineas = 15) => {
    const oraciones = texto.split(/(?<=[.!?])\s+/); // divide en frases completas
    const bloques = [];
  
    for (let i = 0; i < oraciones.length; i += maxLineas) {
      const bloque = oraciones.slice(i, i + maxLineas).join(' ');
      bloques.push(bloque);
    }
  
    return bloques;
  };
  
  module.exports = { dividirTextoEnBloques };