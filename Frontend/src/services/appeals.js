import { API_BASE_URL } from "./api";

export async function fetchAppealStatus(token) {
  const res = await fetch(`${API_BASE_URL}/appeals/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load your suspension status");
  return data;
}

export async function submitAppeal(message, token) {
  const res = await fetch(`${API_BASE_URL}/appeals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit your appeal");
  return data;
}

export async function fetchAllAppeals(token) {
  const res = await fetch(`${API_BASE_URL}/appeals/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load appeals");
  return data;
}

export async function decideAppeal(id, decision, reply, token) {
  const res = await fetch(`${API_BASE_URL}/appeals/${id}/decision`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision, reply }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to record the decision");
  return data;
}