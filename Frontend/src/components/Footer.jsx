import { Link } from "react-router-dom";
import { colors, fonts } from "../theme";
import { SITE_NAME, CONTACT_EMAIL, DISCORD_URL } from "../config/site";

const styles = {
  footer: {
    borderTop: `1px solid ${colors.border}`,
    padding: "2.5rem 2.5rem 2rem",
    marginTop: "4rem",
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "2rem",
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: "1.1rem",
    color: colors.text,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginTop: "0.35rem",
    maxWidth: "320px",
    lineHeight: 1.5,
  },
  columns: {
    display: "flex",
    gap: "3rem",
    flexWrap: "wrap",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  columnTitle: {
    fontFamily: fonts.body,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: colors.text,
    marginBottom: "0.25rem",
  },
  link: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.textMuted,
  },
  bottom: {
    marginTop: "2rem",
    paddingTop: "1.25rem",
    borderTop: `1px solid ${colors.border}`,
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.textMuted,
    lineHeight: 1.6,
  },
};

function Footer() {
  const hasContact = Boolean(CONTACT_EMAIL || DISCORD_URL);

  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.row}>
          <div>
            <p style={styles.brand}>{SITE_NAME}</p>
            <p style={styles.note}>
              A student-to-student marketplace for meeting up and trading on campus. No
              shipping, no payments handled here, no middlemen.
            </p>
          </div>

          <div style={styles.columns}>
            <div style={styles.column}>
              <span style={styles.columnTitle}>Explore</span>
              <Link to="/about" style={styles.link}>
                About
              </Link>
              <Link to="/how-to-use" style={styles.link}>
                How it works
              </Link>
              <Link to="/faq" style={styles.link}>
                FAQ
              </Link>
            </div>

            <div style={styles.column}>
              <span style={styles.columnTitle}>Legal</span>
              <Link to="/terms" style={styles.link}>
                Terms of use
              </Link>
              <Link to="/privacy" style={styles.link}>
                Privacy policy
              </Link>
            </div>

            {hasContact && (
              <div style={styles.column}>
                <span style={styles.columnTitle}>Contact</span>
                {CONTACT_EMAIL && (
                  <a href={`mailto:${CONTACT_EMAIL}`} style={styles.link}>
                    {CONTACT_EMAIL}
                  </a>
                )}
                {DISCORD_URL && (
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Discord
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <p style={styles.bottom}>
          © {new Date().getFullYear()} {SITE_NAME}. A student-built project, not run or
          endorsed by Dedan Kimathi University.
        </p>
      </div>
    </footer>
  );
}

export default Footer;