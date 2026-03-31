import { FaCamera } from "react-icons/fa";

const AvatarUpload = ({ avatarUrl, userName, selectedFile, onSelectFile, onUpload, uploading = false }) => {
  const initials = (userName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : avatarUrl;

  return (
    <div className="avatar-upload-card">
      <div className="avatar-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={`${userName} avatar`} />
        ) : (
          <span>{initials || "U"}</span>
        )}
      </div>
      <div className="avatar-upload-copy">
        <h4>Profile Picture</h4>
        <p>Upload a JPG, PNG, or WEBP image up to 2 MB.</p>
        <div className="avatar-upload-actions">
          <label className="secondary-btn file-upload-btn">
            <FaCamera />
            <span>{selectedFile ? selectedFile.name : "Choose Image"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => onSelectFile(event.target.files?.[0] || null)}
            />
          </label>
          <button
            type="button"
            className="primary-btn compact-btn"
            onClick={onUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Save Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
