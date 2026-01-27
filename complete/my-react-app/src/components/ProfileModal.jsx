// ProfileModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

/*
  Modal matches the vibrant style:
  - large gradient header
  - animated skill tags inside
  - connect button with bounce/ripple
*/

function parseSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills.split(",").map(s => s.trim()).filter(Boolean);
}

export default function ProfileModal({ profile, onClose, onConnect, connecting, open }) {
  if (!profile) return null;

  const skills = parseSkills(profile.SKILLS || profile.skills);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.32 }}
          >
            <div className="relative">
              <div
                style={{
                  background: "linear-gradient(120deg, #ff6a88, #ff9472 45%, #7f5af0)",
                }}
                className="p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{profile.NAME}</div>
                    <div className="text-sm text-white/90 mt-1">{profile.SCHOOL || profile.school}</div>
                  </div>

                  <button onClick={onClose} className="text-white/90 p-2 rounded-md hover:bg-white/10">
                    <FiX size={22} />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-3"><strong>Email:</strong> <span className="text-slate-700">{profile.EMAIL || profile.email}</span></div>
                    <div className="mb-3"><strong>Interests:</strong> <span className="text-slate-700">{profile.INTEREST || profile.interest || "—"}</span></div>
                    <div className="mb-3"><strong>Bio:</strong> <div className="text-slate-600 mt-1">{profile.BIO || profile.bio || "No bio provided."}</div></div>
                  </div>

                  <div>
                    <div className="mb-2 font-semibold">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {skills.length === 0 ? (
                        <div className="text-slate-400">No skills</div>
                      ) : skills.map((s, i) => (
                        <motion.div
                          key={s + i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.06 }}
                          whileHover={{ scale: 1.06 }}
                          className="px-3 py-2 rounded-full font-semibold text-white text-sm"
                          style={{
                            background: `linear-gradient(90deg, hsl(${(i*60)%360} 85% 60%), hsl(${(i*60+40)%360} 80% 55%))`,
                            boxShadow: "0 8px 20px rgba(31,41,55,0.08)"
                          }}
                        >
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    onClick={() => onConnect(profile.ID || profile.id)}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow"
                    disabled={connecting}
                  >
                    {connecting ? "Sending..." : "Send Connection"}
                  </motion.button>

                  <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
