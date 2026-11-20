
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function UserManagement({ role }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // NORMALIZE ROLE
  const normalizedRole = String(role || "").toLowerCase();

  const isAdmin = normalizedRole === "admin";

  // LOAD USERS
  const load = async () => {
    try {
      setError("");

      const data = await api("/auth/users");

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // CHANGE USER ROLE
  const changeRole = async (id, nextRole) => {
    try {
      setBusy(true);
      setError("");

      await api(`/auth/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({
          role: nextRole
        })
      });

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ACTIVATE / DEACTIVATE USER
  const toggle = async (user) => {
    try {
      setBusy(true);
      setError("");

      await api(`/auth/users/${user._id}/details`, {
        method: "PUT",
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // DELETE USER
  const remove = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmDelete) return;

    try {
      setBusy(true);
      setError("");

      await api(`/auth/users/${user._id}`, {
        method: "DELETE"
      });

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ACCESS CONTROL
  if (!isAdmin) {
    return (
      <section className="page-section">
        <div className="content-card glass">
          <h3>Access Denied</h3>
          <p>Only administrators can manage accounts.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">

      {/* PAGE HEADER */}
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>

          <h1>Manage Accounts</h1>

          <p>
            Manage student, faculty and administrator accounts.
          </p>

          <div className="hero-mini-row">
            <span className="glass mini-pill">
              ✦ {role}
            </span>

            <span className="glass mini-pill">
              ● {users.length} Accounts
            </span>
          </div>
        </div>

        <div className="hero-sculpture" aria-hidden="true">
          <div className="sculpture-core" />
          <div className="sculpture-ring" />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="form-error page-error">
          {error}
        </div>
      )}

      {/* USER TABLE */}
      <div className="table-card glass">

        <div className="table-head">
          <b>All Accounts</b>
          <span>{users.length} users</span>
        </div>

        <div className="table-wrap">

          {loading ? (
            <p>Loading accounts...</p>
          ) : users.length === 0 ? (
            <p>No user accounts found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>

                    <td>{item.name}</td>

                    <td>{item.email}</td>

                    {/* CHANGE ROLE */}
                    <td>
                      <select
                        disabled={busy}
                        value={item.role}
                        onChange={(e) =>
                          changeRole(item._id, e.target.value)
                        }
                      >
                        <option value="student">
                          Student
                        </option>

                        <option value="faculty">
                          Faculty
                        </option>

                        <option value="admin">
                          Admin
                        </option>
                      </select>
                    </td>

                    {/* ACCOUNT STATUS */}
                    <td>
                      <button
                        className="status-button"
                        type="button"
                        disabled={busy}
                        onClick={() => toggle(item)}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* DELETE ACCOUNT */}
                    <td>
                      <button
                        className="danger-button"
                        type="button"
                        disabled={busy}
                        onClick={() => remove(item)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

    </section>
  );
}
