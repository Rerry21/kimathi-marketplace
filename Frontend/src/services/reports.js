import { API_BASE_URL } from "./api";

export async function createReport({ listing_id, reported_user_id, reason }, token) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listing_id, reported_user_id, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit report");
  return data;
}

export async function fetchAllReports(token) {
  const res = await fetch(`${API_BASE_URL}/reports/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
}

export async function updateReportStatus(id, status, token) {
  const res = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update report");
  return data;
}