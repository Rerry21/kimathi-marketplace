import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, radius } from "../theme";

const styles = {
  container: {
    maxWidth: "380px",
    margin: "0 auto",
    padding: "4rem 1rem",
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: "1.7rem",
    color: colors.text,
    marginBottom: "1.75rem",
  },
  field: {
    marginBottom: "1.1rem",
  },
  label: {
    display: "block",
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginBottom: "0.35rem",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: "0.95rem",
  },
  submitBtn: {
    width: "100%",
    padding: "0.85rem",
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    border: "none",
    fontFamily: fonts.body,
    fontSize: "0.95rem",
    marginTop: "0.5rem",
  },
  error: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.danger,
    marginBottom: "1rem",
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: "0.85rem",
    color: colors.textMuted,
    marginTop: "1.25rem",
    textAlign: "center",
  },
  link: {
    color: colors.accent,
  },
};

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      navigate(data.user.is_admin ? "/admin/reports" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Log in</h1>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={styles.footer}>
        New here?{" "}
        <Link to="/signup" style={styles.link}>
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default Login;