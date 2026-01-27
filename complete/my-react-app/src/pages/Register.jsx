import React, { useState } from "react";
import { postRegister } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const heroImg = "/logo.jpg"; // decorative header image

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    school: "",
    skills: "",
    interest: "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await postRegister(form);
      setMsg({ type: "success", text: "Registration successful. Redirecting..." });
      setTimeout(() => nav("/login"), 900);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF7E9] via-[#FFEFFD] to-[#E8F8FF] p-6">

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-pink-100 shadow-xl"
      >

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md mb-3">
            <img src={heroImg} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Join the community</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            required
            placeholder="Full Name"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <input
            required
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          <input
            placeholder="School"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          />

          <input
            placeholder="Skills (comma separated)"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
          />

          <input
            placeholder="Interests"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.interest}
            onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
          />

          <input
            required
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />

          {msg && (
            <div
              className={`text-sm ${
                msg.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-medium rounded-xl shadow-sm transition"
            >
              {loading ? "..." : "Register"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
