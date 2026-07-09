import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMagic, FaBookOpen, FaTrophy, FaChartLine, FaClock, FaListUl, FaCheckCircle } from "react-icons/fa";
import { StatCard, SectionCard } from "../components/Card.jsx";
import ChildSelector from "../components/ChildSelector.jsx";
import { useChildren } from "../hooks/useChildren.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Dashboard = () => {
  const { parent } = useAuth();
  const { children, selectedChild, selectedChildId, selectChild, loading } = useChildren();
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [pendingStories, setPendingStories] = useState([]);

  useEffect(() => {
    if (!selectedChildId) return;
    api
      .get("/insights/summary", { params: { childId: selectedChildId, range: "weekly" } })
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null));
  }, [selectedChildId]);

  useEffect(() => {
    if (!selectedChildId) return;

    const loadLibrary = async () => {
      try {
        const [activityRes, storyRes] = await Promise.all([
          api.get("/activity/history", { params: { childId: selectedChildId } }),
          api.get("/story/history", { params: { childId: selectedChildId } }),
        ]);

        const activities = activityRes.data.history || [];
        const stories = storyRes.data.stories || [];

        setRecentActivities(activities);
        setRecentStories(stories);
        setPendingActivities(activities.filter((item) => !item.completed));
        setPendingStories(stories.filter((item) => !item.completed));
      } catch {
        setRecentActivities([]);
        setRecentStories([]);
        setPendingActivities([]);
        setPendingStories([]);
      }
    };

    loadLibrary();
  }, [selectedChildId]);

  const refreshLibrary = async () => {
    if (!selectedChildId) return;
    const [activityRes, storyRes] = await Promise.all([
      api.get("/activity/history", { params: { childId: selectedChildId } }),
      api.get("/story/history", { params: { childId: selectedChildId } }),
    ]);

    const activities = activityRes.data.history || [];
    const stories = storyRes.data.stories || [];

    setRecentActivities(activities);
    setRecentStories(stories);
    setPendingActivities(activities.filter((item) => !item.completed));
    setPendingStories(stories.filter((item) => !item.completed));
  };

  const completeActivity = async (id) => {
    await api.put(`/activity/${id}/complete`, { childId: selectedChildId, feedback: "" });
    await refreshLibrary();
  };

  const completeStory = async (id) => {
    await api.put(`/story/${id}/complete`, { childId: selectedChildId });
    await refreshLibrary();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back, {parent?.name?.split(" ")[0]}!</h1>
          <p className="text-slate-500">Here's how {selectedChild?.childName || "your child"} is doing this week.</p>
        </div>
        {!loading && <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={selectChild} />}
      </div>

      {selectedChild && (
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 shadow-sm w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "overview" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "review" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Review Queue
          </button>
        </div>
      )}

      {!loading && children.length === 0 && (
        <SectionCard title="Let's get started">
          <p className="text-slate-500 mb-4">Create your first child profile to unlock personalized activities and stories.</p>
          <Link to="/dashboard/children" className="btn-primary inline-flex">Create Child Profile</Link>
        </SectionCard>
      )}

      {selectedChild && (
        <>
          {activeTab === "overview" ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard icon={<FaMagic />} label="Activities Completed" value={summary?.activitiesCompleted ?? "-"} />
                <StatCard icon={<FaBookOpen />} label="Stories Generated" value={summary?.storiesGenerated ?? "-"} accent="from-brand-sky to-brand-blue" />
                <StatCard icon={<FaChartLine />} label="Skills Practiced" value={summary?.skillsPracticed ?? "-"} accent="from-brand-purple to-pink-400" />
                <StatCard icon={<FaTrophy />} label="Weekly Progress" value={summary ? "On Track" : "-"} accent="from-brand-yellow to-orange-400" />
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
                    <li><span className="font-semibold">Interests:</span> {selectedChild.interests?.join(", ") || "-"}</li>
                    <li><span className="font-semibold">Focus areas:</span> {selectedChild.challenges?.join(", ") || "-"}</li>
                  </ul>
                </SectionCard>

                <SectionCard title="Recent Activities" subtitle="A parent-friendly view of the latest generated activities">
                  <div className="space-y-4">
                    {recentActivities.slice(0, 3).map((item) => (
                      <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800 flex items-center gap-2">
                                <FaListUl className="text-brand-purple" />
                                {item.activity?.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{item.activity?.goal}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 self-start text-xs font-semibold px-3 py-1 rounded-full ${item.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                              <FaClock />
                              {item.completed ? "Completed" : "Ready"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>{item.activity?.estimatedTime || "Quick activity"}</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.completedAt && <span>Completed {new Date(item.completedAt).toLocaleDateString()}</span>}
                          </div>
                          {!item.completed && (
                            <button onClick={() => completeActivity(item._id)} className="btn-primary !py-2 text-sm self-start">
                              <FaCheckCircle /> Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {recentActivities.length === 0 && <p className="text-sm text-slate-500">No activities generated for this child yet.</p>}
                  </div>
                </SectionCard>

                <SectionCard title="Recent Stories" subtitle="A parent-friendly view of the latest generated stories">
                  <div className="space-y-4">
                    {recentStories.slice(0, 3).map((item) => (
                      <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800 flex items-center gap-2">
                                <FaBookOpen className="text-brand-purple" />
                                {item.storyTitle}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 max-h-14 overflow-hidden">
                                {item.storyContent?.slice(0, 140)}
                                {item.storyContent?.length > 140 ? "..." : ""}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 self-start text-xs font-semibold px-3 py-1 rounded-full ${item.completed ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                              <FaClock />
                              {item.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.completedAt && <span>Completed {new Date(item.completedAt).toLocaleDateString()}</span>}
                          </div>
                          {!item.completed && (
                            <button onClick={() => completeStory(item._id)} className="btn-primary !py-2 text-sm self-start">
                              <FaCheckCircle /> Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {recentStories.length === 0 && <p className="text-sm text-slate-500">No stories generated for this child yet.</p>}
                  </div>
                </SectionCard>
              </div>
            </>
          ) : (
            <div className="grid gap-6">
              <SectionCard title="Parent Review Queue" subtitle="Mark items complete after your child finishes them">
                <div className="space-y-4">
                  {pendingActivities.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{item.activity?.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.activity?.goal}</p>
                        </div>
                        <button onClick={() => completeActivity(item._id)} className="btn-primary !py-2 text-sm shrink-0">
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingStories.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{item.storyTitle}</p>
                          <p className="text-xs text-slate-500 mt-1">Shared to your child page.</p>
                        </div>
                        <button onClick={() => completeStory(item._id)} className="btn-primary !py-2 text-sm shrink-0">
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingActivities.length === 0 && pendingStories.length === 0 && (
                    <p className="text-sm text-slate-500">No pending items right now.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
