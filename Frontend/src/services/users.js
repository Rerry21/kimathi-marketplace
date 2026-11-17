import { API_BASE_URL } from "./api";

export async function updateProfile({ name, location, profile_image_url }, token) {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, location, profile_image_url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

export async function fetchUserById(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function banUser(id, { reason, permanent }, token) {
  const res = await fetch(`${API_BASE_URL}/users/${id}/ban`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason, permanent }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to ban user");
  return data;
}

export async function unbanUser(id, token) {
  const res = await fetch(`${API_BASE_URL}/users/${id}/unban`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to unban user");
  return data;
}