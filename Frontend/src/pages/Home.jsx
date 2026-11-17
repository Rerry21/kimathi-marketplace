import { useState, useEffect } from "react";
import { fetchListings } from "../services/listings";
import { categories } from "../data/mockListings";
import { useAuth } from "../context/AuthContext";
import ListingCard from "../components/ListingCard";
import { colors, fonts, radius } from "../theme";
import heroBg from "../assets/hero-bg.jpg";

const styles = {
  hero: {
    minHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `linear-gradient(rgba(20, 18, 15, 0.6), rgba(20, 18, 15, 0.6)), url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "2.5rem",
  },
  heroInner: {
    maxWidth: "700px",
    width: "100%",
    textAlign: "center",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "3.25rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#FFFFFF",
    marginBottom: "0.75rem",
    lineHeight: 1.1,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: "1.1rem",
    color: "#F1EDE4",
    maxWidth: "480px",
    margin: "0 auto",
  },
  searchRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "2.25rem",
  },
  searchInput: {
    flex: 1,
    padding: "0.9rem 1.1rem",
    borderRadius: radius.sm,
    border: "none",
    fontFamily: fonts.body,
    fontSize: "1rem",
    backgroundColor: colors.surface,
    color: colors.text,
  },
  categoryRow: {
    display: "flex",
    gap: "0.6rem",
    marginTop: "1.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  categoryBtn: (active) => ({
    padding: "0.45rem 1rem",
    borderRadius: "999px",
    border: `1px solid ${active ? colors.accent : "rgba(255,255,255,0.5)"}`,
    backgroundColor: active ? colors.accent : "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
  }),
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  grid: {
    marginTop: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "1.25rem",
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: "2rem",
  },
};

function Home() {
  const { user, justSignedUp, clearJustSignedUp } = useAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (justSignedUp) {
      const timeout = setTimeout(() => clearJustSignedUp(), 6000);
      return () => clearTimeout(timeout);
    }
  }, [justSignedUp, clearJustSignedUp]);

  const filtered = listings.filter((listing) => {
    const matchesCategory =
      activeCategory === "All" || listing.category === activeCategory;
    const matchesQuery = listing.title
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  let headline = "Buy and Sell on Campus";
  if (user && justSignedUp) headline = `Welcome, ${user.name}!`;
  else if (user) headline = `Welcome back, ${user.name}`;

  return (
    <div>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heading}>{headline}</h1>
          <p style={styles.tagline}>
            A marketplace for Dedan Kimathi students. Meet up, check the
            item, trade in person.
          </p>

          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search for an item"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.categoryRow}>
            {categories.map((cat) => (
              <button
                key={cat}
                style={styles.categoryBtn(cat === activeCategory)}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {loading && <p style={styles.empty}>Loading listings...</p>}
        {error && <p style={styles.empty}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p style={styles.empty}>No listings match that search yet.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={styles.grid}>
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;