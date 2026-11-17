import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendEmail, escapeHtml } from "../config/email.js";

const RESET_TTL_MINUTES = 60;
const MAX_PASSWORD_BYTES = 72;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function passwordProblem(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return "Password is too long";
  }

  return null;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
}

export async function signup(req, res) {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Name, email and password are required" });
    }

    const problem = passwordProblem(password);

    if (problem) {
      return res.status(400).json({ success: false, error: problem });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, location)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, location, profile_image_url, is_admin, created_at`,
      [name.trim(), email, password_hash, location]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    sendEmail({
      to: user.email,
      subject: "Welcome to Kimathi Marketplace",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C1561F;">Welcome, ${escapeHtml(user.name)}!</h2>
          <p>Your Kimathi Marketplace account is ready. You can now browse listings, message sellers, and post your own items for sale.</p>
          <p>This platform is for in-person exchange only, right on campus, between fellow Dedan Kimathi students.</p>
          <p style="color: #6B6659; font-size: 0.85rem; margin-top: 2rem;">If you didn't create this account, you can ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        profile_image_url: user.profile_image_url,
        is_admin: user.is_admin,
        is_banned: user.is_banned,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function forgotPassword(req, res) {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (!email || email.length > 254) {
    return res.status(400).json({ success: false, error: "Enter your email address" });
  }

  const sameReply = {
    success: true,
    message: "If an account exists for that email, we've sent a password reset link.",
  };

  try {
    const found = await pool.query(
      "SELECT id, name, email FROM users WHERE lower(email) = lower($1) LIMIT 1",
      [email]
    );

    if (found.rows.length === 0) {
      return res.json(sameReply);
    }

    const account = found.rows[0];

    const recent = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') AS last_hour,
         COALESCE(bool_or(created_at > now() - interval '60 seconds'), false) AS too_soon
       FROM password_resets
       WHERE user_id = $1`,
      [account.id]
    );

    if (Number(recent.rows[0].last_hour) >= 5 || recent.rows[0].too_soon) {
      return res.json(sameReply);
    }

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      "UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [account.id]
    );

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + make_interval(mins => $3::int))`,
      [account.id, hashToken(token), RESET_TTL_MINUTES]
    );

    await pool.query("DELETE FROM password_resets WHERE created_at < now() - interval '7 days'");

    const link = `${frontendUrl()}/reset-password?token=${token}`;

    if (process.env.LOG_RESET_LINKS === "true") {
      console.log(`[dev] Password reset link for ${account.email}: ${link}`);
    }

    sendEmail({
      to: account.email,
      subject: "Reset your Kimathi Marketplace password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C1561F;">Reset your password</h2>
          <p>Hi ${escapeHtml(account.name)},</p>
          <p>We got a request to reset the password for your Kimathi Marketplace account. Use the button below to choose a new one. The link works once and expires in ${RESET_TTL_MINUTES} minutes.</p>
          <p style="margin: 1.5rem 0;">
            <a href="${escapeHtml(link)}" style="background: #C1561F; color: #ffffff; padding: 12px 22px; border-radius: 4px; text-decoration: none; display: inline-block;">Reset password</a>
          </p>
          <p style="color: #6B6659; font-size: 0.85rem;">Or paste this link into your browser:<br>${escapeHtml(link)}</p>
          <p style="color: #6B6659; font-size: 0.85rem;">If you didn't ask for this, you can ignore this email. Your password won't change.</p>
        </div>
      `,
    });

    return res.json(sameReply);
  } catch (error) {
    console.error("forgotPassword failed:", error.message);
    return res.json(sameReply);
  }
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
    return res
      .status(400)
      .json({ success: false, error: "This reset link is invalid or has expired" });
  }

  const problem = passwordProblem(password);

  if (problem) {
    return res.status(400).json({ success: false, error: problem });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const found = await client.query(
      `SELECT pr.id, pr.user_id, u.name, u.email
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1 AND pr.used_at IS NULL AND pr.expires_at > now()
       FOR UPDATE OF pr`,
      [hashToken(token)]
    );

    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: "This reset link is invalid or has expired" });
    }

    const reset = found.rows[0];
    const password_hash = await bcrypt.hash(password, 10);

    await client.query(
      "UPDATE users SET password_hash = $1, password_changed_at = now() WHERE id = $2",
      [password_hash, reset.user_id]
    );

    await client.query(
      "UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [reset.user_id]
    );

    await client.query("COMMIT");

    sendEmail({
      to: reset.email,
      subject: "Your Kimathi Marketplace password was changed",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #C1561F;">Password changed</h2>
          <p>Hi ${escapeHtml(reset.name)},</p>
          <p>The password for your Kimathi Marketplace account was just changed, and you were logged out of your other devices.</p>
          <p style="color: #6B6659; font-size: 0.85rem;">If this wasn't you, reset your password again right away.</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}