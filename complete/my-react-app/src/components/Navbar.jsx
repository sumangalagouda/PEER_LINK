import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { postLogout } from "../api/auth";

export default function Navbar({ auth, onLogout }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await postLogout();
    } catch (err) {
      // ignore; still clear client state
    } finally {
      onLogout();
      navigate("/");
    }
  }

  return (
    <nav className="relative bg-indigo-600 text-white shadow overflow-visible z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/logo.jpg" alt="logo" className="w-7 h-7 rounded-sm object-cover" />
            <span>PeerLink</span>
          </Link>
          <div className="hidden md:flex gap-2">
            <Link to="/" className="px-3 py-1 rounded hover:bg-indigo-500/40">Home</Link>
            {auth.isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-3 py-1 rounded hover:bg-indigo-500/40">Dashboard</Link>
                <Link to="/connections" className="px-3 py-1 rounded hover:bg-indigo-500/40">My Connections</Link>

                {/* Groups dropdown */}
                <div className="relative group">
                  <button className="px-3 py-1 rounded hover:bg-indigo-500/40 flex items-center gap-2">Groups ▾</button>
                <div className="absolute left-0 mt-2 w-44 bg-white text-slate-800 rounded shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50">
                    <Link to="/groups" className="block px-3 py-2 hover:bg-slate-100">Create Group</Link>
                    <Link to="/groupchat" className="block px-3 py-2 hover:bg-slate-100">View Group</Link>
                    <Link to="/projects" className="block px-3 py-2 hover:bg-slate-100">Create Project</Link>
                    <Link to="/hackathon" className="block px-3 py-2 hover:bg-slate-100">Hackathon Team</Link>
                  </div>
                </div>

                <Link to="/profile" className="px-3 py-1 rounded hover:bg-indigo-500/40">Profile</Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!auth.isAuthenticated ? (
            <>
              <Link to="/login" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Login</Link>
              <Link to="/register" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Register</Link>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm">{auth.user?.name}</div>
              </div>
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
