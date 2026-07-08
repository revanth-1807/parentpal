import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChild,
  FaMagic,
  FaChartLine,
  FaBookOpen,
  FaCog,
  FaFeatherAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: <FaHome />, end: true },
  { to: "/dashboard/children", label: "Child Profiles", icon: <FaChild /> },
  { to: "/dashboard/activities", label: "Activity Generator", icon: <FaMagic /> },
  { to: "/dashboard/progress", label: "Progress Analytics", icon: <FaChartLine /> },
  { to: "/dashboard/stories", label: "Story Library", icon: <FaBookOpen /> },
  { to: "/dashboard/settings", label: "Settings", icon: <FaCog /> },
];

const Sidebar = () => {
  const { parent, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 glass-card !rounded-none border-r border-white/40 flex flex-col p-6">
      <div className="flex items-center gap-2 font-display font-extrabold text-xl mb-10">
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg">
          <FaFeatherAlt />
        </span>
        <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
          ParentPal
        </span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/50 pt-4 mt-4">
        <p className="text-sm font-semibold text-slate-700 truncate">{parent?.name}</p>
        <p className="text-xs text-slate-400 truncate mb-3">{parent?.email}</p>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="sidebar-link w-full text-red-500 hover:bg-red-50"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
