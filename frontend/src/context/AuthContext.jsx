import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000");

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressCache, setProgressCache] = useState({});

  // Refs to make the callback-based useGoogleLogin Promise-compatible
  const resolveRef = useRef(null);
  const rejectRef = useRef(null);

  // Default fetch options for cross-domain cookies
  const fetchOptions = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };

  // ── Google Login hook (popup-based, gets access_token) ─────────────────────
  const googleLoginHook = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s backend timeout

      try {
        const res = await fetch(`${API}/api/auth/google`, {
          method: "POST",
          ...fetchOptions,
          signal: controller.signal,
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || err.error || "Auth failed");
        }
        const data = await res.json();
        setCurrentUser(data.user);
        resolveRef.current?.(data);
      } catch (err) {
        clearTimeout(timeoutId);
        rejectRef.current?.(err);
      }
    },
    onError: (err) => {
      rejectRef.current?.(new Error(err.error_description || "Google sign-in failed"));
    },
  });

  // Wrap hook in a Promise so components can await it
  function signInWithGoogle() {
    return new Promise((resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;
      googleLoginHook();
    });
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  async function logout() {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        ...fetchOptions,
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setCurrentUser(null);
    setProgressCache({});
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  async function saveUserProfile(data) {
    const res = await fetch(`${API}/api/users/profile`, {
      method: "POST",
      ...fetchOptions,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    const updated = await res.json();
    setCurrentUser(updated);
    return updated;
  }

  // ── Progress ───────────────────────────────────────────────────────────────
  async function getLevelProgress(missionId) {
    if (!currentUser) return { unlockedLevels: [1], completedLevels: [] };

    // Return cached progress if available to avoid 4-second latency
    if (progressCache[missionId]) {
      return progressCache[missionId];
    }

    try {
      const res = await fetch(`${API}/api/progress/${missionId}`, {
        method: "GET",
        ...fetchOptions,
      });
      if (!res.ok) return { unlockedLevels: [1], completedLevels: [] };
      const data = await res.json();

      // Update cache
      setProgressCache(prev => ({ ...prev, [missionId]: data }));

      return data;
    } catch {
      return { unlockedLevels: [1], completedLevels: [] };
    }
  }

  async function saveLevelProgress(missionId, completedLevel) {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API}/api/progress/${missionId}`, {
        method: "POST",
        ...fetchOptions,
        body: JSON.stringify({ completedLevel }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update cache proactively
        setProgressCache(prev => ({ ...prev, [missionId]: data }));
      }
    } catch (err) {
      console.error("Error saving level progress:", err);
    }
  }

  // ── Boot — restore session from HttpOnly cookie ────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/users/profile`, {
      method: "GET",
      ...fetchOptions,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch((err) => console.error("Boot session error:", err))
      .finally(() => setLoading(false));
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    saveUserProfile,
    getLevelProgress,
    saveLevelProgress,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Mission Data...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
