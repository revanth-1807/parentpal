import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaFeatherAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full blur-3xl opacity-20 -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-gradient-to-br from-brand-sky to-brand-yellow rounded-full blur-3xl opacity-20 -bottom-20 -right-20" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl mb-8 justify-center">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-lg">
            <FaFeatherAlt />
          </span>
          <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">ParentPal</span>
        </Link>

        <h1 className="text-2xl font-extrabold text-center mb-1">Create your account</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Start your child's personalized learning journey</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Full name"
              className="input-field pl-11"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              placeholder="Email address"
              className="input-field pl-11"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min. 6 characters)"
              className="input-field pl-11"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-purple font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
