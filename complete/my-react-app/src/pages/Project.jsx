import React, { useEffect, useState } from "react";
import { fetchMyConnections } from "../api/connections";
import { fetchMyGroups } from "../api/groups";
import { createProject, addProjectMember } from "../api/projects";
import { motion } from "framer-motion";

const heroImg = "/project.jpg"; // decorative header image

export default function Project({ auth }) {
  const [mode, setMode] = useState("individual");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  async function loadLists() {
    try {
      setGroups(await fetchMyGroups());
    } catch {}

    try {
      // Only allow connected students to be added to projects
      setUsers(await fetchMyConnections());
    } catch {}
  }

  function toggleMember(id) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!auth?.isAuthenticated) return alert("Please login");
    if (!title.trim()) return alert("Enter project title");

    setCreating(true);

    try {
      const payload = { title: title.trim(), description: desc.trim(), mode };
      if (mode === "group") payload.group_id = selectedGroup?.id;

      const res = await createProject(payload);
      const pid = res.project_id || res.id;

      if (mode === "group") {
        for (const uid of [...selectedMembers]) {
          try {
            await addProjectMember(pid, uid);
          } catch {}
        }
      }

      alert("Project created!");
      setTitle("");
      setDesc("");
      setSelectedMembers(new Set());
    } catch (err) {
      alert(err.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-pink-100 mb-8 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
          <img src={heroImg} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Project</h1>
          <p className="text-sm text-slate-500">Individual or group project</p>
        </div>
      </motion.div>

      {/* FORM CARD */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
        <form onSubmit={handleCreate} className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-pink-100 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-pink-200 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full border border-pink-100 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-pink-200 outline-none"
            ></textarea>
          </div>

          {/* MODE */}
          <div>
            <label className="block text-sm text-slate-700">Mode</label>
            <div className="flex gap-4 mt-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "individual"}
                  onChange={() => setMode("individual")}
                />
                Individual
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "group"}
                  onChange={() => setMode("group")}
                />
                Group
              </label>
            </div>
          </div>

          {/* GROUP SELECTION */}
          {mode === "group" && (
            <div className="space-y-4">
              {/* SELECT GROUP */}
              <div>
                <label className="block text-sm text-slate-700 mb-1">Select Group</label>
                <select
                  value={selectedGroup?.id || ""}
                  onChange={(e) =>
                    setSelectedGroup(groups.find((g) => String(g.id) === e.target.value))
                  }
                  className="w-full border border-pink-100 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-pink-200 outline-none"
                >
                  <option value="">-- choose group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MEMBERS LIST */}
              <div>
                <label className="block text-sm text-slate-700 mb-1">Add Members</label>
                <div className="border border-pink-100 rounded-xl p-2 max-h-48 overflow-auto bg-pink-50/40">
                  {users.length === 0 ? (
                    <div className="text-sm text-slate-500">No users found.</div>
                  ) : (
                    users.map((u) => (
                      <div
                        key={u.ID}
                        className="flex items-center justify-between py-1 px-1"
                      >
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedMembers.has(u.ID)}
                            onChange={() => toggleMember(u.ID)}
                          />
                          {u.NAME}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-xl shadow-sm transition"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
