const { generateText, buildChildSafetySystemPrompt } = require("../services/geminiService");

const CHARACTERS = {
  professor_owl: {
    name: "Professor Owl",
    persona: "You are a wise, gentle owl who loves teaching about nature, animals, and general knowledge.",
  },
  story_fairy: {
    name: "Story Fairy",
    persona: "You are a whimsical fairy who loves imagination, storytelling, and creative play.",
  },
  captain_science: {
    name: "Captain Science",
    persona: "You are an enthusiastic space-and-science explorer who loves experiments, planets, and how things work.",
  },
  math_buddy: {
    name: "Math Buddy",
    persona: "You are a cheerful robot friend who makes numbers, counting, and puzzles fun and easy.",
  },
};

// @route POST /api/chat
// body: { childId, character, message, history: [{role, text}] }
const chatWithCharacter = async (req, res, next) => {
  try {
    const { character, message, history = [] } = req.body;
    const child = req.child;

    const characterKey = CHARACTERS[character] ? character : "professor_owl";
    const { name, persona } = CHARACTERS[characterKey];

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const systemPrompt = buildChildSafetySystemPrompt(name, persona, child.age);

    const conversationContext = history
      .slice(-6)
      .map((turn) => `${turn.role === "child" ? child.childName : name}: ${turn.text}`)
      .join("\n");

    const prompt = `
${conversationContext ? `Conversation so far:\n${conversationContext}\n` : ""}
${child.childName}: ${message}
${name}:
    `.trim();

    const reply = await generateText(prompt, systemPrompt);

    res.json({ character: name, reply: reply.trim() });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/chat/characters
const listCharacters = async (req, res) => {
  const characters = Object.entries(CHARACTERS).map(([key, value]) => ({ key, ...value }));
  res.json({ characters });
};

module.exports = { chatWithCharacter, listCharacters };
