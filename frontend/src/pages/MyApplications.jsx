import { useEffect, useState } from "react";
import axios from "axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(res.data);
    } catch (error) {
      console.log("Failed to fetch applications");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>You have not applied to any opportunities yet.</p>
      ) : (
        applications.map((app) => (
          <div
            key={app._id}
            style={{
              background: "white",
              padding: 20,
              marginBottom: 15,
              borderRadius: 8,
              border: "1px solid #eee",
            }}
          >
            <h3>{app.opportunity_id?.title}</h3>

            <p>
              <strong>Location:</strong>{" "}
              {app.opportunity_id?.location}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    app.status === "accepted"
                      ? "green"
                      : app.status === "rejected"
                      ? "red"
                      : "orange",
                }}
              >
                {app.status}
              </span>
            </p>

            <p>
              <small>
                Applied on:{" "}
                {new Date(app.createdAt).toLocaleDateString()}
              </small>
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyApplications;