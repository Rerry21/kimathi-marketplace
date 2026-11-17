import { API_BASE_URL } from "./api";

export async function fetchListings(sellerId) {
  const url = sellerId
    ? `${API_BASE_URL}/listings?seller_id=${encodeURIComponent(sellerId)}`
    : `${API_BASE_URL}/listings`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json();
}

export async function fetchListingById(id) {
  const res = await fetch(`${API_BASE_URL}/listings/${id}`);
  if (!res.ok) throw new Error("Listing not found");
  return res.json();
}

export async function createListing(data, token) {
  const res = await fetch(`${API_BASE_URL}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to create listing");
  return result;
}

export async function updateListing(id, data, token) {
  const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to update listing");
  return result;
}

export async function deleteListing(id, token) {
  const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to delete listing");
  return result;
}