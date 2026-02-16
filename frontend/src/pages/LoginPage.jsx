import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@wastezero.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
        <h1>Login to your account</h1>
        <p className="small">Enter your credentials to access your account</p>
        <form onSubmit={onSubmit} className="grid">
          <label>Username</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your username" />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
        <p className="small">
          Demo: admin@wastezero.com / ngo@wastezero.com / volunteer@wastezero.com / agent@wastezero.com
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
