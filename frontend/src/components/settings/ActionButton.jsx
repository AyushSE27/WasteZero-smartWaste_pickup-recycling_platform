const ActionButton = ({
  icon,
  title,
  description,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
}) => (
  <button
    type="button"
    className={`settings-action-button is-${variant}`}
    onClick={onClick}
    disabled={disabled || loading}
  >
    <span className="settings-action-icon">{icon}</span>
    <span className="settings-action-copy">
      <strong>{title}</strong>
      {description ? <small>{description}</small> : null}
    </span>
    {loading ? <span className="settings-action-state">Working...</span> : null}
  </button>
);

export default ActionButton;
