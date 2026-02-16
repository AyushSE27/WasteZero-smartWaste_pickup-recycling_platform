import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="auth-shell">
        <header className="auth-topbar">
          <Link to="/login" className="brand">
            WasteZero
          </Link>
          <button onClick={toggleTheme}>{theme === "light" ? "Dark" : "Light"} mode</button>
        </header>
        <main className="auth-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand-row">
          <span className="logo-mark">WZ</span>
          <Link to="/dashboard" className="brand" onClick={() => setSidebarOpen(false)}>
            WasteZero
          </Link>
        </div>

        <div className="user-card">
          <div className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <strong>{user.name}</strong>
            <p className="sidebar-subtitle">{user.role}</p>
          </div>
        </div>

        <p className="menu-title">MAIN MENU</p>
        <nav className="navlinks">
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/pickup" onClick={() => setSidebarOpen(false)}>
            Schedule Pickup
          </NavLink>
          <NavLink to="/opportunities" onClick={() => setSidebarOpen(false)}>
            Opportunities
          </NavLink>
          <NavLink to="/messages" onClick={() => setSidebarOpen(false)}>
            Messages
          </NavLink>
          <a href="#" onClick={(e) => e.preventDefault()}>
            My Impact
          </a>
        </nav>

        <p className="menu-title">SETTINGS</p>
        <nav className="navlinks">
          <NavLink to="/profile" onClick={() => setSidebarOpen(false)}>
            My Profile
          </NavLink>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Settings
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Help & Support
          </a>
          {user.role === "admin" && (
            <NavLink to="/admin" onClick={() => setSidebarOpen(false)}>
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="dark-toggle-row">
            <span>Dark Mode</span>
            <button onClick={toggleTheme}>{theme === "light" ? "On" : "Off"}</button>
          </div>
          <button className="danger-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen((v) => !v)}>
            =
          </button>
          <div className="search-wrap">
            <input placeholder="Search pickups, opportunities..." />
          </div>
          <div className="actions">
            <span className="icon-btn">o</span>
            <span className="icon-user">{user.name?.[0]?.toLowerCase()}</span>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>

      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/pickup">Schedule</NavLink>
        <NavLink to="/opportunities">Volunteer</NavLink>
        <NavLink to="/messages">Chat</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default AppLayout;
