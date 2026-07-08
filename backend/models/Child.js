const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Parent", required: true, index: true },
    childName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 17 },
    gender: { type: String, enum: ["boy", "girl", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    interests: [{ type: String }],
    learningStyle: { type: String, enum: ["visual", "auditory", "kinesthetic"], default: "visual" },
    challenges: [{ type: String }],
    avatar: { type: String, default: "🦉" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Child", childSchema);
