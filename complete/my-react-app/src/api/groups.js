const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function createGroup(groupName) {
  const res = await fetch(`${API_BASE}/group/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ group_name: groupName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create group');
  return data; // { message, group_id }
}

export async function addMemberToGroup(groupId, userId) {
  const res = await fetch(`${API_BASE}/group/add_member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ group_id: groupId, user_id: userId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add member');
  return data;
}

export async function fetchMyGroups() {
  const res = await fetch(`${API_BASE}/group/my_groups`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch groups');
  return data.groups || [];
}

export async function fetchGroupMessages(groupId) {
  const res = await fetch(`${API_BASE}/group/messages/${groupId}`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
  return data.messages || [];
}

export async function sendGroupMessage(groupId, message) {
  const res = await fetch(`${API_BASE}/group/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ group_id: groupId, message })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to send message');
  return data;
}

export default { createGroup, addMemberToGroup, fetchMyGroups };
