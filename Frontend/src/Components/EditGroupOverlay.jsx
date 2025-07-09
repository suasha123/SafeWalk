import { useState } from "react";
import "../Style/groupinfooverlay.css";

export const EditGroupOverlay = ({ selectedUser, onClose }) => {
  const [newName, setNewName] = useState(selectedUser.name);
  const [newImage, setNewImage] = useState(selectedUser.groupimg);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImage(url);
    }
  };

  const handleSave = () => {
    selectedUser.name = newName;
    selectedUser.groupimg = newImage;
    onClose();
  };

  return (
    <div className="group-info-overlay">
      <div className="group-info-modal dark-theme-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="group-title">Edit Group Info</h2>

        <div className="edit-image-preview">
          <img src={newImage} className="avatar-img" alt="preview" />
        </div>

        <label className="choose-img-link">
          Choose Image
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
        </label>

        <input
          type="text"
          className="group-name-input"
          placeholder="Enter group name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <div className="edit-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
