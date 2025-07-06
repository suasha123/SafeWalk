import { IoClose } from "react-icons/io5";
import "../Style/groupinfo.css";

const GroupInfoOverlay = ({ group, onClose, onExit, onEdit }) => {
  const stopProp = (e) => e.stopPropagation();

  return (
    <div className="group-overlay-container" onClick={onClose}>
      <div className="group-overlay" onClick={stopProp}>
        <button className="close-btn" onClick={onClose}>
          <IoClose size={22} />
        </button>

        <div className="group-header">
          <div className="group-image">
            {group.groupimg ? (
              <img src={group.groupimg} alt="Group" />
            ) : (
              <div className="group-placeholder">
                {group.name?.charAt(0)?.toUpperCase() || "G"}
              </div>
            )}
          </div>
          <div className="group-name">{group.name}</div>
        </div>

        <div className="group-members">
          <h4>Members</h4>
          <ul>
            {group.member.map((m) => (
              <li key={m._id}>@{m.username}</li>
            ))}
          </ul>
        </div>

        <div className="group-actions">
          <button className="edit-btn" onClick={onEdit}>
            Edit Group
          </button>
          <button className="exit-btn" onClick={onExit}>
            Exit Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoOverlay;
