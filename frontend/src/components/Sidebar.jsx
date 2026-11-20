
import React from "react";

const baseItems = [
  
  ["Academic", "◇"],
  ["Posts", "✦"],
  ["Events", "◷"],
  ["Resources", "▱"]
];

export default function Sidebar({
  role,
  open,
  activePage,
  onSelect,
  onLogout,
  onClose
}) {
  const items = [...baseItems];

  if (role === "admin") {
    items.push(
      ["Manage Accounts", "◎"],
      ["Faculty Management", "⌘"]
    );
  }

  const handleNavigation = (page) => {
    onSelect(page);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`side-panel glass ${open ? "open" : ""}`}>

        <div className="side-heading">
          <div className="side-logo">SC</div>

          <div>
            <b>Campus menu</b>
            <small>Move between spaces</small>
          </div>

          <button
            className="close-side"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="side-items">
          {items.map(([name, icon]) => (
            <button
              key={name}
              type="button"
              className={`side-item ${
                activePage === name ? "active" : ""
              }`}
              onClick={() => handleNavigation(name)}
            >
              <span className="side-icon">{icon}</span>
              <span>{name}</span>
              <i>›</i>
            </button>
          ))}
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={onLogout}
        >
          <span className="logout-icon">↪</span>
          <span>Logout</span>
          <i>›</i>
        </button>

        <div className="side-bottom glass">
          <span>✦</span>
          <div>
            <b>Liquid workspace</b>
            <small>Soft, focused and connected</small>
          </div>
        </div>

      </aside>
    </>
  );
}
