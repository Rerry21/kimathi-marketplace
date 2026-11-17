import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);

    const error = new Error("Only JPG, PNG, WebP or GIF images are allowed");
    error.code = "INVALID_FILE_TYPE";
    cb(error);
  },
});

export default upload;