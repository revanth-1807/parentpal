const StoryHistory = require("../models/StoryHistory");
const Badge = require("../models/Badge");
const { generateText } = require("../services/geminiService");

const STORY_SYSTEM_PROMPT = `You are ParentPal's children's story writer. You write warm, imaginative, age-appropriate
short stories where the named child is the hero. Vocabulary and sentence complexity must match the child's age.
Every story must have a clear beginning, an adventure/challenge, a gentle educational lesson woven in naturally, and a
positive, encouraging ending. Never include violence, scary content, or anything inappropriate for children.
Respond with STRICT JSON only, no markdown fences: { "title": string, "content": string }`;

// @route POST /api/story/generate
// body: { childId, favoriteCharacter }
const generateStory = async (req, res, next) => {
  try {
    const { favoriteCharacter } = req.body;
    const child = req.child;

    const prompt = `
Write a short personalized story (roughly 300-500 words) for:
- Child's name: ${child.childName}
- Age: ${child.age}
- Interests: ${child.interests.join(", ") || "general adventure"}
- Favorite character/companion to include: ${favoriteCharacter || "a friendly talking animal"}

The child, ${child.childName}, should be the main character/hero of the story.
    `.trim();

    const raw = await generateText(prompt, STORY_SYSTEM_PROMPT);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let storyData;
    try {
      storyData = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(502).json({ message: "AI returned an unexpected format. Please try again." });
    }

    const story = await StoryHistory.create({
      childId: child._id,
      storyTitle: storyData.title,
      storyContent: storyData.content,
    });

    const storyCount = await StoryHistory.countDocuments({ childId: child._id });
    if (storyCount === 1) {
      await Badge.create({ childId: child._id, badgeName: "First Story Completed", icon: "📖" });
    }

    res.status(201).json({ story });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/story/history?childId=...&search=...
const getStoryHistory = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { childId: req.child._id };
    if (search) query.storyTitle = { $regex: search, $options: "i" };

    const stories = await StoryHistory.find(query).sort({ createdAt: -1 });
    res.json({ stories });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/story/:storyId/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const story = await StoryHistory.findById(req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.favorite = !story.favorite;
    await story.save();
    res.json({ story });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateStory, getStoryHistory, toggleFavorite };
