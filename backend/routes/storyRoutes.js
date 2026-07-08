const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const { generateStory, getStoryHistory, toggleFavorite, markStoryComplete } = require("../controllers/storyController");

const router = express.Router();

router.use(protect);

router.post("/generate", verifyChildOwnership, generateStory);
router.get("/history", verifyChildOwnership, getStoryHistory);
router.put("/:storyId/complete", verifyChildOwnership, markStoryComplete);
router.put("/:storyId/favorite", toggleFavorite);

module.exports = router;
