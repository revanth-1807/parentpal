const ActivityHistory = require("../models/ActivityHistory");
const Badge = require("../models/Badge");
const { queryKnowledge } = require("../services/pineconeService");
const { generateText } = require("../services/geminiService");

const ACTIVITY_SYSTEM_PROMPT = `You are ParentPal's child development activity expert. You create safe, engaging,
age-appropriate developmental activities for children using early-childhood education best practices
(Montessori-inspired, evidence-based). Always respond with STRICT JSON only, no markdown fences, no commentary,
matching this exact shape:
{
  "title": string,
  "goal": string,
  "materials": string[],
  "instructions": string[],
  "learningOutcome": string,
  "difficulty": "easy" | "medium" | "hard",
  "safetyNotes": string,
  "estimatedTime": string
}`;

// @route POST /api/activity/generate
// body: { childId, age, prompt, interest, challenge }
const generateActivity = async (req, res, next) => {
  try {
    const { age, prompt, interest, challenge } = req.body;
    const child = req.child;
    const activityIdea = prompt || [interest, challenge].filter(Boolean).join(", ");

    const searchQuery = activityIdea
      ? `Age ${age || child.age} child activity idea: ${activityIdea}`
      : `Age ${age || child.age} child interests ${child.interests.join(", ")} challenges ${child.challenges.join(", ")}`;

    // 1-3: embed query, search Pinecone, retrieve top contexts
    let matches = [];
    try {
      matches = await queryKnowledge(searchQuery, 4);
    } catch (ragError) {
      console.warn("Pinecone retrieval unavailable, continuing without RAG context:", ragError.message);
    }

    const contextText = matches
      .map((m, i) => `Reference ${i + 1} (${m.metadata?.category || "general"}): ${m.metadata?.text || ""}`)
      .join("\n");

    // 4-5: send context + child profile to Gemini
    const activityPrompt = `
Child profile:
- Name: ${child.childName}
- Age: ${age || child.age}
- Interest: ${interest || child.interests.join(", ")}
- Learning style: ${child.learningStyle}
- Challenge to address: ${challenge || child.challenges.join(", ")}

User's activity idea:
${activityIdea || "No specific idea provided. Create an activity based on the child profile."}

Relevant educational references (use these as inspiration, not verbatim text):
${contextText || "No additional references available; rely on best practice child development knowledge."}

Generate ONE personalized developmental activity as strict JSON per the required schema. If the user provided an idea, shape the activity around it. Always adapt the activity to the child's age and developmental stage.
    `.trim();

    const raw = await generateText(activityPrompt, ACTIVITY_SYSTEM_PROMPT);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let activity;
    try {
      activity = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(502).json({ message: "AI returned an unexpected format. Please try again." });
    }

    const record = await ActivityHistory.create({
      childId: child._id,
      activity,
      completed: false,
    });

    res.status(201).json({ activity: record });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/activity/history?childId=...
const getActivityHistory = async (req, res, next) => {
  try {
    const history = await ActivityHistory.find({ childId: req.child._id }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/activity/:activityId/complete
const markActivityComplete = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const { feedback } = req.body;

    const activity = await ActivityHistory.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.childId.toString() !== req.child._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this activity" });
    }

    activity.completed = true;
    activity.completedAt = new Date();
    activity.feedback = feedback || "";
    await activity.save();

    // Simple gamification: award a badge every 10 completed activities
    const completedCount = await ActivityHistory.countDocuments({ childId: activity.childId, completed: true });
    if (completedCount === 1) {
      await Badge.create({ childId: activity.childId, badgeName: "First Activity Completed", icon: "🌟" });
    }
    if (completedCount % 10 === 0) {
      await Badge.create({ childId: activity.childId, badgeName: `${completedCount} Activities Completed`, icon: "🏆" });
    }

    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateActivity, getActivityHistory, markActivityComplete };
