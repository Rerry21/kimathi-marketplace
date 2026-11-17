import pool from "../config/db.js";

const VALID_STATUS = ["all", "banned", "active"];

export async function getStats(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
         (SELECT COUNT(*) FROM appeals WHERE status = 'pending') AS pending_appeals,
         (SELECT COUNT(*) FROM users WHERE is_banned = true) AS banned_users,
         (SELECT COUNT(*) FROM users WHERE is_admin = false) AS total_users,
         (SELECT COUNT(*) FROM listings l
            LEFT JOIN users u ON u.id = l.seller_id
            WHERE l.status = 'available' AND COALESCE(u.is_banned, false) = false) AS active_listings`
    );

    const row = result.rows[0];

    res.json({
      pending_reports: Number(row.pending_reports),
      pending_appeals: Number(row.pending_appeals),
      banned_users: Number(row.banned_users),
      total_users: Number(row.total_users),
      active_listings: Number(row.active_listings),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
    const status = VALID_STATUS.includes(req.query.status) ? req.query.status : "all";

    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.location, u.is_admin, u.is_banned,
         u.ban_reason, u.ban_permanent, u.banned_at, u.created_at,
         (SELECT COUNT(*) FROM listings l WHERE l.seller_id = u.id) AS listings_count,
         (SELECT COUNT(*) FROM reports r WHERE r.reported_user_id = u.id) AS reports_count
       FROM users u
       WHERE ($1::text = '' OR u.name ILIKE $2 OR u.email ILIKE $2)
         AND (
           $3::text = 'all'
           OR ($3::text = 'banned' AND u.is_banned = true)
           OR ($3::text = 'active' AND u.is_banned = false)
         )
       ORDER BY u.created_at DESC
       LIMIT 200`,
      [search, `%${search}%`, status]
    );

    res.json(
      result.rows.map((row) => ({
        ...row,
        listings_count: Number(row.listings_count),
        reports_count: Number(row.reports_count),
      }))
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}