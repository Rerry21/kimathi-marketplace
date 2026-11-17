import { colors, fonts } from "../theme";

const styles = {
  band: {
    background: `linear-gradient(135deg, ${colors.navBg} 0%, ${colors.accentDeep} 100%)`,
    padding: "3.5rem 2.5rem 3rem",
  },
  inner: {
    maxWidth: "650px",
    margin: "0 auto",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: "2.1rem",
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: "0.4rem",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: "1rem",
    color: "#F3E1D2",
  },
};

function PageHeader({ title, subtitle }) {
  return (
    <div style={styles.band}>
      <div style={styles.inner}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default PageHeader;