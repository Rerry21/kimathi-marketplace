import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createReport } from "../services/reports";
import { colors, fonts, radius } from "../theme";

const reasons = [
  "Scam or fraud",
  "Fake or misleading listing",
  "Inappropriate content",
  "Harassment",
  "Other",
];

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(28, 25, 22, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1.5rem",
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: "1.75rem",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "1.2rem",
    color: colors.text,
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginBottom: "0.4rem",
    marginTop: "1rem",
  },
  select: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.9rem",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    minHeight: "80px",
    resize: "vertical",
  },
  buttonRow: {
    display: "flex",
    gap: "0.6rem",
    marginTop: "1.5rem",
  },
  cancelBtn: {
    flex: 1,
    padding: "0.7rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 1,
    padding: "0.7rem",
    borderRadius: radius.sm,
    border: "none",
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  error: {
    fontFamily: fonts.body,
    fontSize: "0.82rem",
    color: colors.danger,
    marginTop: "0.75rem",
  },
  success: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.highlight,
    textAlign: "center",
  },
};

function ReportModal({ listingId, reportedUserId, onClose }) {
  const { token } = useAuth();
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const fullReason = details.trim() ? `${reason}: ${details.trim()}` : reason;

    try {
      await createReport(
        {
          listing_id: listingId || null,
          reported_user_id: reportedUserId || null,
          reason: fullReason,
        },
        token
      );
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <p style={styles.success}>
            Report submitted. Thank you for helping keep the marketplace safe.
          </p>
        ) : (
          <>
            <h2 style={styles.title}>Report this {listingId ? "listing" : "user"}</h2>
            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Reason</label>
              <select
                style={styles.select}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label style={styles.label}>Additional details (optional)</label>
              <textarea
                style={styles.textarea}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything else we should know?"
              />

              {error && <p style={styles.error}>{error}</p>}

              <div style={styles.buttonRow}>
                <button type="button" style={styles.cancelBtn} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;