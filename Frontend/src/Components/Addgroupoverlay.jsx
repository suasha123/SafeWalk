import React, { useState } from "react";
import "../Style/GroupOverlayModal.css";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
export const GroupOverlayModal = ({ onClose }) => {
  const [mode, setMode] = useState("join"); // "join" or "create"
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setGroupImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const res = await fetch("https://safewalk-xbkj.onrender.com/api/joingrp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
        credentials: "include",
      });
      if (res.ok) {
        const body = await res.json();
        const { grplink, msg } = body;
            onClose();
        navigate(`/chat/groups/${grplink}`);
      } else {
        enqueueSnackbar(msg, { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Error occured", { variant: "warning" });
    }
  };

  const handleCreateGroup = async () => {
    try {
      if (!groupName && !groupImage) {
        enqueueSnackbar("Invalid Input", { variant: "warning" });
        return;
      }
      const fromdata = new FormData();
      fromdata.append("groupimg", groupImage);
      fromdata.append("groupname", groupName);
      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/api/addgroup",
        {
          method: "POST",
          body: fromdata,
          credentials: "include",
        }
      );
      if (res.ok) {
        console.log(res);
        enqueueSnackbar("Group Created Succesfully", { variant: "success" });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="group-overlay-backdrop">
      <div className="group-overlay-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="tab-switcher">
          <button
            className={mode === "join" ? "active" : ""}
            onClick={() => setMode("join")}
          >
            Join Group
          </button>
          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => setMode("create")}
          >
            Create Group
          </button>
        </div>

        {mode === "join" ? (
          <>
            <h3>Enter the invite code to join</h3>
            <input
              type="text"
              placeholder="e.g., ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="group-input"
            />
            <button className="action-btn" onClick={handleJoinGroup}>
              Join Group
            </button>
          </>
        ) : (
          <>
            <h3>Create a New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="group-input"
            />
            <label className="file-upload-link">
              Change group picture
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>

            {previewUrl && (
              <div className="preview-container">
                <img
                  src={previewUrl}
                  alt="Group preview"
                  className="group-preview-img"
                />
              </div>
            )}

            <button className="action-btn" onClick={handleCreateGroup}>
              Create Group
            </button>
          </>
        )}
      </div>
    </div>
  );
};
