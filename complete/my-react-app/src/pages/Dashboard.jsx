import React, { useEffect, useState } from "react";
import StudentCard from "../components/StudentCard";
import ProfileModal from "../components/ProfileModal";
import { fetchAll, fetchSuggested, postConnect } from "../api/connections";
import { fetchProfile } from "../api/profile";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const heroImg = "/dis_logo.jpg";

export default function Dashboard({ auth }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [connectLoading, setConnectLoading] = useState({});
  const [filterMode, setFilterMode] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate("/login");
      return;
    }
    load();
  }, [auth, filterMode]);

  async function load() {
    setLoading(true);
    try {
      const list = filterMode === "match" ? await fetchSuggested() : await fetchAll();
      setStudents(list || []);
    } finally {
      setLoading(false);
    }
  }

  async function viewProfile(id) {
    const p = await fetchProfile(id);
    setSelectedProfile(p);
  }

  async function connect(id) {
    // Start loading state for specific ID
    setConnectLoading((prev) => ({ ...prev, [id]: true }));
    
    try {
      await postConnect(id);
      // On success, mark as requested
      setStudents((prev) =>
        prev.map((s) => (s.ID === id ? { ...s, requested: true } : s))
      );
    } catch (err) {
      console.error("Connection failed", err);
    } finally {
      setConnectLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 font-sans">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
            <img src={heroImg} className="w-full h-full object-cover" alt="Logo" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Discovery</h1>
            <p className="text-sm text-slate-500">Connect with your academic community</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="all">All Students</option>
            <option value="match">Similar Skills</option>
          </select>
          <button
            onClick={load}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {/* STATS STRIP */}
      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={students.length} />
        <StatCard label="Pending Requests" value={students.filter(s => s.requested).length} highlight />
        <StatCard label="Active Filter" value={filterMode} capitalize />
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))
          : students.map((s) => (
              <StudentCard
                key={s.ID}
                student={s}
                onView={viewProfile}
                onConnect={connect}
                connecting={!!connectLoading[s.ID]}
              />
            ))}
      </div>

      <ProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onConnect={connect}
      />
    </div>
  );
}

function StatCard({ label, value, highlight, capitalize }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</p>
      <h3 className={`text-2xl font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </h3>
    </div>
  );
}