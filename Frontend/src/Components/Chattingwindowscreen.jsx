import { useEffect, useRef, useState } from "react";
import "../Style/chattingwindowscreen.css";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";

const ChatWindow = ({ selectedUser, onBack }) => {
  const { socket, user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [receivedmsg, setreceivedmsg] = useState([]);
  const [loading, setLoading] = useState(true);
  const pendingSocketMessages = useRef([]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    if (!socket?.connected) {
      enqueueSnackbar("You're offline. Message not sent.", {
        variant: "error",
      });
      return;
    }
    const msgobj = {
      msg: newMessage,
      to: selectedUser._id,
    };

    setreceivedmsg((prev) => [
      ...prev,
      {
        id: Date.now(),
        message: newMessage,
        fromSelf: true,
      },
    ]);

    socket.emit("sendmsg", msgobj, (ack) => {
      if (!ack.ok) {
        enqueueSnackbar("Message not sent.", {
          variant: "error",
        });
      }
    });
    setNewMessage("");
  };

  // Fetch conversation from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://safewalk-xbkj.onrender.com/api/messages/${selectedUser._id}`, {
          credentials: "include",
        });
        const data = await res.json();

        const formatted = data.messages.map((msg) => ({
          id: msg._id,
          message: msg.msg,
          fromSelf: msg.from !== selectedUser._id,
        }));

        // Merge pending socket messages if any
        const finalMessages = [...formatted, ...pendingSocketMessages.current];
        pendingSocketMessages.current = [];
        setreceivedmsg(finalMessages);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUser?._id) fetchMessages();
  }, [selectedUser]);

  // Handle incoming live messages
  useEffect(() => {
    const handleReceive = (data) => {
      const incoming = {
        id: Date.now(),
        message: data.msg,
        fromSelf: false,
      };

      if (loading) {
        pendingSocketMessages.current.push(incoming);
      } else {
        if (data.from === (selectedUser._id || selectedUser.id)) {
          setreceivedmsg((prev) => [...prev, incoming]);
        }
      }
    };

    socket.on("receivemsg", handleReceive);
    return () => socket.off("receivemsg", handleReceive);
  }, [loading, selectedUser, socket]);

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
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            Loading messages...
          </div>
        ) : (
          receivedmsg.map((msg) => (
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
          ))
        )}
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
