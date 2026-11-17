import pool from "../config/db.js";

const MAX_REASON_LENGTH = 600;

export async function createReport(req, res) {
  try {
    const reported_by = req.user.id;
    const { listing_id, reported_user_id } = req.body;
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

    if (!reason || (!listing_id && !reported_user_id)) {
      return res.status(400).json({
        success: false,
        error: "A reason and either a listing or a user to report is required",
      });
    }

    if (reason.length > MAX_REASON_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `The report must be ${MAX_REASON_LENGTH} characters or fewer`,
      });
    }

    const result = await pool.query(
      `INSERT INTO reports (reported_by, listing_id, reported_user_id, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [reported_by, listing_id || null, reported_user_id || null, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMyReports(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM reports WHERE reported_by = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllReports(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         r.id, r.reason, r.status, r.created_at,
         r.listing_id, r.reported_user_id,
         reporter.name AS reported_by_name,
         reporter.email AS reported_by_email,
         l.title AS listing_title,
         l.description AS listing_description,
         l.price AS listing_price,
         l.status AS listing_status,
         l.image_url AS listing_image,
         reported_user.name AS reported_user_name,
         reported_user.email AS reported_user_email,
         reported_user.is_banned AS reported_user_banned
       FROM reports r
       JOIN users reporter ON reporter.id = r.reported_by
       LEFT JOIN listings l ON l.id = r.listing_id
       LEFT JOIN users reported_user ON reported_user.id = r.reported_user_id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE reports SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}