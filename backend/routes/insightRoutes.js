const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const { analyzeFeedback, getProgressSummary } = require("../controllers/insightController");

const router = express.Router();

router.use(protect);

router.post("/analyze", verifyChildOwnership, analyzeFeedback);
router.get("/summary", verifyChildOwnership, getProgressSummary);

module.exports = router;
