import "../Style/groupinfooverlay.css";

export const GroupInfoOverlay = ({ selectedUser, onClose, onLeaveGroup }) => {
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

  return (
    <div className="group-info-overlay">
      <div className="group-info-modal dark-theme-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="group-header">
          {renderAvatar(selectedUser.groupimg, selectedUser.name)}
          <h2 className="group-title">{selectedUser.name}</h2>
        </div>

        <h4 className="section-heading">Members ({selectedUser.member.length})</h4>
        <div className="member-list">
          {selectedUser.member.map((m) => (
            <div key={m._id} className="member-item">
              {renderAvatar(m.profile, m.username)}
              <span className="member-name">@{m.username}</span>
            </div>
          ))}
        </div>

        <button className="leave-group-btn" onClick={onLeaveGroup}>
          Leave Group
        </button>
      </div>
    </div>
  );
};