import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(""); // clear previous error

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      navigate("/profile");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Registration failed. Try again.");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE SAME AS LOGIN */}
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
        <div className="auth-card large">
          <div className="auth-tabs">
            <button onClick={() => navigate("/login")}>Login</button>
            <button className="active">Register</button>
          </div>

          <h3>Create a new account</h3>
          <p className="sub-text">Fill in your details to join WasteZero</p>

          <form onSubmit={handleSubmit}>
            {errorMessage && <div className="error-msg">{errorMessage}</div>}
            <div className="row">
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
            </div>

            <select name="role" onChange={handleChange}>
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="primary-btn">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;