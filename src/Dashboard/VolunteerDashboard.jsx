import { useEffect, useState } from "react";
import axios from "axios";
import { FaLeaf, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";
import "./volunteerDashboard.css";

const VolunteerDashboard = () => {
  const [stats, setStats] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/stats",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStats(res.data);
  };

  return (
    <div className="volunteer-container">

      <div className="volunteer-card">
        <FaLeaf />
        <h4>Available Opportunities</h4>
        <h2>{stats.totalOpen || 0}</h2>
      </div>

      <div className="volunteer-card">
        <FaClipboardList />
        <h4>My Applications</h4>
        <h2>{stats.totalApplied || 0}</h2>
      </div>

      <div className="volunteer-card">
        <FaCheckCircle />
        <h4>Accepted</h4>
        <h2>{stats.accepted || 0}</h2>
      </div>

      <div className="volunteer-card">
        <FaClock />
        <h4>Pending</h4>
        <h2>{stats.pending || 0}</h2>
      </div>

    </div>
  );
};

export default VolunteerDashboard;