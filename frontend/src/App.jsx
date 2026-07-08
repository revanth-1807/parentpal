import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ChildProfiles from "./pages/ChildProfiles.jsx";
import ActivityGenerator from "./pages/ActivityGenerator.jsx";
import StoryLibrary from "./pages/StoryLibrary.jsx";
import ProgressAnalytics from "./pages/ProgressAnalytics.jsx";
import Settings from "./pages/Settings.jsx";
import ChildMode from "./pages/child/ChildMode.jsx";
import ChildCharacterChat from "./pages/child/ChildCharacterChat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Child Mode - separate colorful, standalone interface */}
      <Route path="/child" element={<ChildMode />} />
      <Route path="/child/chat/:characterKey" element={<ChildCharacterChat />} />

      {/* Parent Mode - protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="children" element={<ChildProfiles />} />
        <Route path="activities" element={<ActivityGenerator />} />
        <Route path="stories" element={<StoryLibrary />} />
        <Route path="progress" element={<ProgressAnalytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

export default App;
