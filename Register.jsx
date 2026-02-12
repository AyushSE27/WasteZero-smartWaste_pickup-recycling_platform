import { useState } from "react";

import { Link, useLocation } from "react-router-dom";
const location = useLocation();

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "Volunteer",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      navigate("/login");
    }
  };

  return (
  <div className="page-container">

    {/* LEFT SIDE */}
    <div className="left-section">
      <div className="logo">🌿 WasteZero</div>

      <h1>
        Join the <span>Recycling Revolution</span>
      </h1>

      <p>
        WasteZero connects volunteers, NGOs, and administrators to
        schedule pickups, track impact, and build a cleaner planet.
      </p>

      <div className="features">
        <div className="feature">
          <h3>Schedule Pickups</h3>
          <p>Smart waste collection</p>
        </div>

        <div className="feature">
          <h3>Track Impact</h3>
          <p>See your contribution</p>
        </div>

        <div className="feature">
          <h3>Volunteer</h3>
          <p>Join eco initiatives</p>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE GLASS CARD */}
    <div className="right-section">

      <div className="tabs">
    <Link
      to="/login"
      className={`tab ${location.pathname === "/login" ? "active" : ""}`}
    >
      Login
    </Link>

    <Link
      to="/register"
      className={`tab ${location.pathname === "/register" ? "active" : ""}`}
    >
      Register
    </Link>
  </div>

      <h2>Create Account</h2>
      <p style={{ marginBottom: "25px", opacity: 0.7 }}>
        Join WasteZero today
      </p>

      <form onSubmit={handleRegister}>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Volunteer">Volunteer</option>
            <option value="NGO">NGO</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          Create Account
        </button>

      </form>
    </div>

  </div>
);

}

export default Register;
