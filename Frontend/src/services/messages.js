import { API_BASE_URL } from "./api";

export async function sendMessage({ listing_id, receiver_id, body }, token) {
  const res = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ listing_id, receiver_id, body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
}

export async function fetchConversations(token) {
  const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function fetchThread(listingId, otherUserId, token) {
  const res = await fetch(
    `${API_BASE_URL}/messages/thread/${listingId}/${otherUserId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

export async function fetchUnreadCount(token) {
  const res = await fetch(`${API_BASE_URL}/messages/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { count: 0 };
  return res.json();
}