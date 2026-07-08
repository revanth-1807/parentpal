import React, { useEffect, useState } from "react";
import { FaMagic, FaClock, FaShieldAlt, FaCheckCircle, FaDownload } from "react-icons/fa";
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
  const [activity, setActivity] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (selectedChild) {
      setInterest(selectedChild.interests?.[0] || "");
      setChallenge(selectedChild.challenges?.[0] || "");
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId]);

  const fetchHistory = async () => {
    if (!selectedChildId) return;
    const { data } = await api.get("/activity/history", { params: { childId: selectedChildId } });
    setHistory(data.history);
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setActivity(null);
    try {
      const { data } = await api.post("/activity/generate", {
        childId: selectedChildId,
        age: selectedChild?.age,
        interest,
        challenge,
      });
      setActivity(data.activity);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't generate an activity right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id, feedback = "") => {
    await api.put(`/activity/${id}/complete`, { feedback });
    fetchHistory();
  };

  const downloadChecklist = (act) => {
    const materials = act.activity?.materials || act.materials || [];
    const content = `ParentPal Shopping List\n${act.activity?.title || act.title}\n\n${materials
      .map((m) => `[ ] ${m}`)
      .join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shopping-list.txt";
    link.click();
    URL.revokeObjectURL(url);
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
            </div>
          </SectionCard>

          <div className="lg:col-span-2 space-y-6">
            {activity && (
              <SectionCard>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-display font-bold">{activity.activity.title}</h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-brand-purple capitalize">
                    {activity.activity.difficulty}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{activity.activity.goal}</p>

                <div className="grid sm:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Materials</h4>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {activity.activity.materials?.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Steps</h4>
                    <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                      {activity.activity.instructions?.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1.5"><FaClock /> {activity.activity.estimatedTime}</span>
                  <span className="flex items-center gap-1.5"><FaShieldAlt /> {activity.activity.safetyNotes}</span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => markComplete(activity._id)} className="btn-primary !py-2 text-sm">
                    <FaCheckCircle /> Mark Complete
                  </button>
                  <button onClick={() => downloadChecklist(activity)} className="btn-secondary !py-2 text-sm">
                    <FaDownload /> Shopping Checklist
                  </button>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Recent Activities">
              <div className="space-y-3">
                {history.slice(0, 6).map((h) => (
                  <div key={h._id} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{h.activity?.title}</p>
                      <p className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${h.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {h.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
                {history.length === 0 && <p className="text-sm text-slate-400">No activities generated yet.</p>}
              </div>
            </SectionCard>
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
