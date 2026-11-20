
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Academic({ role }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userRole = String(role || "").toLowerCase();

  const dashboardPath = {
    student: "/dashboard/student",
    faculty: "/dashboard/faculty",
    admin: "/dashboard/admin"
  }[userRole];

  // FETCH DASHBOARD DATA
  useEffect(() => {
    const loadDashboard = async () => {
      if (!dashboardPath) {
        setError("Invalid user role.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await api(dashboardPath);

        setDashboard(data.dashboard);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [dashboardPath]);

  // LOADING
  if (loading) {
    return (
      <section className="page-section">
        <div className="content-card glass">
          Loading academic dashboard...
        </div>
      </section>
    );
  }

  // ERROR
  if (error) {
    return (
      <section className="page-section">
        <div className="page-hero glass">
          <div>
            <span className="eyebrow">ACADEMICS</span>
            <h1>Dashboard</h1>
            <p>{error}</p>

            <button
              className="continue-button small-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!dashboard) return null;

  const isAdmin = userRole === "admin";

  // STUDENT / FACULTY STATISTICS
  const userStats = [
    {
      title: "Total Posts",
      value: dashboard.totalPosts,
      icon: "▤"
    },
    {
      title: "Total Comments",
      value: dashboard.totalComments,
      icon: "◇"
    },
    {
      title: "Total Likes",
      value: dashboard.totalLikes,
      icon: "♥"
    }
  ];

  // ADMIN STATISTICS
  const adminStats = [
    {
      title: "Total Users",
      value: dashboard.totalUsers,
      icon: "♙"
    },
    {
      title: "Students",
      value: dashboard.totalStudents,
      icon: "♧"
    },
    {
      title: "Faculty",
      value: dashboard.totalFaculty,
      icon: "♙"
    },
    {
      title: "Total Posts",
      value: dashboard.totalPosts,
      icon: "▤"
    },
    {
      title: "Total Comments",
      value: dashboard.totalComments,
      icon: "◇"
    }
  ];

  const stats = isAdmin ? adminStats : userStats;

  const recentPosts = dashboard.recentPosts || [];
  const recentUsers = dashboard.recentUsers || [];

  return (
    <section className="page-section">

      {/* PAGE HEADER */}
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">ACADEMICS</span>

          <h1>Dashboard</h1>

          <p>
            Your campus activity and academic workspace
            connected to Campus Connect.
          </p>

          <div className="hero-mini-row">
            <span className="glass mini-pill">
              ✦ {userRole}
            </span>

            <span className="glass mini-pill">
              ● Live Data
            </span>
          </div>
        </div>

        <div className="hero-sculpture" aria-hidden="true">
          <div className="sculpture-core" />
          <div className="sculpture-ring" />
        </div>
      </div>

      {/* PROFILE */}
      {!isAdmin && dashboard.profile && (
        <div className="content-card glass">
          <div className="content-icon">♙</div>

          <div>
            <span className="card-kicker">MY PROFILE</span>

            <h3>{dashboard.profile.name}</h3>

            <p>{dashboard.profile.email}</p>

            <p>
              Role: {dashboard.profile.role}
            </p>

            {dashboard.profile.department && (
              <p>
                Department: {dashboard.profile.department}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STATISTICS */}
      <div className="content-grid">
        {stats.map((item) => (
          <article className="content-card glass" key={item.title}>
            <div className="content-icon">
              {item.icon}
            </div>

            <div>
              <span className="card-kicker">
                {item.title.toUpperCase()}
              </span>

              <h3>{item.value ?? 0}</h3>

              <p>{item.title} overview</p>
            </div>
          </article>
        ))}
      </div>

      {/* ADMIN RECENT USERS */}
      {isAdmin && (
        <div className="content-card glass">
          <div>
            <span className="card-kicker">USER MANAGEMENT</span>
            <h3>Recent Users</h3>

            {recentUsers.length === 0 ? (
              <p>No recent users found.</p>
            ) : (
              <div className="post-list">
                {recentUsers.map((recentUser) => (
                  <div
                    className="post-meta"
                    key={recentUser._id}
                  >
                    <div className="avatar">
                      {recentUser.name?.slice(0, 1).toUpperCase() || "U"}
                    </div>

                    <div>
                      <b>{recentUser.name}</b>
                      <small>{recentUser.email}</small>
                      <small>{recentUser.role}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT POSTS */}
      <div className="content-card glass">
        <div>
          <span className="card-kicker">CAMPUS ACTIVITY</span>

          <h3>Recent Posts</h3>

          {recentPosts.length === 0 ? (
            <p>No recent posts available.</p>
          ) : (
            <div className="post-list">
              {recentPosts.map((post) => (
                <article
                  className="post-card glass"
                  key={post._id}
                >
                  <div className="post-meta">
                    <div className="avatar">
                      {post.author?.name?.slice(0, 1).toUpperCase() || "C"}
                    </div>

                    <div>
                      <b>{post.author?.name || "Campus User"}</b>

                      <small>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  </div>

                  <h3>{post.title}</h3>

                  <p>{post.content}</p>

                  <div className="post-actions">
                    <span>
                      ♥ {post.likes?.length || 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
