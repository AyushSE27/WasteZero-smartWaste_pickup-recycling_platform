import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="page-container">
      <div className="left-section">
        <div className="logo">🌿 WasteZero</div>
        <h1>
          Join the <span>Recycling Revolution</span>
        </h1>
        <p>
          WasteZero connects volunteers, NGOs, and administrators to
          schedule pickups, track impact, and build a cleaner planet.
        </p>
      </div>

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

        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
