// utils/analisisIA.js
const MODELOS = [
    'Terapia Cognitivo-Conductual (TCC)',
    'Psicoanálisis',
    'Logoterapia',
    'Terapia Centrada en la Persona',
    'Gestalt',
    'Humanista-Existencial',
    'Terapia Analítico-Funcional (FAP)',
    'Sistémica',
    'Aceptación y Compromiso (ACT)',
    'Dialéctica Conductual (DBT)',
    'Mindfulness / Mindfulness-based'
  ];
  
  // recorta texto largo para no explotar tokens
  function clamp(text, max = 9000) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max) + '\n[...texto recortado para análisis...]';
  }
  
  function buildPrompt(input, modeloSeleccionado) {
    const datos = {
      fichaTecnica: input.fichaTecnica || {},
      historialClinico: input.historialClinico || {},
      minuta: input.minuta || {},
      transcripcion: clamp(input.transcripcion || '')
    };
  
    return `
  Eres un supervisor clínico experto. Analiza la sesión en base al **modelo declarado** por el estudiante: "${modeloSeleccionado}" y fundamenta los comnetarios en base a documentacion academica actualizada, no menos del 2015, citando a los autores de dicha documentación.
  
  Devuelve **SOLO JSON válido** con esta estructura EXACTA (sin comentarios, sin texto fuera del JSON):
  
  {
    "evaluacionGeneral": "Texto narrativo. Balance entre técnicas bien aplicadas y errores/quiebres.",
    "tecnicasConversacionales": {
      "Paráfrasis": "Dónde se usó bien o faltó, con ejemplos si aplica.",
      "Reflejo": "...",
      "Empatía": "...",
      "Preguntas Abiertas": "...",
      "Revelación": "...",
      "Humor": "...",
      "Sarcasmo": "...",
      "Confrontación": "...",
      "Quiebres Terapeuticos": "Si hubo, causas y reparación.",
      "Fluidez": "Evitar repeticiones, no saltar abruptamente, relevancia."
      "Preguntas Incorrectas": "Dónde se usó y con ejemplos si aplica",
      "Preguntas Sugestivas": "...",
      "Preguntas Cerradas": "..."
    },
    "coberturaTematica": {
      "Motivo de Consulta": "¿Se exploró?",
      "Infancia": "...",
      "Familia": "...",
      "Ocupación Estudios": "...",
      "Pareja": "...",
      "Hijos": "...",
      "Sexualidad": "...",
      "Creencias y Valores": "..."
    },
    "analisisPorModelo": {
      "modelo": "${modeloSeleccionado}",
      "esperado": ["Viñetas con técnicas y principios esperados del modelo"],
      "observado": "Lo que sí se hizo (o no) en relación al modelo.",
      "errores": "Errores o desalineaciones respecto al modelo.",
      "sugerencias": "Recomendaciones concretas y accionables según este modelo."
    },
    "sintesisFinal": {
      "fortalezas": ["..."],
      "areasDeMejora": ["..."]
    }
  }
  
  Considera además:
  - Parafraseo, reflejo, empatía con propósito, preguntas abiertas, revelación, humor, sarcasmo, confrontación, quiebres.
  - Relevancia de preguntas, no repetirse, no cambiar abruptamente.
  - Indagar motivo de consulta, infancia, vínculos familiares, ocupación/estudios, pareja, hijos, sexualidad, creencias/valores.
  - Ajustar el análisis a ${modeloSeleccionado}:
    - TCC: ABC, PA/distorsiones, reestructuración/experimentos, activación, tareas específicas.
    - Psicoanálisis: asociación, clarificación, interpretación defensas, transferencia/contratransferencia, timing.
    - Logoterapia: sentido/valores/responsabilidad, intención paradójica cuando aplique, sin minimizar dolor.
    - Centrada en la Persona: empatía reflejada, aceptación incondicional, baja directividad.
    - Gestalt: aquí-ahora, awareness, silla vacía, cierre de ejercicios.
    - Humanista-Existencial: libertad/responsabilidad/aislamiento/muerte/sentido; autenticidad sin centrarse en el terapeuta.
    - FAP: CCR1/2/3, refuerzo natural, aquí-ahora, forma-función-contexto.
    - Sistémica: pautas/relaciones, preguntas circulares, tareas estratégicas, evitar culpabilizar.
    - ACT: defusión, aceptación, valores/acciones comprometidas, metáforas; no convertir en TCC.
    - DBT: validación + cambio, habilidades, cadena conductual; evitar confrontar sin validar.
    - Mindfulness: práctica real guiada, contraindicaciones, evitar espiritualizar o “meditar de palabra”.
  
  DATOS DE LA SESIÓN (JSON):
  ${JSON.stringify(datos, null, 2)}
    `.trim();
  }
  
  module.exports = { buildPrompt, MODELOS };