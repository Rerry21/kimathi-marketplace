import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, radius } from "../theme";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 13, 11, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: "1.5rem",
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderTop: `4px solid ${colors.danger}`,
    padding: "2rem",
    maxWidth: "420px",
    width: "100%",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "1.3rem",
    color: colors.text,
    marginBottom: "0.9rem",
  },
  text: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.textMuted,
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  reasonBox: {
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: "0.8rem 1rem",
    marginBottom: "1rem",
  },
  reasonLabel: {
    fontFamily: fonts.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    color: colors.danger,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  reasonText: {
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.text,
    marginTop: "0.25rem",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    marginTop: "0.5rem",
  },
};

function BanNotice() {
  const { banNotice, dismissBanNotice } = useAuth();
  const navigate = useNavigate();

  if (!banNotice) return null;

  const reason = banNotice.includes(" Reason: ") ? banNotice.split(" Reason: ")[1] : null;

  function handleClose() {
    dismissBanNotice();
    navigate("/");
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Your account has been suspended</h2>
        <p style={styles.text}>
          You have been logged out and can no longer post, edit or message on Kimathi Marketplace.
        </p>

        {reason && (
          <div style={styles.reasonBox}>
            <span style={styles.reasonLabel}>Reason</span>
            <p style={styles.reasonText}>{reason}</p>
          </div>
        )}

        <p style={styles.text}>
          If you believe this was a mistake, please contact the Kimathi Marketplace team.
        </p>

        <button style={styles.button} onClick={handleClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default BanNotice;