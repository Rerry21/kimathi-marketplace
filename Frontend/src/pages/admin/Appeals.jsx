import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAllAppeals, decideAppeal } from "../../services/appeals";
import ActionModal from "../../components/admin/ActionModal";
import { ui, capitalize, formatDateTime } from "../../components/admin/ui";

const FILTERS = ["pending", "approved", "denied", "all"];

function Appeals() {
  const { token } = useAuth();
  const { refreshStats } = useOutletContext();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    return fetchAllAppeals(token)
      .then((data) => {
        setAppeals(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    pending: appeals.filter((a) => a.status === "pending").length,
    approved: appeals.filter((a) => a.status === "approved").length,
    denied: appeals.filter((a) => a.status === "denied").length,
    all: appeals.length,
  };

  const visible = filter === "all" ? appeals : appeals.filter((a) => a.status === filter);

  return (
    <div>
      <h1 style={ui.title}>Appeals</h1>
      <p style={ui.subtitle}>
        Suspended students can appeal twice. After a second denial, the ban becomes permanent.
      </p>

      <div style={ui.filterRow}>
        {FILTERS.map((f) => (
          <button key={f} style={ui.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {capitalize(f)} ({counts[f]})
          </button>
        ))}
      </div>

      {error && <p style={ui.error}>{error}</p>}
      {loading && <p style={ui.empty}>Loading appeals...</p>}

      {!loading && visible.length === 0 && (
        <p style={ui.empty}>No {filter !== "all" ? filter : ""} appeals.</p>
      )}

      {!loading &&
        visible.map((appeal) => (
          <div style={ui.card} key={appeal.id}>
            <div style={ui.topRow}>
              <p style={ui.heading}>
                {appeal.user_name} ({appeal.user_email})
              </p>
              <span style={ui.statusTag(appeal.status)}>{appeal.status}</span>
            </div>

            <p style={ui.meta}>
              Ban reason: {appeal.ban_reason || "No reason recorded"}
              <br />
              Appeals used this suspension: {appeal.appeals_used} of 2
              <br />
              Submitted {formatDateTime(appeal.created_at)}
            </p>

            <div style={ui.messageBox}>{appeal.message}</div>

            {appeal.ban_permanent && appeal.is_banned && (
              <p style={ui.warn}>This ban is permanent</p>
            )}

            {appeal.status !== "pending" && appeal.admin_reply && (
              <p style={ui.note}>Your reply: {appeal.admin_reply}</p>
            )}

            {appeal.status === "pending" && (
              <div style={ui.actions}>
                <button style={ui.btn("success")} onClick={() => setModal({ type: "approve", appeal })}>
                  Approve and unban
                </button>
                <button style={ui.btn("danger")} onClick={() => setModal({ type: "deny", appeal })}>
                  Deny
                </button>
              </div>
            )}
          </div>
        ))}

      {modal && modal.type === "approve" && (
        <ActionModal
          title={`Approve ${modal.appeal.user_name}'s appeal?`}
          description="This lifts the suspension and restores their listings right away."
          label="Note to the user (optional)"
          placeholder="Anything you want them to know?"
          maxLength={500}
          confirmLabel="Approve and unban"
          onConfirm={async ({ text }) => {
            await decideAppeal(modal.appeal.id, "approved", text, token);
            await load();
            refreshStats();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal.type === "deny" && (
        <ActionModal
          title={`Deny ${modal.appeal.user_name}'s appeal?`}
          description={
            modal.appeal.appeals_used >= 2
              ? "This is their last appeal. Denying it makes the ban permanent."
              : "They will see your reply and can appeal once more."
          }
          label="Reply the user will see"
          placeholder="Explain your decision."
          required
          maxLength={500}
          confirmLabel="Deny appeal"
          danger
          onConfirm={async ({ text }) => {
            await decideAppeal(modal.appeal.id, "denied", text, token);
            await load();
            refreshStats();
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Appeals;