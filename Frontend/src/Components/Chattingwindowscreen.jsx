import { useEffect, useRef, useState } from "react";
import "../Style/chattingwindowscreen.css";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";
import { GroupInfoOverlay } from "./GroupInfo";
import { useNavigate } from "react-router-dom";
const ChatWindow = ({ selectedUser, onBack , loadGroups}) => {
  const { socket, user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [rawMessages, setRawMessages] = useState([]);
  const [receivedmsg, setreceivedmsg] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setgroupInfo] = useState(false);
  const pendingSocketMessages = useRef([]);
  const joinedGroups = useRef(new Set());
  const messagesEndRef = useRef(null);
  const isGroupChat = !!selectedUser.groupimg;
  const navigate = useNavigate();
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
      ...(isGroupChat
        ? { groupId: selectedUser._id }
        : { to: selectedUser._id }),
    };

    setreceivedmsg((prev) => [
      ...prev,
      {
        id: Date.now(),
        message: newMessage,
        fromSelf: true,
        name: user?.name || "You",
        profile: user?.profile || "",
      },
    ]);

    socket.emit("sendmsg", msgobj, (ack) => {
      if (!ack.ok) {
        enqueueSnackbar("Message not sent.", { variant: "error" });
      }
    });
    setNewMessage("");
    setTimeout(() => {
      document.querySelector(".chat-input-box input")?.focus();
    },10);
  };

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const url = isGroupChat
          ? `https://safewalk-xbkj.onrender.com/api/groupmsg/${selectedUser._id}`
          : `https://safewalk-xbkj.onrender.com/api/messages/${selectedUser._id}`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        pendingSocketMessages.current = [];
        setRawMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, isGroupChat]);

  useEffect(() => {
    if (!user) return;

    const formatted = rawMessages.map((msg) => {
      const isSelf = msg.from === user.id;

      return {
        id: msg._id,
        message: msg.msg,
        fromSelf: isSelf,
        profile: isGroupChat
          ? msg.profile
          : isSelf
          ? user.profile
          : selectedUser.profile,
      };
    });

    setreceivedmsg([...formatted, ...pendingSocketMessages.current]);
    pendingSocketMessages.current = [];
  }, [user, rawMessages]);

  useEffect(() => {
    if (isGroupChat && socket?.connected) {
      const groupId = selectedUser._id;
      if (!joinedGroups.current.has(groupId)) {
        socket.emit("joingroup", groupId);
        joinedGroups.current.add(groupId);
      }
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    if (!user) joinedGroups.current.clear();
  }, [user]);

  useEffect(() => {
    const handleReceive = (data) => {
      const incoming = {
        id: Date.now(),
        message: data.msg,
        fromSelf: false,
        name: data.name || "",
        profile: data.profile || "",
      };

      if (loading || !user) {
        pendingSocketMessages.current.push(incoming);
      } else {
        const shouldRender =
          (isGroupChat && data.groupId === selectedUser._id) ||
          (!isGroupChat && data.from === selectedUser._id);

        if (shouldRender) {
          setreceivedmsg((prev) => [...prev, incoming]);
        }
      }
    };

    socket.on("receivemsg", handleReceive);
    return () => socket.off("receivemsg", handleReceive);
  }, [loading, selectedUser, socket, isGroupChat, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [receivedmsg]);

  // Scroll to bottom when input is focused (for mobile)
  useEffect(() => {
    const inputBox = document.querySelector(".chat-input-box input");
    if (!inputBox) return;

    const handleFocus = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    };

    inputBox.addEventListener("focus", handleFocus);
    return () => inputBox.removeEventListener("focus", handleFocus);
  }, []);

  const renderAvatar = (source, fallbackChar) => {
    return source && source.trim() !== "" ? (
      <img src={source} className="avatar-img" alt="profile" />
    ) : (
      <div className="avatar-fallback">{fallbackChar.toUpperCase()}</div>
    );
  };

  return (
    <>
      <div className="chat-box">
        <div className="chat-header">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <HiArrowNarrowLeft className="back-icon" />
            </button>
          )}
          <div className="avatar">
            {renderAvatar(
              isGroupChat ? selectedUser.groupimg : selectedUser.profile,
              selectedUser.name?.charAt(0) ||
                selectedUser.email?.charAt(0) ||
                "?"
            )}
          </div>

          <div
            onClick={() => setgroupInfo(!groupInfo)}
            className="chat-header-content"
          >
            <div className="chat-title">{selectedUser.name}</div>

            {isGroupChat && (
              <div className="group-members-scroll">
                {selectedUser.member
                  .slice(0, Math.min(selectedUser.member.length, 5))
                  .map((m) => (
                    <span key={m._id} className="group-member-name">
                      @{m.username}
                    </span>
                  ))}
                {selectedUser.member.length > 5 && (
                  <span className="group-member-more">
                    +{selectedUser.member.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
              Loading messages...
            </div>
          ) : (
            <>
              {receivedmsg.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${
                    msg.fromSelf ? "from-self" : "from-other"
                  }`}
                >
                  {!msg.fromSelf && (
                    <div className="avatar">
                      {renderAvatar(
                        isGroupChat ? msg.profile : selectedUser.profile,
                        msg.name?.charAt(0) || "?"
                      )}
                    </div>
                  )}
                  <div className="message-bubble">{msg.message}</div>
                  {msg.fromSelf && (
                    <div className="avatar self-avatar">
                      {renderAvatar(
                        user?.profile,
                        user?.name?.charAt(0) || user?.email?.charAt(0) || "?"
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
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
      {groupInfo && isGroupChat && (
        <GroupInfoOverlay
          selectedUser={selectedUser}
          onClose={() => setgroupInfo(false)}
           onGroupUpdated={loadGroups}
          onLeaveGroup={async () => {
            const res = await fetch(
              "https://safewalk-xbkj.onrender.com/api/leavegroup",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ groupid: selectedUser._id }),
              }
            );
            const body = await res.json();
            if (res.ok) {
              loadGroups();
              navigate("/chat/groups");
            } else {
              enqueueSnackbar(body.msg , {variant : "warning"});
              setgroupInfo(false);
              onBack?.(); 
            }
          }}
        />
      )}
    </>
  );
};

export default ChatWindow;
