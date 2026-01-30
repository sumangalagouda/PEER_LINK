import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            PeerLink
          </h1>

          <p className="mt-4 text-lg md:text-xl text-slate-600">
            Connect with students who share your skills.
            Collaborate on projects, form teams, and grow together.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Login
            </Link>
          </div>
        </motion.div>

        {/* RIGHT IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <img
            src="/std3.jpg"
            alt="Students collaborating"
            className="rounded-xl shadow-md object-cover h-48 w-full"
          />
          <img
            src="/std2.jpg"
            alt="Student studying"
            className="rounded-xl shadow-md object-cover h-48 w-full mt-8"
          />
          <img
            src="/std4.jpg"
            alt="Team discussion"
            className="rounded-xl shadow-md object-cover h-48 w-full col-span-2"
          />
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-semibold text-center text-slate-900">
            Why PeerLink?
          </h2>

          <p className="text-center text-slate-600 mt-3 max-w-xl mx-auto">
            Designed to help students find the right people —
            not random connections.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                Skill-Based Matching
              </h3>
              <p className="text-slate-600 mt-2">
                Discover peers with similar technical skills and interests.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                Meaningful Connections
              </h3>
              <p className="text-slate-600 mt-2">
                Connect with students across colleges for collaboration.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                Team Formation
              </h3>
              <p className="text-slate-600 mt-2">
                Build teams for hackathons, projects, and study groups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
