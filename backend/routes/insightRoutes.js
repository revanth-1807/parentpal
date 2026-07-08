const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const { analyzeFeedback, getProgressSummary, getBadges } = require("../controllers/insightController");

const router = express.Router();

router.use(protect);

router.post("/analyze", verifyChildOwnership, analyzeFeedback);
router.get("/summary", verifyChildOwnership, getProgressSummary);
router.get("/badges", verifyChildOwnership, getBadges);

module.exports = router;
