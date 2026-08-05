// server/scripts/repararIndicesPracticas.js
// =========================================================
// El índice antiguo { estudiante, licencia } impedía que un paquete
// con varios módulos generara una práctica por cada uno.
// Este script lo elimina y verifica que exista el índice correcto
// { estudiante, licencia, modulo }.
//
// Se puede correr las veces que haga falta: no rompe nada si ya
// está todo en orden.
//
//   node scripts/repararIndicesPracticas.js
// =========================================================
require("dotenv").config();
const mongoose = require("mongoose");

function mismasClaves(key, esperado) {
  const a = Object.keys(key || {});
  const b = Object.keys(esperado);
  if (a.length !== b.length) return false;
  return b.every((k) => key[k] === esperado[k]);
}

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const col = mongoose.connection.collection("practicainstancias");

  let indices = await col.indexes();
  console.log("Índices actuales:");
  for (const i of indices) {
    console.log(`  · ${i.name} ${JSON.stringify(i.key)}${i.unique ? " (único)" : ""}`);
  }

  /* ── 1) Eliminar el índice antiguo { estudiante, licencia } ── */
  const viejo = indices.find((i) => mismasClaves(i.key, { estudiante: 1, licencia: 1 }) && i.unique);

  if (viejo) {
    await col.dropIndex(viejo.name);
    console.log(`\n🗑️  Índice antiguo "${viejo.name}" eliminado.`);
    indices = await col.indexes();
  } else {
    console.log("\n✅ El índice antiguo ya no existe.");
  }

  /* ── 2) Asegurar el índice correcto (sin forzar el nombre) ── */
  const correcto = indices.find((i) =>
    mismasClaves(i.key, { estudiante: 1, licencia: 1, modulo: 1 })
  );

  if (correcto) {
    console.log(
      `✅ El índice correcto ya existe: "${correcto.name}"${
        correcto.unique ? " (único)" : " ⚠️  no es único"
      }`
    );

    if (!correcto.unique) {
      await col.dropIndex(correcto.name);
      await col.createIndex({ estudiante: 1, licencia: 1, modulo: 1 }, { unique: true });
      console.log("   Se recreó como único.");
    }
  } else {
    await col.createIndex({ estudiante: 1, licencia: 1, modulo: 1 }, { unique: true });
    console.log("✅ Índice correcto creado.");
  }

  /* ── 3) Estado actual de las prácticas ── */
  const total = await col.countDocuments();
  console.log(`\n📦 Prácticas registradas en la base: ${total}`);

  console.log(
    "\nAbrí la sección Prácticas del estudiante: las compras que quedaron\n" +
    "sin práctica se crean solas al entrar."
  );

  await mongoose.disconnect();
})().catch((e) => {
  console.error("\n❌", e?.message || e);
  process.exit(1);
});
