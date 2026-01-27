import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">

      {/* Floating circles background */}
      <div className="absolute inset-0">
        <div className="absolute w-100 h-100 bg-white/10 rounded-full blur-2xl  left-0 animate-pulse"></div>
        <div className="absolute w-100 h-100 bg-white/10 rounded-full blur-2xl bottom-20 right-0 animate-ping"></div>
      </div>

      {/* Main content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-20 text-white">

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            PeerLink  
            <span className="block text-indigo-200">Connect • Collaborate • Grow</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mt-4 text-indigo-100">
            A smart student networking platform that matches you with peers who share your skills,
            helping you collaborate on projects, form study groups, and join hackathons.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
               Get Started
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-900/40 backdrop-blur-md border border-indigo-200 text-white font-semibold rounded-xl hover:bg-indigo-800/50 transition"
            >
              Login
            </Link>
          </div>
        </motion.div>

        {/* WHY PEERLINK SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-md">
            Why Choose PeerLink?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30"
            >
              <h3 className="text-xl font-semibold">🎯 Skill-Based Matching</h3>
              <p className="text-indigo-50 mt-2">
                Find peers who match your technical skills and interests — instantly.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30"
            >
              <h3 className="text-xl font-semibold">🤝 Build Connections</h3>
              <p className="text-indigo-50 mt-2">
                Connect with students across colleges and exchange knowledge.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30"
            >
              <h3 className="text-xl font-semibold">👥 Create Groups</h3>
              <p className="text-indigo-50 mt-2">
                Form teams for mini-projects, hackathons, or study circles.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
