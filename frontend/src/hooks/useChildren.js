import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";

export const useChildren = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(
    localStorage.getItem("parentpal_selected_child") || ""
  );
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/children");
      setChildren(data.children);
      // Cache a lightweight list so Child Mode (no-login kid interface) can offer a profile picker
      localStorage.setItem(
        "parentpal_children_cache",
        JSON.stringify(data.children.map((c) => ({ _id: c._id, childName: c.childName, avatar: c.avatar, age: c.age })))
      );
      if (!selectedChildId && data.children.length > 0) {
        selectChild(data.children[0]._id);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChild = (id) => {
    setSelectedChildId(id);
    localStorage.setItem("parentpal_selected_child", id);
  };

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const selectedChild = children.find((c) => c._id === selectedChildId) || null;

  return { children, selectedChild, selectedChildId, selectChild, loading, refresh: fetchChildren };
};
