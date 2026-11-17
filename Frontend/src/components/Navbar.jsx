import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchUnreadCount } from "../services/messages";
import { useIsMobile } from "../hooks/useIsMobile";
import { colors, fonts, radius } from "../theme";

const styles = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.1rem 1.5rem",
    backgroundColor: colors.navBg,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontFamily: fonts.heading,
    fontSize: "1.3rem",
    fontWeight: 700,
    color: colors.navText,
    textShadow: `0 0 20px rgba(193, 86, 31, 0.5)`,
    whiteSpace: "nowrap",
  },
  links: {
    display: "flex",
    gap: "2rem",
  },
  link: (active) => ({
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: active ? colors.accent : colors.navTextMuted,
    fontWeight: active ? 600 : 400,
    borderBottom: active ? `2px solid ${colors.accent}` : "2px solid transparent",
    paddingBottom: "0.3rem",
  }),
  auth: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  loginLink: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.navText,
  },
  sellBtn: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    padding: "0.55rem 1.1rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    color: colors.navText,
  },
  logoutBtn: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.navTextMuted,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  messagesLink: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    fontSize: "0.65rem",
    fontFamily: fonts.body,
    fontWeight: 700,
    borderRadius: "999px",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
  },
  themeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "0.3rem",
  },
  hamburgerBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.4rem",
    display: "flex",
  },
  mobilePanel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.navBg,
    display: "flex",
    flexDirection: "column",
    padding: "1rem 1.5rem 1.5rem",
    gap: "1rem",
    borderTop: `1px solid rgba(255,255,255,0.1)`,
  },
  mobileLink: (active) => ({
    fontFamily: fonts.body,
    fontSize: "1rem",
    color: active ? colors.accent : colors.navText,
    fontWeight: active ? 600 : 400,
  }),
  mobileDivider: {
    borderTop: `1px solid rgba(255,255,255,0.1)`,
    margin: "0.25rem 0",
  },
};

const navItems = [
  { to: "/", label: "Browse" },
  { to: "/how-to-use", label: "How it works" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
];

function MessageIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 4h16v14H5.2L4 19.2V4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HamburgerIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ color }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ color }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Navbar() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(1000);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;

    function loadCount() {
      fetchUnreadCount(token).then((data) => setUnreadCount(data.count));
    }

    loadCount();
    const interval = setInterval(loadCount, 5000);
    return () => clearInterval(interval);
  }, [token, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const ThemeToggle = (
    <button style={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? <MoonIcon color={colors.navText} /> : <SunIcon color={colors.navText} />}
    </button>
  );

  if (isMobile) {
    return (
      <header style={{ ...styles.bar, position: "relative" }}>
        <Link to="/" style={styles.logo}>
          Kimathi Marketplace
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          {ThemeToggle}
          {user && (
            <Link to="/messages" style={styles.messagesLink}>
              <MessageIcon color={colors.navText} />
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </Link>
          )}
          <button style={styles.hamburgerBtn} onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <CloseIcon color={colors.navText} /> : <HamburgerIcon color={colors.navText} />}
          </button>
        </div>

        {menuOpen && (
          <div style={styles.mobilePanel}>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} style={styles.mobileLink(location.pathname === item.to)}>
                {item.label}
              </Link>
            ))}

            <div style={styles.mobileDivider} />

            {user ? (
              <>
                <Link to={`/profile/${user.id}`} style={styles.mobileLink(false)}>
                  My Profile
                </Link>
                <Link to="/post" style={styles.mobileLink(false)}>
                  Sell an item
                </Link>
                <button
                  style={{ ...styles.logoutBtn, textAlign: "left", fontSize: "1rem" }}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.mobileLink(false)}>
                  Log in
                </Link>
                <Link to="/signup" style={styles.mobileLink(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    );
  }

  return (
    <header style={styles.bar}>
      <Link to="/" style={styles.logo}>
        Kimathi Marketplace
      </Link>

      <nav style={styles.links}>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={styles.link(location.pathname === item.to)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={styles.auth}>
        {ThemeToggle}
        {user ? (
          <>
            <Link to="/messages" style={styles.messagesLink}>
              <MessageIcon color={location.pathname === "/messages" ? colors.accent : colors.navText} />
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </Link>
            <Link to={`/profile/${user.id}`} style={styles.greeting}>
              My Profile
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log out
            </button>
            <Link to="/post" style={styles.sellBtn}>
              Sell an item
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.loginLink}>
              Log in
            </Link>
            <Link to="/signup" style={styles.sellBtn}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;