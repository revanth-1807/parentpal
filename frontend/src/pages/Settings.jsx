import React, { useEffect, useState } from "react";
import { FaUserCircle, FaShieldAlt, FaExternalLinkAlt } from "react-icons/fa";
import { SectionCard } from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { parent } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setPin(localStorage.getItem("parentpal_child_mode_pin") || "");
  }, []);

  const savePin = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setStatus("Enter a PIN to protect Child Mode.");
      return;
    }
    if (pin.trim() !== confirmPin.trim()) {
      setStatus("PIN and confirmation must match.");
      return;
    }
    localStorage.setItem("parentpal_child_mode_pin", pin.trim());
    setStatus("Child Mode PIN saved on this device.");
  };

  const openChildMode = () => {
    window.open("/child", "_blank", "noopener,noreferrer");
  };

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
        <button type="button" onClick={openChildMode} className="btn-secondary inline-flex items-center gap-2">
          <FaExternalLinkAlt /> Open Child Mode
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Child Mode uses a parent PIN on this device to unlock fullscreen access.
        </p>
      </SectionCard>

      <SectionCard title="Child Mode PIN" subtitle="Set the PIN that unlocks fullscreen Child Mode on this device">
        <form onSubmit={savePin} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block flex items-center gap-2">
              <FaShieldAlt /> New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              className="input-field"
              placeholder="Enter a PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              className="input-field"
              placeholder="Re-enter the PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </div>
          {status && <div className="text-sm rounded-xl px-3 py-2 bg-slate-50 text-slate-600">{status}</div>}
          <button type="submit" className="btn-primary">
            Save PIN
          </button>
        </form>
      </SectionCard>
    </div>
  );
};

export default Settings;
