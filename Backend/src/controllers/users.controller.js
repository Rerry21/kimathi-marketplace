import pool from "../config/db.js";
import { sendEmail, escapeHtml } from "../config/email.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, location, profile_image_url } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           location = COALESCE($2, location),
           profile_image_url = COALESCE($3, profile_image_url)
       WHERE id = $4
       RETURNING id, name, email, location, profile_image_url, is_admin, created_at`,
      [name, location, profile_image_url, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const result = await pool.query(
      "SELECT id, name, location, profile_image_url, is_banned, created_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function banUser(req, res) {
  try {
    const { id } = req.params;
    const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    const permanent = req.body.permanent === true;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!reason) {
      return res.status(400).json({ success: false, error: "A ban reason is required" });
    }

    if (reason.length > 300) {
      return res
        .status(400)
        .json({ success: false, error: "The ban reason must be 300 characters or fewer" });
    }

    const target = await pool.query("SELECT id, is_admin FROM users WHERE id = $1", [id]);

    if (target.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (target.rows[0].is_admin) {
      return res.status(400).json({ success: false, error: "Admin accounts can't be banned" });
    }

    const result = await pool.query(
      `UPDATE users
       SET banned_at = CASE WHEN is_banned THEN COALESCE(banned_at, now()) ELSE now() END,
           ban_permanent = ($2::boolean OR (is_banned AND ban_permanent)),
           ban_reason = $1,
           is_banned = true
       WHERE id = $3
       RETURNING id, name, email, is_banned, ban_reason, ban_permanent`,
      [reason, permanent, id]
    );

    const bannedUser = result.rows[0];

    await pool.query(
      "UPDATE reports SET status = 'resolved' WHERE reported_user_id = $1 AND status = 'pending'",
      [id]
    );

    if (permanent) {
      await pool.query(
        `UPDATE appeals
         SET status = 'denied',
             admin_reply = 'This account has been permanently banned.',
             decided_at = now()
         WHERE user_id = $1 AND status = 'pending'`,
        [id]
      );
    }

    sendEmail({
      to: bannedUser.email,
      subject: "Your Kimathi Marketplace account has been suspended",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #8C3A2B;">Account suspended</h2>
          <p>Hi ${escapeHtml(bannedUser.name)},</p>
          <p>Your Kimathi Marketplace account has been suspended.</p>
          <p><strong>Reason:</strong> ${escapeHtml(bannedUser.ban_reason)}</p>
          ${
            bannedUser.ban_permanent
              ? "<p>This suspension is permanent.</p>"
              : "<p>If you believe this was a mistake, log in to Kimathi Marketplace to submit an appeal.</p>"
          }
        </div>
      `,
    });

    res.json(bannedUser);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function unbanUser(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_PATTERN.test(id)) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_banned = false, ban_reason = NULL, ban_permanent = false
       WHERE id = $1
       RETURNING id, name, is_banned`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await pool.query(
      `UPDATE appeals
       SET status = 'approved',
           admin_reply = COALESCE(admin_reply, 'Your suspension was lifted by an administrator.'),
           decided_at = now()
       WHERE user_id = $1 AND status = 'pending'`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}