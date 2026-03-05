import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaLeaf,
  FaComments,
  FaChartBar,
  FaUser,
  FaCog,
  FaMoon,
  FaSun,
  FaBars,
  FaBell,
} from "react-icons/fa";
import "./dashboard.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={`dashboard ${collapsed ? "collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>♻ {collapsed ? "" : "WasteZero"}</h2>
          <FaBars
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

          <nav>
          <NavLink to="/dashboard">
            <FaTachometerAlt /> {!collapsed && "Dashboard"}
          </NavLink>
          {role === "volunteer" && (
          <NavLink to="/schedule">
            <FaCalendarAlt /> {!collapsed && "Schedule Pickup"}
          </NavLink>
          )}

          {role==="admin" &&(
           <NavLink to = "/admin-pickups">
            <FaCalendarAlt/> {!collapsed && "Schedule Pickup"}
           </NavLink>
          )}

          <NavLink to="/opportunities">
            <FaLeaf /> {!collapsed && "Opportunities"}
          </NavLink>
          {role === "volunteer" && (
          <NavLink to="/my-applications">
            <FaLeaf /> {!collapsed && "My Applications"}
          </NavLink>
          )}
          
          <NavLink to="/messages">
            <FaComments /> {!collapsed && "Messages"}
          </NavLink>

          <NavLink to="/impact">
            <FaChartBar /> {!collapsed && "My Impact"}
          </NavLink>

          <NavLink to="/profile">
            <FaUser /> {!collapsed && "My Profile"}
          </NavLink>

          <NavLink to="/settings">
            <FaCog /> {!collapsed && "Settings"}
          </NavLink>
        </nav>
        {/* Dark Mode Toggle */}
        <div className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
          {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </div>
        <div className="nav-links">
          {token && (
            <>
              <button className="logout-btn-nav" onClick={handleLogout}>
                Sign Out 
              </button>
            </>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <div className="user-info">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
          </div>
          <FaBell
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
          />
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default DashboardLayout;
