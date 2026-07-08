import React, { useEffect, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import api from "../api/axios.js";

const StoryLibrary = () => {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const cacheKey = selectedChildId ? `parentpal_story_cache_${selectedChildId}` : "";

  useEffect(() => {
    if (selectedChild) {
      setFavoriteCharacter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const syncStoryCache = async () => {
    if (!selectedChildId) return;
    try {
      const { data } = await api.get("/story/history", { params: { childId: selectedChildId } });
      localStorage.setItem(cacheKey, JSON.stringify(data.stories || []));
    } catch {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return;
    }
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setCreated(false);
    try {
      await api.post("/story/generate", {
        childId: selectedChildId,
        favoriteCharacter,
      });
      setCreated(true);
      await syncStoryCache();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate a story right now. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <p className="text-xs text-slate-400">
                The story will appear in the child view. The parent dashboard is used to mark it complete.
              </p>
            </div>
          </SectionCard>

          <div className="lg:col-span-2 space-y-6">
            {created && (
              <SectionCard>
                <p className="text-sm uppercase tracking-wide text-brand-purple font-semibold mb-2">Shared to Child</p>
                <p className="text-slate-600">The story is now available in the child page and the parent review queue.</p>
              </SectionCard>
            )}
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
