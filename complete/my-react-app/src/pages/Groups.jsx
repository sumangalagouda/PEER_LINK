import React, { useEffect, useState } from "react";
import { fetchMyConnections } from "../api/connections";
import { createGroup, addMemberToGroup, fetchMyGroups } from "../api/groups";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiUserPlus, FiCheckCircle } from "react-icons/fi";

export default function Groups({ auth }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    loadUsers();
    loadMyGroups();
  }, []);

  async function loadUsers() {
    try {
      // Only show accepted connections as selectable members
      const list = await fetchMyConnections();
      setUsers(list || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }

  async function loadMyGroups() {
    try {
      const g = await fetchMyGroups();
      setMyGroups(g || []);
    } catch (err) {
      console.error("Failed to load groups", err);
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
    if (!groupName.trim()) return alert("Enter group name");

    setCreating(true);
    try {
      const res = await createGroup(groupName.trim());
      const gid = res.group_id;

      for (const uid of Array.from(selected)) {
        await addMemberToGroup(gid, uid).catch((err) =>
          console.warn("Add failed", uid, err)
        );
      }

      setGroupName("");
      setSelected(new Set());
      await loadMyGroups();

      alert("Group created!");
    } catch (err) {
      alert(err.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-b from-[#FFF8E8] via-[#FFF1FA] to-[#E8F8FF]">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-10 border border-[#FFDDEE]"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-linear-to-br from-[#FF91A4] to-[#FFB56B] text-white shadow-md">
            <FiUsers size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Groups</h1>
            <p className="text-sm text-slate-600">
              Create colorful groups and add your network!
            </p>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* CREATE GROUP */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-xl rounded-3xl p-6 border border-[#FFE4F2]"
        >
          <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <FiUserPlus className="text-[#FB73B3]" /> Create a Group
          </h3>

          <form onSubmit={handleCreate} className="space-y-5">
            {/* GROUP NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Group Name
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1 w-full border border-[#FFDDEE] rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-[#FF8FB1] outline-none"
                placeholder="Ex: Coding Squad"
              />
            </div>

            {/* SELECT MEMBERS */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Add Members
              </label>

              <div className="max-h-52 overflow-auto p-3 rounded-xl border border-[#FFE8CC] bg-[#FFF3E4] shadow-inner">
                {users.map((u) => (
                  <motion.div
                    key={u.ID}
                    layout
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/80 transition"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(u.ID)}
                        onChange={() => toggleUser(u.ID)}
                        className="h-4 w-4 accent-[#FF9EC7]"
                      />
                      <span className="text-sm text-slate-700">
                        {u.NAME}
                        <span className="text-xs text-slate-500">
                          {" "}
                          ({u.SKILLS})
                        </span>
                      </span>
                    </label>
                  </motion.div>
                ))}

                {users.length === 0 && (
                  <div className="text-sm text-slate-500">No users found.</div>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2 bg-linear-to-r from-[#FF7EB3] to-[#FFB067] text-white font-semibold rounded-xl shadow-md hover:scale-[1.03] transition disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </form>
        </motion.div>

        {/* MY GROUPS */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-xl rounded-3xl p-6 border border-[#FFE4F2]"
        >
          <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <FiCheckCircle className="text-[#74D680]" /> My Groups
          </h3>

          <AnimatePresence>
            {myGroups.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-500"
              >
                You have no groups yet.
              </motion.div>
            )}

            <div className="space-y-3">
              {myGroups.map((g) => (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="p-4 rounded-xl bg-linear-to-r from-[#FFE4F0] to-[#FFF6D1] border shadow-sm hover:shadow-md transition"
                >
                  <div className="font-semibold text-slate-800">
                    {g.group_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Created at: {g.created_at}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
