import pool from "../config/db.js";

const VALID_STATUSES = ["available", "reserved", "sold"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanUrls(image_urls) {
  if (!Array.isArray(image_urls)) return null;
  return image_urls
    .filter((url) => typeof url === "string" && url.length > 0)
    .slice(0, 6);
}

async function saveListingImages(listingId, urls) {
  await pool.query("DELETE FROM listing_images WHERE listing_id = $1", [listingId]);

  if (urls.length === 0) return;

  const placeholders = urls.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(",");
  const values = [listingId];
  urls.forEach((url, i) => {
    values.push(url, i);
  });

  await pool.query(
    `INSERT INTO listing_images (listing_id, image_url, position) VALUES ${placeholders}`,
    values
  );
}

export async function getListings(req, res) {
  try {
    const { seller_id } = req.query;

    if (seller_id !== undefined && (typeof seller_id !== "string" || !UUID_PATTERN.test(seller_id))) {
      return res.status(400).json({ success: false, error: "Invalid seller" });
    }

    const result = seller_id
      ? await pool.query(
          `SELECT l.* FROM listings l
           LEFT JOIN users u ON u.id = l.seller_id
           WHERE l.seller_id = $1 AND COALESCE(u.is_banned, false) = false
           ORDER BY l.created_at DESC`,
          [seller_id]
        )
      : await pool.query(
          `SELECT l.* FROM listings l
           LEFT JOIN users u ON u.id = l.seller_id
           WHERE l.status <> 'sold' AND COALESCE(u.is_banned, false) = false
           ORDER BY l.created_at DESC`
        );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getListingById(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const listingResult = await pool.query(
      `SELECT l.* FROM listings l
       LEFT JOIN users u ON u.id = l.seller_id
       WHERE l.id = $1 AND COALESCE(u.is_banned, false) = false`,
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const imagesResult = await pool.query(
      "SELECT image_url FROM listing_images WHERE listing_id = $1 ORDER BY position ASC",
      [id]
    );

    const listing = listingResult.rows[0];
    listing.images = imagesResult.rows.map((row) => row.image_url);

    res.json(listing);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createListing(req, res) {
  try {
    const seller_id = req.user.id;
    const { title, description, price, category, condition, location, image_urls } = req.body;

    const urls = cleanUrls(image_urls) || [];
    const cover = urls[0] || null;

    const result = await pool.query(
      `INSERT INTO listings (seller_id, title, description, price, category, condition, location, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [seller_id, title, description, price, category, condition, location, cover]
    );

    const listing = result.rows[0];

    if (urls.length > 0) {
      await saveListingImages(listing.id, urls);
    }

    listing.images = urls;
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition, location, status, image_urls } =
      req.body;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const existing = await pool.query("SELECT seller_id FROM listings WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (existing.rows[0].seller_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: "You can only edit your own listings" });
    }

    const result = await pool.query(
      `UPDATE listings
       SET title = $1, description = $2, price = $3, category = $4,
           condition = $5, location = $6, status = COALESCE($7, status)
       WHERE id = $8
       RETURNING *`,
      [title, description, price, category, condition, location, status ?? null, id]
    );

    const listing = result.rows[0];
    const urls = cleanUrls(image_urls);

    if (urls !== null) {
      const cover = urls[0] || null;
      await pool.query("UPDATE listings SET image_url = $1 WHERE id = $2", [cover, id]);
      await saveListingImages(id, urls);
      listing.image_url = cover;
      listing.images = urls;
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteListing(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const existing = await pool.query("SELECT seller_id FROM listings WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (existing.rows[0].seller_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: "You can only delete your own listings" });
    }

    const result = await pool.query("DELETE FROM listings WHERE id = $1 RETURNING *", [id]);

    res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}