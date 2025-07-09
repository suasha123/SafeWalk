import { useState } from "react";
import "../Style/groupinfooverlay.css";
import { useAuth } from "./AuthContext";

export const GroupInfoOverlay = ({ selectedUser, onClose, onLeaveGroup }) => {
  const { user } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(selectedUser.name);
  const [newImage, setNewImage] = useState(selectedUser.groupimg);

  const renderAvatar = (profile, username) => {
    if (profile && profile.trim() !== "") {
      return <img src={profile} className="avatar-img" alt="profile" />;
    } else {
      return (
        <div className="avatar">
          {username?.charAt(0)?.toUpperCase() || "?"}
        </div>
      );
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await onLeaveGroup(); // parent handles actual logic
    } finally {
      setLeaving(false);
    }
  };

  const handleSave = () => {
    selectedUser.name = newName;
    selectedUser.groupimg = newImage;
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImage(url);
    }
  };

  return (
    <div className="group-info-overlay">
      <div className="group-info-modal dark-theme-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="group-header">
          <div className="avatar-edit-container">
            {renderAvatar(newImage, newName)}
            <button className="edit-icon" onClick={() => setIsEditing(true)}>✎</button>
          </div>

          {isEditing ? (
            <>
              <input
                type="text"
                className="group-name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="edit-buttons">
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <button onClick={handleSave}>Save</button>
              </div>
            </>
          ) : (
            <h2 className="group-title">{selectedUser.name}</h2>
          )}
        </div>

        <h4 className="section-heading">
          Members ({selectedUser.member.length})
        </h4>

        <div className="member-list">
          {selectedUser.member.map((m) => (
            <div key={m._id} className="member-item">
              {renderAvatar(m.profile, m.username)}
              <span className="member-name">@{m.username}</span>
            </div>
          ))}
        </div>

        <button
          className={`leave-group-btn ${leaving ? "loading" : ""}`}
          onClick={handleLeave}
          disabled={leaving}
        >
          {leaving ? (
            <>
              <span className="spinner"></span> Leaving...
            </>
          ) : (
            "Leave Group"
          )}
        </button>
      </div>
    </div>
  );
};
