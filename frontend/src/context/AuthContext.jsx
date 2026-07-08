import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [parent, setParent] = useState(() => {
    const stored = localStorage.getItem("parentpal_parent");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parent) localStorage.setItem("parentpal_parent", JSON.stringify(parent));
  }, [parent]);

  const register = async (name, email, password) => {
  console.log("register args:", name, email, password);

  setLoading(true);
  try {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
  } catch (err) {
    console.log("Backend error:", err.response?.data);
    throw err;
  } finally {
    setLoading(false);
  }
};

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("parentpal_token", data.token);
      setParent(data.parent);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("parentpal_token");
    localStorage.removeItem("parentpal_parent");
    setParent(null);
  };

  return (
    <AuthContext.Provider value={{ parent, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
