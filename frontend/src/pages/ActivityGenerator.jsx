import React, { useEffect, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import api from "../api/axios.js";

const ActivityGenerator = () => {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const [interest, setInterest] = useState("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const cacheKey = selectedChildId ? `parentpal_activity_cache_${selectedChildId}` : "";

  const cacheHistory = (items) => {
    if (!cacheKey) return;
    localStorage.setItem(cacheKey, JSON.stringify(items));
  };

  useEffect(() => {
    if (selectedChild) {
      setInterest(selectedChild.interests?.[0] || "");
      setChallenge(selectedChild.challenges?.[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const syncHistoryCache = async () => {
    if (!selectedChildId) return;
    try {
      const { data } = await api.get("/activity/history", { params: { childId: selectedChildId } });
      cacheHistory(data.history || []);
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
      await api.post("/activity/generate", {
        childId: selectedChildId,
        age: selectedChild?.age,
        interest,
        challenge,
      });
      setCreated(true);
      await syncHistoryCache();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate an activity right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Activity Generator</h1>
          <p className="text-slate-500">AI + Montessori-inspired knowledge base, personalized just for your child.</p>
        </div>
        <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={selectChild} />
      </div>

      {selectedChild ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <SectionCard title="Generate an Activity" className="lg:col-span-1 h-fit">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Interest</label>
                <input className="input-field" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="e.g. Space" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Focus Area / Challenge</label>
                <input className="input-field" value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="e.g. Fine Motor Skills" />
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center">
                <FaMagic /> {loading ? "Generating..." : "Generate Activity"}
              </button>
              <p className="text-xs text-slate-400">
                The activity will appear in the child view. The parent dashboard is used to mark it complete.
              </p>
            </div>
          </SectionCard>

          <div className="lg:col-span-2 space-y-6">
            {created && (
              <SectionCard>
                <p className="text-sm uppercase tracking-wide text-brand-purple font-semibold mb-2">Shared to Child</p>
                <p className="text-slate-600">The activity is now available in the child page and the parent review queue.</p>
              </SectionCard>
            )}
          </div>
        </div>
      ) : (
        <SectionCard>
          <p className="text-slate-500">Create a child profile first to generate personalized activities.</p>
        </SectionCard>
      )}
    </div>
  );
};

export default ActivityGenerator;
