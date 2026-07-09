const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const {
  generateActivity,
  getActivityHistory,
  markActivityComplete,
} = require("../controllers/activityController");

const router = express.Router();

router.use(protect);

router.post("/generate", verifyChildOwnership, generateActivity);
router.get("/history", verifyChildOwnership, getActivityHistory);
router.put("/:activityId/complete", verifyChildOwnership, markActivityComplete);

module.exports = router;
