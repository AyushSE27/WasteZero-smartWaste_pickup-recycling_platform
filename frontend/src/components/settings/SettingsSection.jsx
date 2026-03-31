const SettingsSection = ({ icon, title, description, children, tone = "default" }) => (
  <section className={`settings-section-card ${tone !== "default" ? `is-${tone}` : ""}`}>
    <div className="settings-section-head">
      <div className="settings-section-title-wrap">
        <span className="settings-section-icon">{icon}</span>
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
    </div>
    <div className="settings-section-body">{children}</div>
  </section>
);

export default SettingsSection;
