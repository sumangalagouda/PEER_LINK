// StudentCard.jsx (Simple Pastel Version)
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
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100"
    >
      <div className="flex items-start gap-4">
        {/* Avatar Box */}
        <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center text-lg font-semibold text-slate-800">
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="font-semibold text-slate-800">{student.NAME}</div>
          <div className="text-xs text-slate-500">{student.SCHOOL || "—"}</div>

          {common.length > 0 && (
            <div className="mt-2 text-xs text-green-700">
              Match: {common.join(", ")}
            </div>
          )}

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400">No skills</span>
            ) : (
              skills.map((sk, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 rounded-full text-xs"
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
              className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-sm"
            >
              View
            </button>

            <button
              onClick={() => onConnect(student.ID)}
              disabled={connecting || student.requested}
              className={`px-3 py-1 rounded-md text-sm text-white shadow-sm ${
                student.requested
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-pink-400 hover:bg-pink-500"
              }`}
            >
              {connecting ? "Sending..." : student.requested ? "Requested" : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
