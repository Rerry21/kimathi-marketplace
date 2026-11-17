import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { fetchAdminStats } from "../../services/admin";
import { colors, fonts, radius } from "../../theme";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/appeals", label: "Appeals" },
  { to: "/admin/users", label: "Users" },
];

const styles = {
  shell: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    minHeight: "100vh",
    backgroundColor: colors.bg,
  }),
  sidebar: {
    width: "250px",
    flexShrink: 0,
    backgroundColor: colors.navBg,
    color: colors.navText,
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: colors.navText,
    padding: "0 0.5rem",
  },
  brandTag: {
    display: "inline-block",
    fontFamily: fonts.body,
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    backgroundColor: colors.accent,
    borderRadius: "4px",
    padding: "0.15rem 0.45rem",
    margin: "0.5rem 0.5rem 1.5rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: 1,
  },
  link: (active, isMobile) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.6rem",
    fontFamily: fonts.body,
    fontSize: "0.92rem",
    fontWeight: active ? 600 : 400,
    color: active ? colors.accent : colors.navText,
    backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
    borderRadius: radius.sm,
    padding: "0.65rem 0.75rem",
    whiteSpace: "nowrap",
    flexShrink: isMobile ? 0 : undefined,
  }),
  badge: {
    fontFamily: fonts.body,
    fontSize: "0.68rem",
    fontWeight: 700,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    borderRadius: "999px",
    padding: "0.1rem 0.5rem",
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  signedIn: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.navTextMuted,
    padding: "0 0.5rem",
    wordBreak: "break-word",
  },
  sideBtn: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.navText,
    background: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: radius.sm,
    padding: "0.5rem 0.75rem",
    textAlign: "left",
    cursor: "pointer",
  },
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.navBg,
    padding: "0.9rem 1rem 0.4rem",
  },
  mobileBrand: {
    fontFamily: fonts.heading,
    fontSize: "1rem",
    fontWeight: 700,
    color: colors.navText,
  },
  mobileActions: {
    display: "flex",
    gap: "0.5rem",
  },
  mobileBtn: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.navText,
    background: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: radius.sm,
    padding: "0.35rem 0.7rem",
    cursor: "pointer",
  },
  mobileNav: {
    display: "flex",
    gap: "0.25rem",
    overflowX: "auto",
    backgroundColor: colors.navBg,
    padding: "0.4rem 0.75rem 0.75rem",
  },
  main: (isMobile) => ({
    flex: 1,
    minWidth: 0,
    padding: isMobile ? "1.25rem" : "2.5rem",
  }),
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
};

function AdminLayout() {
  const { user, token, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);

  const handlersRef = useRef({ updateUser, navigate });
  handlersRef.current = { updateUser, navigate };

  const refreshStats = useCallback(() => {
    fetchAdminStats(token)
      .then(setStats)
      .catch((err) => {
        if (err.status === 403) {
          handlersRef.current.updateUser({ is_admin: false });
          handlersRef.current.navigate("/");
        }
      });
  }, [token]);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const counts = {
    "/admin/reports": stats ? stats.pending_reports : 0,
    "/admin/appeals": stats ? stats.pending_appeals : 0,
  };

  const links = NAV_ITEMS.map((item) => {
    const count = counts[item.to] || 0;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        style={({ isActive }) => styles.link(isActive, isMobile)}
      >
        <span>{item.label}</span>
        {count > 0 && <span style={styles.badge}>{count}</span>}
      </NavLink>
    );
  });

  const themeLabel = theme === "light" ? "Dark mode" : "Light mode";

  return (
    <div style={styles.shell(isMobile)}>
      {isMobile ? (
        <>
          <header style={styles.mobileHeader}>
            <span style={styles.mobileBrand}>Moderation</span>
            <div style={styles.mobileActions}>
              <button style={styles.mobileBtn} onClick={toggleTheme}>
                {themeLabel}
              </button>
              <button style={styles.mobileBtn} onClick={handleLogout}>
                Log out
              </button>
            </div>
          </header>
          <nav style={styles.mobileNav}>{links}</nav>
        </>
      ) : (
        <aside style={styles.sidebar}>
          <span style={styles.brand}>Kimathi Marketplace</span>
          <span style={styles.brandTag}>Admin</span>

          <nav style={styles.nav}>{links}</nav>

          <div style={styles.footer}>
            <p style={styles.signedIn}>Signed in as {user.name}</p>
            <button style={styles.sideBtn} onClick={toggleTheme}>
              {themeLabel}
            </button>
            <button style={styles.sideBtn} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </aside>
      )}

      <main style={styles.main(isMobile)}>
        <div style={styles.content}>
          <Outlet context={{ stats, refreshStats }} />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;