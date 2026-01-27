import React, { useEffect, useState } from "react";
import { fetchProfile } from "../api/profile";
import { useNavigate } from "react-router-dom";

export default function Profile({ auth }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [auth]);

  async function loadProfile() {
    try {
      let userId = auth?.user?.id;

      if (!userId) {
        const saved = JSON.parse(localStorage.getItem("peer_user"));
        if (saved?.id) userId = saved.id;
      }

      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!profile)
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load profile.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E9] via-[#FFEFFD] to-[#E9FAFF] p-6 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LEFT PANEL */}
        <div className="flex flex-col items-center md:items-start bg-white/90 backdrop-blur-xl border border-[#FFDCEC] p-6 rounded-3xl shadow-lg">
          
          {/* Avatar */}
          <img
            src={`https://ui-avatars.com/api/?name=${profile.NAME}&size=256&background=ffb4c6&color=fff`}
            alt={profile.NAME}
            className="w-36 h-36 rounded-full shadow-xl mb-4 border-4 border-white"
          />

          <h2 className="text-slate-900 text-2xl font-bold">{profile.NAME}</h2>
          <p className="text-slate-600 text-sm">{profile.INTEREST || "Student"}</p>

          {/* Info Fields */}
          <div className="mt-6 space-y-4 text-sm w-full">

            <div className="flex items-center justify-between text-slate-800">
              <span className="font-medium">Education</span>
              <span className="bg-[#FFF4F9] border border-[#FFD2E7] rounded-full px-3 py-1 text-slate-700">
                {profile.SCHOOL || "—"}
              </span>
            </div>

            <button className="bg-gradient-to-r from-[#FFB0D9] to-[#FFD18B] text-white px-4 py-1 rounded-full shadow hover:scale-[1.04] transition w-full text-center">
              Edit Profile
            </button>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Bio */}
          <div className="bg-gradient-to-br from-[#FFE9F7] to-[#E7F2FF] p-6 rounded-3xl shadow-md border border-[#FFDCEC]">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Bio</h3>
            <p className="text-slate-600 text-sm">
              {profile.BIO || "No bio available."}
            </p>
          </div>

          {/* Goals */}
          <div className="bg-gradient-to-br from-[#FFF2D1] to-[#FFE3F2] p-6 rounded-3xl shadow-md border border-[#FFE7C6]">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Goals</h3>
            <p className="text-slate-600 text-sm">
              {profile.GOALS || "No goals added."}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-gradient-to-br from-[#EAF5FF] to-[#FFF0F7] p-6 rounded-3xl shadow-md border border-[#DCEFFF]">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.SKILLS || "No skills")
                .split(",")
                .map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white border border-[#D8E7FF] text-[#5474C2] rounded-full text-xs font-medium shadow-sm"
                  >
                    {s.trim()}
                  </span>
                ))}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-gradient-to-br from-[#FFF6DE] to-[#FFE7F8] p-6 rounded-3xl shadow-md border border-[#FFE3C9]">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Interests</h3>
            <p className="text-slate-600 text-sm">
              {profile.INTEREST || "No interests added."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
