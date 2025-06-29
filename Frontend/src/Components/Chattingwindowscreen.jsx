
import "../Style/chattingwindowscreen.css";
import { HiArrowNarrowLeft } from "react-icons/hi";
const ChatWindow = ({ selectedUser, onBack }) => {
  const messages = [
    { id: 1, user: "S", name: "Sam", message: "Hey, are you safe?", fromSelf: true },
    { id: 2, user: selectedUser.initial, name: selectedUser.name, message: "Yes! Just entered the safe zone 🏃‍♀️", fromSelf: false },
    { id: 3, user: "S", name: "Sam", message: "Great, keep me updated!", fromSelf: true },
  ];

  return (
    <div className="chat-box">
      <div className="chat-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <HiArrowNarrowLeft className="back-icon" />
          </button>
        )}
        <div className="avatar">{selectedUser.initial}</div>
        <div className="chat-title">{selectedUser.name}</div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.fromSelf ? "from-self" : "from-other"}`}
          >
            {!msg.fromSelf && <div className="avatar">{msg.user}</div>}
            <div className="message-bubble">{msg.message}</div>
            {msg.fromSelf && <div className="avatar self-avatar">{msg.user}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;