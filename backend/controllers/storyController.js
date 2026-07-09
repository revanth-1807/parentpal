const StoryHistory = require("../models/StoryHistory");
const Badge = require("../models/Badge");
const { generateText } = require("../services/geminiService");

const STORY_SYSTEM_PROMPT = `You are ParentPal's children's story writer. You write warm, imaginative, age-appropriate
short stories where the named child is the hero. Vocabulary and sentence complexity must match the child's age.
Every story must have a clear beginning, an adventure/challenge, a gentle educational lesson woven in naturally, and a
positive, encouraging ending. Never include violence, scary content, or anything inappropriate for children.
Respond with STRICT JSON only, no markdown fences: { "title": string, "content": string }`;

// @route POST /api/story/generate
// body: { childId, prompt, favoriteCharacter }
const generateStory = async (req, res, next) => {
  try {
    const { prompt, favoriteCharacter } = req.body;
    const child = req.child;
    const storyIdea = prompt || favoriteCharacter;

    const storyPrompt = `
Write a short personalized story (roughly 300-500 words) for:
- Child's name: ${child.childName}
- Age: ${child.age}
- Interests: ${child.interests.join(", ") || "general adventure"}
- User's story idea: ${storyIdea || "No specific idea provided. Create a fresh story from the child's interests."}

The child, ${child.childName}, should be the main character/hero of the story.
If the user provided an idea, use it as inspiration and adapt the language, tone, and complexity to the child's age.
    `.trim();

    const raw = await generateText(storyPrompt, STORY_SYSTEM_PROMPT);
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
      completed: false,
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

// @route PUT /api/story/:storyId/complete
const markStoryComplete = async (req, res, next) => {
  try {
    const story = await StoryHistory.findById(req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (story.childId.toString() !== req.child._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this story" });
    }

    story.completed = true;
    story.completedAt = new Date();
    await story.save();

    res.json({ story });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateStory, getStoryHistory, toggleFavorite, markStoryComplete };
