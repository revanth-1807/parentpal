const mongoose = require("mongoose");

const activityHistorySchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    activity: {
      title: String,
      goal: String,
      materials: [String],
      instructions: [String],
      learningOutcome: String,
      difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
      safetyNotes: String,
      estimatedTime: String,
    },
    completed: { type: Boolean, default: false },
    feedback: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityHistory", activityHistorySchema);
