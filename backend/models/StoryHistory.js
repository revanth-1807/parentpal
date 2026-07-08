const mongoose = require("mongoose");

const storyHistorySchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    storyTitle: { type: String, required: true },
    storyContent: { type: String, required: true },
    favorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoryHistory", storyHistorySchema);
