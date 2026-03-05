import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <h2>♻ WasteZero</h2>
        <h1>Reset Your Password</h1>
        <p>
          Enter your registered email address and we will send you
          a secure reset link.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          <h3>Forgot Password</h3>

          {error && <div className="error-msg">{error}</div>}
          {message && <div className="success-msg">{message}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="primary-btn">
              Send Reset Link
            </button>
          </form>

          <div style={{ marginTop: 15, textAlign: "center" }}>
            <span
              style={{ cursor: "pointer", color: "#2d89ef" }}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;