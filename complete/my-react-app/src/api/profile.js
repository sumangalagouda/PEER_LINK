const API_BASE = import.meta.env.VITE_API_BASE || "https://peer-link-1.onrender.com";

export async function fetchProfile(id) {
  const res = await fetch(`${API_BASE}/profile/view/${id}`, {
    method: "GET",
    credentials: "include",  // IMPORTANT for protected routes
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

  return {
    ID: data.profile.ID,
    NAME: data.profile.NAME,
    EMAIL: data.profile.EMAIL,
    SCHOOL: data.profile.SCHOOL,
    SKILLS: data.profile.SKILLS,
    INTEREST: data.profile.INTEREST
  };
}
