
import React, { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Posts from "./pages/Posts";
import Academic from "./pages/Academic";
import Events from "./pages/Events";
import Resources from "./pages/Resources";
import UserManagement from "./pages/UserManagement";
import FacultyManagement from "./pages/FacultyManagement";

import {
  api,
  clearSession,
  getSavedUser,
  saveSession
} from "./api";

const pageMap = {
  Posts,
  Academic,
  Events,
  Resources,
  "Manage Accounts": UserManagement,
  "Faculty Management": FacultyManagement
};

const roleLabel = (role) =>
  role === "faculty"
    ? "Professor"
    : role.charAt(0).toUpperCase() + role.slice(1);

export default function App() {
  const [user, setUser] = useState(getSavedUser);
  const [page, setPage] = useState("Posts");
  const [registerRole, setRegisterRole] = useState("Student");
  const [showRegister, setShowRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("campus_token"))
  );

  // RESTORE SAVED SESSION
  useEffect(() => {
    if (!localStorage.getItem("campus_token")) return;

    api("/auth/profile")
      .then((data) => {
        setUser(data.user);

        localStorage.setItem(
          "campus_user",
          JSON.stringify(data.user)
        );
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));

  }, []);

  // LOGIN
  const login = async (email, password, selectedRole) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    const expectedRole =
      selectedRole === "Professor"
        ? "faculty"
        : selectedRole.toLowerCase();

    if (data.user.role !== expectedRole) {
      throw new Error(
        `This account is a ${roleLabel(data.user.role)} account. Select the correct workspace.`
      );
    }

    saveSession(data.token, data.user);

    setUser(data.user);
    setPage("Posts");
  };

  // LOGOUT
  const logout = () => {
    clearSession();

    setUser(null);
    setMenuOpen(false);
    setShowRegister(false);
  };

  // REGISTRATION
  const openRegister = (selectedRole) => {
    setRegisterRole(selectedRole);
    setShowRegister(true);
  };

  const registrationDone = (email) => {
    setShowRegister(false);
    setPage("Posts");
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="glass loading-card">
          Checking your campus session…
        </div>
      </div>
    );
  }

  // LOGIN AND REGISTRATION SCREENS
  if (!user) {
    if (showRegister) {
      return (
        <Registration
          role={registerRole}
          onBack={() => setShowRegister(false)}
          onRegistered={registrationDone}
        />
      );
    }

    return (
      <Login
        onLogin={login}
        onRegister={openRegister}
      />
    );
  }

  const Page = pageMap[page] || Posts;

  // DISPLAY ROLE
  const role = roleLabel(user.role);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#e9f4f7,#f1f5f7_52%,#eaf2f5)]">

      {/* AMBIENT BACKGROUND EFFECTS */}

      <div
        className="pointer-events-none fixed -left-[210px] top-[20%] z-0
        h-[440px] w-[440px] rounded-full
        bg-[radial-gradient(circle,rgba(83,194,212,0.25),transparent_68%)]
        blur-[5px]"
      />

      <div
        className="pointer-events-none fixed -right-[230px] top-[2%] z-0
        h-[500px] w-[500px] rounded-full
        bg-[radial-gradient(circle,rgba(129,165,214,0.24),transparent_69%)]
        blur-[5px]"
      />

      <div
        className="pointer-events-none fixed -bottom-[230px] right-[25%] z-0
        h-[420px] w-[420px] rounded-full
        bg-[radial-gradient(circle,rgba(159,190,213,0.18),transparent_69%)]
        blur-[5px]"
      />

      {/* LIQUID ANIMATION */}

      <div className="liquid-scene" aria-hidden="true">

        <div className="liquid-ribbon ribbon-a" />
        <div className="liquid-ribbon ribbon-b" />

        <div className="liquid-orb orb-a" />
        <div className="liquid-orb orb-b" />

        <div className="liquid-drop drop-a" />
        <div className="liquid-drop drop-b" />

      </div>

      {/* NAVBAR */}

      <Navbar
        role={role}
        user={user}
        onMenu={() => setMenuOpen(true)}
        onNavigate={setPage}
      />

      {/* SIDEBAR */}

      <Sidebar
        role={user.role}
        open={menuOpen}
        activePage={page}
        onSelect={(next) => {
          setPage(next);
          setMenuOpen(false);
        }}
        onLogout={logout}
        onClose={() => setMenuOpen(false)}
      />

      {/* MAIN CONTENT */}

      <main className="relative z-[2] pt-[82px]">
        <Page
          role={user.role}
          user={user}
        />
      </main>

    </div>
  );
}
