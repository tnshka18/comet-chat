import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

const DEMO_USERS = [
  { uid: "cometchat-uid-3", name: "Nancy Grace", emoji: "👩" },
  { uid: "cometchat-uid-4", name: "Susan Marie", emoji: "👩‍💼" },
  { uid: "cometchat-uid-5", name: "John Paul", emoji: "👨" },
];

const Login = () => {
  const { login, loading, error } = useAuth();
  const [uid, setUid] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) { setLocalError("Please enter a UID"); return; }
    setLocalError("");
    try { await login(uid); } catch (err: any) { setLocalError(err.message); }
  };

  const handleDemo = async (demoUid: string) => {
    setLocalError("");
    try { await login(demoUid); } catch (err: any) { setLocalError(err.message); }
  };

  const displayError = localError || error;

  return (
    <div className={styles.container}>
      <div className={styles.bg}>
        <div className={styles.grid} />
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 8C4 5.79 5.79 4 8 4h12c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4h-3l-5 4v-4H8c-2.21 0-4-1.79-4-4V8z" fill="url(#logoGrad)"/>
              <circle cx="9" cy="12" r="1.5" fill="#fff" opacity="0.9"/>
              <circle cx="14" cy="12" r="1.5" fill="#fff" opacity="0.9"/>
              <circle cx="19" cy="12" r="1.5" fill="#fff" opacity="0.9"/>
              <defs>
                <linearGradient id="logoGrad" x1="4" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00e5ff"/>
                  <stop offset="1" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>CometChat</span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in with your CometChat UID</p>

        {displayError && (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#ff0066" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11v.5" stroke="#ff0066" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>User ID</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. superhero"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                autoFocus
                autoComplete="off"
                autoCapitalize="none"
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className={styles.divider}><span>or try a demo user</span></div>

        <div className={styles.demoGrid}>
          {DEMO_USERS.map((u) => (
            <button
              key={u.uid}
              className={styles.demoBtn}
              onClick={() => handleDemo(u.uid)}
              disabled={loading}
            >
              <span className={styles.demoEmoji}>{u.emoji}</span>
              <span className={styles.demoName}>{u.name}</span>
            </button>
          ))}
        </div>

        <p className={styles.note}>
          Demo users must exist in your CometChat dashboard
        </p>
      </div>
    </div>
  );
};

export default Login;
