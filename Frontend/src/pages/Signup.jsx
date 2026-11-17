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
  hint: {
    fontFamily: fonts.body,
    fontSize: "0.75rem",
    color: colors.textMuted,
    marginTop: "0.3rem",
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
  agree: {
    fontFamily: fonts.body,
    fontSize: "0.78rem",
    color: colors.textMuted,
    lineHeight: 1.5,
    marginTop: "0.9rem",
    textAlign: "center",
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

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ name, email, password, location });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Create an account</h1>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Full name</label>
          <input
            style={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            minLength={8}
            required
          />
          <p style={styles.hint}>At least 8 characters.</p>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Hostel / location</label>
          <input
            style={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p style={styles.agree}>
          By creating an account, you agree to our{" "}
          <Link to="/terms" style={styles.link}>
            Terms of use
          </Link>{" "}
          and{" "}
          <Link to="/privacy" style={styles.link}>
            Privacy policy
          </Link>
          .
        </p>
      </form>

      <p style={styles.footer}>
        Already have an account?{" "}
        <Link to="/login" style={styles.link}>
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Signup;