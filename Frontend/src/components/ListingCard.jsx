import { useState } from "react";
import { Link } from "react-router-dom";
import { colors, fonts, radius } from "../theme";

const styles = {
  card: (hovered) => ({
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hovered
      ? "0 12px 24px rgba(0, 0, 0, 0.15)"
      : "0 0 0 rgba(0,0,0,0)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  }),
  imageWrap: {
    position: "relative",
    height: "160px",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    height: "160px",
    backgroundColor: colors.accentMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    color: colors.textMuted,
  },
  badge: {
    position: "absolute",
    top: "0.6rem",
    left: "0.6rem",
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.72rem",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
  },
  body: {
    padding: "0.9rem 1rem 1.1rem",
  },
  title: {
    fontFamily: fonts.body,
    fontSize: "0.98rem",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "0.25rem",
  },
  price: {
    fontFamily: fonts.heading,
    fontSize: "1.1rem",
    color: colors.accent,
    marginBottom: "0.4rem",
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.textMuted,
  },
};

function ListingCard({ listing }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/listing/${listing.id}`} style={{ textDecoration: "none" }}>
      <div
        style={styles.card(hovered)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={styles.imageWrap}>
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>{listing.category}</div>
          )}
          <span style={styles.badge}>Sell</span>
        </div>
        <div style={styles.body}>
          <p style={styles.title}>{listing.title}</p>
          <p style={styles.price}>KSh {Number(listing.price).toLocaleString()}</p>
          <p style={styles.meta}>
            {listing.condition} · {listing.location}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;