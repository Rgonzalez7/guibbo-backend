/**
 * server/scripts/migrarSubmodulos.js
 *
 * Migración: eliminar el nivel "Submódulo".
 *
 *   ANTES:  Modulo → Submodulo → Ejercicio
 *   AHORA:  Modulo → Ejercicio
 *
 * Qué hace:
 *   1. Para cada Ejercicio con `submodulo`, resuelve el módulo padre
 *      (submodulo.modulo) y lo escribe en `ejercicio.modulo`.
 *   2. Copia `reintento` del submódulo al módulo (se queda el MAYOR valor
 *      encontrado entre los submódulos de ese módulo).
 *   3. Elimina el campo `submodulo` de los ejercicios.
 *   4. (Opcional) Borra las colecciones `submodulos` y `submoduloinstancias`.
 *
 * Uso:
 *   node scripts/migrarSubmodulos.js            → dry-run (no escribe nada)
 *   node scripts/migrarSubmodulos.js --apply    → aplica los cambios
 *   node scripts/migrarSubmodulos.js --apply --drop  → aplica y borra colecciones viejas
 *
 * Requiere MONGO_URI (o MONGODB_URI) en el entorno.
 */

require("dotenv").config();
const mongoose = require("mongoose");

const APPLY = process.argv.includes("--apply");
const DROP = process.argv.includes("--drop");

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  "";

(async () => {
  if (!MONGO_URI) {
    console.error("❌ Falta MONGO_URI en el entorno.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log(`✅ Conectado a MongoDB`);
  console.log(APPLY ? "🚀 Modo APPLY (se escriben cambios)" : "🔍 Modo DRY-RUN (no se escribe nada)");

  const db = mongoose.connection.db;
  const Ejercicios = db.collection("ejercicios");
  const Submodulos = db.collection("submodulos");
  const Modulos = db.collection("modulos");

  // ── 1. Mapa submoduloId -> { moduloId, reintento }
  const submodulos = await Submodulos.find({}).toArray();
  const mapa = new Map();
  for (const s of submodulos) {
    mapa.set(String(s._id), {
      modulo: s.modulo,
      reintento: Number(s.reintento) || 0,
    });
  }
  console.log(`\n📦 Submódulos encontrados: ${submodulos.length}`);

  // ── 2. Migrar ejercicios
  const ejercicios = await Ejercicios.find({ submodulo: { $exists: true } }).toArray();
  console.log(`📦 Ejercicios con submódulo: ${ejercicios.length}`);

  let migrados = 0;
  let huerfanos = 0;

  for (const ej of ejercicios) {
    const info = mapa.get(String(ej.submodulo));
    if (!info?.modulo) {
      huerfanos++;
      console.warn(`   ⚠️  Ejercicio ${ej._id} ("${ej.titulo}") tiene un submódulo inexistente. Se omite.`);
      continue;
    }

    if (APPLY) {
      await Ejercicios.updateOne(
        { _id: ej._id },
        { $set: { modulo: info.modulo }, $unset: { submodulo: "" } }
      );
    }
    migrados++;
  }

  console.log(`\n✅ Ejercicios migrados: ${migrados}`);
  if (huerfanos) console.log(`⚠️  Ejercicios huérfanos (sin módulo): ${huerfanos}`);

  // ── 3. Mover `reintento` al módulo (se queda el mayor)
  const reintentoPorModulo = new Map();
  for (const s of submodulos) {
    if (!s.modulo) continue;
    const key = String(s.modulo);
    const actual = reintentoPorModulo.get(key) || 0;
    reintentoPorModulo.set(key, Math.max(actual, Number(s.reintento) || 0));
  }

  let modulosActualizados = 0;
  for (const [moduloId, reintento] of reintentoPorModulo.entries()) {
    if (!reintento) continue;
    if (APPLY) {
      await Modulos.updateOne(
        { _id: new mongoose.Types.ObjectId(moduloId) },
        { $set: { reintento } }
      );
    }
    modulosActualizados++;
  }
  console.log(`✅ Módulos con reintento actualizado: ${modulosActualizados}`);

  // ── 4. Borrar colecciones viejas
  if (DROP) {
    if (APPLY) {
      const existentes = await db.listCollections().toArray();
      const nombres = existentes.map((c) => c.name);

      if (nombres.includes("submodulos")) {
        await db.dropCollection("submodulos");
        console.log("🗑️  Colección `submodulos` eliminada");
      }
      if (nombres.includes("submoduloinstancias")) {
        await db.dropCollection("submoduloinstancias");
        console.log("🗑️  Colección `submoduloinstancias` eliminada");
      }
    } else {
      console.log("🗑️  (dry-run) Se borrarían: submodulos, submoduloinstancias");
    }
  } else {
    console.log("\nℹ️  Las colecciones `submodulos` y `submoduloinstancias` NO se borraron. Usá --drop para eliminarlas.");
  }

  if (!APPLY) {
    console.log("\n🔍 DRY-RUN terminado. Ejecutá con --apply para aplicar los cambios.");
  } else {
    console.log("\n🎉 Migración completada.");
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error("❌ Error en la migración:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
