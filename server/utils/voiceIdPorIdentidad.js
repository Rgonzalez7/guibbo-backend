// server/utils/voiceIdPorIdentidad.js
//
// Elige la voz de ElevenLabs según la identidad que inventa OpenAI, no
// según el trastorno.
//
// Antes había una voz por trastorno. El problema es que el trastorno no
// determina ni la edad ni el género del paciente: OpenAI podía inventar
// una mujer de 22 años y sonaba un hombre adulto, porque la voz estaba
// atada al diagnóstico.
//
// Quien define la personalidad y la conducta es el prompt de OpenAI. La
// voz solo tiene que sonar como la persona que la ficha describe, así
// que basta con seis: tres franjas de edad por dos géneros.
//
// Variables de entorno:
//   ELEVEN_VOICE_ADOLESCENTE_F   15 a 19 años
//   ELEVEN_VOICE_ADOLESCENTE_M
//   ELEVEN_VOICE_JOVEN_F         20 a 29 años
//   ELEVEN_VOICE_JOVEN_M
//   ELEVEN_VOICE_ADULTO_F        30 años en adelante
//   ELEVEN_VOICE_ADULTO_M
//   ELEVEN_VOICE_DEFAULT         respaldo si falta alguna

/** ElevenLabs usa ids de 20 caracteres alfanuméricos. */
function esVoiceIdValido(id) {
  return /^[A-Za-z0-9]{20}$/.test(String(id || "").trim());
}

/** Franja etaria a partir de la edad de la ficha. */
function franjaEtaria(edad) {
  const n = Number(edad);
  if (!Number.isFinite(n) || n <= 0) return "adulto";
  if (n <= 19) return "adolescente";
  if (n <= 29) return "joven";
  return "adulto";
}

/**
 * Normaliza el género a "f" o "m".
 * OpenAI devuelve texto libre ("femenino", "mujer", "masculino"…), así que
 * se aceptan las variantes habituales. Si no se reconoce, devuelve null y
 * quien llama decide.
 */
function normalizarGenero(genero) {
  const g = String(genero || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!g) return null;
  if (/^(f|fem|femenino|femenina|mujer|chica|muchacha|nina|senora|senorita)$/.test(g)) return "f";
  if (/^(m|masc|masculino|masculina|hombre|chico|muchacho|nino|senor|varon)$/.test(g)) return "m";

  // Frases sueltas del tipo "mujer de 30 años"
  if (/\b(mujer|femenin|chica|nina|senora)\w*/.test(g)) return "f";
  if (/\b(hombre|masculin|chico|nino|varon|senor)\w*/.test(g)) return "m";

  return null;
}

const ENV_POR_PERFIL = {
  adolescente_f: "ELEVEN_VOICE_ADOLESCENTE_F",
  adolescente_m: "ELEVEN_VOICE_ADOLESCENTE_M",
  joven_f: "ELEVEN_VOICE_JOVEN_F",
  joven_m: "ELEVEN_VOICE_JOVEN_M",
  adulto_f: "ELEVEN_VOICE_ADULTO_F",
  adulto_m: "ELEVEN_VOICE_ADULTO_M",
};

function vozPorDefecto() {
  return (
    String(process.env.ELEVEN_VOICE_DEFAULT || "").trim() ||
    String(process.env.ELEVEN_VOICE_ID || "").trim() ||
    ""
  );
}

/**
 * Resuelve la voz para una identidad.
 *
 * @param {Object} identidad  { edad, genero }
 * @param {Function} [log]    para dejar rastro de por qué se eligió
 * @returns {{ voiceId: string, perfil: string, motivo: string }}
 */
function resolveVoiceIdPorIdentidad(identidad, log) {
  const franja = franjaEtaria(identidad?.edad);
  let genero = normalizarGenero(identidad?.genero);

  const avisar = (...args) => {
    if (typeof log === "function") log(...args);
  };

  // Sin género no hay voz que elegir. Se toma uno para que la sesión no
  // se quede muda, pero conviene que se vea en el log: significa que la
  // ficha vino incompleta.
  if (!genero) {
    genero = Math.random() < 0.5 ? "f" : "m";
    avisar(
      `⚠️  La ficha no trae género reconocible ("${identidad?.genero || ""}"). ` +
        `Se usa ${genero === "f" ? "femenino" : "masculino"} para poder sintetizar.`
    );
  }

  const perfil = `${franja}_${genero}`;
  const envKey = ENV_POR_PERFIL[perfil];
  const propia = String(process.env[envKey] || "").trim();
  const respaldo = vozPorDefecto();

  if (!propia) {
    avisar(`⚠️  Falta ${envKey}. Se usa la voz por defecto.`);
    return { voiceId: respaldo, perfil, motivo: `sin ${envKey}` };
  }

  // Un id mal copiado hace que ElevenLabs rechace la petición y la sesión
  // se quede sin audio, sin explicación.
  if (!esVoiceIdValido(propia)) {
    avisar(
      `⚠️  ${envKey} tiene un id inválido ("${propia}", ${propia.length} caracteres; ` +
        "se esperan 20). Se usa la voz por defecto."
    );
    return { voiceId: respaldo, perfil, motivo: `${envKey} inválido` };
  }

  return { voiceId: propia, perfil, motivo: envKey };
}

/** Etiqueta legible del perfil, para logs y diagnóstico. */
function etiquetaPerfil(perfil) {
  const [franja, genero] = String(perfil || "").split("_");
  const edades = {
    adolescente: "15 a 19 años",
    joven: "20 a 29 años",
    adulto: "30 años o más",
  };
  const g = genero === "f" ? "mujer" : "hombre";
  return `${g}, ${edades[franja] || "adulta"}`;
}

module.exports = {
  resolveVoiceIdPorIdentidad,
  franjaEtaria,
  normalizarGenero,
  esVoiceIdValido,
  etiquetaPerfil,
  ENV_POR_PERFIL,
};
