const { Pinecone } = require("@pinecone-database/pinecone");
const { generateEmbedding } = require("./geminiService");

let pineconeClient = null;
const INDEX_NAME = process.env.PINECONE_INDEX || "parentpal";

const getClient = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pineconeClient;
};

const getIndex = () => getClient().index(INDEX_NAME);

// Creates the index if it doesn't already exist. Run once during setup.
const ensureIndexExists = async (dimension = 768) => {
  const client = getClient();
  const existing = await client.listIndexes();
  const exists = existing.indexes?.some((idx) => idx.name === INDEX_NAME);
  if (!exists) {
    await client.createIndex({
      name: INDEX_NAME,
      dimension,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    console.log(`Created Pinecone index: ${INDEX_NAME}`);
  }
};

// Upsert a batch of knowledge chunks: [{ id, text, metadata }]
const upsertKnowledge = async (chunks) => {
  const index = getIndex();
  const vectors = [];
  for (const chunk of chunks) {
    const values = await generateEmbedding(chunk.text);
    vectors.push({
      id: chunk.id,
      values,
      metadata: { text: chunk.text, ...chunk.metadata },
    });
  }
  await index.upsert(vectors);
  return vectors.length;
};

// Query Pinecone with a natural language query, optionally filtered by metadata
const queryKnowledge = async (queryText, topK = 5, filter = {}) => {
  const index = getIndex();
  const queryEmbedding = await generateEmbedding(queryText);
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: Object.keys(filter).length ? filter : undefined,
  });
  return results.matches || [];
};

module.exports = { ensureIndexExists, upsertKnowledge, queryKnowledge, getIndex };
