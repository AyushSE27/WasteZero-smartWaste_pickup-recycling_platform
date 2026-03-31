const ConfirmationModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="settings-modal-backdrop" role="presentation">
      <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <h3 id="confirm-modal-title">{title}</h3>
        <p>{message}</p>
        <div className="settings-modal-actions">
          <button type="button" className="secondary-btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="danger-btn" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
