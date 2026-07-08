import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMicrophone, FaArrowLeft, FaVolumeUp } from "react-icons/fa";
import api from "../../api/axios.js";
import ChildModeGate from "../../components/ChildModeGate.jsx";

const CHARACTER_META = {
  professor_owl: { name: "Professor Owl", emoji: "🦉", color: "from-blue-400 to-sky-400" },
  story_fairy: { name: "Story Fairy", emoji: "🧚", color: "from-purple-400 to-pink-400" },
  captain_science: { name: "Captain Science", emoji: "🚀", color: "from-yellow-400 to-orange-400" },
  math_buddy: { name: "Math Buddy", emoji: "🤖", color: "from-green-400 to-emerald-400" },
};

const ChildCharacterChat = () => {
  const { characterKey } = useParams();
  const navigate = useNavigate();
  const meta = CHARACTER_META[characterKey] || CHARACTER_META.professor_owl;

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("parentpal_active_child_mode_profile");
    if (!stored) {
      navigate("/child");
      return;
    }
    const p = JSON.parse(stored);
    setProfile(p);
    setMessages([{ role: "ai", text: `Hi ${p.childName}! I'm ${meta.name}. What do you want to talk about today?` }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !profile) return;
    const newHistory = [...messages, { role: "child", text }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/chat", {
        childId: profile._id,
        character: characterKey,
        message: text,
        history: newHistory.map((m) => ({ role: m.role, text: m.text })),
      });
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      speak(data.reply);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Oops, I got a little sleepy! Can you ask me again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <ChildModeGate title="ParentPal Child Chat" subtitle="This character chat stays in fullscreen until a parent enters the PIN.">
      <div className={`min-h-screen flex flex-col bg-gradient-to-br ${meta.color}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/child")} className="text-white bg-white/20 rounded-full p-3">
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2 text-white font-display font-extrabold text-xl">
            <span className="text-3xl">{meta.emoji}</span> {meta.name}
          </div>
          <div className="w-10" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-w-2xl mx-auto w-full">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "child" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-5 py-3 rounded-3xl text-lg shadow-lg ${
                  m.role === "child" ? "bg-white text-slate-800" : "bg-white/95 text-slate-800"
                }`}
              >
                {m.role === "ai" && (
                  <button onClick={() => speak(m.text)} className="text-xs text-brand-purple mb-1 flex items-center gap-1">
                    <FaVolumeUp /> Play
                  </button>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/95 px-5 py-3 rounded-3xl text-lg shadow-lg animate-pulse">{meta.emoji} is thinking...</div>
            </div>
          )}
        </div>

        <div className="p-6 max-w-2xl mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              className="flex-1 rounded-2xl px-5 py-4 text-lg outline-none shadow-lg"
            />
            <button
              type="button"
              onClick={startListening}
              className={`rounded-2xl px-5 shadow-lg text-white text-xl ${listening ? "bg-red-500 animate-pulse" : "bg-slate-700"}`}
            >
              <FaMicrophone />
            </button>
            <button type="submit" className="rounded-2xl px-6 bg-white font-bold text-slate-800 shadow-lg">
              Send
            </button>
          </form>
        </div>
      </div>
    </ChildModeGate>
  );
};

export default ChildCharacterChat;
