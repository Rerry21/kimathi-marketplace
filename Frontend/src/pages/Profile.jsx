import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchListings, updateListing, deleteListing } from "../services/listings";
import { fetchUserById } from "../services/users";
import ReportModal from "../components/ReportModal";
import { colors, fonts, radius } from "../theme";

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: colors.accentMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.heading,
    fontSize: "1.4rem",
    color: colors.accent,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: "1.4rem",
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginTop: "0.2rem",
  },
  headerActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.4rem",
  },
  editLink: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.accent,
  },
  reportLink: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    color: colors.danger,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "1rem",
    color: colors.text,
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "1.25rem",
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: "1rem",
  },
  suspendedBox: {
    border: `1px solid ${colors.border}`,
    borderLeft: `4px solid ${colors.danger}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: "1.25rem 1.5rem",
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    color: colors.textMuted,
    lineHeight: 1.6,
  },
  postLink: {
    display: "inline-block",
    marginTop: "0.5rem",
    padding: "0.6rem 1.1rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontSize: "0.9rem",
  },
  cardWrap: {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    height: "150px",
    backgroundColor: colors.accentMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    color: colors.textMuted,
  },
  cardBody: {
    padding: "0.9rem 1rem",
  },
  cardTitle: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "0.2rem",
  },
  cardPrice: {
    fontFamily: fonts.heading,
    fontSize: "1.05rem",
    color: colors.accent,
    marginBottom: "0.3rem",
  },
  statusTag: (status) => ({
    display: "inline-block",
    fontFamily: fonts.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "0.15rem 0.5rem",
    borderRadius: "999px",
    backgroundColor:
      status === "sold" ? colors.border : status === "reserved" ? colors.accentMuted : colors.accent,
    color: status === "available" ? "#FFFFFF" : colors.textMuted,
    marginBottom: "0.6rem",
  }),
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.6rem",
    flexWrap: "wrap",
  },
  actionBtn: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    padding: "0.35rem 0.6rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: "pointer",
  },
  soldBtn: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    padding: "0.35rem 0.6rem",
    borderRadius: radius.sm,
    border: "none",
    backgroundColor: colors.highlight,
    color: "#FFFFFF",
    cursor: "pointer",
  },
  deleteBtn: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    padding: "0.35rem 0.6rem",
    borderRadius: radius.sm,
    border: "none",
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    cursor: "pointer",
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.danger,
    marginBottom: "1rem",
  },
};

function Profile() {
  const { id } = useParams();
  const { user: loggedInUser, token } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [actionError, setActionError] = useState("");

  const isOwnProfile = loggedInUser && loggedInUser.id === id;
  const isSuspended = !isOwnProfile && profileUser && profileUser.is_banned;
  const visibleListings = isOwnProfile
    ? listings
    : listings.filter((listing) => listing.status !== "sold");

  function loadListings() {
    fetchListings(id).then(setListings);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUserById(id).catch(() => null), fetchListings(id)])
      .then(([userData, sellerListings]) => {
        setProfileUser(userData);
        setListings(sellerListings);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMarkSold(listing) {
    setActionError("");
    try {
      await updateListing(listing.id, { ...listing, status: "sold" }, token);
      loadListings();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete(listing) {
    const confirmed = window.confirm(`Delete "${listing.title}"? This can't be undone.`);
    if (!confirmed) return;
    setActionError("");
    try {
      await deleteListing(listing.id, token);
      loadListings();
    } catch (err) {
      setActionError(err.message);
    }
  }

  const displayName = isOwnProfile ? loggedInUser.name : profileUser?.name || "Student";
  const displayLocation = isOwnProfile ? loggedInUser.location : profileUser?.location;
  const displayPhoto = isOwnProfile
    ? loggedInUser.profile_image_url
    : profileUser?.profile_image_url;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            {displayPhoto ? (
              <img src={displayPhoto} alt={displayName} style={styles.avatarImg} />
            ) : (
              displayName.charAt(0)
            )}
          </div>
          <div>
            <p style={styles.name}>{displayName}</p>
            <p style={styles.meta}>{displayLocation || "Kimathi Marketplace member"}</p>
          </div>
        </div>

        <div style={styles.headerActions}>
          {isOwnProfile && (
            <Link to="/profile/edit" style={styles.editLink}>
              Edit profile
            </Link>
          )}
          {loggedInUser && !isOwnProfile && !isSuspended && (
            <button style={styles.reportLink} onClick={() => setShowReport(true)}>
              Report this user
            </button>
          )}
        </div>
      </div>

      {isSuspended ? (
        <div style={styles.suspendedBox}>
          This account is suspended. Its listings are hidden and it can't be contacted.
        </div>
      ) : (
        <>
          <p style={styles.sectionTitle}>{isOwnProfile ? "Your listings" : "Active listings"}</p>

          {actionError && <p style={styles.errorText}>{actionError}</p>}
          {loading && <p style={styles.empty}>Loading listings...</p>}

          {!loading && visibleListings.length === 0 && (
            <div>
              <p style={styles.empty}>
                {isOwnProfile
                  ? "You haven't posted anything yet."
                  : "This student hasn't posted anything yet."}
              </p>
              {isOwnProfile && (
                <Link to="/post" style={styles.postLink}>
                  Post your first item
                </Link>
              )}
            </div>
          )}

          {!loading && visibleListings.length > 0 && (
            <div style={styles.grid}>
              {visibleListings.map((listing) => (
                <div style={styles.cardWrap} key={listing.id}>
                  <Link to={`/listing/${listing.id}`}>
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.title} style={styles.image} />
                    ) : (
                      <div style={styles.imagePlaceholder}>{listing.category}</div>
                    )}
                  </Link>
                  <div style={styles.cardBody}>
                    {isOwnProfile && (
                      <span style={styles.statusTag(listing.status)}>{listing.status}</span>
                    )}
                    <p style={styles.cardTitle}>{listing.title}</p>
                    <p style={styles.cardPrice}>KSh {Number(listing.price).toLocaleString()}</p>

                    {isOwnProfile && (
                      <div style={styles.actions}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => navigate(`/edit/${listing.id}`)}
                        >
                          Edit
                        </button>
                        {listing.status !== "sold" && (
                          <button style={styles.soldBtn} onClick={() => handleMarkSold(listing)}>
                            Mark as sold
                          </button>
                        )}
                        <button style={styles.deleteBtn} onClick={() => handleDelete(listing)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showReport && <ReportModal reportedUserId={id} onClose={() => setShowReport(false)} />}
    </div>
  );
}

export default Profile;