import React, { useEffect, useState } from "react";
import { fetchMyConnections, fetchRequests, acceptRequest } from "../api/connections";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiMessageCircle, FiUserPlus } from "react-icons/fi";

// Uploaded hero image for decoration
const pageBg = "/conned.jpg";

export default function MyConnections({ auth }) {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      nav("/login");
      return;
    }
    load();
    loadRequests();
  }, [auth]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMyConnections();
      setConnections(data || []);
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRequests() {
    try {
      const data = await fetchRequests();
      setRequests(data || []);
    } catch {
      setRequests([]);
    }
  }

  async function handleAccept(r) {
    try {
      setAccepting(r.requester_id);
      await acceptRequest(r.requester_id);

      setRequests((prev) => prev.filter((x) => x.requester_id !== r.requester_id));

      setConnections((prev) => [
        {
          ID: r.requester_id,
          NAME: r.NAME,
          SKILLS: r.SKILLS,
          EMAIL: r.EMAIL,
          SCHOOL: r.SCHOOL,
          INTEREST: r.INTEREST,
        },
        ...prev,
      ]);
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E9] via-[#FFEFFD] to-[#E7F8FF] p-6">
      
      {/* HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-10 border border-[#FFE4F2]"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl border border-white/70">
              <img src={pageBg} className="w-full h-full object-cover" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">My Connections</h1>
              <p className="text-sm text-slate-500 mt-1">Connect, collaborate, and grow together.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadRequests()}
              className="px-4 py-2 rounded-xl bg-white text-slate-700 font-medium border shadow-sm hover:scale-[1.03] transition"
            >
              Refresh
            </button>

            <button
              onClick={() => nav("/discover")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9DC7] to-[#FFBC6A] text-white font-semibold shadow-md hover:scale-[1.05] transition"
            >
              Find People
            </button>
          </div>

        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Incoming Requests */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          
          <div className="bg-white rounded-3xl p-4 shadow-md border border-[#FFE7EF]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">Incoming Requests</h3>
              <div className="text-sm text-slate-500">{requests.length} pending</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {requests.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500">
                    No new requests
                  </motion.div>
                )}

                {requests.map((r, i) => (
                  <motion.div
                    key={r.requester_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between bg-gradient-to-r from-[#FFF1F8] to-[#FFF9DE] border p-3 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white font-medium text-slate-700 shadow-sm flex items-center justify-center">
                        {(r.NAME || "U").split(" ").map((n) => n[0]).join("")}
                      </div>

                      <div>
                        <div className="font-medium text-slate-800">{r.NAME}</div>
                        <div className="text-xs text-slate-500">{r.SKILLS || "—"}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(r)}
                        disabled={accepting === r.requester_id}
                        className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#7CD2A5] to-[#A6F5CE] text-white rounded-md shadow hover:scale-[1.03] transition"
                      >
                        {accepting === r.requester_id ? "..." : <><FiCheck /> Accept</>}
                      </button>

                      <button className="px-3 py-1 bg-white border rounded-md text-slate-600 shadow-sm">
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-md border text-sm text-slate-500">
            Tip: Accept requests to start messaging and collaborating with people!
          </div>
        </motion.div>

        {/* RIGHT: Connections List */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="bg-white rounded-3xl p-4 shadow-md border border-[#FFE7EF]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">Your Connections</h3>
              <div className="text-sm text-slate-500">{connections.length}</div>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between bg-[#FFF0F8] p-3 rounded-xl">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-white"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-white rounded"></div>
                        <div className="w-20 h-4 bg-white/70 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {connections.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500">
                    No connections yet.
                  </motion.div>
                )}

                {connections.map((c, i) => (
                  <motion.div
                    key={c.ID || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F4EDFF] text-slate-700 font-semibold flex items-center justify-center shadow">
                        {(c.NAME || "U").split(" ").map((n) => n[0]).join("")}
                      </div>

                      <div>
                        <div className="text-slate-800 font-medium">{c.NAME}</div>
                        <div className="text-xs text-slate-500">{c.SKILLS || "—"}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1 bg-white border rounded-md shadow text-slate-700">
                        <FiMessageCircle /> Message
                      </button>

                      <button className="px-3 py-1 text-[#826CF5] border border-[#DFD9FF] bg-white rounded-md shadow">
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
