import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaListUl, FaBookOpen } from "react-icons/fa";
import { SectionCard } from "../../components/Card.jsx";
import api from "../../api/axios.js";
import ChildModeGate from "../../components/ChildModeGate.jsx";

const CHARACTERS = [
  { key: "professor_owl", name: "Professor Owl", emoji: "??", color: "from-blue-400 to-sky-400", tagline: "Loves nature & knowledge" },
  { key: "story_fairy", name: "Story Fairy", emoji: "??", color: "from-purple-400 to-pink-400", tagline: "Loves stories & imagination" },
  { key: "captain_science", name: "Captain Science", emoji: "??", color: "from-yellow-400 to-orange-400", tagline: "Loves space & experiments" },
  { key: "math_buddy", name: "Math Buddy", emoji: "??", color: "from-green-400 to-emerald-400", tagline: "Loves numbers & puzzles" },
];

const ChildMode = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem("parentpal_children_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      setProfiles(parsed);
      if (parsed.length === 1) setSelectedProfile(parsed[0]);
    }
  }, []);

  useEffect(() => {
    if (!selectedProfile?._id) {
      setActivities([]);
      setStories([]);
      setActiveActivity(null);
      setActiveStory(null);
      return;
    }

    const loadItems = async () => {
      try {
        const [activityRes, storyRes] = await Promise.all([
          api.get("/activity/history", { params: { childId: selectedProfile._id } }),
          api.get("/story/history", { params: { childId: selectedProfile._id } }),
        ]);

        const activityData = activityRes.data.history || [];
        const storyData = storyRes.data.stories || [];

        setActivities(activityData);
        setStories(storyData);
        setActiveActivity(activityData[0] || null);
        setActiveStory(storyData[0] || null);
        localStorage.setItem(`parentpal_activity_cache_${selectedProfile._id}`, JSON.stringify(activityData));
        localStorage.setItem(`parentpal_story_cache_${selectedProfile._id}`, JSON.stringify(storyData));
      } catch {
        const activityCache = localStorage.getItem(`parentpal_activity_cache_${selectedProfile._id}`);
        const storyCache = localStorage.getItem(`parentpal_story_cache_${selectedProfile._id}`);

        const parsedActivities = activityCache ? JSON.parse(activityCache) : [];
        const parsedStories = storyCache ? JSON.parse(storyCache) : [];
        setActivities(parsedActivities);
        setStories(parsedStories);
        setActiveActivity(parsedActivities[0] || null);
        setActiveStory(parsedStories[0] || null);
      }
    };

    loadItems();
  }, [selectedProfile]);

  const goToChat = (characterKey) => {
    if (!selectedProfile) return;
    localStorage.setItem("parentpal_active_child_mode_profile", JSON.stringify(selectedProfile));
    navigate(`/child/chat/${characterKey}`);
  };

  return (
    <ChildModeGate title="ParentPal Child Mode" subtitle="This screen stays in fullscreen until a parent enters the PIN.">
      <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-purple to-brand-sky px-6 py-12 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-extrabold text-white text-center mb-2 drop-shadow"
        >
          Hi there!
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
          <div className="w-full max-w-5xl space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
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

            <SectionCard title="Today's Activities" subtitle="Activities your parent created for you will appear here." className="bg-white/95">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-500">No activities yet. When a parent creates one, it will show up here automatically.</p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setActiveActivity(item)}
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        activeActivity?._id === item._id ? "border-brand-purple bg-purple-50" : "border-slate-100 bg-slate-50 hover:border-brand-purple"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <FaListUl className="text-brand-purple" />
                            {item.activity?.title || "Activity"}
                          </h4>
                          <p className="text-sm text-slate-600">{item.activity?.goal}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 self-start text-xs font-semibold px-3 py-1 rounded-full ${item.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                          <FaCheckCircle />
                          {item.completed ? "Completed" : "Ready to do"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><FaClock /> {item.activity?.estimatedTime || "Quick activity"}</span>
                        <span>{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>

            {activeActivity && (
              <SectionCard title="Open Activity" subtitle="Tap an activity above to open it here." className="bg-white/95">
                <h4 className="text-xl font-bold text-slate-800 mb-2">{activeActivity.activity?.title}</h4>
                <p className="text-slate-600 mb-4">{activeActivity.activity?.goal}</p>
                <div className="grid sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Materials</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {activeActivity.activity?.materials?.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Steps</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      {activeActivity.activity?.instructions?.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ol>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Today's Stories" subtitle="Stories your parent created for you will appear here." className="bg-white/95">
              {stories.length === 0 ? (
                <p className="text-sm text-slate-500">No stories yet. When a parent creates one, it will show up here automatically.</p>
              ) : (
                <div className="space-y-4">
                  {stories.slice(0, 5).map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setActiveStory(item)}
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        activeStory?._id === item._id ? "border-brand-purple bg-purple-50" : "border-slate-100 bg-slate-50 hover:border-brand-purple"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <FaBookOpen className="text-brand-purple" />
                            {item.storyTitle || "Story"}
                          </h4>
                          <p className="text-sm text-slate-600">{item.completed ? "Completed" : "Ready to read"}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 self-start text-xs font-semibold px-3 py-1 rounded-full ${item.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                          <FaCheckCircle />
                          {item.completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>

            {activeStory && (
              <SectionCard title="Open Story" subtitle="Tap a story above to open it here." className="bg-white/95">
                <h4 className="text-xl font-bold text-slate-800 mb-2">{activeStory.storyTitle}</h4>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{activeStory.storyContent}</p>
              </SectionCard>
            )}
          </div>
        )}
      </div>
    </ChildModeGate>
  );
};

export default ChildMode;
