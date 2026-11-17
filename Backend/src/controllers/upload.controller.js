import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "kimathi-marketplace",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    const uploads = await Promise.all(
      req.files.map((file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        return cloudinary.uploader.upload(base64, { folder: "kimathi-marketplace" });
      })
    );

    const urls = uploads.map((result) => result.secure_url);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}