import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchListingById } from "../services/listings";
import { sendMessage } from "../services/messages";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";
import ReportModal from "../components/ReportModal";
import { colors, fonts, radius } from "../theme";

function getStyles(isMobile) {
  return {
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: isMobile ? "1.5rem" : "2.5rem",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
      gap: isMobile ? "1.5rem" : "2.5rem",
    },
    image: {
      width: "100%",
      height: isMobile ? "220px" : "340px",
      objectFit: "cover",
      borderRadius: radius.md,
    },
    imagePlaceholder: {
      height: isMobile ? "220px" : "340px",
      borderRadius: radius.md,
      backgroundColor: colors.accentMuted,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.body,
      color: colors.textMuted,
    },
    thumbRow: {
      display: "flex",
      gap: "0.6rem",
      marginTop: "0.75rem",
      flexWrap: "wrap",
    },
    thumb: (active) => ({
      width: "64px",
      height: "64px",
      objectFit: "cover",
      borderRadius: radius.sm,
      border: `2px solid ${active ? colors.accent : "transparent"}`,
      cursor: "pointer",
      opacity: active ? 1 : 0.75,
    }),
    title: {
      fontFamily: fonts.heading,
      fontSize: isMobile ? "1.4rem" : "1.7rem",
      color: colors.text,
      marginBottom: "0.4rem",
    },
    price: {
      fontFamily: fonts.heading,
      fontSize: isMobile ? "1.2rem" : "1.4rem",
      color: colors.accent,
      marginBottom: "1rem",
    },
    meta: {
      fontFamily: fonts.body,
      fontSize: "0.88rem",
      color: colors.textMuted,
      marginBottom: "1.5rem",
    },
    description: {
      fontFamily: fonts.body,
      fontSize: "0.95rem",
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: "1.75rem",
    },
    sellerBox: {
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      padding: "1rem 1.25rem",
      marginBottom: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "0.5rem",
    },
    sellerName: {
      fontFamily: fonts.body,
      fontWeight: 600,
      color: colors.text,
      fontSize: "0.95rem",
    },
    reportLink: {
      fontFamily: fonts.body,
      fontSize: "0.8rem",
      color: colors.danger,
      background: "none",
      border: "none",
      cursor: "pointer",
    },
    messageBtn: {
      width: "100%",
      padding: "0.85rem",
      borderRadius: radius.sm,
      backgroundColor: colors.accent,
      color: "#FFFFFF",
      fontFamily: fonts.body,
      fontSize: "0.95rem",
      border: "none",
    },
    textarea: {
      width: "100%",
      padding: "0.7rem 0.9rem",
      borderRadius: radius.sm,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: "0.9rem",
      minHeight: "90px",
      resize: "vertical",
      marginBottom: "0.75rem",
    },
    status: {
      padding: "3rem",
      textAlign: "center",
      fontFamily: fonts.body,
      color: colors.textMuted,
    },
    sent: {
      fontFamily: fonts.body,
      fontSize: "0.88rem",
      color: colors.highlight,
      marginTop: "0.6rem",
    },
    errorText: {
      fontFamily: fonts.body,
      fontSize: "0.85rem",
      color: colors.danger,
      marginTop: "0.6rem",
    },
  };
}

function ListingDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchListingById(id)
      .then((data) => {
        setListing(data);
        setActiveImage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSendError("");

    try {
      await sendMessage(
        { listing_id: listing.id, receiver_id: listing.seller_id, body: draft },
        token
      );
      setSent(true);
      setTimeout(() => navigate("/messages"), 1000);
    } catch (err) {
      setSendError(err.message);
    }
  }

  if (loading) {
    return <p style={styles.status}>Loading listing...</p>;
  }

  if (error || !listing) {
    return (
      <div style={styles.status}>
        <p>This listing no longer exists.</p>
        <Link to="/" style={{ color: colors.accent }}>
          Back to browse
        </Link>
      </div>
    );
  }

  const isOwnListing = user && user.id === listing.seller_id;
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : listing.image_url
      ? [listing.image_url]
      : [];

  return (
    <div style={styles.container}>
      <div>
        {images.length > 0 ? (
          <img src={images[activeImage]} alt={listing.title} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>{listing.category}</div>
        )}

        {images.length > 1 && (
          <div style={styles.thumbRow}>
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`View ${i + 1}`}
                style={styles.thumb(i === activeImage)}
                onClick={() => setActiveImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 style={styles.title}>{listing.title}</h1>
        <p style={styles.price}>KSh {Number(listing.price).toLocaleString()}</p>
        <p style={styles.meta}>
          {listing.condition} · {listing.location}
        </p>
        <p style={styles.description}>{listing.description}</p>

        <div style={styles.sellerBox}>
          <p style={styles.sellerName}>
            <Link to={`/profile/${listing.seller_id}`} style={{ color: colors.text }}>
              View seller's profile
            </Link>
          </p>
          {user && !isOwnListing && (
            <button style={styles.reportLink} onClick={() => setShowReport(true)}>
              Report
            </button>
          )}
        </div>

        {isOwnListing ? (
          <p style={styles.meta}>This is your own listing.</p>
        ) : !user ? (
          <Link
            to="/login"
            style={{
              ...styles.messageBtn,
              display: "block",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Log in to message seller
          </Link>
        ) : showForm ? (
          <form onSubmit={handleSend}>
            <textarea
              style={styles.textarea}
              placeholder="Hi, is this still available?"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
            />
            <button type="submit" style={styles.messageBtn}>
              Send message
            </button>
            {sent && <p style={styles.sent}>Message sent! Redirecting...</p>}
            {sendError && <p style={styles.errorText}>{sendError}</p>}
          </form>
        ) : (
          <button style={styles.messageBtn} onClick={() => setShowForm(true)}>
            Message seller
          </button>
        )}
      </div>

      {showReport && (
        <ReportModal
          listingId={listing.id}
          reportedUserId={listing.seller_id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

export default ListingDetail;