// server/scripts/diagnosticoVoces.js
// =========================================================
// Revisa qué trastornos tienen voz de ElevenLabs configurada.
// Un trastorno sin voz usa ELEVEN_VOICE_DEFAULT; si tampoco
// existe, la simulación no arranca.
//
//   node scripts/diagnosticoVoces.js
// =========================================================
require("dotenv").config();

const { TRASTORNOS } = require("../utils/promptsTrastornos");

function envKey(clave) {
  return `ELEVEN_VOICE_TRANSTORNO_${String(clave).toUpperCase()}`;
}

const porDefecto =
  String(process.env.ELEVEN_VOICE_DEFAULT || "").trim() ||
  String(process.env.ELEVEN_VOICE_ID || "").trim();

/** Los IDs de ElevenLabs son alfanuméricos de 20 caracteres. */
function esValido(v) {
  return /^[A-Za-z0-9]{20}$/.test(String(v || "").trim());
}

const conVoz = [];
const sinVoz = [];
const invalidas = [];

for (const t of TRASTORNOS) {
  const k = envKey(t.trastorno);
  const v = String(process.env[k] || "").trim();

  if (!v) sinVoz.push({ ...t, envKey: k, voiceId: v });
  else if (!esValido(v)) invalidas.push({ ...t, envKey: k, voiceId: v });
  else conVoz.push({ ...t, envKey: k, voiceId: v });
}

/* ── Voces repetidas: dos trastornos con el mismo ID suenan igual ── */
const porId = new Map();
for (const t of conVoz) {
  if (!porId.has(t.voiceId)) porId.set(t.voiceId, []);
  porId.get(t.voiceId).push(t.trastorno);
}
const repetidas = [...porId.entries()].filter(([, l]) => l.length > 1);

console.log(`\n🔊 Voz por defecto: ${porDefecto || "❌ NO CONFIGURADA"}`);
console.log(`\n✅ Con voz propia (${conVoz.length}):`);
for (const t of conVoz) console.log(`   · ${t.trastorno.padEnd(26)} ${t.voiceId}`);

console.log(`\n⚠️  Sin voz propia (${sinVoz.length}):`);
for (const t of sinVoz) console.log(`   · ${t.trastorno.padEnd(26)} ${t.envKey}`);

if (invalidas.length) {
  console.log(`\n❌ IDs con formato inválido (${invalidas.length}):`);
  for (const t of invalidas) {
    console.log(
      `   · ${t.trastorno.padEnd(26)} "${t.voiceId}" (${t.voiceId.length} caracteres, se esperan 20)`
    );
  }
  console.log("   Estos NO generan audio: revisá el .env. Mientras tanto usan la voz por defecto.");
}

if (repetidas.length) {
  console.log(`\n🔁 Voces repetidas (${repetidas.length}):`);
  for (const [id, lista] of repetidas) {
    console.log(`   · ${id} → ${lista.join(", ")}`);
  }
}

if (!esValido(porDefecto) && porDefecto) {
  console.log(
    `\n❌ ELEVEN_VOICE_DEFAULT también tiene formato inválido ("${porDefecto}").`
  );
}

if (sinVoz.length && !porDefecto) {
  console.log(
    "\n❌ PROBLEMA: hay trastornos sin voz y tampoco existe ELEVEN_VOICE_DEFAULT.\n" +
    "   Esas simulaciones se van a cerrar apenas conectar.\n" +
    "   Definí ELEVEN_VOICE_DEFAULT en el .env como respaldo."
  );
} else if (sinVoz.length) {
  console.log(
    `\nℹ️  Los ${sinVoz.length} trastornos sin voz propia usarán la voz por defecto.\n` +
    "   Suenan todos igual, pero funcionan."
  );
} else {
  console.log("\n🎉 Todos los trastornos tienen voz propia.");
}
