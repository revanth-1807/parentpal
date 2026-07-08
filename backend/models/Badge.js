const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    badgeName: { type: String, required: true },
    icon: { type: String, default: "🏅" },
    earnedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);
