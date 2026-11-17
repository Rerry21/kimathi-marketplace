import { colors, fonts, radius } from "../../theme";

export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDateTime(value) {
    return new Date(value).toLocaleString();
}

export function formatDate(value) {
    return new Date(value).toLocaleDateString();
}

export const ui = {
    title: {
        fontFamily: fonts.heading,
        fontSize: "1.7rem",
        fontWeight: 700,
        color: colors.text,
        marginBottom: "0.3rem",
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: "0.92rem",
        color: colors.textMuted,
        marginBottom: "1.75rem"
    },
    filterRow: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
    },
    filterBtn: (active) => ({
        fontFamily: fonts.body,
        fontSize: "0.85rem",
        padding: "0.4rem 0.9rem",
        borderRadius: "999px",
        border: `1px solid ${active ? colors.accent : colors.border}`,
        backgroundColor: active ? colors.accent: "transparent",
        color: active ? "FFFFFF" :colors.textMuted,
        cursor: "pointer",
    }),
    card: {
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: "1.25rem",
        marginBottom: "1rem",
        backgroundColor: colors.surface,
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
        flexWrap: "Wrap",
    },
    heading: {
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: "0.95rem",
        color: colors.text,
        wordBreak: "break-word",
    },
    meta: {
        fontFamily: fonts.body,
        fontSize: "0.85rem",
        color: colors.textMuted,
        marginTop: "0.5rem",
        lineHeight: 1.6,
        wordBreak: "break-word",
    },
    messageBox: {
        fontFamily: fonts.body,
        fontSize: "0.9rem",
        color: colors.text,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.sm,
        padding: "0.8rem 1rem",
        marginTop: "0.8rem",
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
    note: {
        fontFamily: fonts.body,
        fontSize: "0.85rem",
        color: colors.textMuted,
        marginTop: "0.75",
        lineHeight: 1.5,
    },
    warn: {
        fontFamily: fonts.body,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: colors.danger,
        marginTop: "0.5rem",
    },
    actions: {
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.9rem",
        flexWrap: "wrap",
    },
    btn: (kind = "neutral") => {
        const base = {
            fontFamily: fonts.body,
            fontSize: "0.8rem",
            padding: "0.45rem 0.85rem",
            borderRadius: radius.sm,
            cursor: "pointer",
        };

        if (kind === "danger") {
            return { ...base, border: "none", backgroundColor: colors.danger, color: "#FFFFFF"};
        }
        if (kind === "success") {
            return { ...base, border: "none", backgroundColor: colors.highlight, color: "#FFFFFF"};
        }
        if (kind === "active") {
            return {
                ...base,
                border: `1px solid ${color.border}`,
                backgroundColor: colors.accentMuted,
                color: colors.text,
            };
        }
        return {
            ...base,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            color: colors.text,
        };
    },
    statusTag: (status) => ({
        fontFamily: fonts.body,
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        backgroundColor:
          status === "resolved" || status === "approved"
            ? colors.highlight
            : status === "denied"
            ? colors.danger
            : status === "dismissed"
            ? colors.border
            : colors.accent,
        color: status === "dismissed" ? colors.textMuted : "#FFFFFF",
        textTransform: "capitalize",
        flexShrink: 0,
    }),
    empty: {
        fontFamily: fonts.body,
        color: colors.textMuted,
        padding: "2rem",
        textAlign: "center",
    },
    error: {
        fontFamily: fonts.body,
        fontSize: "0.85rem",
        color: colors.danger,
        marginBottom: "1rem",
    },
    input: {
        width: "100%",
        padding: "0.7rem 0.9rem",
        borderRadius: radius.sm,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: fonts.body,
        fontSize: "0.92rem",
        marginBottom: "1rem",
    },
};