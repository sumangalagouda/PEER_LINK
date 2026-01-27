// Dashboard.jsx (Simple Pastel Theme)
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
  const [filterMode, setFilterMode] = useState("all"); // all | match
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
    setConnectLoading((prev) => ({ ...prev, [id]: true }));
    setStudents((prev) =>
      prev.map((s) => (s.ID === id ? { ...s, requested: true } : s))
    );
    try {
      await postConnect(id);
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.ID === id ? { ...s, requested: false } : s))
      );
    } finally {
      setConnectLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-pink-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <img src={heroImg} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Discover Students</h1>
            <p className="text-xs text-slate-500">Browse all or filter by similar skills</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm text-sm"
          >
            <option value="all">All Students</option>
            <option value="match">Similar Skills</option>
          </select>
          <button
            onClick={load}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 text-sm"
          >
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Student Grid */}
      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl shadow-sm animate-pulse" />
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

      {/* Modal */}
      <ProfileModal
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onConnect={connect}
      />
    </div>
  );
}
