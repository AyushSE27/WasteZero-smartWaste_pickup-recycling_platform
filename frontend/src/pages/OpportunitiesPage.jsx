import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const seedImages = [
  "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1200&q=80"
];

const emptyForm = {
  title: "",
  description: "",
  date: "",
  duration: "",
  location: "",
  required_skills: "",
  wasteType: "plastic"
};

const OpportunitiesPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canManage = user.role === "ngo" || user.role === "admin";

  const load = async () => {
    const { data } = await api.get("/opportunities");
    const rows = (data.opportunities || []).map((item, idx) => ({
      ...item,
      image: item.image || seedImages[idx % seedImages.length]
    }));
    setItems(rows);
    if (rows.length && !selectedId) setSelectedId(rows[0].id);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.title} ${item.description} ${item.location}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const selected = items.find((item) => item.id === selectedId) || filteredItems[0] || null;

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      required_skills: form.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    };

    if (selected && mode === "edit") {
      await api.patch(`/opportunities/${selected.id}`, payload);
    } else {
      await api.post("/opportunities", payload);
    }

    setForm(emptyForm);
    setMode("list");
    await load();
  };

  const openCreate = () => {
    setForm(emptyForm);
    setMode("create");
  };

  const openEdit = (item) => {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      date: item.date || "",
      duration: item.duration || "",
      location: item.location || "",
      required_skills: (item.required_skills || []).join(", "),
      wasteType: item.wasteType || "plastic"
    });
    setMode("edit");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/opportunities/${deleteTarget.id}`);
    setDeleteTarget(null);
    setMode("list");
    setSelectedId("");
    await load();
  };

  const onApply = async (id) => {
    await api.post(`/applications/opportunity/${id}`);
    alert("Applied successfully");
  };

  return (
    <section>
      {mode === "list" && (
        <>
          <header className="page-head opportunities-head">
            <div>
              <h1>Volunteer Opportunities</h1>
              <p>Browse and join recycling and waste management initiatives</p>
            </div>
            {canManage && (
              <button className="primary-action" onClick={openCreate}>
                + Create Opportunity
              </button>
            )}
          </header>

          <div className="toolbar card">
            <input
              placeholder="Search opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {!!filteredItems.length && (
            <div className="op-cards-grid">
              {filteredItems.map((item) => (
                <article className="card opportunity-card" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div className="op-card-content">
                    <div className="op-card-title-row">
                      <h3>{item.title}</h3>
                      <span className="status-chip">{item.status || "open"}</span>
                    </div>
                    <p>{item.description}</p>
                    <p>{item.date || "2025-06-20"}</p>
                    <p>{item.location}</p>
                    <p>{item.duration}</p>
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setMode("detail");
                      }}
                    >
                      {user.role === "volunteer" ? "Apply Now" : "View Details"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!filteredItems.length && (
            <div className="card empty-state">
              <p>No opportunities found matching your criteria.</p>
              <p>Check back later for new opportunities.</p>
            </div>
          )}
        </>
      )}

      {mode === "detail" && selected && (
        <>
          <button className="text-back-btn" onClick={() => setMode("list")}> 
            ? Back to Opportunities
          </button>

          <div className="detail-shell">
            <div>
              <header className="page-head">
                <h1>{selected.title}</h1>
                <p>Volunteer opportunity details</p>
              </header>
              <img className="detail-hero" src={selected.image} alt={selected.title} />
              <div className="card">
                <h3>Description</h3>
                <p>{selected.description}</p>
              </div>
              <div className="card">
                <h3>Required Skills</h3>
                <p>{(selected.required_skills || []).join(", ") || "teamwork, presentation skills"}</p>
              </div>
            </div>

            <aside className="card opp-side-panel">
              <h2>Opportunity Details</h2>
              <p>
                <strong>Date</strong>
                <br />
                {selected.date || "2025-07-10"}
              </p>
              <p>
                <strong>Duration</strong>
                <br />
                {selected.duration}
              </p>
              <p>
                <strong>Location</strong>
                <br />
                {selected.location}
              </p>
              <p>
                <strong>Posted by</strong>
                <br />
                NGO ID: {selected.ngo_id}
              </p>
              <div className="actions-row">
                {user.role === "volunteer" && <button onClick={() => onApply(selected.id)}>Apply</button>}
                {canManage && (
                  <>
                    <button className="secondary-btn" onClick={() => openEdit(selected)}>
                      Edit
                    </button>
                    <button className="danger-btn" onClick={() => setDeleteTarget(selected)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      {(mode === "create" || mode === "edit") && (
        <>
          <button className="text-back-btn" onClick={() => setMode("list")}> 
            ? Back to Opportunities
          </button>

          <header className="page-head">
            <h1>{mode === "edit" ? "Edit Opportunity" : "Create New Opportunity"}</h1>
            <p>
              {mode === "edit"
                ? "Update the details of this volunteer opportunity"
                : "Post a volunteer opportunity for waste management and recycling"}
            </p>
          </header>

          <form onSubmit={submit} className="card grid">
            <h2>Opportunity Details</h2>
            <label>Title</label>
            <input
              value={form.title}
              placeholder="E.g. Beach Cleanup Drive"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <label>Description</label>
            <textarea
              rows={5}
              value={form.description}
              placeholder="Provide details about the volunteer opportunity"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-2">
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label>Duration</label>
                <input
                  value={form.duration}
                  placeholder="E.g. 2 hours, 3-4 hours"
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>

            <label>Location</label>
            <input
              value={form.location}
              placeholder="E.g. Ocean Beach, San Francisco"
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <label>Required Skills</label>
            <input
              value={form.required_skills}
              placeholder="teamwork, physical stamina"
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            />

            <label>Waste Type</label>
            <select value={form.wasteType} onChange={(e) => setForm({ ...form, wasteType: e.target.value })}>
              <option value="plastic">Plastic</option>
              <option value="organic">Organic</option>
              <option value="ewaste">E-Waste</option>
              <option value="metal">Metal</option>
            </select>

            <button type="submit">{mode === "edit" ? "Save Changes" : "Create Opportunity"}</button>
          </form>
        </>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Are you sure?</h3>
            <p>
              This action cannot be undone. This will permanently delete the opportunity and remove all
              associated applications.
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OpportunitiesPage;
