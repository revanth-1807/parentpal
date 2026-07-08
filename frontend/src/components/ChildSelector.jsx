import React from "react";
import { Link } from "react-router-dom";

const ChildSelector = ({ children, selectedChildId, onSelect }) => {
  if (!children || children.length === 0) {
    return (
      <div className="glass-card p-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">No child profiles yet.</p>
        <Link to="/dashboard/children" className="btn-primary !px-4 !py-2 text-sm">
          Add Child Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-500">Viewing:</span>
      <select
        value={selectedChildId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="input-field !py-2 !w-auto font-semibold"
      >
        {children.map((c) => (
          <option key={c._id} value={c._id}>
            {c.avatar || "🙂"} {c.childName} (age {c.age})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChildSelector;
