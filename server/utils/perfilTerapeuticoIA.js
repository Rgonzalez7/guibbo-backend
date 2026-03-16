// server/utils/perfilTerapeuticoIA.js
// =========================================================
// Prompt para generar el perfil terapéutico del estudiante.
// Analiza la transcripción más reciente y el historial previo
// para calcular los 6 estilos clínicos y un resumen narrativo.
// =========================================================

const PERFILES_DEF = {
    validante: {
      label: "Validante",
      description: "Refuerza emociones, normaliza experiencias, usa frases como 'Tiene sentido que te sientas así'.",
    },
    directivo: {
      label: "Directivo",
      description: "Da estructura clara, marca tareas, propone ejercicios. Más común en TCC.",
    },
    colaborativo: {
      label: "Colaborativo",
      description: "Co-construye hipótesis, pregunta antes de interpretar. '¿Te hace sentido si lo vemos así?'",
    },
    confrontativo: {
      label: "Confrontativo",
      description: "Señala incongruencias, desafía distorsiones. 'Noté que dices X pero haces Y'.",
    },
    exploratorio: {
      label: "Exploratorio",
      description: "Profundiza en historia y significado, amplía narrativa. Más común en psicodinámico.",
    },
    contenedor: {
      label: "Contenedor",
      description: "Regula intensidad emocional, baja activación. Más presente en trauma.",
    },
  };
  
  function buildPerfilTerapeuticoPrompt({ transcripcion, perfilPrevio, historialResumen }) {
    const perfilesList = Object.entries(PERFILES_DEF)
      .map(([key, def]) => `- ${key} (${def.label}): ${def.description}`)
      .join("\n");
  
    const perfilPrevioTxt = perfilPrevio
      ? `Perfil anterior del estudiante (para comparar y actualizar con ponderación 0.3):
  ${JSON.stringify(perfilPrevio, null, 2)}`
      : "No hay perfil previo. Este es el primer análisis.";
  
    const historialTxt = historialResumen
      ? `Resumen del historial de sesiones anteriores:
  ${historialResumen}`
      : "No hay historial previo de sesiones.";
  
    return `
  Eres un supervisor clínico experto en formación de terapeutas. Analiza la transcripción de una sesión clínica y genera el perfil terapéutico del estudiante.
  
  PERFILES TERAPÉUTICOS (todos los terapeutas tienen algo de cada uno):
  ${perfilesList}
  
  INSTRUCCIONES:
  - Analiza las intervenciones del terapeuta (no del paciente) en la transcripción.
  - Asigna un valor entre 0.0 y 1.0 a cada perfil según qué tan presente está en la sesión.
  - Los valores NO deben sumar 1.0 exactamente; cada uno es independiente.
  - Si existe un perfil previo, actualiza con ponderación: nuevo = (0.7 × nuevo) + (0.3 × previo).
  - Genera un resumen narrativo de 2 a 4 frases en español, en segunda persona, que describa el estilo clínico del estudiante de forma constructiva y pedagógica.
  - NO inventes información que no esté en la transcripción.
  - Si la transcripción es muy corta o no tiene suficientes intervenciones del terapeuta, indica valores bajos y señálalo en el resumen.
  
  ${perfilPrevioTxt}
  
  ${historialTxt}
  
  TRANSCRIPCIÓN DE LA SESIÓN:
  ${transcripcion || "(sin transcripción disponible)"}
  
  Devuelve SOLO JSON válido con esta estructura EXACTA:
  {
    "perfilTerapeutico": {
      "validante": 0.0,
      "directivo": 0.0,
      "colaborativo": 0.0,
      "confrontativo": 0.0,
      "exploratorio": 0.0,
      "contenedor": 0.0
    },
    "resumenPerfil": "",
    "meta": {
      "perfilDominante": "",
      "sesionesAnalizadas": 0,
      "notaDelSupervisor": ""
    }
  }
  
  REGLAS DE SALIDA:
  - Responde SOLO JSON válido.
  - No agregues texto fuera del JSON.
  - Los valores de perfilTerapeutico deben ser números entre 0.0 y 1.0.
  - perfilDominante debe ser la key del perfil con valor más alto.
  `.trim();
  }
  
  function normalizePerfilResult(raw) {
    let obj = raw;
    if (typeof raw === "string") {
      try {
        obj = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) obj = JSON.parse(m[0]);
        else throw new Error("La IA no devolvió JSON parseable.");
      }
    }
    if (!obj || typeof obj !== "object") return null;
  
    const pt = obj?.perfilTerapeutico || {};
  
    const clamp = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(1, n));
    };
  
    const perfilNormalizado = {
      validante:    clamp(pt.validante),
      directivo:    clamp(pt.directivo),
      colaborativo: clamp(pt.colaborativo),
      confrontativo:clamp(pt.confrontativo),
      exploratorio: clamp(pt.exploratorio),
      contenedor:   clamp(pt.contenedor),
    };
  
    // Recalcular dominante desde los valores normalizados
    const dominante = Object.entries(perfilNormalizado)
      .reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
  
    const resumenPerfil = String(obj?.resumenPerfil || "").trim();
    const meta = obj?.meta || {};
  
    return {
      perfilTerapeutico: perfilNormalizado,
      resumenPerfil,
      meta: {
        perfilDominante: dominante,
        sesionesAnalizadas: Number(meta?.sesionesAnalizadas || 1),
        notaDelSupervisor: String(meta?.notaDelSupervisor || "").trim(),
        generadoAt: new Date().toISOString(),
      },
    };
  }
  
  module.exports = {
    buildPerfilTerapeuticoPrompt,
    normalizePerfilResult,
    PERFILES_DEF,
  };
  