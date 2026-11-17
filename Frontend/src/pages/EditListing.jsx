import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchListingById, updateListing } from "../services/listings";
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
  currentRow: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
    marginBottom: "0.75rem",
  },
  currentThumb: {
    width: "56px",
    height: "56px",
    objectFit: "cover",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
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
  status: {
    padding: "3rem",
    textAlign: "center",
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
};

function EditListing() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchListingById(id)
      .then((data) => {
        setForm({
          title: data.title,
          price: data.price,
          category: data.category,
          condition: data.condition,
          location: data.location,
          description: data.description,
          status: data.status,
        });

        const imgs =
          data.images && data.images.length > 0
            ? data.images
            : data.image_url
            ? [data.image_url]
            : [];

        setExistingImages(imgs);
        setCoverPreview(imgs[0] || null);
      })
      .catch(() => setError("Could not load this listing."))
      .finally(() => setLoading(false));
  }, [id]);

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

    if (Number(form.price) <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const uploadedCover = coverFile ? await uploadImages([coverFile], token) : [];
      const uploadedExtras = extraFiles.length > 0 ? await uploadImages(extraFiles, token) : [];

      const cover = uploadedCover[0] || existingImages[0] || null;
      const extras = extraFiles.length > 0 ? uploadedExtras : existingImages.slice(1);
      const image_urls = [cover, ...extras].filter(Boolean);

      await updateListing(id, { ...form, image_urls }, token);
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user.id}`), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={styles.status}>Loading listing...</p>;
  if (!form) return <p style={styles.status}>{error || "Listing not found."}</p>;

  const currentExtras = existingImages.slice(1);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Edit listing</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>Saved! Redirecting...</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Cover photo</label>
          <input
            style={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
          />
          <p style={styles.hint}>Leave empty to keep the current cover photo.</p>
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
          <label style={styles.label}>Status</label>
          <select
            style={styles.select}
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Meet-up location</label>
          <input
            style={styles.input}
            type="text"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Additional photos</label>

          {currentExtras.length > 0 && extraFiles.length === 0 && (
            <div style={styles.currentRow}>
              {currentExtras.map((url, i) => (
                <img key={i} src={url} alt={`Current ${i + 2}`} style={styles.currentThumb} />
              ))}
            </div>
          )}

          <PhotoDropzone files={extraFiles} onFilesChange={setExtraFiles} maxFiles={5} />
          <p style={styles.hint}>
            Adding new photos here replaces the current additional photos. Leave empty to keep them.
          </p>
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

        <button type="submit" style={styles.submitBtn} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default EditListing;