// server/scripts/diagnosticoVoces.js
// =========================================================
// Revisa las seis voces de ElevenLabs del paciente simulado.
//
// La voz ya no depende del trastorno sino de la identidad que
// inventa OpenAI: franja de edad por género. Un perfil sin voz
// cae en ELEVEN_VOICE_DEFAULT; si tampoco existe, la simulación
// no arranca.
//
//   node scripts/diagnosticoVoces.js
// =========================================================
require("dotenv").config();

const {
  ENV_POR_PERFIL,
  esVoiceIdValido,
  etiquetaPerfil,
} = require("../utils/voiceIdPorIdentidad");

const porDefecto =
  String(process.env.ELEVEN_VOICE_DEFAULT || "").trim() ||
  String(process.env.ELEVEN_VOICE_ID || "").trim();

const filas = Object.entries(ENV_POR_PERFIL).map(([perfil, envKey]) => {
  const voiceId = String(process.env[envKey] || "").trim();
  const estado = !voiceId ? "falta" : !esVoiceIdValido(voiceId) ? "inválida" : "ok";
  return { perfil, envKey, voiceId, estado };
});

const ok = filas.filter((f) => f.estado === "ok");
const faltan = filas.filter((f) => f.estado === "falta");
const invalidas = filas.filter((f) => f.estado === "inválida");

console.log("\n=== Voces del paciente simulado ===\n");

for (const f of filas) {
  const marca = f.estado === "ok" ? "✓" : f.estado === "falta" ? "·" : "✗";
  const valor =
    f.estado === "ok"
      ? f.voiceId
      : f.estado === "falta"
      ? "(sin definir)"
      : `${f.voiceId} — ${f.voiceId.length} caracteres, se esperan 20`;
  console.log(`  ${marca} ${etiquetaPerfil(f.perfil).padEnd(24)} ${f.envKey.padEnd(28)} ${valor}`);
}

/* ── Voces repetidas: dos perfiles con el mismo id suenan igual ── */
const porId = new Map();
for (const f of ok) {
  if (!porId.has(f.voiceId)) porId.set(f.voiceId, []);
  porId.get(f.voiceId).push(etiquetaPerfil(f.perfil));
}
const repetidas = [...porId.entries()].filter(([, l]) => l.length > 1);

console.log("");

if (repetidas.length) {
  console.log("⚠️  Voces repetidas (sonarán idénticas):");
  for (const [id, perfiles] of repetidas) {
    console.log(`     ${id} → ${perfiles.join(", ")}`);
  }
  console.log("");
}

if (invalidas.length) {
  console.log(`✗ ${invalidas.length} con id inválido: no sintetizan y caen en la voz por defecto.`);
}

if (faltan.length) {
  console.log(
    `· ${faltan.length} sin definir: esos perfiles usarán ${
      porDefecto ? "ELEVEN_VOICE_DEFAULT" : "…nada, y la sesión fallará"
    }.`
  );
}

if (!porDefecto) {
  console.log("✗ No hay ELEVEN_VOICE_DEFAULT ni ELEVEN_VOICE_ID: sin respaldo.");
} else if (!esVoiceIdValido(porDefecto)) {
  console.log(`✗ La voz por defecto tiene un id inválido: "${porDefecto}".`);
}

if (ok.length === filas.length && porDefecto && esVoiceIdValido(porDefecto) && !repetidas.length) {
  console.log("Todo en orden: las seis voces están configuradas y son distintas.");
}

console.log("");
