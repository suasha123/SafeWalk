import React, { useState, useEffect } from "react";
import ChatWindow from "./Chattingwindowscreen";
import "../Style/chattingwindowscreen.css";
import { NavBar } from "./Navbar";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./SplashScreen";
import { AddToChatButton } from "./AddtoChatButton";

const groupChats = [{ id: 99, name: "React Buddies", initial: "R" }];

const ChatLayout = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("chats");
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [chatContacts, setChatContacts] = useState(null);
  const [searching, setSearching] = useState(false);

  const showSearchResults = searchResults !== null;

  const currentList = showSearchResults
    ? searchResults
    : activeTab === "chats"
    ? chatContacts
    : groupChats;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshChatContacts = async () => {
    try {
      const response = await fetch(`https://safewalk-xbkj.onrender.com/api/getaddedchat`, {
        credentials: "include",
      });
      if (response.ok) {
        const body = await response.json();
        setChatContacts(body.userslist);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/");
    }

    if (!loading && isLoggedIn) {
      refreshChatContacts();
    }
  }, [loading, isLoggedIn]);

  const handleContactClick = (contact) => {
    setActiveChat(contact);
  };

  const handleNewChat = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch("https://safewalk-xbkj.onrender.com/api/getusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: searchTerm }),
      });

      if (res.ok) {
        const user = await res.json();
        setSearchResults([user]);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.log(err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleBack = () => {
    setActiveChat(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults(null);
  };

  if (loading) return <SplashScreen />;

  return (
    <>
      <NavBar />
      <div className="full-center-wrapper">
        <div className="main-chat-layout">
          <div
            className={`sidebar ${isMobile && activeChat ? "hidden-on-mobile" : ""}`}
          >
            <div className="sidebar-header">
              <button
                className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("chats");
                  handleClearSearch();
                }}
              >
                Chats
              </button>
              <button
                className={`tab-btn ${activeTab === "groups" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("groups");
                  handleClearSearch();
                }}
              >
                Groups
              </button>
            </div>

            <div className="new-chat-container">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search username..."
                  className="new-chat-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={handleClearSearch}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                className="new-chat-btn"
                onClick={handleNewChat}
                disabled={searching}
                style={{
                  backgroundColor: searching ? "#4c3ba3" : "#7e4fff",
                  cursor: searching ? "not-allowed" : "pointer",
                }}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            <h2 className="sidebar-title">
              {showSearchResults
                ? "Search Results"
                : activeTab === "chats"
                ? "Your Chats"
                : "Your Groups"}
            </h2>

            <div className="sidebar-scroll">
              {searching ? (
                <div className="loading-spinner">
                  <div className="spinner-circle"></div>
                  <p className="loading-text">Searching...</p>
                </div>
              ) : chatContacts === null ? (
                <div className="loading-spinner">
                  <div className="spinner-circle"></div>
                  <p className="loading-text">Loading Chats...</p>
                </div>
              ) : currentList.length === 0 ? (
                <p style={{ color: "#aaa", padding: "10px" }}>
                  {showSearchResults ? "No user found." : "No contacts."}
                </p>
              ) : (
                currentList.map((contact) => {
                  const isAlreadyAdded = chatContacts.some(
                    (c) => c._id === contact._id || c._id === contact.id
                  );

                  return (
                    <div
                      key={contact._id || contact.id}
                      className={`contact ${
                        activeChat?._id === contact._id ||
                        activeChat?.id === contact.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        !showSearchResults && handleContactClick(contact)
                      }
                    >
                      <div className="avatar">
                        {contact.profile ? (
                          <img
                            src={contact.profile}
                            className="avatar-img"
                            alt="profile"
                          />
                        ) : (
                          <div className="avatar-fallback">
                            {(contact.name?.charAt(0) || contact.email?.charAt(0) || "?").toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="contact-info-wrapper">
                        <div className="contact-name">{contact.name}</div>
                        {showSearchResults && !isAlreadyAdded && (
                          <AddToChatButton
                            contact={contact}
                            onAdded={refreshChatContacts}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className={`chat-area ${isMobile && !activeChat ? "hidden-on-mobile" : ""}`}
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
