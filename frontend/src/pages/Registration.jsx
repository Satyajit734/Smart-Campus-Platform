
import React, { useState } from "react";
import { api } from "../api";

export default function Registration({ role, onBack, onRegistered }) {
  // NORMALIZE ROLE
  const normalizedRole = String(role || "").toLowerCase();
  const isAdmin = normalizedRole === "admin";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: ""
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // HANDLE INPUT
  const update = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // REGISTER ACCOUNT
  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password) {
      setError("Enter your name, email and password.");
      return;
    }

    if (isAdmin && !form.secretKey.trim()) {
      setError("Enter the admin secret key.");
      return;
    }

    if (isAdmin && form.password.length < 8) {
      setError("Admin password must be at least 8 characters.");
      return;
    }

    try {
      setBusy(true);

      const path = isAdmin
        ? "/auth/admin/register"
        : "/auth/register";

      const body = isAdmin
        ? {
            name,
            email,
            password: form.password,
            secretKey: form.secretKey
          }
        : {
            name,
            email,
            password: form.password
          };

      await api(path, {
        method: "POST",
        body: JSON.stringify(body)
      });

      onRegistered(email);

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">

      <div className="login-ambient login-ambient-a" />
      <div className="login-ambient login-ambient-b" />

      {/* TOP BAR */}
      <div className="login-topbar glass">

        <div className="brand">
          <div className="brand-mark">SC</div>

          <div>
            <strong>Smart Campus</strong>
            <small>Digital campus workspace</small>
          </div>
        </div>

        <div className="status-pill">
          <span className="status-dot" />
          Campus Portal
        </div>

      </div>

      <div className="login-stage">

        {/* LEFT CONTENT */}
        <div className="login-copy">

          <span className="eyebrow">
            SMART CAMPUS
          </span>

          <h1>
            Create your campus account.
          </h1>

          <p>
            Join the Smart Campus workspace with the same
            smooth liquid-glass experience.
          </p>

          <div className="feature-capsules">
            <span className="glass capsule">
              ✦ Academic
            </span>

            <span className="glass capsule">
              ◷ Events
            </span>

            <span className="glass capsule">
              ▱ Resources
            </span>
          </div>

        </div>

        {/* REGISTRATION FORM */}
        <form
          className="login-card glass"
          onSubmit={submit}
        >

          <div className="login-card-shine" />

          <div className="login-heading">

            <div className="login-icon">
              SC
            </div>

            <div>
              <span className="eyebrow">
                CREATE ACCOUNT
              </span>

              <h2>
                {isAdmin
                  ? "Create admin account"
                  : "Create student account"}
              </h2>
            </div>

          </div>

          {/* NAME */}
          <label htmlFor="register-name">
            Full name
          </label>

          <div className="glass-field">
            <span>◌</span>

            <input
              id="register-name"
              name="name"
              value={form.name}
              onChange={update}
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
            />
          </div>

          {/* EMAIL */}
          <label htmlFor="register-email">
            Email address
          </label>

          <div className="glass-field">
            <span>◌</span>

            <input
              id="register-email"
              name="email"
              value={form.email}
              onChange={update}
              type="email"
              autoComplete="email"
              placeholder="you@campus.edu"
              required
            />
          </div>

          {/* PASSWORD */}
          <label htmlFor="register-password">
            Password
          </label>

          <div className="glass-field">
            <span>⌁</span>

            <input
              id="register-password"
              name="password"
              value={form.password}
              onChange={update}
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
            />
          </div>

          {/* ADMIN SECRET KEY */}
          {isAdmin && (
            <>
              <label htmlFor="register-secret">
                Admin secret key
              </label>

              <div className="glass-field">
                <span>⌘</span>

                <input
                  id="register-secret"
                  name="secretKey"
                  value={form.secretKey}
                  onChange={update}
                  type="password"
                  placeholder="Enter admin secret key"
                  required
                />
              </div>
            </>
          )}

          {/* ERROR */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            className="continue-button"
            type="submit"
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
            <span>→</span>
          </button>

          {/* BACK */}
          <button
            className="register-link-button"
            type="button"
            onClick={onBack}
            disabled={busy}
          >
            ← Back to login
          </button>

          <div className="login-note">
            <span>✦</span>
            <span>
              Secure, calm and connected campus experience
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}
