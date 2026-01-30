const API_BASE = import.meta.env.VITE_API_BASE || "https://peer-link-1.onrender.com";

// LOGIN -----------------------------
console.log("Calling:", API_BASE + "/auth/login");

export async function postLogin(email, password) {
const res = await fetch(`${API_BASE}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",   // <-- This sends session cookie
  body: JSON.stringify({ email, password })
});

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  return data;
}

// LOGOUT -----------------------------
export async function postLogout() {
  return fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).then(r => r.json());
}

// STATUS -----------------------------
export async function getAuthStatus() {
  const res = await fetch(`${API_BASE}/auth/status`, {
    method: "GET",
    credentials: "include",   // IMPORTANT
  });

  return res.json();
}

// REGISTER -----------------------------
export async function postRegister(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
