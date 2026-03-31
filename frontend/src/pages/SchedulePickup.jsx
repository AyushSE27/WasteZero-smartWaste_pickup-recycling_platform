import { useState, useEffect } from "react";
import axios from "axios";
import "./schedulePickup.css";

const SchedulePickup = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    date: "",
    timeSlot: "",
    wasteTypes: [],
    notes: "",
  });

  /* ================= LOAD HISTORY ================= */
  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistory(res.data);
    } catch (error) {
      console.log("Error loading pickups");
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWasteChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      wasteTypes: checked
        ? [...prev.wasteTypes, value]
        : prev.wasteTypes.filter((item) => item !== value),
    }));
  };

  /* ================= STEP 1 VALIDATION ================= */
  const handleNext = () => {
    const { address, city, date, timeSlot } = formData;

    if (!address.trim()) return alert("Please enter address");
    if (!city.trim()) return alert("Please enter city");
    if (!date) return alert("Please select pickup date");
    if (!timeSlot) return alert("Please select time slot");

    setStep(2);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.wasteTypes.length === 0) {
      return alert("Please select at least one waste type");
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Pickup Scheduled Successfully!");

      setFormData({
        address: "",
        city: "",
        date: "",
        timeSlot: "",
        wasteTypes: [],
        notes: "",
      });

      setStep(1);
      setActiveTab("history");
      fetchPickups();
    } catch (error) {
      console.log("Error scheduling pickup");
    }
  };

  /* ================= DELETE ================= */
  const deletePickup = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/pickups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchPickups();
    } catch (error) {
      console.log("Error deleting pickup");
    }
  };

  return (
    <div className="schedule-container">
      <div className="header">
        <h2>Schedule Pickup</h2>
        <p>Request waste collection and manage your pickups</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "new" ? "tab active" : "tab"}
          onClick={() => {
            setActiveTab("new");
            setStep(1);
          }}
        >
          Schedule New Pickup
        </button>

        <button
          className={activeTab === "history" ? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          Pickup History
        </button>
      </div>

      {/* ================= HISTORY ================= */}
      {activeTab === "history" && (
        <div className="card">
          <h3>Your Pickup History</h3>
          <p> view and manage all your schedule pickups </p>
          {history.length === 0 ? (
            <div className="card-history">
              <p>you haven't scheduled any pickup yet</p>
              <button className="prime-btn" onClick={() => setActiveTab("new")}>
                scheduled your first pickup
              </button>
            </div>
          ) : (
            history.map((p) => (
              <div key={p._id} className="pickup-card">
                <div className="pickup-top">
                  <div className="pickup-id">{p.pickupId}</div>

                  <span className={`pickup-status ${p.status}`}>
                    {p.status}
                  </span>
                </div>

                <div className="pickup-meta">
                  <div>📅 {new Date(p.date).toLocaleDateString()}</div>
                  <div>⏰ {p.timeSlot}</div>
                </div>

                <div className="pickup-details">
                  <p>
                    <strong>📍 Address:</strong> {p.address}, {p.city}
                  </p>
                  <p>
                    <strong>♻ Waste:</strong> {p.wasteTypes.join(", ")}
                  </p>
                  <p>
                    <strong>📝 Notes:</strong> {p.notes || "None"}
                  </p>
                </div>

                <div className="pickup-actions">
                  <button
                    className="delete-btn"
                    onClick={() => deletePickup(p._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= STEP 1 ================= */}
      {activeTab === "new" && step === 1 && (
        <div className="card">
          <h3>Request Waste Collection</h3>

          <label>Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your street address"
          />

          <div className="row">
            <div>
              <label>City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Pickup Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Preferred Time Slot</label>
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
          >
            <option value="">Select a time slot</option>
            <option>9 AM - 12 PM</option>
            <option>12 PM - 3 PM</option>
            <option>3 PM - 6 PM</option>
          </select>

          <button className="next-btn" onClick={handleNext}>
            Next Step
          </button>
        </div>
      )}

      {/* ================= STEP 2 ================= */}
      {activeTab === "new" && step === 2 && (
        <div className="card">
          <h3>Select Waste Types</h3>

          <div className="waste-grid">
            {[
              { name: "Plastic", icon: "♻️" },
              { name: "Glass", icon: "🍾" },
              { name: "Electronic Waste", icon: "💻" },
              { name: "Paper", icon: "📄" },
              { name: "Metal", icon: "🔩" },
              { name: "Organic Waste", icon: "🌿" },
              { name: "Other", icon: " " },
            ].map((item) => (
              <div
                key={item.name}
                className={`waste-card ${
                  formData.wasteTypes.includes(item.name) ? "selected" : ""
                }`}
                onClick={() => {
                  const exists = formData.wasteTypes.includes(item.name);

                  setFormData((prev) => ({
                    ...prev,
                    wasteTypes: exists
                      ? prev.wasteTypes.filter((t) => t !== item.name)
                      : [...prev.wasteTypes, item.name],
                  }));
                }}
              >
                <span className="waste-icon">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          <label>Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="btn-row">
            <button className="submit-btn" onClick={() => setStep(1)}>
              Previous
            </button>
            <button className="submit-btn" onClick={handleSubmit}>
              Schedule Pickup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePickup;