import React, { useEffect, useState } from "react";

const PIN_KEY = "parentpal_child_mode_pin";
const SESSION_KEY = "parentpal_child_mode_unlocked";

const ChildModeGate = ({ children, title = "Child Mode", subtitle = "Enter the parent PIN to unlock fullscreen mode." }) => {
  const [locked, setLocked] = useState(sessionStorage.getItem(SESSION_KEY) !== "true");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && sessionStorage.getItem(SESSION_KEY) === "true") {
        sessionStorage.removeItem(SESSION_KEY);
        setLocked(true);
        setPin("");
        setError("Fullscreen was exited. Enter the parent PIN to continue.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const requestFullscreen = async () => {
    if (!document.documentElement.requestFullscreen || document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Some browsers block fullscreen unless the gesture is accepted.
    }
  };

  const unlock = async (e) => {
    e.preventDefault();
    const savedPin = localStorage.getItem(PIN_KEY);

    if (!savedPin) {
      setError("Set a child-mode PIN in Settings first.");
      return;
    }

    if (pin.trim() !== savedPin) {
      setError("Incorrect PIN. Try again.");
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "true");
    setLocked(false);
    setError("");
    await requestFullscreen();
  };

  if (!locked) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-purple to-brand-sky flex items-center justify-center px-6 py-10">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-purple mb-2">{title}</p>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Locked Mode</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <form onSubmit={unlock} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Parent PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input-field"
              placeholder="Enter PIN"
            />
          </div>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>}
          <button type="submit" className="btn-primary w-full justify-center">
            Unlock Child Mode
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChildModeGate;
