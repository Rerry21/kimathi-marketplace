import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 403 && localStorage.getItem("token")) {
        const data = await response
          .clone()
          .json()
          .catch(() => null);

        if (
          data &&
          typeof data.error === "string" &&
          data.error.startsWith("Your account has been suspended")
        ) {
          setUser((prev) => {
            if (!prev || prev.is_banned) return prev;
            const next = { ...prev, is_banned: true };
            localStorage.setItem("user", JSON.stringify(next));
            return next;
          });
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  async function signup({ name, email, password, location }) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, location }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");

    setUser(data.user);
    setToken(data.token);
    setJustSignedUp(true);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  async function login({ email, password }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setUser(data.user);
    setToken(data.token);
    setJustSignedUp(false);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  function logout() {
    setUser(null);
    setToken(null);
    setJustSignedUp(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function clearJustSignedUp() {
    setJustSignedUp(false);
  }

  function updateUser(updatedFields) {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        justSignedUp,
        signup,
        login,
        logout,
        clearJustSignedUp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}