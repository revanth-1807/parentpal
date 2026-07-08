import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMagic, FaBookOpen, FaTrophy, FaChartLine } from "react-icons/fa";
import { StatCard, SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Dashboard = () => {
  const { parent } = useAuth();
  const { children, selectedChild, selectedChildId, selectChild, loading } = useChildren();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!selectedChildId) return;
    api
      .get(`/insights/summary`, { params: { childId: selectedChildId, range: "weekly" } })
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null));
  }, [selectedChildId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back, {parent?.name?.split(" ")[0]} 👋</h1>
          <p className="text-slate-500">Here's how {selectedChild?.childName || "your child"} is doing this week.</p>
        </div>
        {!loading && <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={selectChild} />}
      </div>

      {!loading && children.length === 0 && (
        <SectionCard title="Let's get started">
          <p className="text-slate-500 mb-4">Create your first child profile to unlock personalized activities and stories.</p>
          <Link to="/dashboard/children" className="btn-primary inline-flex">Create Child Profile</Link>
        </SectionCard>
      )}

      {selectedChild && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={<FaMagic />} label="Activities Completed" value={summary?.activitiesCompleted ?? "–"} />
            <StatCard icon={<FaBookOpen />} label="Stories Generated" value={summary?.storiesGenerated ?? "–"} accent="from-brand-sky to-brand-blue" />
            <StatCard icon={<FaChartLine />} label="Skills Practiced" value={summary?.skillsPracticed ?? "–"} accent="from-brand-purple to-pink-400" />
            <StatCard icon={<FaTrophy />} label="Weekly Progress" value={summary ? "On Track" : "–"} accent="from-brand-yellow to-orange-400" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="Quick Actions" subtitle="Jump right back in">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/dashboard/activities" className="btn-primary justify-center">
                  <FaMagic /> New Activity
                </Link>
                <Link to="/dashboard/stories" className="btn-secondary justify-center">
                  <FaBookOpen /> New Story
                </Link>
              </div>
            </SectionCard>

            <SectionCard title="This Child" subtitle="Profile snapshot">
              <ul className="text-sm text-slate-600 space-y-2">
                <li><span className="font-semibold">Age:</span> {selectedChild.age}</li>
                <li><span className="font-semibold">Learning style:</span> {selectedChild.learningStyle}</li>
                <li><span className="font-semibold">Interests:</span> {selectedChild.interests?.join(", ") || "—"}</li>
                <li><span className="font-semibold">Focus areas:</span> {selectedChild.challenges?.join(", ") || "—"}</li>
              </ul>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
