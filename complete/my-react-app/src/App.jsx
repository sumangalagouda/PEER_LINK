import React, { useEffect, useState } from "react";
import "./index.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
// import Login from './components/Login';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyConnections from "./pages/MyConnections";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import Project from "./pages/Project";
import Hackathon from "./pages/Hackathon";
import { getAuthStatus } from "./api/auth";

/**
 * App root handles auth bootstrap and routing.
 * Note: All pages use fetch() to your Flask endpoints specified earlier.
 */

export default function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    // On mount, check auth status from backend
    async function check() {
      try {
        const res = await getAuthStatus();
        if (res && res.logged_in) {
          // backend's /auth/status returns user_id and user_name
          setAuth({ isAuthenticated: true, user: { id: res.user_id, name: res.user_name }, loading: false });
        } else {
          setAuth({ isAuthenticated: false, user: null, loading: false });
        }
      } catch (err) {
        setAuth({ isAuthenticated: false, user: null, loading: false });
      }
    }
    check();
  }, []);

  const onLogin = (user) => {
    setAuth({ isAuthenticated: true, user, loading: false });
    navigate("/dashboard");
  };

  const onLogout = () => {
    setAuth({ isAuthenticated: false, user: null, loading: false });
    navigate("/");
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 animate-spin text-indigo-600">⏳</div>
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar auth={auth} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home auth={auth} />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard auth={auth} />} />
          <Route path="/connections" element={<MyConnections auth={auth} />} />
          <Route path="/profile" element={<Profile auth={auth} />} />
          <Route path="/groups" element={<Groups auth={auth} />} />
          <Route path="/groupchat" element={<GroupChat auth={auth} />} />
          <Route path="/projects" element={<Project auth={auth} />} />
          <Route path="/hackathon" element={<Hackathon auth={auth} />} />
          <Route path="*" element={<Home auth={auth} />} />
        </Routes>
      </main>
    </div>
  );
}
