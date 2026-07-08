const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const {
  createChild,
  getChildren,
  getChildById,
  updateChild,
  deleteChild,
} = require("../controllers/childController");

const router = express.Router();

router.use(protect);

router.post("/", createChild);
router.get("/", getChildren);
router.get("/:id", verifyChildOwnership, getChildById);
router.put("/:id", verifyChildOwnership, updateChild);
router.delete("/:id", verifyChildOwnership, deleteChild);

module.exports = router;
