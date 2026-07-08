# ParentPal – AI-Driven Child Development & Interactive Companion

A full-stack MERN application with two experiences:
- **Parent Mode** – personalized, RAG-powered developmental activities, adaptive AI stories, progress analytics, and a developmental insight analyzer.
- **Child Mode** – a safe, colorful, no-login AI companion interface for kids, with voice input/output and strict content-safety guardrails.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Framer Motion, Recharts, React Icons, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (`@google/generative-ai`) |
| RAG | Pinecone vector DB + Gemini embeddings |
| Voice | Browser SpeechRecognition + SpeechSynthesis APIs |

---

## Project Structure

```
parentpal/
├── backend/
│   ├── config/db.js
│   ├── models/            # Parent, Child, ActivityHistory, StoryHistory, Badge
│   ├── middleware/        # auth (JWT + ownership), error handler
│   ├── controllers/       # auth, child, activity, story, insight, chat
│   ├── routes/
│   ├── services/          # geminiService.js, pineconeService.js
│   ├── data/knowledgeBase.json   # sample RAG dataset (8 categories)
│   ├── scripts/ingest.js  # embeds + upserts knowledgeBase.json into Pinecone
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/          # Landing, Login, Register, Dashboard, ChildProfiles,
    │   │                   # ActivityGenerator, StoryLibrary, ProgressAnalytics, Settings
    │   ├── pages/child/     # ChildMode (character picker), ChildCharacterChat (voice chat)
    │   ├── components/     # Navbar, Sidebar, Card, ChildSelector, ProtectedRoute
    │   ├── context/AuthContext.jsx
    │   ├── hooks/useChildren.js
    │   └── api/axios.js
    └── .env.example
```

---

## 1. Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier is fine)
- A [Google Gemini API key](https://ai.google.dev/)
- A [Pinecone](https://www.pinecone.io/) account + API key (free tier is fine)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/parentpal

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=parentpal
```

Ingest the sample educational knowledge base into Pinecone (creates the index automatically):

```bash
npm run ingest
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`, with a health check at `GET /api/health`.

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to your backend URL (default `http://localhost:5000/api`).

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

- Parent flow: `/` → `/register` → `/dashboard`
- Child flow: `/child` (log in as a parent first and create a child profile — Child Mode reads a cached profile list from the browser so a child can pick their profile without logging in)

---

## 4. API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a parent account |
| POST | `/api/auth/login` | Log in |
| GET  | `/api/auth/me` | Current parent (protected) |
| POST | `/api/children` | Create child profile |
| GET  | `/api/children` | List child profiles |
| PUT/DELETE | `/api/children/:id` | Update / delete profile |
| POST | `/api/activity/generate` | RAG-powered activity generation |
| GET  | `/api/activity/history` | Activity history |
| PUT  | `/api/activity/:id/complete` | Mark complete + award badges |
| POST | `/api/story/generate` | Adaptive story generation |
| GET  | `/api/story/history` | Story library (search supported) |
| PUT  | `/api/story/:id/favorite` | Toggle favorite |
| POST | `/api/insights/analyze` | AI developmental insight analyzer |
| GET  | `/api/insights/summary` | Weekly/monthly progress summary |
| POST | `/api/chat` | Safe child-mode AI companion chat |

All child-scoped routes verify that the requesting parent owns the child profile.

---

## 5. RAG Pipeline (Activity Generator)

1. Child's age/interest/challenge is turned into a natural-language query.
2. Query is embedded via Gemini embeddings.
3. Pinecone similarity search retrieves the top matching educational references (Montessori activities, milestones, safety guidelines, etc.).
4. Retrieved context + child profile is sent to Gemini with a strict-JSON system prompt.
5. Gemini returns a structured activity (title, goal, materials, steps, learning outcome, difficulty, safety notes, time estimate), which is saved to MongoDB.

To add more knowledge, extend `backend/data/knowledgeBase.json` and re-run `npm run ingest`.

---

## 6. Child Safety Design

- Child Mode chat uses a strict system prompt (`buildChildSafetySystemPrompt`) that forbids violence, self-harm, politics, adult content, and dangerous instructions, and instructs the AI to redirect unsafe topics toward educational content.
- Child Mode requires no login/typing of credentials — it only reads a locally cached, non-sensitive profile list (name, age, avatar) set up by the parent.
- Backend enforces child-profile ownership on every request via `verifyChildOwnership` middleware.

---

## 7. Deployment

**Frontend → Vercel**
```bash
cd frontend
vercel
```
Set the `VITE_API_URL` environment variable in the Vercel project settings to your deployed backend URL.

**Backend → Render**
1. Push `backend/` to a Git repo.
2. Create a new Web Service on Render, root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all `.env` variables in the Render dashboard.
5. Set `CLIENT_URL` to your deployed Vercel URL (for CORS).

**Database → MongoDB Atlas** — already cloud-hosted; whitelist Render's outbound IPs (or `0.0.0.0/0` for demo purposes).

**Vector DB → Pinecone** — already cloud-hosted (serverless index, `us-east-1`, cosine metric, 768 dimensions to match Gemini's `text-embedding-004`).

---

## 8. Security Notes

- Passwords hashed with bcrypt (salt rounds: 10).
- JWT-based auth with a configurable expiry.
- `helmet` for HTTP header hardening, `express-rate-limit` on all `/api` routes (with a stricter limit on AI-generation routes to control cost/abuse).
- `express-validator` on registration/login inputs.
- All secrets are read from environment variables — never commit `.env`.

---

## 9. Known Limitations / Next Steps

- The demo pricing section on the landing page is illustrative only (no real payment integration).
- Voice features depend on browser support for the Web Speech APIs (best in Chrome).
- For production, add refresh tokens, email verification, and stricter per-parent AI-usage quotas.
