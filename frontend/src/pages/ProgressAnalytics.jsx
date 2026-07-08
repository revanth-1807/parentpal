import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaBrain, FaTrophy } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import api from "../api/axios.js";

const ProgressAnalytics = () => {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!selectedChildId) return;
    api.get("/insights/summary", { params: { childId: selectedChildId, range: "weekly" } }).then(({ data }) => setWeekly(data));
    api.get("/insights/summary", { params: { childId: selectedChildId, range: "monthly" } }).then(({ data }) => setMonthly(data));
    api.get("/insights/badges", { params: { childId: selectedChildId } }).then(({ data }) => setBadges(data.badges || [])).catch(() => setBadges([]));
  }, [selectedChildId]);

  const chartData = weekly && monthly
    ? [
        { name: "This Week", Activities: weekly.activitiesCompleted, Stories: weekly.storiesGenerated, Skills: weekly.skillsPracticed },
        { name: "This Month", Activities: monthly.activitiesCompleted, Stories: monthly.storiesGenerated, Skills: monthly.skillsPracticed },
      ]
    : [];

  const handleAnalyze = async () => {
    if (!feedback.trim()) return;
    setError("");
    setLoading(true);
    setInsight(null);
    try {
      const { data } = await api.post("/insights/analyze", { childId: selectedChildId, feedback });
      setInsight(data.insight);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't analyze feedback right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Progress Analytics</h1>
          <p className="text-slate-500">Track growth and get AI-powered developmental insights.</p>
        </div>
        <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={selectChild} />
      </div>

      {selectedChild ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="Weekly vs Monthly Growth">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Activities" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Stories" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Skills" fill="#FACC15" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Development Trend">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Activities" stroke="#3B82F6" strokeWidth={3} />
                  <Line type="monotone" dataKey="Skills" stroke="#8B5CF6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          <SectionCard title="Developmental Insight Analyzer" subtitle="Describe how an activity went and get AI-powered guidance">
            <textarea
              className="input-field min-h-[100px] mb-3"
              placeholder="e.g. Child enjoyed the activity but struggled with cutting shapes."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2 mb-3">{error}</div>}
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
              <FaBrain /> {loading ? "Analyzing..." : "Analyze Feedback"}
            </button>

            {insight && (
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-sm text-green-700 mb-2">Strengths</h4>
                  <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                    {insight.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-sm text-yellow-700 mb-2">Areas for Improvement</h4>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    {insight.areasForImprovement?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-sm text-blue-700 mb-2">Recommended Next</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    {insight.recommendedNextActivities?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <p className="sm:col-span-3 text-sm text-slate-600 italic">{insight.summary}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Badges & Achievements">
            {badges.length === 0 ? (
              <div className="flex items-center gap-3 text-slate-400">
                <FaTrophy className="text-2xl text-brand-yellow" />
                <p className="text-sm">No badges yet. When your child completes activities or stories, achievements will appear here.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div key={badge._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-yellow to-orange-400 text-white flex items-center justify-center text-2xl shadow-lg">
                      {badge.icon || "🏅"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{badge.badgeName}</h4>
                      <p className="text-xs text-slate-500">
                        Earned on {new Date(badge.earnedDate || badge.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : (
        <SectionCard>
          <p className="text-slate-500">Create a child profile first to see progress analytics.</p>
        </SectionCard>
      )}
    </div>
  );
};

export default ProgressAnalytics;
