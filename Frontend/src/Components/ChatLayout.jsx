import React, { useState, useEffect } from "react";
import ChatWindow from "./Chattingwindowscreen";
import "../Style/chattingwindowscreen.css";
import { NavBar } from "./Navbar";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./SplashScreen";
const chatContacts = [
  { id: 1, name: "Nina", initial: "N" },
  { id: 2, name: "Alex", initial: "A" },
];

const groupChats = [{ id: 99, name: "React Buddies", initial: "R" }];

const ChatLayout = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chats");
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const currentList = activeTab === "chats" ? chatContacts : groupChats;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn]);

  const handleContactClick = (contact) => {
    setActiveChat(contact);
  };

  const handleBack = () => {
    setActiveChat(null);
  };
if(loading){
    return(
        <SplashScreen />
    )
}
  return (
    <>
      <NavBar />
      <div className="full-center-wrapper">
        <div className="main-chat-layout">
          <div
            className={`sidebar ${
              isMobile && activeChat ? "hidden-on-mobile" : ""
            }`}
          >
            <div className="sidebar-header">
              <button
                className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
                onClick={() => setActiveTab("chats")}
              >
                Chats
              </button>
              <button
                className={`tab-btn ${activeTab === "groups" ? "active" : ""}`}
                onClick={() => setActiveTab("groups")}
              >
                Groups
              </button>
            </div>
            <h2 className="sidebar-title">
              {activeTab === "chats" ? "Your Chats" : "Your Groups"}
            </h2>
            <div className="sidebar-scroll">
              {currentList.map((contact) => (
                <div
                  key={contact.id}
                  className={`contact ${
                    activeChat?.id === contact.id ? "active" : ""
                  }`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="avatar">{contact.initial}</div>
                  <div className="contact-name">{contact.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`chat-area ${
              isMobile && !activeChat ? "hidden-on-mobile" : ""
            }`}
          >
            {activeChat ? (
              <ChatWindow
                selectedUser={activeChat}
                onBack={isMobile ? handleBack : null}
              />
            ) : (
              <div className="placeholder">
                <p className="placeholder-text">
                  Select a chat to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatLayout;
