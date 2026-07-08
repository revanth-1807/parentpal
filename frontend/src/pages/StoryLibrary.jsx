import React, { useEffect, useState } from "react";
import { FaMagic, FaSearch, FaHeart, FaRegHeart, FaBookOpen } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import api from "../api/axios.js";

const StoryLibrary = () => {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    if (selectedChildId) fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, search]);

  const fetchStories = async () => {
    const { data } = await api.get("/story/history", { params: { childId: selectedChildId, search } });
    setStories(data.stories);
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/story/generate", {
        childId: selectedChildId,
        favoriteCharacter,
      });
      setActiveStory(data.story);
      fetchStories();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate a story right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    await api.put(`/story/${id}/favorite`);
    fetchStories();
    if (activeStory?._id === id) setActiveStory({ ...activeStory, favorite: !activeStory.favorite });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Story Library</h1>
          <p className="text-slate-500">Adaptive stories where your child is always the hero.</p>
        </div>
        <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={selectChild} />
      </div>

      {selectedChild ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <SectionCard title="Generate a New Story" className="h-fit">
            <div className="space-y-4">
              <input
                className="input-field"
                placeholder="Favorite character (optional)"
                value={favoriteCharacter}
                onChange={(e) => setFavoriteCharacter(e.target.value)}
              />
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center">
                <FaMagic /> {loading ? "Writing story..." : "Generate Story"}
              </button>
            </div>
          </SectionCard>

          <div className="lg:col-span-2 space-y-6">
            {activeStory && (
              <SectionCard>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-display font-bold">{activeStory.storyTitle}</h3>
                  <button onClick={() => toggleFavorite(activeStory._id)} className="text-brand-purple text-xl">
                    {activeStory.favorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{activeStory.storyContent}</p>
              </SectionCard>
            )}

            <SectionCard title="Story Library" subtitle={`${stories.length} stories saved`}>
              <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  className="input-field pl-11 !py-2"
                  placeholder="Search stories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {stories.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setActiveStory(s)}
                    className="text-left border border-slate-100 rounded-2xl p-4 hover:border-brand-purple transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FaBookOpen className="text-brand-purple" />
                      {s.favorite && <FaHeart className="text-pink-400 text-sm" />}
                    </div>
                    <p className="font-semibold text-sm">{s.storyTitle}</p>
                    <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </button>
                ))}
                {stories.length === 0 && <p className="text-sm text-slate-400 col-span-2">No stories yet.</p>}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <SectionCard>
          <p className="text-slate-500">Create a child profile first to generate personalized stories.</p>
        </SectionCard>
      )}
    </div>
  );
};

export default StoryLibrary;
