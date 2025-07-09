import { useState } from "react";
import "../Style/groupinfooverlay.css";
import { useAuth } from "./AuthContext";
import { EditGroupOverlay } from "./EditGroupOverlay"; 

export const GroupInfoOverlay = ({ selectedUser, onClose, onLeaveGroup , onGroupUpdated }) => {
  const { user } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false); 

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
      await onLeaveGroup();
    } finally {
      setLeaving(false);
    }
  };

  if (editingGroup) {
    return (
      <EditGroupOverlay
        selectedUser={selectedUser}
        onGroupUpdated={onGroupUpdated}
        onClose={() => setEditingGroup(false)}
      />
    );
  }

  return (
    <div className="group-info-overlay">
      <div className="group-info-modal dark-theme-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <button
          className="edit-group-btn"
          onClick={() => setEditingGroup(true)}
        >
          Edit Group
        </button>

        <div className="group-header">
          {renderAvatar(selectedUser.groupimg, selectedUser.name)}
          <h2 className="group-title">{selectedUser.name}</h2>
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
