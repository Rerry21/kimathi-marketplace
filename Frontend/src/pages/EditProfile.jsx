import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/users";
import { uploadImage } from "../services/upload";
import { colors, fonts, radius } from "../theme";

const styles = {
  container: {
    maxWidth: "440px",
    margin: "0 auto",
    padding: "3rem 1.5rem",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "1.6rem",
    color: colors.text,
    marginBottom: "1.75rem",
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    marginBottom: "1.75rem",
  },
  avatarPreview: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: colors.accentMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.heading,
    fontSize: "1.5rem",
    color: colors.accent,
  },
  fileInput: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
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
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.95rem",
  },
  submitBtn: {
    width: "100%",
    padding: "0.85rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
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
};

function EditProfile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user ? user.name : "");
  const [location, setLocation] = useState(user?.location || "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profile_image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return <p style={{ padding: "3rem", textAlign: "center", color: colors.textMuted }}>Please log in first.</p>;
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let profile_image_url = user.profile_image_url;
      if (imageFile) {
        profile_image_url = await uploadImage(imageFile, token);
      }

      const updated = await updateProfile({ name, location, profile_image_url }, token);
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user.id}`), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Edit your profile</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>Saved! Redirecting...</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.avatarRow}>
          {previewUrl ? (
            <img src={previewUrl} alt="Profile" style={styles.avatarPreview} />
          ) : (
            <div style={styles.avatarPlaceholder}>{name.charAt(0)}</div>
          )}
          <input
            style={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Full name</label>
          <input
            style={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Hostel / location</label>
          <input
            style={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit" style={styles.submitBtn} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;