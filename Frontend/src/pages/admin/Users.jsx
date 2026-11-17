import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminUsers } from "../../services/admin";
import { banUser, unbanUser } from "../../services/users";
import ActionModal from "../../components/admin/ActionModal";
import { ui, capitalize, formatDate } from "../../components/admin/ui";
import { colors, fonts } from "../../theme";

const FILTERS = ["all", "active", "banned"];

const styles = {
  tagRow: {
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
    marginTop: "0.45rem",
  },
  tag: (kind) => ({
    fontFamily: fonts.body,
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    padding: "0.15rem 0.5rem",
    borderRadius: "4px",
    backgroundColor: kind === "admin" ? colors.accentMuted : "transparent",
    color: kind === "admin" ? colors.accent : colors.danger,
    border: kind === "admin" ? "none" : `1px solid ${colors.danger}`,
  }),
};

function Users() {
  const { token } = useAuth();
  const { refreshStats } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(
      () => {
        fetchAdminUsers({ search, status }, token)
          .then((data) => {
            if (!cancelled) {
              setUsers(data);
              setError("");
            }
          })
          .catch((err) => {
            if (!cancelled) setError(err.message);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      search ? 300 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, status, token, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
    refreshStats();
  }

  return (
    <div>
      <h1 style={ui.title}>Users</h1>
      <p style={ui.subtitle}>Search every account and suspend or restore it directly.</p>

      <input
        style={ui.input}
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={ui.filterRow}>
        {FILTERS.map((f) => (
          <button key={f} style={ui.filterBtn(status === f)} onClick={() => setStatus(f)}>
            {capitalize(f)}
          </button>
        ))}
      </div>

      {error && <p style={ui.error}>{error}</p>}
      {loading && <p style={ui.empty}>Loading users...</p>}

      {!loading && users.length === 0 && <p style={ui.empty}>No users match that search.</p>}

      {!loading &&
        users.map((person) => (
          <div style={ui.card} key={person.id}>
            <div style={ui.topRow}>
              <div>
                <p style={ui.heading}>{person.name}</p>
                <p style={ui.meta}>
                  {person.email}
                  {person.location ? ` · ${person.location}` : ""}
                </p>
                <div style={styles.tagRow}>
                  {person.is_admin && <span style={styles.tag("admin")}>Admin</span>}
                  {person.is_banned && <span style={styles.tag("banned")}>Banned</span>}
                  {person.is_banned && person.ban_permanent && (
                    <span style={styles.tag("banned")}>Permanent</span>
                  )}
                </div>
              </div>

              {!person.is_admin &&
                (person.is_banned ? (
                  <button style={ui.btn("success")} onClick={() => setModal({ type: "unban", person })}>
                    Unban
                  </button>
                ) : (
                  <button style={ui.btn("danger")} onClick={() => setModal({ type: "ban", person })}>
                    Ban
                  </button>
                ))}
            </div>

            <p style={ui.meta}>
              Joined {formatDate(person.created_at)} · {person.listings_count} listing
              {person.listings_count === 1 ? "" : "s"} · {person.reports_count} report
              {person.reports_count === 1 ? "" : "s"} against
            </p>

            {person.is_banned && (
              <p style={ui.note}>
                Banned {person.banned_at ? formatDate(person.banned_at) : ""}. Reason:{" "}
                {person.ban_reason || "none recorded"}
              </p>
            )}
          </div>
        ))}

      {modal && modal.type === "ban" && (
        <ActionModal
          title={`Ban ${modal.person.name}?`}
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
            await banUser(modal.person.id, { reason: text, permanent: checked }, token);
            reload();
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal.type === "unban" && (
        <ActionModal
          title={`Unban ${modal.person.name}?`}
          description="Their account and listings will be restored right away."
          confirmLabel="Unban user"
          onConfirm={async () => {
            await unbanUser(modal.person.id, token);
            reload();
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default Users;