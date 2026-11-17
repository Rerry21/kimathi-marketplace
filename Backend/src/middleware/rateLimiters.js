import { rateLimit, ipKeyGenerator } from "express-rate-limit";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function waitText(req) {
  const info = req.rateLimit;
  const resetAt = info && info.resetTime ? new Date(info.resetTime).getTime() : Date.now() + MINUTE;
  const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / MINUTE));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function makeLimiter({ windowMs, limit, message, keyGenerator, skipSuccessfulRequests }) {
  const options = {
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: `${message} Please try again in ${waitText(req)}.`,
      });
    },
  };

  if (keyGenerator) options.keyGenerator = keyGenerator;
  if (skipSuccessfulRequests) options.skipSuccessfulRequests = true;

  return rateLimit(options);
}

const byUser = (req) => req.user.id;

export const loginIpLimiter = makeLimiter({
  windowMs: 15 * MINUTE,
  limit: 60,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts from this network.",
});

export const loginAccountLimiter = makeLimiter({
  windowMs: 15 * MINUTE,
  limit: 8,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    return `${ipKeyGenerator(req.ip)}|${email}`;
  },
  message: "Too many failed login attempts for this account.",
});

export const signupLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 20,
  message: "Too many accounts were created from this network.",
});

export const forgotPasswordLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 10,
  message: "Too many password reset requests.",
});

export const resetPasswordLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 20,
  message: "Too many password reset attempts.",
});

export const sendMessageLimiter = makeLimiter({
  windowMs: MINUTE,
  limit: 20,
  keyGenerator: byUser,
  message: "You're sending messages too quickly.",
});

export const createListingLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 15,
  keyGenerator: byUser,
  message: "You've posted a lot of listings in a short time.",
});

export const uploadLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 30,
  keyGenerator: byUser,
  message: "You've uploaded a lot of photos in a short time.",
});

export const reportLimiter = makeLimiter({
  windowMs: HOUR,
  limit: 10,
  keyGenerator: byUser,
  message: "You've submitted a lot of reports in a short time.",
});

export const accountWriteLimiter = makeLimiter({
  windowMs: 15 * MINUTE,
  limit: 60,
  keyGenerator: byUser,
  message: "You're making changes too quickly.",
});