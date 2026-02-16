import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
    skills: "plastic,cleanup",
    location: "Delhi",
    bio: ""
  });
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register({
        ...form,
        bio: form.bio || form.username,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <section className="auth-card">
      <aside className="auth-banner">
        <div className="brand-row">
          <span className="logo-mark">♻</span>
          <h2>WasteZero</h2>
        </div>
        <h3>Join the Recycling Revolution</h3>
        <p>
          WasteZero connects volunteers, NGOs, and administrators to schedule pickups, manage recycling
          opportunities, and make a positive impact on our environment.
        </p>
        <div className="feature-row">
          <div>
            <strong>Schedule Pickups</strong>
            <p>Easily arrange waste collection</p>
          </div>
          <div>
            <strong>Track Impact</strong>
            <p>Monitor your environmental contribution</p>
          </div>
          <div>
            <strong>Volunteer</strong>
            <p>Join recycling initiatives</p>
          </div>
        </div>
      </aside>
      <div className="auth-form">
        <div className="auth-switch">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </div>
        <h1>Create a new account</h1>
        <p className="small">Fill in your details to join WasteZero</p>
        <form onSubmit={onSubmit} className="grid grid-2">
          <div>
            <label>Full Name</label>
            <input placeholder="Your full name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input placeholder="Your email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div className="full-span">
            <label>Username</label>
            <input
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
            />
          </div>
          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
            />
          </div>
          <div className="full-span">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setField("role", e.target.value)}>
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="hidden-fields">
            <input
              placeholder="Skills comma separated"
              value={form.skills}
              onChange={(e) => setField("skills", e.target.value)}
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
            <textarea placeholder="Bio" value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
          </div>
          <button type="submit">Create Account</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
