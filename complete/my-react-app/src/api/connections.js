const API_BASE = import.meta.env.VITE_API_BASE || "https://peer-link-1.onrender.com";

export async function fetchSuggested() {
  const res = await fetch(`${API_BASE}/connect/suggested`, {
    method: "GET",
    credentials: "include",    // <-- MUST HAVE
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to fetch suggestions");

  const list = data.suggested || [];

  return list.map(u => ({
    ID: u.id,
    NAME: u.name,
    EMAIL: u.email,
    SCHOOL: u.school,
    SKILLS: u.skills,
    INTEREST: u.interest,
    COMMON: u.common_skills,
    connected: false
  }));
}

export async function fetchAll() {
  const res = await fetch(`${API_BASE}/connect/all`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
  const list = data.students || [];
  return list.map(u => ({
    ID: u.id,
    NAME: u.name,
    EMAIL: u.email,
    SCHOOL: u.school,
    SKILLS: u.skills,
    INTEREST: u.interest,
    COMMON: u.common_skills ?? [],
    connected: !!u.connected
  }));
}

export async function postConnect(receiverId) {
  const res = await fetch(`${API_BASE}/connect/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",  // <-- MUST HAVE
    body: JSON.stringify({ connect_to: receiverId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  return data;
}

export async function fetchMyConnections() {
  const res = await fetch(`${API_BASE}/connect/my-connections`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch my connections');
  const list = data.connections || [];
  return list.map(u => ({
    ID: u.ID ?? u.id,
    NAME: u.NAME ?? u.name,
    EMAIL: u.EMAIL ?? u.email,
    SCHOOL: u.SCHOOL ?? u.school,
    SKILLS: u.SKILLS ?? u.skills,
    INTEREST: u.INTEREST ?? u.interest
  }));
}

export async function fetchRequests() {
  const res = await fetch(`${API_BASE}/connect/requests`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch requests');
  const list = data.requests || [];
  return list.map(r => ({
    requester_id: r.requester_id,
    ID: r.id,
    NAME: r.name,
    EMAIL: r.email,
    SCHOOL: r.school,
    SKILLS: r.skills,
    INTEREST: r.interest
  }));
}

export async function acceptRequest(requesterId) {
  const res = await fetch(`${API_BASE}/connect/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ requester_id: requesterId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to accept request');
  return data;
}
