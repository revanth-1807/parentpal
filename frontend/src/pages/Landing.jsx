import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMagic,
  FaBookOpen,
  FaShieldAlt,
  FaChartLine,
  FaMicrophone,
  FaStar,
  FaRocket,
} from "react-icons/fa";
import Navbar from "../components/Navbar.jsx";

const features = [
  {
    icon: <FaMagic />,
    title: "Personalized Activities",
    desc: "AI-generated developmental activities tailored to your child's age, interests, and challenges.",
  },
  {
    icon: <FaBookOpen />,
    title: "AI Story Generator",
    desc: "Adaptive stories starring your child as the hero, with a gentle lesson woven into every adventure.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safe AI Companion",
    desc: "Kid-safe characters that redirect unsafe topics and encourage curiosity, kindness, and learning.",
  },
  {
    icon: <FaChartLine />,
    title: "Progress Tracking",
    desc: "Weekly and monthly insights into skills practiced, milestones reached, and growth over time.",
  },
  {
    icon: <FaMicrophone />,
    title: "Voice Interaction",
    desc: "Kids can talk to their AI companion and hear it talk back, no typing required.",
  },
];

const steps = [
  "Parent creates a free profile",
  "Child profile is created with interests & learning style",
  "AI recommends personalized activities & stories",
  "Child learns, plays, and explores safely",
  "Progress is tracked and celebrated together",
];

const testimonials = [
  { name: "Amara T.", role: "Mom of two", quote: "ParentPal turned rainy afternoons into learning adventures my kids actually ask for." },
  { name: "Rohan K.", role: "Dad & educator", quote: "The activity generator feels like having a child development expert on call." },
  { name: "Priya S.", role: "Homeschool parent", quote: "My daughter loves Story Fairy — and I love that it's actually safe for her." },
];

const plans = [
  { name: "Starter", price: "Free", features: ["1 child profile", "5 activities / month", "Basic progress tracking"] },
  { name: "Family", price: "$9/mo", features: ["Up to 4 child profiles", "Unlimited activities & stories", "Full analytics & badges"], highlighted: true },
  { name: "Learning Pro", price: "$19/mo", features: ["Everything in Family", "Voice interaction", "Priority AI generation"] },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/70 text-brand-purple font-semibold text-xs mb-5 shadow">
            AI-Driven Child Development
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Helping your child <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">grow, learn & imagine</span> every day
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            ParentPal blends personalized educational activities for parents with a safe, curious AI companion for kids — powered by real child development research.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              <FaRocket /> Get Started Free
            </Link>
            <Link to="/child" className="btn-secondary">
              Try Child Mode
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute w-72 h-72 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full blur-3xl opacity-20" />
          <div className="glass-card w-full max-w-sm p-8 text-center animate-float">
            <div className="text-7xl mb-4">🦉📚🚀</div>
            <p className="font-display font-bold text-xl mb-2">Meet Professor Owl!</p>
            <p className="text-slate-500 text-sm">Your child's curious learning companion, ready to explore space, science, stories & more.</p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Everything your family needs</h2>
          <p className="text-slate-500">One platform, two experiences — built for parents and designed for kids.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple text-white flex items-center justify-center text-xl mb-4 shadow">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={step} className="glass-card p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-brand-blue to-brand-purple text-white flex items-center justify-center font-bold mb-3">
                {i + 1}
              </div>
              <p className="text-sm text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Loved by parents</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-6">
              <div className="flex gap-1 text-brand-yellow mb-3">
                {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} />)}
              </div>
              <p className="text-slate-600 italic mb-4">"{t.quote}"</p>
              <p className="font-bold text-slate-800 text-sm">{t.name}</p>
              <p className="text-xs text-slate-400">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Simple pricing (Demo)</h2>
          <p className="text-slate-500">This is a demo pricing table for the hackathon prototype.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`glass-card p-8 text-center ${p.highlighted ? "ring-2 ring-brand-purple scale-105" : ""}`}
            >
              <h3 className="font-bold text-xl mb-1">{p.name}</h3>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent mb-6">
                {p.price}
              </p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                {p.features.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
              <Link to="/register" className={p.highlighted ? "btn-primary w-full" : "btn-secondary w-full"}>
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/50 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ParentPal. Built for curious families.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-brand-purple">Features</a>
            <a href="#pricing" className="hover:text-brand-purple">Pricing</a>
            <Link to="/login" className="hover:text-brand-purple">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
