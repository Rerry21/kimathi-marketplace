import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAllReports, updateReportStatus } from "../../services/reports";
import { banUser, unbanUser } from "../../services/users";
import ActionModal from "../../components/admin/ActionModal";
import { ui, capitalize, formatDateTime } from "../../components/admin/ui";
import { colors, fonts, radius } from "../../theme";

const FILTERS = ["pending", "resolved", "dismissed", "all"];

const styles = {
  listingBox: {
    display: "flex",
    gap: "0.9rem",
    marginTop: "0.9rem",
    padding: "0.8rem",
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  thumb: {
    width: "72px",
    height: "72px",
    objectFit: "cover",
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  thumbEmpty: {
    width: "72px",
    height: "72px",
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    flexShrink: 0,
  },
  listingTitle: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.9rem",
    color: colors.text,
    wordBreak: "break-word",
  },
  listingMeta: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.textMuted,
    marginTop: "0.15rem",
  },
  listingDesc: {
    fontFamily: fonts.body,
    fontSize: "0.82rem",
    color: colors.textMuted,
    marginTop: "0.35rem",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
};

function shorten(text, length) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function Reports() {
  const { token } = useAuth();
  const { refreshStats } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    return fetchAllReports(token)
      .then((data) => {
        setReports(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id, status) {
    setError("");
    try {
      await updateReportStatus(id, status, token);
      await load();
      refreshStats();
    } catch (err) {
      setError(err.message);
    }
  }

  const counts = {
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
    all: reports.length,
  };

  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div>
      <h1 style={ui.title}>Reports</h1>
      <p style={ui.subtitle}>Review what students have reported and take action.</p>

      <div style={ui.filterRow}>
        {FILTERS.map((f) => (
          <button key={f} style={ui.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {capitalize(f)} ({counts[f]})
          </button>
        ))}
      </div>

      {error && <p style={ui.error}>{error}</p>}
      {loading && <p style={ui.empty}>Loading reports...</p>}

      {!loading && visible.length === 0 && (
        <p style={ui.empty}>No {filter !== "all" ? filter : ""} reports.</p>
      )}

      {!loading &&
        visible.map((report) => (
          <div style={ui.card} key={report.id}>
            <div style={ui.topRow}>
              <p style={ui.heading}>{report.reason}</p>
              <span style={ui.statusTag(report.status)}>{report.status}</span>
            </div>

            <p style={ui.meta}>
              Reported by {report.reported_by_name} ({report.reported_by_email})
              <br />
              {report.reported_user_id && (
                <>
                  About user: {report.reported_user_name} ({report.reported_user_email})
                  <br />
                </>
              )}
              {formatDateTime(report.created_at)}
            </p>

            {report.listing_id && (
              <div style={styles.listingBox}>
                {report.listing_image ? (
                  <img src={report.listing_image} alt="" style={styles.thumb} />
                ) : (
                  <div style={styles.thumbEmpty} />
                )}
                <div>
                  <p style={styles.listingTitle}>{report.listing_title || "Listing"}</p>
                  <p style={styles.listingMeta}>
                    KSh {Number(report.listing_price).toLocaleString()} · {report.listing_status}
                  </p>
                  {report.listing_description && (
                    <p style={styles.listingDesc}>{shorten(report.listing_description, 160)}</p>
                  )}
                </div>
              </div>
            )}

            {report.reported_user_banned && (
              <p style={ui.warn}>This user is currently banned</p>
            )}

            <div style={ui.actions}>
              <button
                style={ui.btn(report.status === "resolved" ? "active" : "neutral")}
                onClick={() => changeStatus(report.id, "resolved")}
              >
                Mark resolved
              </button>
              <button
                style={ui.btn(report.status === "dismissed" ? "active" : "neutral")}
                onClick={() => changeStatus(report.id, "dismissed")}
              >
                Dismiss
              </button>
              <button
                style={ui.btn(report.status === "pending" ? "active" : "neutral")}
                onClick={() => changeStatus(report.id, "pending")}
              >
                Reopen
              </button>

              {report.reported_user_id &&
                (report.reported_user_banned ? (
                  <button style={ui.btn("success")} onClick={() => setModal({ type: "unban", report })}>
                    Unban user
                  </button>
                ) : (
                  <button style={ui.btn("danger")} onClick={() => setModal({ type: "ban", report })}>
                    Ban user
                  </button>
                ))}
            </div>
          </div>
        ))}

      {modal && modal.type === "ban" && (
        <ActionModal
          title={`Ban ${modal.report.reported_user_name}?`}
          description={
            "They will see the reason below and can appeal twice, unless the ban is permanent.\nAll of their listings are hidden, and pending reports about them are resolved."
          }
          label="Reason (shown to the user)"
          placeholder="Why is this account being suspended?"
          required
          maxLength={300}
          checkboxLabel="Permanent ban (no appeals)"
          confirmLabel="Ban user"
          danger
          onConfirm={async ({ text, checked }) => {
            await banUser(
              modal.report.reported_user_id,
              { reason: text, permanent: checked },
              token
            );
            await load();
            refreshStats();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal.type === "unban" && (
        <ActionModal
          title={`Unban ${modal.report.reported_user_name}?`}
          description="Their account and listings will be restored right away."
          confirmLabel="Unban user"
          onConfirm={async () => {
            await unbanUser(modal.report.reported_user_id, token);
            await load();
            refreshStats();
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Reports;