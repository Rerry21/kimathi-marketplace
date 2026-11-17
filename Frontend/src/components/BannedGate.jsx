import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAppealStatus, submitAppeal } from "../services/appeals";
import { colors, fonts, radius } from "../theme";

const MIN_LENGTH = 20;
const MAX_LENGTH = 1000;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.25rem",
    backgroundColor: colors.bg,
  },
  card: {
    width: "100%",
    maxWidth: "540px",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderTop: `4px solid ${colors.danger}`,
    borderRadius: radius.md,
    padding: "2rem",
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: "0.9rem",
    fontWeight: 700,
    color: colors.textMuted,
    marginBottom: "1.25rem",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "1.5rem",
    color: colors.text,
    marginBottom: "0.75rem",
  },
  text: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.textMuted,
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  box: {
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: "0.85rem 1rem",
    marginBottom: "1rem",
  },
  boxLabel: (color) => ({
    fontFamily: fonts.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    color,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  }),
  boxText: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.text,
    marginTop: "0.3rem",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  label: {
    display: "block",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginBottom: "0.4rem",
  },
  textarea: {
    width: "100%",
    minHeight: "130px",
    padding: "0.75rem 0.9rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    resize: "vertical",
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: "0.75rem",
    color: colors.textMuted,
    marginTop: "0.3rem",
    marginBottom: "0.9rem",
  },
  submitBtn: (enabled) => ({
    width: "100%",
    padding: "0.8rem",
    borderRadius: radius.sm,
    backgroundColor: enabled ? colors.accent : colors.border,
    color: enabled ? "#FFFFFF" : colors.textMuted,
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    cursor: enabled ? "pointer" : "not-allowed",
  }),
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    paddingTop: "1.25rem",
    borderTop: `1px solid ${colors.border}`,
    gap: "1rem",
    flexWrap: "wrap",
  },
  linkBtn: {
    background: "none",
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.accent,
    cursor: "pointer",
    padding: 0,
  },
  mutedBtn: {
    background: "none",
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    cursor: "pointer",
    padding: 0,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.danger,
    marginBottom: "1rem",
  },
};

function BannedGate() {
  const { token, logout, updateUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  function loadStatus() {
    return fetchAppealStatus(token)
      .then((data) => {
        if (!data.is_banned) {
          updateUser({ is_banned: false });
          return;
        }
        setStatus(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadStatus().finally(() => setLoading(false));
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [token]);

  async function handleCheck() {
    setChecking(true);
    await loadStatus();
    setChecking(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await submitAppeal(message, token);
      setStatus(data);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const latest = status ? status.latest_appeal : null;
  const pending = latest !== null && latest.status === "pending";
  const denied = latest !== null && latest.status === "denied";
  const length = message.trim().length;
  const canSubmit = length >= MIN_LENGTH && length <= MAX_LENGTH && !submitting;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.brand}>Kimathi Marketplace</p>
        <h1 style={styles.title}>Your account is suspended</h1>

        {loading && <p style={styles.text}>Loading your suspension details...</p>}

        {error && <p style={styles.error}>{error}</p>}

        {status && (
          <>
            <p style={styles.text}>
              You can't post, edit, message or browse while your account is suspended.
            </p>

            <div style={styles.box}>
              <span style={styles.boxLabel(colors.danger)}>Reason</span>
              <p style={styles.boxText}>{status.ban_reason || "No reason was recorded."}</p>
            </div>

            {status.ban_permanent && (
              <div style={styles.box}>
                <span style={styles.boxLabel(colors.danger)}>Permanent suspension</span>
                <p style={styles.boxText}>
                  This suspension is permanent and can't be appealed.
                </p>
              </div>
            )}

            {denied && (
              <div style={styles.box}>
                <span style={styles.boxLabel(colors.textMuted)}>Your last appeal was denied</span>
                <p style={styles.boxText}>
                  {latest.admin_reply || "No reply was provided."}
                </p>
              </div>
            )}

            {pending && (
              <div style={styles.box}>
                <span style={styles.boxLabel(colors.accent)}>Appeal under review</span>
                <p style={styles.boxText}>{latest.message}</p>
                <p style={{ ...styles.text, marginTop: "0.75rem", marginBottom: 0 }}>
                  We'll review it as soon as we can. This page checks for a decision
                  automatically, or you can check yourself below.
                </p>
              </div>
            )}

            {status.can_appeal && (
              <form onSubmit={handleSubmit}>
                <label style={styles.label}>
                  Explain why this suspension should be lifted.{" "}
                  {status.appeals_remaining === 1
                    ? "This is your last appeal."
                    : `You have ${status.appeals_remaining} appeals left.`}
                </label>
                <textarea
                  style={styles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MAX_LENGTH}
                  placeholder="Write your appeal here..."
                />
                <p style={styles.counter}>
                  {length}/{MAX_LENGTH} characters (at least {MIN_LENGTH})
                </p>
                <button type="submit" style={styles.submitBtn(canSubmit)} disabled={!canSubmit}>
                  {submitting ? "Sending..." : "Submit appeal"}
                </button>
              </form>
            )}
          </>
        )}

        <div style={styles.footerRow}>
          <button style={styles.linkBtn} onClick={handleCheck} disabled={checking}>
            {checking ? "Checking..." : "Check status"}
          </button>
          <button style={styles.mutedBtn} onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default BannedGate;