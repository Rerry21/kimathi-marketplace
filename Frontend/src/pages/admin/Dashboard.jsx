import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAllReports } from "../../services/reports";
import { fetchAllAppeals } from "../../services/appeals";
import { ui, formatDateTime } from "../../components/admin/ui";
import { colors, fonts, radius } from "../../theme";

const styles = {
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: (highlight) => ({
    display: "block",
    border: `1px solid ${highlight ? colors.accent : colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: "1.1rem 1.25rem",
  }),
  statLabel: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    color: colors.textMuted,
    marginBottom: "0.4rem",
  },
  statValue: (highlight) => ({
    fontFamily: fonts.heading,
    fontSize: "2rem",
    fontWeight: 700,
    color: highlight ? colors.accent : colors.text,
  }),
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.25rem",
  },
  panel: {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: "1.1rem 1.25rem",
  },
  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  panelTitle: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.95rem",
    color: colors.text,
  },
  panelLink: {
    fontFamily: fonts.body,
    fontSize: "0.82rem",
    color: colors.accent,
  },
  row: {
    padding: "0.7rem 0",
    borderTop: `1px solid ${colors.border}`,
  },
  rowMain: {
    fontFamily: fonts.body,
    fontSize: "0.88rem",
    color: colors.text,
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: "0.76rem",
    color: colors.textMuted,
    marginTop: "0.2rem",
  },
  clear: {
    fontFamily: fonts.body,
    fontSize: "0.88rem",
    color: colors.textMuted,
    padding: "0.5rem 0",
  },
};

function shorten(text, length) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function Dashboard() {
  const { token } = useAuth();
  const { stats } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchAllReports(token), fetchAllAppeals(token)])
      .then(([reportData, appealData]) => {
        setReports(reportData.filter((r) => r.status === "pending").slice(0, 5));
        setAppeals(appealData.filter((a) => a.status === "pending").slice(0, 5));
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const cards = [
    {
      label: "Pending reports",
      value: stats ? stats.pending_reports : "-",
      to: "/admin/reports",
      highlight: stats && stats.pending_reports > 0,
    },
    {
      label: "Pending appeals",
      value: stats ? stats.pending_appeals : "-",
      to: "/admin/appeals",
      highlight: stats && stats.pending_appeals > 0,
    },
    {
      label: "Banned users",
      value: stats ? stats.banned_users : "-",
      to: "/admin/users",
      highlight: false,
    },
    {
      label: "Students",
      value: stats ? stats.total_users : "-",
      to: "/admin/users",
      highlight: false,
    },
    {
      label: "Live listings",
      value: stats ? stats.active_listings : "-",
      to: null,
      highlight: false,
    },
  ];

  return (
    <div>
      <h1 style={ui.title}>Dashboard</h1>
      <p style={ui.subtitle}>What needs your attention right now.</p>

      {error && <p style={ui.error}>{error}</p>}

      <div style={styles.statGrid}>
        {cards.map((card) => {
          const content = (
            <>
              <p style={styles.statLabel}>{card.label}</p>
              <p style={styles.statValue(card.highlight)}>{card.value}</p>
            </>
          );

          return card.to ? (
            <Link key={card.label} to={card.to} style={styles.statCard(card.highlight)}>
              {content}
            </Link>
          ) : (
            <div key={card.label} style={styles.statCard(card.highlight)}>
              {content}
            </div>
          );
        })}
      </div>

      <div style={styles.columns}>
        <div style={styles.panel}>
          <div style={styles.panelHead}>
            <span style={styles.panelTitle}>Latest pending reports</span>
            <Link to="/admin/reports" style={styles.panelLink}>
              View all
            </Link>
          </div>

          {reports.length === 0 && (
            <p style={styles.clear}>Nothing waiting. You're all caught up.</p>
          )}

          {reports.map((report) => (
            <div key={report.id} style={styles.row}>
              <p style={styles.rowMain}>{shorten(report.reason, 90)}</p>
              <p style={styles.rowMeta}>
                About {report.reported_user_name || report.listing_title || "unknown"} ·{" "}
                {formatDateTime(report.created_at)}
              </p>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHead}>
            <span style={styles.panelTitle}>Latest pending appeals</span>
            <Link to="/admin/appeals" style={styles.panelLink}>
              View all
            </Link>
          </div>

          {appeals.length === 0 && (
            <p style={styles.clear}>Nothing waiting. You're all caught up.</p>
          )}

          {appeals.map((appeal) => (
            <div key={appeal.id} style={styles.row}>
              <p style={styles.rowMain}>{shorten(appeal.message, 90)}</p>
              <p style={styles.rowMeta}>
                {appeal.user_name} · {formatDateTime(appeal.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;