import React, { useEffect, useState } from "react";
import { fetchMyConnections } from "../api/connections";
import { createGroup, addMemberToGroup } from "../api/groups";
import { motion } from "framer-motion";

const heroImg = "/hack.jpg";

export default function Hackathon({ auth }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]); // accepted connections
  const [selected, setSelected] = useState(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const list = await fetchMyConnections();
      setMembers(list || []);
    } catch (e) {
      setMembers([]);
    }
  }

  function toggleUser(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!auth?.isAuthenticated) return alert("Please login");
    const name = teamName.trim();
    if (!name) return alert("Enter team name");

    setCreating(true);
    try {
      // Represent a Hackathon team as a group on backend
      const res = await createGroup(name);
      const gid = res.group_id;
      for (const uid of Array.from(selected)) {
        try {
          await addMemberToGroup(gid, uid);
        } catch (err) {
          // ignore individual failures
        }
      }
      setTeamName("");
      setSelected(new Set());
      alert("Hackathon team created!");
    } catch (err) {
      alert(err.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FFF8E8] via-[#FFF1FA] to-[#E8F8FF] p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-10 border border-[#FFDDEE]"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
            <img src={heroImg} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Create Hackathon Team</h1>
            <p className="text-sm text-slate-600">Pick a name and add your connections.</p>
          </div>
        </div>
      </motion.div>

      {/* CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-xl border border-[#FFE4F2]">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Team Name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1 w-full border border-[#FFDDEE] rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-[#FF8FB1] outline-none"
              placeholder="Ex: Hack Wizards"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Add Members (Connections)</label>
            <div className="max-h-56 overflow-auto p-3 rounded-xl border border-[#FFE8CC] bg-[#FFF3E4] shadow-inner">
              {members.length === 0 ? (
                <div className="text-sm text-slate-500">No connections yet.</div>
              ) : (
                members.map((u) => (
                  <div key={u.ID} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/80">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(u.ID)}
                        onChange={() => toggleUser(u.ID)}
                        className="h-4 w-4 accent-[#FF9EC7]"
                      />
                      <span className="text-sm text-slate-700">
                        {u.NAME}
                        <span className="text-xs text-slate-500"> {u.SKILLS ? `(${u.SKILLS})` : ""}</span>
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2 bg-linear-to-r from-[#FF7EB3] to-[#FFB067] text-white font-semibold rounded-xl shadow-md hover:scale-[1.03] transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
