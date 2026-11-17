import { useState } from "react";
import { colors, fonts, radius } from "../../theme";

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 13, 11, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1.25rem",
    },
    modal: (danger) => ({
        width: "100%",
        maxWidth: "440px",
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderTop: `4px solid ${danger ? colors.danger : colors.accent}`,
        borderRadius: radius.md,
        padding: "1.5rem",
    }),
    title: {
        fontFamily: fonts.heading,
        fontSize: "1.15rem",
        color: colors.text,
        marginBottom: "0.6rem",
    },
    description: {
        fontFamily: fonts.body,
        fontSize: "0.88rem",
        color: colors.textMuted,
        lineHeight: 1.55,
        marginBottom: "1rem",
        whiteSpace: "pre-line",
    },
    label: {
       display: "block",
       fontFamily: fonts.body,
       fontSize: "0.82rem",
       color: colors.textMuted,
       marginBottom: "0.35rem", 
    },
    textarea: {
        width: "100%",
        minHeight: "90px",
        padding: "0.75rem 0.85rem",
        borderRadius: radius.sm,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: fonts.body,
        fontSize: "0.9rem",
        resize: "vertical",
    },
    counter: {
        fontFamily: fonts.body,
        fontSize: "0.72rem",
        colors: colors.textMuted,
        marginTop: "0.25rem",
        marginBottom: "0.85rem",
    },
    checkRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: fonts.body,
        fontSize: "0.88rem",
        color: colors.text,
        marginBottom: "0.9rem",
        cursor: "pointer",
    },
    error: {
        fontFamily: fonts.body,
        fontSize: "0.82rem",
        color: colors.danger,
        marginBottom: "0.8rem",
    },
    buttons: {
        display: "flex",
        gap: "0.6rem",
        marginBottom: "0.8rem",
    },
    cancel: {
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
    confirm: (danger, busy) => ({
        flex: 1,
        padding: "0.7rem",
        borderRadius: radius.sm,
        border: "none",
        backgroundColor: danger ? colors.danger : colors.accent,
        color: "#FFFFFF",
        fontFamily: fonts.body,
        fontSize: "0.9rem",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.7 : 1,
    }),
};

function ActionModal({
    title,
    description,
    label,
    placeholder,
    required = false,
    maxLength = 500,
    checkboxLabel,
    confirmLabel = "Confirm",
    danger = false,
    onConfirm,
    onClose,
}) {
    const [text, setText] = useState("");
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleConfirm() {
        if (label && required && !text.trim()) {
            setError("This field is required.");
            return;
        }

        setBusy(true);
        setError("");

        try {
            await onConfirm({ text: text.trim(), checked });
            onClose();
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

  return (
    <div style={styles.overlay} onClick={busy ? undefined : onClose}>
      <div style={styles.modal(danger)} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>{title}</h2>
        {description && <p style={styles.description}>{description}</p>}

        {label && (
          <>
            <label style={styles.label}>{label}</label>
            <textarea
              style={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              autoFocus
            />
            <p style={styles.counter}>
              {text.length}/{maxLength}
            </p>
          </>
        )}

        {checkboxLabel && (
          <label style={styles.checkRow}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>{checkboxLabel}</span>
          </label>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttons}>
          <button style={styles.cancel} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button style={styles.confirm(danger, busy)} onClick={handleConfirm} disabled={busy}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionModal;