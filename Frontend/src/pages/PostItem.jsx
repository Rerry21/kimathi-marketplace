import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createListing } from "../services/listings";
import { uploadImages } from "../services/upload";
import { categories } from "../data/mockListings";
import PhotoDropzone from "../components/PhotoDropzone";
import { colors, fonts, radius } from "../theme";

const fieldBase = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: radius.sm,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: "0.95rem",
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "1.8rem",
    color: colors.text,
    marginBottom: "1.75rem",
  },
  field: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginBottom: "0.4rem",
  },
  input: fieldBase,
  textarea: {
    ...fieldBase,
    minHeight: "120px",
    resize: "vertical",
  },
  select: fieldBase,
  fileInput: {
    ...fieldBase,
    padding: "0.6rem",
    border: `1px dashed ${colors.border}`,
    fontSize: "0.9rem",
  },
  coverPreview: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: radius.md,
    marginTop: "0.75rem",
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: "0.75rem",
    color: colors.textMuted,
    marginTop: "0.4rem",
  },
  submitBtn: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    border: "none",
    marginTop: "0.5rem",
  },
  note: {
    fontFamily: fonts.body,
    fontSize: "0.82rem",
    color: colors.textMuted,
    marginTop: "0.75rem",
  },
  error: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.danger,
    marginBottom: "1rem",
  },
  success: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.highlight,
    marginBottom: "1rem",
  },
};

function PostItem() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: categories[1],
    condition: "Used - good",
    location: "",
    description: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You need to log in before posting a listing.");
      return;
    }

    if (Number(form.price) <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const allFiles = coverFile ? [coverFile, ...extraFiles] : extraFiles;
      let image_urls = [];
      if (allFiles.length > 0) {
        image_urls = await uploadImages(allFiles, token);
      }

      await createListing({ ...form, image_urls }, token);
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user.id}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Sell an item</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>Listing posted! Redirecting...</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Cover photo</label>
          <input
            style={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
          />
          <p style={styles.hint}>This is the photo buyers see when browsing.</p>
          {coverPreview && (
            <img src={coverPreview} alt="Cover preview" style={styles.coverPreview} />
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Title</label>
          <input
            style={styles.input}
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Price (KSh)</label>
          <input
            style={styles.input}
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select
            style={styles.select}
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Condition</label>
          <select
            style={styles.select}
            value={form.condition}
            onChange={(e) => handleChange("condition", e.target.value)}
          >
            <option>New</option>
            <option>Used - good</option>
            <option>Used - fair</option>
            <option>Service</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Meet-up location</label>
          <input
            style={styles.input}
            type="text"
            placeholder="e.g. Main gate, Hostel C"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Additional photos</label>
          <PhotoDropzone files={extraFiles} onFilesChange={setExtraFiles} maxFiles={5} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Posting..." : "Post listing"}
        </button>

        <p style={styles.note}>
          This platform is for in-person exchange only. We do not process
          payments or shipping.
        </p>
      </form>
    </div>
  );
}

export default PostItem;