import { useState } from "react";
import "../Style/groupinfooverlay.css";
import { enqueueSnackbar } from "notistack";

export const EditGroupOverlay = ({ selectedUser, onClose, onGroupUpdated }) => {
  const [newName, setNewName] = useState(selectedUser.name);
  const [newImage, setNewImage] = useState(selectedUser.groupimg);
  const [imageFile, setImageFile] = useState(null);
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImage(url);
      setImageFile(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("grpimg", imageFile);
      formData.append("grpname", newName);
      formData.append("grpid", selectedUser._id);
      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/upload/updategrp",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (res.ok) {
          onGroupUpdated?.();
          onClose();
        }
      } else {
        enqueueSnackbar(data.msg, { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "warning" });
    }
  };

  return (
    <div className="group-info-overlay">
      <div className="group-info-modal dark-theme-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

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
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
