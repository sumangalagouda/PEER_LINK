import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLogin } from "../api/auth";
import { motion } from "framer-motion";

// Use the public folder path for static assets served by Vite
const heroImg = "/logo.jpg"; // decorative header image (place logo.jpg in `public/`)

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await postLogin(form.email, form.password);

      const user =
        data.user ||
        {
          id: data.userId || data.ID,
          name: data.user?.NAME || data.user?.name || form.email,
        };

      localStorage.setItem("peerlink_user", JSON.stringify(user));
      onLogin(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF7E9] via-[#FFEFFD] to-[#E8F8FF] p-6">

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-pink-100 shadow-xl"
      >
        {/* HEADER IMAGE + TITLE */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md mb-3">
            <img src={heroImg} alt="PeerLink logo" loading="lazy" className="w-full h-full object-cover" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Login to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* EMAIL */}
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
          />

          {/* PASSWORD */}
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            className="w-full p-3 border border-pink-100 rounded-xl bg-white focus:ring-2 focus:ring-pink-200 outline-none text-slate-700"
          />

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          {/* BUTTONS */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white font-medium rounded-xl shadow-sm transition"
            >
              {loading ? "..." : "Login"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm text-pink-600 hover:underline"
            >
              Create Account
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
