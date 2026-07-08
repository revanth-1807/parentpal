import React from "react";
import { FaUserCircle, FaLink } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { parent } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="text-slate-500">Manage your ParentPal account.</p>
      </div>

      <SectionCard title="Account">
        <div className="flex items-center gap-4">
          <FaUserCircle className="text-5xl text-brand-purple" />
          <div>
            <p className="font-semibold">{parent?.name}</p>
            <p className="text-sm text-slate-500">{parent?.email}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Child Mode Access" subtitle="Share this link on your child's device">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <FaLink className="text-slate-400" />
          <code className="text-sm text-slate-600">{window.location.origin}/child</code>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Child Mode does not require login and only shows safe, kid-friendly AI companions.
        </p>
      </SectionCard>
    </div>
  );
};

export default Settings;
