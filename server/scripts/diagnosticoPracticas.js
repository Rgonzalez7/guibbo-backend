// server/scripts/diagnosticoPracticas.js
// =========================================================
// Muestra las compras y prácticas de un estudiante, y crea las
// que falten (lo mismo que hace la pantalla al abrirse).
//
//   node scripts/diagnosticoPracticas.js correo@estudiante.com
// =========================================================
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.log("Uso: node scripts/diagnosticoPracticas.js correo@estudiante.com");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const Usuario = require("../models/user");
  const Licencia = require("../models/licencia");
  const Orden = require("../models/orden");
  const PracticaInstancia = require("../models/practicaInstancia");
  const { Modulo } = require("../models/modulo");

  const user = await Usuario.findOne({ email }).lean();
  if (!user) {
    console.log(`❌ No existe el usuario ${email}`);
    process.exit(1);
  }

  const uid = user._id;
  console.log(`\n👤 ${email} · rol=${user.rol} · id=${uid}`);

  /* ── Órdenes ── */
  const ordenes = await Orden.find({ comprador: uid }).lean();
  console.log(`\n🧾 Órdenes: ${ordenes.length}`);
  for (const o of ordenes) {
    console.log(
      `   · ${o.estado} | ${(o.items || []).map((i) => i.nombre).join(", ")} | licencias=${
        (o.licencias || []).length
      } | ${new Date(o.createdAt).toLocaleString("es-CR")}`
    );
  }

  /* ── Licencias ── */
  const licencias = await Licencia.find({ titular: "usuario", usuario: uid }).lean();
  console.log(`\n🔑 Licencias personales: ${licencias.length}`);
  for (const l of licencias) {
    console.log(
      `   · ${l.productoNombre} | pago=${l.estadoPago} | activo=${l.activo} | ` +
      `expira=${l.expira ? new Date(l.expira).toLocaleDateString("es-CR") : "sin vencimiento"} | ` +
      `módulos=${(l.modulos || []).length}`
    );
    for (const m of l.modulos || []) {
      const mod = await Modulo.findById(m).select("titulo").lean();
      console.log(`       - ${mod ? mod.titulo : `⚠️ módulo inexistente (${m})`}`);
    }
  }

  /* ── Prácticas existentes ── */
  const antes = await PracticaInstancia.find({ estudiante: uid })
    .populate("modulo", "titulo")
    .lean();
  console.log(`\n🎯 Prácticas de este estudiante: ${antes.length}`);
  for (const p of antes) {
    console.log(`   · ${p.modulo?.titulo || "?"} | estado=${p.estado} | materia=${p.materia || "—"}`);
  }

  /* ── Sincronización ── */
  const elegibles = licencias.filter((l) => l.activo && l.estadoPago === "pagado");
  console.log(`\n🔄 Licencias pagadas y activas: ${elegibles.length}`);

  const yaCreadas = new Set(
    antes.map((p) => `${String(p.licencia)}|${String(p.modulo?._id || p.modulo)}`)
  );

  let creadas = 0;
  for (const l of elegibles) {
    for (const moduloId of l.modulos || []) {
      const clave = `${String(l._id)}|${String(moduloId)}`;
      if (yaCreadas.has(clave)) continue;
      try {
        await PracticaInstancia.create({
          estudiante: uid,
          modulo: moduloId,
          licencia: l._id,
          estado: "pendiente",
        });
        creadas++;
      } catch (e) {
        console.log(`   ⚠️  No se pudo crear (${moduloId}): ${e.message}`);
      }
    }
  }

  console.log(creadas ? `\n✅ Prácticas creadas ahora: ${creadas}` : "\n✅ No faltaba ninguna práctica.");

  if (!creadas && !antes.length) {
    console.log(
      "\n⚠️  Este estudiante no tiene prácticas ni licencias pagadas.\n" +
      "    Revisá que la compra se haya hecho con ESTE usuario y que la\n" +
      "    licencia esté en estadoPago='pagado' y activo=true."
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error("\n❌", e?.message || e);
  process.exit(1);
});
