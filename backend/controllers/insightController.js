const { generateText } = require("../services/geminiService");
const ActivityHistory = require("../models/ActivityHistory");
const StoryHistory = require("../models/StoryHistory");
const Badge = require("../models/Badge");

const INSIGHT_SYSTEM_PROMPT = `You are ParentPal's child development analyst. Parents describe how their child did during
an activity. Analyze the feedback supportively and constructively. Respond with STRICT JSON only, no markdown fences:
{
  "strengths": string[],
  "areasForImprovement": string[],
  "recommendedNextActivities": string[],
  "summary": string
}`;

// @route POST /api/insights/analyze
// body: { childId, feedback }
const analyzeFeedback = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const child = req.child;

    if (!feedback) return res.status(400).json({ message: "feedback is required" });

    const prompt = `
Child: ${child.childName}, age ${child.age}, learning style: ${child.learningStyle}.
Parent feedback: "${feedback}"

Analyze this feedback and provide developmental insights as strict JSON per the schema.
    `.trim();

    const raw = await generateText(prompt, INSIGHT_SYSTEM_PROMPT);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let insight;
    try {
      insight = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(502).json({ message: "AI returned an unexpected format. Please try again." });
    }

    res.json({ insight });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/insights/summary?childId=...&range=weekly|monthly
const getProgressSummary = async (req, res, next) => {
  try {
    const child = req.child;
    const { range = "weekly" } = req.query;

    const days = range === "monthly" ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [activitiesCompleted, storiesGenerated, skillsPracticed] = await Promise.all([
      ActivityHistory.countDocuments({ childId: child._id, completed: true, createdAt: { $gte: since } }),
      StoryHistory.countDocuments({ childId: child._id, createdAt: { $gte: since } }),
      ActivityHistory.distinct("activity.title", { childId: child._id, createdAt: { $gte: since } }),
    ]);

    res.json({
      range,
      since,
      activitiesCompleted,
      storiesGenerated,
      skillsPracticed: skillsPracticed.length,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/insights/badges
const getBadges = async (req, res, next) => {
  try {
    const child = req.child;
    const badges = await Badge.find({ childId: child._id }).sort({ earnedDate: -1, createdAt: -1 });
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeFeedback, getProgressSummary, getBadges };
