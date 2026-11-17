import { Link } from "react-router-dom";
import { colors, fonts, radius } from "../theme";

const styles = {
  wrap: {
    maxWidth: "520px",
    margin: "0 auto",
    padding: "5rem 1.5rem",
    textAlign: "center",
  },
  code: {
    fontFamily: fonts.heading,
    fontSize: "5rem",
    fontWeight: 700,
    color: colors.accent,
    lineHeight: 1,
    marginBottom: "0.75rem",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "1.5rem",
    color: colors.text,
    marginBottom: "0.6rem",
  },
  text: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.textMuted,
    lineHeight: 1.6,
    marginBottom: "1.75rem",
  },
  button: {
    display: "inline-block",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    padding: "0.75rem 1.5rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
  },
};

function NotFound() {
  return (
    <div style={styles.wrap}>
      <p style={styles.code}>404</p>
      <h1 style={styles.title}>We couldn't find that page</h1>
      <p style={styles.text}>
        The link may be broken, or the page may have been moved or removed.
      </p>
      <Link to="/" style={styles.button}>
        Back to browse
      </Link>
    </div>
  );
}

export default NotFound;