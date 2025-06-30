import { useEffect, useState } from "react";
import "../Style/chattingwindowscreen.css";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { useAuth } from "./AuthContext";

const ChatWindow = ({ selectedUser, onBack }) => {
  const { socket, user} = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [receivedmsg, setreceivedmsg] = useState([
    {
      id: 1,
      user: "S",
      name: "Sam",
      message: "Hey, are you safe?",
      fromSelf: true,
    },
    {
      id: 2,
      user: selectedUser.initial,
      name: selectedUser.name,
      message: "Yes! Just entered the safe zone 🏃‍♀️",
      fromSelf: false,
    },
    {
      id: 3,
      user: "S",
      name: "Sam",
      message: "Great, keep me updated!",
      fromSelf: true,
    },
  ]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const msgobj = {
      msg: newMessage,
      to: selectedUser._id, // receiver
      from: "685c221b997c0343ce5c83a7", // hardcoded sender (your test ID)
    };

    setreceivedmsg((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: "Me",
        name: "Me",
        message: newMessage,
        fromSelf: true,
      },
    ]);

    socket.emit("sendmsg", msgobj);
    setNewMessage("");
  };

  useEffect(() => {
    const handleReceive = (data) => {
      console.log("Received message:", data.msg);
      console.log("Comparing with:", selectedUser._id || selectedUser.id);

      // ✅ FIX: check both _id and id for selectedUser
      if (data.from === (selectedUser._id || selectedUser.id)) {
        setreceivedmsg((prev) => [
          ...prev,
          {
            id: Date.now(),
            user: selectedUser.initial,
            name: selectedUser.name,
            message: data.msg,
            fromSelf: false,
          },
        ]);
      }
    };

    socket.on("receivemsg", handleReceive);
    return () => {
      socket.off("receivemsg", handleReceive);
    };
  }, [selectedUser, socket]);

  return (
    <div className="chat-box">
      <div className="chat-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <HiArrowNarrowLeft className="back-icon" />
          </button>
        )}
        <div className="avatar">
          {selectedUser.profile ? (
            <img
              src={selectedUser.profile}
              className="avatar-img"
              alt="profile"
            />
          ) : (
            (
              selectedUser.name?.charAt(0) ||
              selectedUser.email?.charAt(0) ||
              "?"
            ).toUpperCase()
          )}
        </div>
        <div className="chat-title">{selectedUser.name}</div>
      </div>

      <div className="chat-messages">
        {receivedmsg.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.fromSelf ? "from-self" : "from-other"
            }`}
          >
            {!msg.fromSelf && (
              <div className="avatar">
                {selectedUser.profile ? (
                  <img
                    src={selectedUser.profile}
                    className="avatar-img"
                    alt="profile"
                  />
                ) : (
                  (
                    selectedUser.name?.charAt(0) ||
                    selectedUser.email?.charAt(0) ||
                    "?"
                  ).toUpperCase()
                )}
              </div>
            )}
            <div className="message-bubble">{msg.message}</div>
            {msg.fromSelf && (
              <div className="avatar self-avatar">
                {user?.profile ? (
                  <img
                    src={user.profile}
                    className="avatar-img"
                    alt="profile"
                  />
                ) : (
                  (
                    user?.name?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "?"
                  ).toUpperCase()
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={handleSend}>
          <IoSend />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
