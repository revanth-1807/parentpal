// Loads knowledgeBase.json, chunks it (it's already pre-chunked per entry),
// generates embeddings via Gemini, and upserts into Pinecone.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { ensureIndexExists, upsertKnowledge } = require("../services/pineconeService");

const run = async () => {
  try {
    console.log("Starting ParentPal knowledge base ingestion...");

    const filePath = path.join(__dirname, "../data/knowledgeBase.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const entries = JSON.parse(raw);

    console.log(`Loaded ${entries.length} knowledge entries.`);

    await ensureIndexExists(768);

    const chunks = entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      metadata: {
        category: entry.category,
        ageGroup: entry.ageGroup,
        skill: entry.skill,
        difficulty: entry.difficulty,
        activityType: entry.activityType,
      },
    }));

    const count = await upsertKnowledge(chunks);
    console.log(`Successfully upserted ${count} vectors into Pinecone index "${process.env.PINECONE_INDEX}".`);
    process.exit(0);
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
};

run();
