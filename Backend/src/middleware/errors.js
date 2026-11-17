export function hideServerErrors(req, res, next) {
  if (process.env.EXPOSE_ERRORS === "true") return next();

  const sendJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 500) {
      const detail = body && typeof body === "object" && body.error ? body.error : "unknown error";
      console.error(`[${req.method} ${req.originalUrl}] ${res.statusCode}: ${detail}`);

      return sendJson({
        success: false,
        error: "Something went wrong on our side. Please try again.",
      });
    }

    return sendJson(body);
  };

  next();
}

export function notFound(req, res) {
  res.status(404).json({ success: false, error: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, error: "Invalid JSON in the request body" });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, error: "The request is too large" });
  }

  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, error: "Each photo must be 5 MB or smaller" });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, error: "You can upload up to 6 photos at a time" });
    }

    return res.status(400).json({ success: false, error: "The upload could not be processed" });
  }

  console.error(`[${req.method} ${req.originalUrl}] ${err.message}`);
  res.status(500).json({
    success: false,
    error: "Something went wrong on our side. Please try again.",
  });
}