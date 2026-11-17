const PRIVATE_NETWORK_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

function readCorsConfig() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const allowPrivateNetwork = process.env.ALLOW_LAN_ORIGINS === "true";

  return { allowedOrigins, allowPrivateNetwork };
}

export function buildCorsOptions() {
  const { allowedOrigins, allowPrivateNetwork } = readCorsConfig();

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowPrivateNetwork && PRIVATE_NETWORK_ORIGIN.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    maxAge: 600,
  };
}

export function describeCors() {
  const { allowedOrigins, allowPrivateNetwork } = readCorsConfig();
  const parts = [];

  if (allowedOrigins.length > 0) parts.push(allowedOrigins.join(", "));
  if (allowPrivateNetwork) parts.push("local network origins (development only)");

  return parts.length > 0
    ? `CORS allows: ${parts.join(" + ")}`
    : "CORS allows: no browser origins. Set ALLOWED_ORIGINS in .env";
}