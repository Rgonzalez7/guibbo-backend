// server/models/dailyAdvice.js
const mongoose = require("mongoose");

const DailyAdviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dateKey: { type: String, required: true, index: true }, // YYYY-MM-DD
    count: { type: Number, default: 0 },
    lastAdvice: {
      titulo: { type: String, default: "" },
      texto: { type: String, default: "" },
      createdAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// ✅ Un solo doc por usuario por día
DailyAdviceSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("DailyAdvice", DailyAdviceSchema);