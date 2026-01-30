// StudentCard.jsx (Standard Display Style – Lilac Connect Button)
import React from "react";
import { motion } from "framer-motion";

export default function StudentCard({ student, onView, onConnect, connecting }) {
  const initials = (student?.NAME || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const skills = (student?.SKILLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const common = Array.isArray(student?.COMMON) ? student.COMMON : [];

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center
                     text-sm font-semibold text-slate-700 border border-slate-300"
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {student.NAME}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {student.SCHOOL || "—"}
          </div>

          {/* Common Skills */}
          {common.length > 0 && (
            <div className="mt-2 text-xs text-emerald-600">
              Matches: {common.join(", ")}
            </div>
          )}

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400">No skills listed</span>
            ) : (
              skills.map((sk, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 text-xs rounded-md
                             bg-slate-100 border border-slate-200 text-slate-700"
                >
                  {sk}
                </span>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onView(student.ID)}
              className="px-3 py-1.5 rounded-md text-sm
                         border border-slate-300 bg-white
                         text-slate-700 hover:bg-slate-100 transition"
            >
              View
            </button>

            <button
              onClick={() => onConnect(student.ID)}
              disabled={connecting || student.requested}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                student.requested
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : "bg-violet-400 text-white hover:bg-violet-500"
              }`}
            >
              {connecting
                ? "Sending..."
                : student.requested
                ? "Requested"
                : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
