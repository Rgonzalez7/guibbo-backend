/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const tests = require('../data/tests');
const TestModel = require('../models/Test');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/psicoapp');
    for (const t of tests) {
      await TestModel.updateOne({ id: t.id }, t, { upsert: true });
      console.log(`✓ Seed: ${t.id}`);
    }
    console.log('✅ Tests sembrados/actualizados');
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error seed:', e);
    process.exit(1);
  }
})();