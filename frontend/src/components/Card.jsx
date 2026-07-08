import React from "react";

export const StatCard = ({ icon, label, value, accent = "from-brand-blue to-brand-purple" }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} text-white flex items-center justify-center text-2xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-display font-extrabold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export const SectionCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`glass-card p-6 ${className}`}>
    {title && (
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);
