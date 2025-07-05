import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatWindow from "./Chattingwindowscreen";
import "../Style/chattingwindowscreen.css";
import { NavBar } from "./Navbar";
import { useAuth } from "./AuthContext";
import { SplashScreen } from "./SplashScreen";
import { AddToChatButton } from "./AddtoChatButton";
import { FaPlus } from "react-icons/fa";
import { GroupOverlayModal } from "./Addgroupoverlay";
import { useRef } from "react";
const ChatLayout = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const { tab = "chats", entityId } = useParams();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(tab);
  const [currentChat, setCurrentChat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [searching, setSearching] = useState(false);
  const chatref = useRef(null);
  const isSearching = searchResults !== null;
  const displayList = isSearching
    ? searchResults
    : selectedTab === "chats"
    ? contacts
    : groupChats;

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/api/getaddedchat",
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setContacts(data.userslist);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (chatref.current) {
      chatref.current.scrollIntoView({ behavior: "smooth" });
    }
    return () => {
    chatref.current = null;
  };
  }, [currentChat]);

  const loadGroups = async () => {
    try {
      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/api/getgroups",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setGroupChats(data.groups);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate("/");
    if (!loading && isLoggedIn) {
      loadContacts();
      loadGroups();
    }
  }, [loading, isLoggedIn]);

  useEffect(() => {
    setSelectedTab(tab);
    if (entityId) {
      if (tab === "chats" && contacts) {
        const found = contacts.find((c) => c._id === entityId);
        if (found) setCurrentChat(found);
      } else if (tab === "groups" && groupChats) {
        const found = groupChats.find((g) => g._id === entityId);
        if (found) setCurrentChat(found);
      }
    } else {
      setCurrentChat(null);
    }
  }, [tab, entityId, contacts, groupChats]);

  const handleClickItem = (item) => {
    setCurrentChat(item);
    navigate(`/chat/${selectedTab}/${item._id || item.id}`);
  };

  const handleNewSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/api/getusers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: searchTerm }),
        }
      );
      const result = await res.json();
      if (res.ok) setSearchResults([result]);
      else setSearchResults([]);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults(null);
  };

  const goBack = () => {
    setCurrentChat(null);
    navigate(`/chat/${selectedTab}`);
  };

  if (loading) return <SplashScreen />;

  return (
    <>
      <NavBar />
      <div className="full-center-wrapper">
        <div className="main-chat-layout">
          <div
            ref={chatref}
            className={`sidebar ${
              isMobile && currentChat ? "hidden-on-mobile" : ""
            }`}
          >
            <div className="sidebar-header">
              <button
                className={`tab-btn ${selectedTab === "chats" ? "active" : ""}`}
                onClick={() => {
                  setSelectedTab("chats");
                  clearSearch();
                  navigate("/chat/chats");
                }}
              >
                Chats
              </button>
              <button
                className={`tab-btn ${
                  selectedTab === "groups" ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedTab("groups");
                  clearSearch();
                  navigate("/chat/groups");
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
                  <button className="clear-search-btn" onClick={clearSearch}>
                    ✕
                  </button>
                )}
              </div>
              <button
                className="new-chat-btn"
                onClick={handleNewSearch}
                disabled={searching}
                style={{
                  backgroundColor: searching ? "#4c3ba3" : "#7e4fff",
                  cursor: searching ? "not-allowed" : "pointer",
                }}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {!searching && (
              <h2 className="sidebar-title">
                {isSearching
                  ? "Search Results"
                  : selectedTab === "chats"
                  ? "Your Chats"
                  : "Your Groups"}
              </h2>
            )}

            <div className="sidebar-scroll">
              {searching ? (
                <div className="loading-spinner">
                  <div className="spinner-circle"></div>
                  <p>Searching...</p>
                </div>
              ) : contacts === null && selectedTab === "chats" ? (
                <div className="loading-spinner">
                  <div className="spinner-circle"></div>
                  <p>Loading Chats...</p>
                </div>
              ) : displayList.length === 0 ? (
                <p style={{ color: "#aaa", padding: "10px" }}>
                  {isSearching ? "No user found." : "No contacts."}
                </p>
              ) : (
                displayList.map((item) => {
                  const isAdded = contacts?.some(
                    (c) => c._id === item._id || c._id === item.id
                  );

                  return (
                    <div
                      key={item._id || item.id}
                      className={`contact ${
                        currentChat?._id === item._id ||
                        currentChat?.id === item.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleClickItem(item)}
                    >
                      <div className="avatar">
                        {item.profile || item.groupimg ? (
                          <img
                            src={item.profile || item.groupimg}
                            className="avatar-img"
                            alt="profile"
                          />
                        ) : (
                          <div className="avatar-fallback">
                            {(
                              item.name?.charAt(0) ||
                              item.email?.charAt(0) ||
                              "?"
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="contact-info-wrapper">
                        <div className="contact-name">{item.name}</div>
                        {isSearching && !isAdded && selectedTab === "chats" && (
                          <AddToChatButton
                            contact={item}
                            onAdded={loadContacts}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {selectedTab === "groups" && (
              <button
                className="create-group-fab"
                onClick={() => setShowGroupModal(true)}
              >
                <FaPlus />
              </button>
            )}
          </div>

          <div
            className={`chat-area ${
              isMobile && !currentChat ? "hidden-on-mobile" : ""
            }`}
          >
            {currentChat ? (
              <ChatWindow
                selectedUser={currentChat}
                onBack={isMobile ? goBack : null}
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
      {showGroupModal && (
        <GroupOverlayModal onClose={() => setShowGroupModal(false)} />
      )}
    </>
  );
};

export default ChatLayout;
