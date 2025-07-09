import "../Style/groupinfooverlay.css";

export const GroupInfoOverlay = ({ selectedUser, onClose, onLeaveGroup }) => {
  return (
    <div className="group-info-overlay">
      <div className="group-info-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="group-title">{selectedUser.name}</h2>

        <img
          src={selectedUser.groupimg || "default_group_image.png"}
          alt="Group"
          className="group-info-img"
        />

        <h4>Members ({selectedUser.member.length})</h4>
        <ul className="group-member-list">
          {selectedUser.member.map((m) => (
            <li key={m._id}>@{m.username}</li>
          ))}
        </ul>

        <button className="leave-group-btn" onClick={onLeaveGroup}>
          Leave Group
        </button>
      </div>
    </div>
  );
};
