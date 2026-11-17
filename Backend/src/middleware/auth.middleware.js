import jwt from "jsonwebtoken";
import pool from "../config/db.js";

async function authenticate(req, res, next, allowBanned) {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({success: false, error: "No token provided"});
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token"});
  }
  try {
    const result = await pool.query(
      `SELECT id, email, is_admin, is_banned, ban_reason, password_changed_at
      FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "This account no longer exists"});
    }

    const account = result.rows[0]

    if(account.password_changed_at) {
      const changedAt = Math.floor(new Date(account.password_changed_at).getTime() / 1000);

    if (typeof decoded.iat !== "number" || decoded.iat < changedAt) {
      return res
       .status(401)
       .json({ success: false, error: "Your password was changed. Please log in again."});
      }
    }

    if (account.is_banned && !allowBanned) {
      return res.status(403).json({
        success: false,
        error: `Your account has been suspended.${
          account.ban_reason? `Reason:${account.ban_reason}`:""
        }`,
      });
    }

    req.user = {
      id: account.id,
      email: account.email,
      is_admin: account.is_admin,
      is_banned: account.is_banned,
    };

    next();
  } catch (error){
    res.status(500).json({success: false, error: error.messsage});
  }
}

export function requireAuth(req, res, next){
  return authenticate(req, res, next, false);
}

export function requireAuthAllowBanned(req, res, next) {
  return authenticate(req, res, next, true);
}