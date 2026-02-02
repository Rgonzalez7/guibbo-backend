#!/usr/bin/env node
/**
 * Script para poblar la colección "tests" en MongoDB.
 * Permite leer:
 *   - Archivos JSON dentro de un directorio
 *   - Un único archivo index.js que exporte un array de tests
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function main() {
  const args = require("minimist")(process.argv.slice(2));
  const uri = args.uri || process.env.MONGO_URI;
  const dbName = args.db || "guibbo";
  const dirOrFile = args.dir;

  if (!uri || !dirOrFile) {
    console.error("❌ Uso: node seed_tests.js --uri <mongo-uri> --db <nombre> --dir <carpeta|archivo.js>");
    process.exit(1);
  }

  console.log("🧩 Conectando a MongoDB...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("tests");

  console.log("🔧 Creando índice único { id: 1 } (si no existe)...");
  await col.createIndex({ id: 1 }, { unique: true });

  let tests = [];

  const absPath = path.resolve(dirOrFile);
  const stat = fs.statSync(absPath);

  if (stat.isDirectory()) {
    console.log("📂 Leyendo carpeta:", absPath);
    const files = fs.readdirSync(absPath).filter(f => f.endsWith(".json"));
    for (const f of files) {
      const raw = fs.readFileSync(path.join(absPath, f), "utf8");
      const parsed = JSON.parse(raw);
      tests.push(parsed);
    }
  } else if (stat.isFile() && absPath.endsWith(".js")) {
    console.log("📄 Cargando módulo JS:", absPath);
    const mod = require(absPath);
    if (Array.isArray(mod)) {
      tests = mod;
    } else {
      console.error("❌ El archivo JS no exporta un array válido");
      process.exit(1);
    }
  } else {
    console.error("❌ El argumento --dir debe ser una carpeta o un archivo .js");
    process.exit(1);
  }

  console.log(`📥 Insertando/actualizando ${tests.length} tests...`);
  for (const t of tests) {
    if (!t.id) {
      console.warn("⚠️ Test sin id, ignorado:", t);
      continue;
    }
    await col.updateOne({ id: t.id }, { $set: t }, { upsert: true });
  }

  console.log("✅ Seed completado.");
  await client.close();
}

main().catch(err => {
  console.error("💥 Error general:", err);
  process.exit(1);
});