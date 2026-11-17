import pool from "../config/db.js";

const MAX_APPEALS = 2;
const MIN_LENGTH = 20;
const MAX_LENGTH = 1000;
const MAX_REPLY_LENGTH = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getBanState(userId) {
  const userResult = await pool.query(
    "SELECT is_banned, ban_reason, ban_permanent, banned_at FROM users WHERE id = $1",
    [userId]
  );

  if (userResult.rows.length === 0) return null;

  const account = userResult.rows[0];
  const since = account.banned_at || new Date(0);

  const countResult = await pool.query(
    "SELECT COUNT(*) FROM appeals WHERE user_id = $1 AND created_at >= $2",
    [userId, since]
  );

  const latestResult = await pool.query(
    `SELECT id, message, status, admin_reply, created_at, decided_at
     FROM appeals
     WHERE user_id = $1 AND created_at >= $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, since]
  );

  const used = Number(countResult.rows[0].count);
  const latest = latestResult.rows[0] || null;
  const pending = latest !== null && latest.status === "pending";

  return {
    is_banned: account.is_banned,
    ban_reason: account.ban_reason,
    ban_permanent: account.ban_permanent,
    appeals_used: used,
    appeals_remaining: Math.max(MAX_APPEALS - used, 0),
    can_appeal: account.is_banned && !account.ban_permanent && !pending && used < MAX_APPEALS,
    latest_appeal: latest,
  };
}

export async function getMyAppealStatus(req, res) {
  try {
    const state = await getBanState(req.user.id);

    if (!state) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function submitAppeal(req, res) {
  try {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (message.length < MIN_LENGTH || message.length > MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Your appeal must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`,
      });
    }

    const state = await getBanState(req.user.id);

    if (!state) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    if (!state.is_banned) {
      return res.status(400).json({ success: false, error: "Your account is not suspended" });
    }

    if (state.ban_permanent) {
      return res
        .status(403)
        .json({ success: false, error: "This suspension is permanent and can't be appealed" });
    }

    if (state.latest_appeal && state.latest_appeal.status === "pending") {
      return res
        .status(409)
        .json({ success: false, error: "You already have an appeal waiting for review" });
    }

    if (state.appeals_used >= MAX_APPEALS) {
      return res.status(403).json({ success: false, error: "You have used all of your appeals" });
    }

    try {
      await pool.query("INSERT INTO appeals (user_id, message) VALUES ($1, $2)", [
        req.user.id,
        message,
      ]);
    } catch (insertError) {
      if (insertError.code === "23505") {
        return res
          .status(409)
          .json({ success: false, error: "You already have an appeal waiting for review" });
      }
      throw insertError;
    }

    const updated = await getBanState(req.user.id);
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllAppeals(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         a.id, a.message, a.status, a.admin_reply, a.created_at, a.decided_at, a.user_id,
         u.name AS user_name, u.email AS user_email,
         u.ban_reason, u.ban_permanent, u.is_banned,
         (SELECT COUNT(*) FROM appeals a2
            WHERE a2.user_id = a.user_id
              AND a2.created_at >= COALESCE(u.banned_at, '1970-01-01'::timestamptz)) AS appeals_used
       FROM appeals a
       JOIN users u ON u.id = a.user_id
       ORDER BY (a.status = 'pending') DESC, a.created_at DESC`
    );

    res.json(result.rows.map((row) => ({ ...row, appeals_used: Number(row.appeals_used) })));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function decideAppeal(req, res) {
  const { id } = req.params;
  const { decision } = req.body;
  const reply = typeof req.body.reply === "string" ? req.body.reply.trim() : "";

  if (!UUID_PATTERN.test(id)) {
    return res.status(404).json({ success: false, error: "Appeal not found" });
  }

  if (!["approved", "denied"].includes(decision)) {
    return res.status(400).json({ success: false, error: "Invalid decision" });
  }

  if (decision === "denied" && !reply) {
    return res
      .status(400)
      .json({ success: false, error: "A reply is required when denying an appeal" });
  }

  if (reply.length > MAX_REPLY_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `The reply must be ${MAX_REPLY_LENGTH} characters or fewer`,
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const found = await client.query("SELECT * FROM appeals WHERE id = $1 FOR UPDATE", [id]);

    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Appeal not found" });
    }

    const appeal = found.rows[0];

    if (appeal.status !== "pending") {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: "This appeal has already been decided" });
    }

    const updated = await client.query(
      `UPDATE appeals
       SET status = $1, admin_reply = $2, decided_at = now()
       WHERE id = $3
       RETURNING *`,
      [decision, reply || null, id]
    );

    if (decision === "approved") {
      await client.query(
        `UPDATE users
         SET is_banned = false, ban_reason = NULL, ban_permanent = false
         WHERE id = $1`,
        [appeal.user_id]
      );
    } else {
      const owner = await client.query(
        "SELECT banned_at, is_banned FROM users WHERE id = $1",
        [appeal.user_id]
      );

      if (owner.rows.length > 0 && owner.rows[0].is_banned) {
        const since = owner.rows[0].banned_at || new Date(0);
        const count = await client.query(
          "SELECT COUNT(*) FROM appeals WHERE user_id = $1 AND created_at >= $2",
          [appeal.user_id, since]
        );

        if (Number(count.rows[0].count) >= MAX_APPEALS) {
          await client.query("UPDATE users SET ban_permanent = true WHERE id = $1", [
            appeal.user_id,
          ]);
        }
      }
    }

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}