require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const activityRoutes = require("./routes/activityRoutes");
const storyRoutes = require("./routes/storyRoutes");
const insightRoutes = require("./routes/insightRoutes");
const chatRoutes = require("./routes/chatRoutes");

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic global rate limiting to protect the API and AI cost
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter limit for expensive AI generation routes
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { message: "Too many AI requests, please slow down and try again shortly." },
});
app.use(["/api/activity/generate", "/api/story/generate", "/api/chat"], aiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ParentPal API", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ParentPal API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
