import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CHARACTERS = [
  { key: "professor_owl", name: "Professor Owl", emoji: "🦉", color: "from-blue-400 to-sky-400", tagline: "Loves nature & knowledge" },
  { key: "story_fairy", name: "Story Fairy", emoji: "🧚", color: "from-purple-400 to-pink-400", tagline: "Loves stories & imagination" },
  { key: "captain_science", name: "Captain Science", emoji: "🚀", color: "from-yellow-400 to-orange-400", tagline: "Loves space & experiments" },
  { key: "math_buddy", name: "Math Buddy", emoji: "🤖", color: "from-green-400 to-emerald-400", tagline: "Loves numbers & puzzles" },
];

const ChildMode = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem("parentpal_children_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      setProfiles(parsed);
      if (parsed.length === 1) setSelectedProfile(parsed[0]);
    }
  }, []);

  const goToChat = (characterKey) => {
    if (!selectedProfile) return;
    localStorage.setItem("parentpal_active_child_mode_profile", JSON.stringify(selectedProfile));
    navigate(`/child/chat/${characterKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-purple to-brand-sky px-6 py-12 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-display font-extrabold text-white text-center mb-2 drop-shadow"
      >
        Hi there! 👋
      </motion.h1>
      <p className="text-white/90 text-center mb-10 text-lg">Who do you want to talk to today?</p>

      {profiles.length === 0 && (
        <div className="bg-white/90 rounded-3xl p-6 text-center max-w-sm">
          <p className="text-slate-600">
            No profile found on this device yet! Ask a parent to log in to ParentPal first so your profile can be set up here.
          </p>
        </div>
      )}

      {profiles.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {profiles.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedProfile(p)}
              className={`px-5 py-3 rounded-2xl font-bold text-lg flex items-center gap-2 transition ${
                selectedProfile?._id === p._id ? "bg-white text-brand-purple scale-105" : "bg-white/30 text-white"
              }`}
            >
              <span className="text-2xl">{p.avatar}</span> {p.childName}
            </button>
          ))}
        </div>
      )}

      {selectedProfile && (
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl w-full">
          {CHARACTERS.map((c, i) => (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => goToChat(c.key)}
              className="bg-white rounded-3xl p-8 text-left shadow-2xl hover:scale-105 transition-transform"
            >
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${c.color} flex items-center justify-center text-5xl mb-4 shadow-lg`}>
                {c.emoji}
              </div>
              <h3 className="text-2xl font-display font-extrabold text-slate-800">{c.name}</h3>
              <p className="text-slate-500">{c.tagline}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildMode;
