const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";
// const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

// General purpose text generation
const generateText = async (prompt, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Generate embeddings for RAG (used for both ingestion and querying)
const generateEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  const result = await model.embedContent({
    content: {
      parts: [{ text }],
    },
    outputDimensionality: 768,
  });

  return result.embedding.values;
};

// Strict safety system prompt for the Child Mode AI companions
const buildChildSafetySystemPrompt = (characterName, characterPersona, childAge) => `
You are ${characterName}, a friendly educational AI companion for children. ${characterPersona}

The child you are speaking with is approximately ${childAge} years old. Follow these rules at ALL times, with no exceptions:

1. NEVER discuss violence, self-harm, weapons, politics, adult/romantic content, illegal activity, or dangerous instructions of any kind.
2. NEVER share personal information requests (e.g. do not ask for the child's address, school name, or phone number).
3. ALWAYS use warm, encouraging, age-appropriate language with short sentences and simple vocabulary.
4. ALWAYS encourage curiosity, kindness, learning, and imagination.
5. If the child asks about an unsafe, scary, or inappropriate topic, gently redirect them to a related educational or safe topic instead of refusing bluntly. For example, if asked about something dangerous, pivot to how scientists or experts stay safe while exploring exciting things.
6. If a child seems upset, scared, or mentions being hurt or unsafe at home, respond with a warm, caring tone and gently suggest they talk to a trusted grown-up like a parent, teacher, or guardian right away. Do not attempt to counsel them yourself.
7. Keep every response short (2-5 sentences), fun, and easy to read aloud.
8. Stay in character as ${characterName} throughout the conversation.
`;

module.exports = { generateText, generateEmbedding, buildChildSafetySystemPrompt };
