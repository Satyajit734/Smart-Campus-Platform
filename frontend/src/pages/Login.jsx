import React, { useState } from "react";

const roles = [
  { name: "Admin", icon: "⌘", caption: "Campus control" },
  { name: "Professor", icon: "◇", caption: "Faculty workspace" },
  { name: "Student", icon: "○", caption: "Student workspace" },
];

export default function Login({ onLogin, onRegister }) {
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await onLogin(email.trim(), password, role);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-ambient login-ambient-a" /><div className="login-ambient login-ambient-b" />
      <div className="login-topbar glass">
        <div className="brand"><div className="brand-mark">SC</div><div><strong>Smart Campus</strong><small>Digital campus workspace</small></div></div>
        <div className="status-pill"><span className="status-dot" />Campus Portal</div>
      </div>

      <div className="login-stage">
        <div className="login-copy">
          <span className="eyebrow">SMART CAMPUS</span>
          <h1>Everything your campus needs, in one calm space.</h1>
          <p>A clean, professional campus interface with a smooth liquid-glass experience across every screen.</p>
          <div className="feature-capsules"><span className="glass capsule">✦ Academic</span><span className="glass capsule">◷ Events</span><span className="glass capsule">▱ Resources</span></div>
        </div>

        <form className="login-card glass" onSubmit={submit}>
          <div className="login-card-shine" />
          <div className="login-heading"><div className="login-icon">SC</div><div><span className="eyebrow">WELCOME BACK</span><h2>Choose your workspace</h2></div></div>

          <div className="role-grid">
            {roles.map((item) => <button key={item.name} type="button" className={`role-card ${role === item.name ? "selected" : ""}`} onClick={() => setRole(item.name)}>
              <span className="role-icon">{item.icon}</span><span className="role-text"><b>{item.name}</b><small>{item.caption}</small></span><span className="role-check">{role === item.name ? "✓" : ""}</span>
            </button>)}
          </div>

          <label htmlFor="login-email">Email address</label>
          <div className="glass-field"><span>◌</span><input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@campus.edu" /></div>
          <label htmlFor="login-password">Password</label>
          <div className="glass-field"><span>⌁</span><input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Enter your password" /></div>

          {error && <div className="form-error">{error}</div>}
          <button className="continue-button" type="submit" disabled={busy}>{busy ? "Signing in…" : `Continue as ${role}`}<span>→</span></button>
          <button className="register-link-button" type="button" onClick={() => onRegister(role)}>Don&apos;t have an account? <b>Create account</b></button>
          <div className="login-note"><span>✦</span><span>Secure, calm and connected campus experience</span></div>
        </form>
      </div>
    </div>
  );
}
