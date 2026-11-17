import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAllReports, updateReportStatus } from "../services/reports";
import { fetchAllAppeals, decideAppeal } from "../services/appeals";
import { banUser, unbanUser } from "../services/users";
import { colors, fonts, radius } from "../theme";

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2.5rem",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "1.8rem",
    color: colors.text,
    marginBottom: "1.5rem",
  },
  tabRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
  },
  tabBtn: (active) => ({
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    fontWeight: active ? 600 : 400,
    padding: "0.6rem 1rem",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? colors.accent : "transparent"}`,
    color: active ? colors.accent : colors.textMuted,
    cursor: "pointer",
    marginBottom: "-1px",
  }),
  tabCount: {
    marginLeft: "0.4rem",
    fontSize: "0.72rem",
    fontWeight: 700,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    borderRadius: "999px",
    padding: "0.1rem 0.45rem",
  },
  filterRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  filterBtn: (active) => ({
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    border: `1px solid ${active ? colors.accent : colors.border}`,
    backgroundColor: active ? colors.accent : "transparent",
    color: active ? "#FFFFFF" : colors.textMuted,
    cursor: "pointer",
  }),
  card: {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    padding: "1.25rem",
    marginBottom: "1rem",
    backgroundColor: colors.surface,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  reason: {
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.95rem",
    color: colors.text,
  },
  statusTag: (status) => ({
    fontFamily: fonts.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    backgroundColor:
      status === "resolved" || status === "approved"
        ? colors.highlight
        : status === "denied"
        ? colors.danger
        : status === "dismissed"
        ? colors.border
        : colors.accent,
    color: status === "dismissed" ? colors.textMuted : "#FFFFFF",
    textTransform: "capitalize",
  }),
  meta: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginTop: "0.5rem",
    lineHeight: 1.6,
  },
  link: {
    color: colors.accent,
  },
  messageBox: {
    fontFamily: fonts.body,
    fontSize: "0.9rem",
    color: colors.text,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: "0.8rem 1rem",
    marginTop: "0.8rem",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  replyBox: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginTop: "0.7rem",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.9rem",
    flexWrap: "wrap",
  },
  actionBtn: (active) => ({
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: active ? colors.accentMuted : colors.surface,
    color: colors.text,
    cursor: "pointer",
  }),
  banBtn: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    borderRadius: radius.sm,
    border: "none",
    backgroundColor: colors.danger,
    color: "#FFFFFF",
    cursor: "pointer",
  },
  unbanBtn: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.highlight,
    cursor: "pointer",
  },
  approveBtn: {
    fontFamily: fonts.body,
    fontSize: "0.8rem",
    padding: "0.4rem 0.8rem",
    borderRadius: radius.sm,
    border: "none",
    backgroundColor: colors.highlight,
    color: "#FFFFFF",
    cursor: "pointer",
  },
  tagDanger: {
    fontFamily: fonts.body,
    fontSize: "0.72rem",
    fontWeight: 600,
    color: colors.danger,
    marginTop: "0.5rem",
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    padding: "2rem",
    textAlign: "center",
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.danger,
    marginBottom: "1rem",
  },
};

const REPORT_FILTERS = ["pending", "resolved", "dismissed", "all"];
const APPEAL_FILTERS = ["pending", "approved", "denied", "all"];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function AdminReports() {
  const { user, token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState("pending");
  const [appealFilter, setAppealFilter] = useState("pending");
  const [actionError, setActionError] = useState("");

  function loadAll() {
    if (!token) return;
    Promise.all([fetchAllReports(token), fetchAllAppeals(token)])
      .then(([reportData, appealData]) => {
        setReports(reportData);
        setAppeals(appealData);
      })
      .catch((err) => setActionError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user && user.is_admin) loadAll();
  }, [user && user.is_admin, token]);

  if (authLoading) return <p style={styles.empty}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;

  async function runAction(action) {
    setActionError("");
    try {
      await action();
      loadAll();
    } catch (err) {
      setActionError(err.message);
    }
  }

  function handleStatusChange(id, status) {
    runAction(() => updateReportStatus(id, status, token));
  }

  function handleBan(report) {
    const reason = window.prompt(
      `Ban ${report.reported_user_name}? Write the reason they will see:`
    );
    if (reason === null) return;

    if (!reason.trim()) {
      setActionError("A ban reason is required.");
      return;
    }

    const permanent = window.confirm(
      "Make this ban PERMANENT, with no appeals?\n\nOK = permanent.\nCancel = a normal ban the user can appeal twice."
    );

    runAction(() => banUser(report.reported_user_id, { reason, permanent }, token));
  }

  function handleUnban(report) {
    const confirmed = window.confirm(`Unban ${report.reported_user_name}?`);
    if (!confirmed) return;
    runAction(() => unbanUser(report.reported_user_id, token));
  }

  function handleApprove(appeal) {
    const note = window.prompt(
      `Approve ${appeal.user_name}'s appeal and lift the suspension?\n\nOptional note to the user:`
    );
    if (note === null) return;
    runAction(() => decideAppeal(appeal.id, "approved", note, token));
  }

  function handleDeny(appeal) {
    const lastAppeal = appeal.appeals_used >= 2;
    const reply = window.prompt(
      `Deny ${appeal.user_name}'s appeal? Write the reply they will see.${
        lastAppeal ? "\n\nThis is their last appeal. Denying it makes the ban permanent." : ""
      }`
    );
    if (reply === null) return;

    if (!reply.trim()) {
      setActionError("A reply is required to deny an appeal.");
      return;
    }

    runAction(() => decideAppeal(appeal.id, "denied", reply, token));
  }

  const filteredReports =
    reportFilter === "all" ? reports : reports.filter((r) => r.status === reportFilter);
  const filteredAppeals =
    appealFilter === "all" ? appeals : appeals.filter((a) => a.status === appealFilter);

  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const pendingAppeals = appeals.filter((a) => a.status === "pending").length;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Moderation</h1>

      <div style={styles.tabRow}>
        <button style={styles.tabBtn(tab === "reports")} onClick={() => setTab("reports")}>
          Reports
          {pendingReports > 0 && <span style={styles.tabCount}>{pendingReports}</span>}
        </button>
        <button style={styles.tabBtn(tab === "appeals")} onClick={() => setTab("appeals")}>
          Appeals
          {pendingAppeals > 0 && <span style={styles.tabCount}>{pendingAppeals}</span>}
        </button>
      </div>

      {actionError && <p style={styles.errorText}>{actionError}</p>}
      {loading && <p style={styles.empty}>Loading...</p>}

      {!loading && tab === "reports" && (
        <>
          <div style={styles.filterRow}>
            {REPORT_FILTERS.map((f) => (
              <button
                key={f}
                style={styles.filterBtn(reportFilter === f)}
                onClick={() => setReportFilter(f)}
              >
                {capitalize(f)}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <p style={styles.empty}>
              No {reportFilter !== "all" ? reportFilter : ""} reports.
            </p>
          )}

          {filteredReports.map((report) => (
            <div style={styles.card} key={report.id}>
              <div style={styles.topRow}>
                <p style={styles.reason}>{report.reason}</p>
                <span style={styles.statusTag(report.status)}>{report.status}</span>
              </div>

              <p style={styles.meta}>
                Reported by {report.reported_by_name} ({report.reported_by_email})
                <br />
                {report.listing_id && (
                  <>
                    About listing:{" "}
                    {report.reported_user_banned ? (
                      <span>{report.listing_title || "Hidden listing"}</span>
                    ) : (
                      <Link to={`/listing/${report.listing_id}`} style={styles.link}>
                        {report.listing_title || "View listing"}
                      </Link>
                    )}
                    <br />
                  </>
                )}
                {report.reported_user_id && (
                  <>
                    About user: {report.reported_user_name} ({report.reported_user_email})
                    <br />
                  </>
                )}
                {new Date(report.created_at).toLocaleString()}
              </p>

              {report.reported_user_banned && (
                <p style={styles.tagDanger}>This user is currently banned</p>
              )}

              <div style={styles.actions}>
                <button
                  style={styles.actionBtn(report.status === "resolved")}
                  onClick={() => handleStatusChange(report.id, "resolved")}
                >
                  Mark resolved
                </button>
                <button
                  style={styles.actionBtn(report.status === "dismissed")}
                  onClick={() => handleStatusChange(report.id, "dismissed")}
                >
                  Dismiss
                </button>
                <button
                  style={styles.actionBtn(report.status === "pending")}
                  onClick={() => handleStatusChange(report.id, "pending")}
                >
                  Reopen
                </button>

                {report.reported_user_id &&
                  (report.reported_user_banned ? (
                    <button style={styles.unbanBtn} onClick={() => handleUnban(report)}>
                      Unban user
                    </button>
                  ) : (
                    <button style={styles.banBtn} onClick={() => handleBan(report)}>
                      Ban user
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && tab === "appeals" && (
        <>
          <div style={styles.filterRow}>
            {APPEAL_FILTERS.map((f) => (
              <button
                key={f}
                style={styles.filterBtn(appealFilter === f)}
                onClick={() => setAppealFilter(f)}
              >
                {capitalize(f)}
              </button>
            ))}
          </div>

          {filteredAppeals.length === 0 && (
            <p style={styles.empty}>
              No {appealFilter !== "all" ? appealFilter : ""} appeals.
            </p>
          )}

          {filteredAppeals.map((appeal) => (
            <div style={styles.card} key={appeal.id}>
              <div style={styles.topRow}>
                <p style={styles.reason}>
                  {appeal.user_name} ({appeal.user_email})
                </p>
                <span style={styles.statusTag(appeal.status)}>{appeal.status}</span>
              </div>

              <p style={styles.meta}>
                Ban reason: {appeal.ban_reason || "No reason recorded"}
                <br />
                Appeals used this suspension: {appeal.appeals_used} of 2
                <br />
                Submitted {new Date(appeal.created_at).toLocaleString()}
              </p>

              <div style={styles.messageBox}>{appeal.message}</div>

              {appeal.ban_permanent && appeal.is_banned && (
                <p style={styles.tagDanger}>This ban is permanent</p>
              )}

              {!appeal.is_banned && appeal.status === "pending" && (
                <p style={styles.tagDanger}>This user is no longer banned</p>
              )}

              {appeal.status !== "pending" && appeal.admin_reply && (
                <p style={styles.replyBox}>Your reply: {appeal.admin_reply}</p>
              )}

              {appeal.status === "pending" && (
                <div style={styles.actions}>
                  <button style={styles.approveBtn} onClick={() => handleApprove(appeal)}>
                    Approve and unban
                  </button>
                  <button style={styles.banBtn} onClick={() => handleDeny(appeal)}>
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AdminReports;