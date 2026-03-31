import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Applicants = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (id) fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/applications/opportunity/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setApplications(res.data);
    } catch (error) {
      console.log("Error fetching applicants");
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchApplicants();
    } catch (error) {
      console.log("Error updating status");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Applicants</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Ranked automatically by match score
      </p>

      {applications.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Match</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app, index) => (
                <tr key={app._id} style={rowStyle}>
                  <td style={tdStyle}>#{index + 1}</td>
                  <td style={tdStyle}>{app.volunteer_id?.name}</td>
                  <td style={tdStyle}>{app.volunteer_id?.email}</td>
                  <td style={tdStyle}>{app.volunteer_id?.location}</td>

                  {/* Match Score */}
                  <td>
                    <strong>{app.matchScore ?? 0}%</strong>

                    <div className="match-bar">
                      <div
                        className="match-fill"
                        style={{
                          width: `${app.matchScore ?? 0}%`,
                          background:
                            app.matchScore >= 80
                              ? "#28a745"
                              : app.matchScore >= 50
                                ? "#ffc107"
                                : "#dc3545",
                        }}
                      />
                    </div>
                  </td>

                  {/* Status */}
                  <td style={tdStyle}>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={tdStyle}>
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app._id, "accepted")}
                          style={acceptBtn}
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => updateStatus(app._id, "rejected")}
                          style={rejectBtn}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "14px",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

const rowStyle = {
  transition: "background 0.2s",
};

const acceptBtn = {
  background: "#28a745",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  marginRight: "5px",
  cursor: "pointer",
};

const rejectBtn = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};


export default Applicants;