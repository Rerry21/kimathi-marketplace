import { API_BASE_URL } from "./api";

async function readJson(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || fallbackMessage);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readJson(res, "Failed to load the dashboard");
}

export async function fetchAdminUsers({ search, status }, token) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readJson(res, "Failed to load users");
}