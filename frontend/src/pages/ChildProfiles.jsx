import React, { useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import { useChildren } from "../hooks/useChildren.js";
import api from "../api/axios.js";

const INTEREST_OPTIONS = ["Space", "Dinosaurs", "Animals", "Science", "Art", "Music"];
const CHALLENGE_OPTIONS = ["Focus", "Reading", "Writing", "Fine Motor Skills"];
const AVATARS = ["🦉", "🦄", "🐯", "🐳", "🦖", "🐼", "🚀", "🌟"];

const emptyForm = {
  childName: "",
  age: "",
  gender: "prefer_not_to_say",
  interests: [],
  learningStyle: "visual",
  challenges: [],
  avatar: "🦉",
};

const ChildProfiles = () => {
  const { children, refresh } = useChildren();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleMulti = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  };

  const startEdit = (child) => {
    setEditingId(child._id);
    setForm({
      childName: child.childName,
      age: child.age,
      gender: child.gender,
      interests: child.interests || [],
      learningStyle: child.learningStyle,
      challenges: child.challenges || [],
      avatar: child.avatar || "🦉",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/children/${editingId}`, form);
      } else {
        await api.post("/children", form);
      }
      await refresh();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong saving this profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this child profile? This cannot be undone.")) return;
    await api.delete(`/children/${id}`);
    await refresh();
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Child Profiles</h1>
        <p className="text-slate-500">Manage your children's profiles to personalize their learning journey.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          {children.map((child) => (
            <SectionCard key={child._id}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{child.avatar}</div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(child)} className="text-slate-400 hover:text-brand-purple">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(child._id)} className="text-slate-400 hover:text-red-500">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg">{child.childName}</h3>
              <p className="text-sm text-slate-500 mb-3">Age {child.age} · {child.learningStyle} learner</p>
              <div className="flex flex-wrap gap-1.5">
                {child.interests?.map((i) => (
                  <span key={i} className="text-xs bg-blue-50 text-brand-blue px-2 py-1 rounded-full">{i}</span>
                ))}
              </div>
            </SectionCard>
          ))}

          {children.length === 0 && (
            <SectionCard className="sm:col-span-2 text-center py-10">
              <p className="text-slate-500">No child profiles yet. Create one using the form →</p>
            </SectionCard>
          )}
        </div>

        <SectionCard title={editingId ? "Edit Profile" : "Add Child Profile"}>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2 mb-3">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setForm({ ...form, avatar: a })}
                    className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center border ${
                      form.avatar === a ? "border-brand-purple bg-purple-50" : "border-slate-200"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <input
              className="input-field"
              placeholder="Child's name"
              required
              value={form.childName}
              onChange={(e) => setForm({ ...form, childName: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                className="input-field"
                type="number"
                min={1}
                max={17}
                placeholder="Age"
                required
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <select
                className="input-field"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Learning Style</label>
              <select
                className="input-field"
                value={form.learningStyle}
                onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleMulti("interests", i)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      form.interests.includes(i) ? "bg-brand-purple text-white border-brand-purple" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Focus Areas / Challenges</label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleMulti("challenges", c)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      form.challenges.includes(c) ? "bg-brand-blue text-white border-brand-blue" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                <FaPlus /> {editingId ? "Save Changes" : "Add Profile"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
};

export default ChildProfiles;
