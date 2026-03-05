import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password: form.password }
      );

      setSuccess(res.data.message);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <h2>♻ WasteZero</h2>
        <h1>Create a New Password</h1>
        <p>
          Choose a strong password to secure your account.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          <h3>Reset Password</h3>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">
              Reset Password
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

export default ResetPassword;