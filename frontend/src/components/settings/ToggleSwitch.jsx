const ToggleSwitch = ({ label, description, checked, onChange, disabled = false }) => (
  <label className={`toggle-row ${disabled ? "is-disabled" : ""}`}>
    <div>
      <span className="toggle-label">{label}</span>
      {description ? <p>{description}</p> : null}
    </div>
    <span className="toggle-control">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </span>
  </label>
);

export default ToggleSwitch;
