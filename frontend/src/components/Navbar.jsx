import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFeatherAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { parent, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg">
            <FaFeatherAlt />
          </span>
          <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            ParentPal
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-purple transition">Features</a>
          <a href="#how-it-works" className="hover:text-brand-purple transition">How it Works</a>
          <a href="#pricing" className="hover:text-brand-purple transition">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          {parent ? (
            <>
              <button onClick={() => navigate("/dashboard")} className="btn-secondary !px-4 !py-2 text-sm">
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-semibold text-slate-500 hover:text-red-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-purple transition">
                Log In
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
