import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getSingleOpportunity,
  deleteOpportunity,
} from "../services/opportunityService";
import axios from "axios";
import "./opportunities.css";
const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const [applied, setApplied] = useState(false);

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchOpportunity();
    checkIfApplied();
  }, []);

  const checkIfApplied = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const alreadyApplied = res.data.some(
        (app) => app.opportunity_id?._id === id,
      );

      if (alreadyApplied) setApplied(true);
    } catch (error) {
      console.log("Error checking application");
    }
  };

  const fetchOpportunity = async () => {
    const res = await getSingleOpportunity(id);
    setData(res.data);
  };

  const handleApply = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/applications/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setApplied(true);
    } catch (error) {
      alert("Already applied or error occurred");
    }
  };

  const handleDelete = async () => {
    await deleteOpportunity(id, token);
    navigate("/opportunities");
  };

  if (!data) {
    return (
      <div style={{ padding: 30 }}>
        <h3>Loading opportunity...</h3>
        <p style={{ color: "#666" }}>Please wait while we fetch the details.</p>
      </div>
    );
  }

  return (
    <div className="details-container">
      {/* Back */}
      <div className="back-link" onClick={() => navigate("/opportunities")}>
        ← Back to Opportunities
      </div>

      {/* Header */}
      <div className="details-header">
        <div>
          <h1>{data.title}</h1>
          <p className="subtitle">Volunteer opportunity details</p>
        </div>

        <span className={`status-badge ${data.status}`}>{data.status}</span>
      </div>

      <div className="details-grid">
        {/* LEFT SIDE */}
        <div className="details-left">
          <div className="image-card">
            <div className="image-card">
              {data.image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${data.image}`}
                  alt="Opportunity"
                  className="card-image"
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Description</h3>
            <p>{data.description}</p>
          </div>

          <div className="card">
            <h3>Required Skills</h3>
            <div className="skills">
              {data.required_skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="details-right">
          <div className="card sidebar-card">
            <h3>Opportunity Details</h3>

            <div className="detail-item">
              <span>⏳ Duration</span>
              <strong>{data.duration}</strong>
            </div>

            <div className="detail-item">
              <span>📍 Location</span>
              <strong>{data.location}</strong>
            </div>

            <div className="detail-item">
              <span>🏢 Posted By</span>
              <strong>{data.ngo_id?.name}</strong>
            </div>

            {/* Volunteer */}
            {role === "volunteer" && data.status === "open" && (
              <button
                className="primary-btn full-width"
                onClick={handleApply}
                disabled={applied}
              >
                {applied ? "Applied ✓" : "Apply Now"}
              </button>
            )}

            {/* NGO */}
            {role === "ngo" && (
              <button
                className="secondary-btn full-width"
                onClick={() => navigate(`/applicants/${id}`)}
              >
                View Applicants
              </button>
            )}

            {(role === "ngo" || role === "admin") && (
              <div className="action-buttons">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/opportunities/edit/${id}`)}
                >
                  Edit
                </button>

                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;