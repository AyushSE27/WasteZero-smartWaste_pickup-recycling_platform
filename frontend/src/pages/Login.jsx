import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // STEP 1: Send OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      setSuccessMessage(res.data.message); // "OTP sent"
      setStep(2); // move to OTP step
      setTimer(30);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed");
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/verify-otp`,
        {
          email: form.email,
          otp: form.otp,
        },
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("name", res.data.name);

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP");
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResendOtp = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      setSuccessMessage("OTP resent successfully");
      setTimer(30);
    } catch (error) {
      setErrorMessage("Failed to resend OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <h2>♻ WasteZero</h2>
        <h1>Join the Recycling Revolution</h1>
        <p>
          WasteZero connects volunteers, NGOs, and administrators to schedule
          pickups, manage recycling opportunities, and make a positive impact on
          our environment.
        </p>

        <div className="features">
          <div>
            <h4>Schedule Pickups</h4>
            <p>Easily arrange waste collection</p>
          </div>

          <div>
            <h4>Track Impact</h4>
            <p>Monitor your environmental contribution</p>
          </div>

          <div>
            <h4>Volunteer</h4>
            <p>Join recycling initiatives</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className="active">Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </div>

          <h3>{step === 1 ? "Login to your account" : "Enter OTP"}</h3>

          {errorMessage && <div className="error-msg">{errorMessage}</div>}

          {successMessage && (
            <div className="success-msg">{successMessage}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin}>
              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />

              <div className="forgot-link">
                <span onClick={() => navigate("/forgot-password")}>
                  Forgot Password
                </span>
              </div>

              <button type="submit" className="primary-btn">
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                name="otp"
                value={form.otp}
                placeholder="Enter 6-digit OTP"
                onChange={handleChange}
                required
              />
              <div className="resend-section">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                  className="resend-btn"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
              </div>
              <button type="submit" className="primary-btn">
                Verify & Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;