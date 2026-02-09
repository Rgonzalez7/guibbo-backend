// server/controllers/consejoDiarioController.js
const OpenAI = require("openai");
const DailyAdvice = require("../models/dailyAdvice");

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickOne(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickManyUnique(arr, n = 1) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

/**
 * Catálogo fijo de temas que tu app evalúa / usa
 * (evaluaciones + herramientas + buenas prácticas).
 * Esto NO depende del frontend.
 */
const CATALOG = [
  // ===== Core SIEMPRE =====
  {
    key: "base_core",
    titleHint: "Base clínica",
    focus:
      "rapport + preguntas abiertas + encuadre + alianza terapéutica",
    howTo:
      "abre con una frase de bienvenida, explica objetivo de la sesión (encuadre), usa 3 preguntas abiertas seguidas y valida la emoción del paciente con una frase empática.",
  },

  // ===== Microhabilidades =====
  {
    key: "parafrasis",
    titleHint: "Paráfrasis",
    focus: "paráfrasis clínica para clarificar sin dirigir",
    howTo:
      "elige 1 frase del paciente y reformúlala en 1 oración: misma idea, palabras distintas; termina con “¿así lo entiendes?” para confirmar.",
  },
  {
    key: "reflejo",
    titleHint: "Reflejo emocional",
    focus: "reflejo emocional (afecto) para aumentar alianza",
    howTo:
      "identifica emoción + intensidad: “Suena a que esto te generó mucha ___”; después pregunta “¿en qué parte del cuerpo lo notas?”",
  },
  {
    key: "clarificacion",
    titleHint: "Clarificación",
    focus: "clarificación: reducir ambigüedad y ordenar la narrativa",
    howTo:
      "toma una parte confusa y pregunta: “¿Qué pasó primero, después y al final?”; luego resume en 1 línea y pide confirmación.",
  },
  {
    key: "resumen",
    titleHint: "Resumen",
    focus: "resumen breve para cerrar bloques sin perder información",
    howTo:
      "al minuto 10–12 haz un resumen en 2 oraciones: situación + emoción; cierra con “¿qué faltó o qué es lo más importante?”",
  },
  {
    key: "palabras_clave",
    titleHint: "Palabras clave",
    focus: "extraer palabras clave para hipótesis y plan",
    howTo:
      "escribe 5 palabras clave del relato (evento, emoción, conducta, pensamiento, contexto) y conecta 2 con una hipótesis tentativa.",
  },

  // ===== Hx / historia de vida (opcional en tu modelo) =====
  {
    key: "motivo_consulta",
    titleHint: "Motivo de consulta",
    focus: "motivo de consulta: definir problema en términos observables",
    howTo:
      "convierte “me siento mal” en 2 observables: qué pasa, cuándo pasa; y define 1 meta mínima para la semana.",
  },
  {
    key: "anamnesis",
    titleHint: "Anamnesis",
    focus: "anamnesis: recolectar datos sin interrogatorio rígido",
    howTo:
      "usa un puente: “para entender mejor, cuéntame un poco de…” y haz 2 preguntas abiertas + 1 de precisión (tiempo/frecuencia).",
  },

  // ===== Enfoques =====
  {
    key: "tcc_abc",
    titleHint: "TCC (ABC)",
    focus: "TCC: ABC (Acontecimiento–Belief–Consecuencia)",
    howTo:
      "elige un evento reciente y completa A-B-C en 3 líneas; luego pregunta por evidencia a favor/en contra del pensamiento.",
  },
  {
    key: "tcc_reestructuracion",
    titleHint: "Reestructuración",
    focus: "TCC: reestructuración cognitiva básica",
    howTo:
      "toma un pensamiento automático y crea una alternativa realista (no positiva); cierra con “del 0 al 10, ¿cuánto te la crees?”",
  },
  {
    key: "psico_defensas",
    titleHint: "Defensas",
    focus: "psico: identificar defensas con respeto clínico",
    howTo:
      "escucha si aparece evitación, racionalización o humor; formula una observación suave: “me pregunto si hablar de esto es difícil…”",
  },
  {
    key: "logoterapia_sentido",
    titleHint: "Logoterapia",
    focus: "logoterapia: propósito/sentido como recurso",
    howTo:
      "pregunta por valor/propósito: “¿qué te gustaría que esto signifique cuando lo superes?” y define 1 acción coherente hoy.",
  },

  // ===== Herramientas / expediente =====
  {
    key: "ficha_tecnica",
    titleHint: "Ficha técnica",
    focus: "ficha técnica: completar datos relevantes sin exceso",
    howTo:
      "completa primero motivo de consulta + ocupación + periodo de evaluación; valida coherencia: edad vs fecha de nacimiento.",
  },
  {
    key: "historial_clinico",
    titleHint: "Historial clínico",
    focus: "historial clínico: estructura y síntesis",
    howTo:
      "rellena 1 sección con 3 frases: hecho, impacto, ejemplo; al final escribe 1 síntesis de 2 líneas (patrón + contexto).",
  },
  {
    key: "pruebas_consignas",
    titleHint: "Pruebas",
    focus: "pruebas: practicar consignas claras",
    howTo:
      "ensaya la consigna en voz alta en 20 segundos; incluye qué hacer, cuánto tiempo y qué pasa si hay duda; evita jerga.",
  },
  {
    key: "interpretacion",
    titleHint: "Interpretación",
    focus: "interpretación: sostener hipótesis sin sobreafirmar",
    howTo:
      "escribe 1 hipótesis + 2 evidencias del caso; agrega 1 contra-evidencia o alternativa para mantener criterio clínico.",
  },
  {
    key: "anexos",
    titleHint: "Anexos",
    focus: "anexos: orden y trazabilidad",
    howTo:
      "adjunta resultados/observaciones con fecha y contexto; nombra anexos por tipo (Prueba–Fecha) y anota 1 conclusión breve.",
  },
  {
    key: "recomendaciones",
    titleHint: "Recomendaciones",
    focus: "recomendaciones: acciones realistas y medibles",
    howTo:
      "redacta 2 recomendaciones en formato: acción + frecuencia + objetivo; evita “debería”, usa “te propongo”.",
  },
  {
    key: "plan_intervencion",
    titleHint: "Plan",
    focus: "plan de intervención: objetivo–estructura–material",
    howTo:
      "define 1 objetivo SMART, 1 estructura (inicio–medio–cierre) y 1 material; cierra con criterio de éxito (cómo medirás).",
  },

  // ===== Ética / buenas prácticas =====
  {
    key: "buenas_practicas",
    titleHint: "Buena práctica",
    focus: "buenas prácticas: presencia, límites y cuidado del paciente",
    howTo:
      "antes de iniciar, respira 30s; recuerda confidencialidad y límites; al final, valida emoción y acuerda un siguiente paso pequeño.",
  },
];

exports.generarConsejoDiario = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || "");
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const dateKey = todayKey();
    const max = 3;

    // Upsert doc por (userId, dateKey)
    let doc = await DailyAdvice.findOne({ userId, dateKey });
    if (!doc) {
      doc = await DailyAdvice.create({
        userId,
        dateKey,
        count: 0,
        lastAdvice: { titulo: "", texto: "", createdAt: null },
      });
    }

    if (doc.count >= max) {
      return res.status(429).json({
        message: "Límite diario alcanzado",
        remaining: 0,
        max,
        count: doc.count,
        consejo: doc.lastAdvice?.texto
          ? { titulo: doc.lastAdvice.titulo, texto: doc.lastAdvice.texto }
          : null,
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // ✅ Siempre incluye base + 1 foco aleatorio (a veces 2)
    const base = CATALOG.find((x) => x.key === "base_core");
    const pool = CATALOG.filter((x) => x.key !== "base_core");
    const focos = pickManyUnique(pool, Math.random() < 0.35 ? 2 : 1); // 35% chance de 2 focos
    const focoTxt = focos
      .map((f, i) => `${i + 1}) ${f.focus}. Guía: ${f.howTo}`)
      .join("\n");

    const system = `
Eres un supervisor/tutor académico para estudiantes de psicología clínica.
Genera un CONSEJO DE ESTUDIO DIARIO en español, breve, útil y accionable.

Reglas:
- NO menciones que eres IA.
- Consejo de 2 a 4 frases (máx ~420 caracteres).
- Debe incluir 1 micro-acción concreta para hoy (tiempo + qué hacer).
- Tono empático, profesional y motivador.
- SIN viñetas.
- Evita consejos genéricos sin instrucciones.
- Devuelve SOLO JSON estricto:
{
  "titulo": "string (máx 8 palabras)",
  "texto": "string (2 a 4 frases, máx ~420 caracteres)"
}
`.trim();

    const user = `
Fecha: ${dateKey}

Base (siempre presente):
- ${base.focus}. Guía: ${base.howTo}

Foco(s) sugerido(s) para hoy (elige uno y aplícalo):
${focoTxt}

Instrucciones:
- Integra la base + el foco elegido de forma natural (sin listar).
- Incluye micro-acción con tiempo (10–20 minutos) y un resultado observable.
- Devuelve SOLO el JSON.
`.trim();

    const resp = await client.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    });

    const raw = resp?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        titulo: "Micro-práctica clínica",
        texto:
          "Hoy practica encuadre y preguntas abiertas: en 10 minutos escribe 3 preguntas que exploren el motivo de consulta sin dirigir la respuesta. Luego haz una paráfrasis de 1 frase del paciente y confirma con “¿así lo entiendes?”.",
      };
    }

    const titulo = String(parsed?.titulo || "Consejo de hoy").slice(0, 60);
    const texto = String(parsed?.texto || "").slice(0, 700);

    doc.count += 1;
    doc.lastAdvice = { titulo, texto, createdAt: new Date() };
    await doc.save();

    return res.json({
      ok: true,
      max,
      count: doc.count,
      remaining: Math.max(0, max - doc.count),
      consejo: { titulo, texto },
    });
  } catch (err) {
    console.error("❌ Error generarConsejoDiario:", err?.message || err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};