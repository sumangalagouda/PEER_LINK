const API_BASE = import.meta.env.VITE_API_BASE || "https://peer-link-1.onrender.com";

export async function createProject(payload) {
  const res = await fetch(`${API_BASE}/project/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create project');
  return data;
}

export async function addProjectMember(projectId, userId) {
  const res = await fetch(`${API_BASE}/project/add_member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ project_id: projectId, user_id: userId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add project member');
  return data;
}

export default { createProject, addProjectMember };
