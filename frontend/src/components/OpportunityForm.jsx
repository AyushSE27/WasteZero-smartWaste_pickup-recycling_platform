import { useState, useEffect } from "react";
import "./opportunities.css";

const OpportunityForm = ({ onSubmit, selectedOpportunity }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
    duration: "",
    location: "",
  });

  useEffect(() => {
    if (selectedOpportunity) {
      setFormData({
        ...selectedOpportunity,
        required_skills: selectedOpportunity.required_skills.join(", "),
      });
    }
  }, [selectedOpportunity]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const form = new FormData();

  form.append("title", formData.title);
  form.append("description", formData.description);
  form.append("duration", formData.duration);
  form.append("location", formData.location);
  form.append("date", formData.date || "");

  // Convert skills to JSON string
  form.append(
    "required_skills",
    JSON.stringify(
      formData.required_skills
        .split(",")
        .map((skill) => skill.trim())
    )
  );

  if (formData.image) {
    form.append("image", formData.image);
  }

  onSubmit(form);

  setFormData({
    title: "",
    description: "",
    required_skills: "",
    duration: "",
    location: "",
    date: "",
    image: null,
  });
};

  return (
    <div className="opportunity-form-card">
      <h2>{selectedOpportunity ? "Edit Opportunity" : "Create Opportunity"}</h2>

      <form className="opportunity-form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Required Skills</label>
          <input
            name="required_skills"
            value={formData.required_skills}
            onChange={handleChange}
            placeholder="e.g. teamwork, sustainability"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration</label>
            <input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
  <label>Upload Image</label>

  <div className="file-upload-wrapper">
    <label className="file-upload-btn">
      Choose Image
      <input
        type="file"
        name="image"
        onChange={(e) =>
          setFormData({ ...formData, image: e.target.files[0] })
        }
      />
    </label>

    <span className="file-name">
      {formData.image ? formData.image.name : "No file"}
    </span>
  </div>
</div>
        </div>

        <button type="submit" className="primary-btn">
          {selectedOpportunity ? "Update Opportunity" : "Create Opportunity"}
        </button>
      </form>
    </div>
  );
};

export default OpportunityForm;