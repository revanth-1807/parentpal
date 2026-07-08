const express = require("express");
const { protect, verifyChildOwnership } = require("../middleware/auth");
const { chatWithCharacter, listCharacters } = require("../controllers/chatController");

const router = express.Router();

router.get("/characters", listCharacters);
router.post("/", protect, verifyChildOwnership, chatWithCharacter);

module.exports = router;
