import { useEffect, useState } from "react";
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from "../services/opportunityService";
import OpportunityForm from "../components/OpportunityForm";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import "./opportunities.css";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const res = await getOpportunities(token);
      setOpportunities(res.data);
    } catch (error) {
      console.log("Failed to fetch opportunities");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CREATE / UPDATE ================= */
  const handleCreateOrUpdate = async (data) => {
    try {
      if (selected) {
        await updateOpportunity(selected._id, data, token);
      } else {
        await createOpportunity(data, token);
      }

      setSelected(null);
      fetchData();
    } catch (error) {
      console.log("Error saving opportunity");
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      await deleteOpportunity(deleteId, token);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.log("Error deleting opportunity");
    }
  };

  /*=====================filter===================*/
  const filteredOpportunities = opportunities.filter((op) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      op.title.toLowerCase().includes(search) ||
      op.description.toLowerCase().includes(search) ||
      op.location.toLowerCase().includes(search);

    const matchesStatus = statusFilter ? op.status === statusFilter : true;

    const matchesLocation = locationFilter
      ? op.location === locationFilter
      : true;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="opportunities-page">
      <div className="op-header">
        <div>
          <h2>Opportunities</h2>
          <p>Browse and manage recycling initiatives</p>
        </div>

        {role === "ngo" && (
          <button
            className="create-btn"
            onClick={() => {
              setSelected(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close Form" : "+ Create Opportunity"}
          </button>
        )}
      </div>
      <div className="search-bar">
        <input
          className="search"
          type="text"
          placeholder="Search opportunities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="select-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="select-location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {[...new Set(opportunities.map((op) => op.location))].map(
            (loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ),
          )}
        </select>
      </div>

      {role === "ngo" && showForm && (
        <OpportunityForm
          onSubmit={handleCreateOrUpdate}
          selectedOpportunity={selected}
        />
      )}

      <div className="opportunities-grid">
        {filteredOpportunities.map((op) => (
          <div key={op._id} className="opportunity-card">
            {/* IMAGE */}
            {op.image ? (
              <img
                src={`http://localhost:5000/${op.image}`}
                alt="Opportunity"
                className="card-image"
              />
            ) : (
              <div className="no-image">No Image</div>
            )}
            {/* CARD BODY */}
            <div className="card-body">
              {/* TITLE + STATUS */}
              <div className="title-row">
                <h3 onClick={() => navigate(`/opportunities/${op._id}`)}>
                  {op.title}
                </h3>

                <span
                  className={`status-badge ${
                    op.status === "open" ? "status-open" : "status-closed"
                  }`}
                >
                  {op.status}
                </span>
              </div>

              <p className="description">{op.description}</p>

              {/* META INFO */}
              <div className="meta">
                <div>
                  📅{" "}
                  {op.date
                    ? new Date(op.date).toLocaleDateString()
                    : "Not specified"}
                </div>
                <div>📍 {op.location}</div>
                <div>⏳ {op.duration}</div>
              </div>
            </div>
            <div className="skills">
              {op.required_skills.map((skill, index) => (
                <span key={index} className="skill-chip">
                  {skill}
                </span>
              ))}
            </div>
            {role === "volunteer" && (
              <div className="card-actions">
                <div className="card-actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/opportunities/${op._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
            {role === "ngo" && (
              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelected(op);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => {
                    setDeleteId(op._id);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Are you sure?</h3>
            <p>
              This action cannot be undone. This will permanently delete the
              opportunity.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;