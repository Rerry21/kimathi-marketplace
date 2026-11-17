import pool from "../config/db.js";

export async function sendMessage(req, res) {
  try {
    const sender_id = req.user.id;
    const { listing_id, receiver_id, body } = req.body;

    if (!listing_id || !receiver_id || !body) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO messages (listing_id, sender_id, receiver_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listing_id, sender_id, receiver_id, body]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT DISTINCT ON (listing_id, other_user_id)
         m.listing_id,
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
         u.name AS other_user_name,
         l.title AS listing_title,
         m.body AS last_message,
         m.sender_id AS last_sender_id,
         m.created_at,
         (
           SELECT COUNT(*) FROM messages
           WHERE listing_id = m.listing_id
             AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
             AND receiver_id = $1
             AND read = false
         ) AS unread_count
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
       JOIN listings l ON l.id = m.listing_id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY listing_id, other_user_id, m.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getThread(req, res) {
  try {
    const userId = req.user.id;
    const { listingId, otherUserId } = req.params;

    const result = await pool.query(
      `SELECT * FROM messages
       WHERE listing_id = $1
         AND (
           (sender_id = $2 AND receiver_id = $3)
           OR (sender_id = $3 AND receiver_id = $2)
         )
       ORDER BY created_at ASC`,
      [listingId, userId, otherUserId]
    );

    await pool.query(
      `UPDATE messages
       SET read = true
       WHERE listing_id = $1 AND sender_id = $2 AND receiver_id = $3 AND read = false`,
      [listingId, otherUserId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND read = false",
      [userId]
    );

    res.json({ count: Number(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}