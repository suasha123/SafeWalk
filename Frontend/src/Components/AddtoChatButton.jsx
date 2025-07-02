import { useState } from "react";

export const AddToChatButton = ({ contact, onAdded }) => {
  const [status, setStatus] = useState("idle");

  const handleAdd = async () => {
    setStatus("loading");
    try {
      const res = await fetch("https://safewalk-xbkj.onrender.com/api/addchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ addeduser: contact.id }),
      });
      if (res.ok) {
        setStatus("success");
        if (onAdded) onAdded(); // refresh chat list in parent
      } else {
        setStatus("idle");
      }
    } catch (err) {
      setStatus("idle");
    }
  };

  return (
    <button
      className={`add-chat-btn ${status}`}
      onClick={handleAdd}
      disabled={status === "success" || status === "loading"}
    >
      {status === "loading"
        ? "Adding..."
        : status === "success"
        ? "Added"
        : "Add to Chat"}
    </button>
  );
};
