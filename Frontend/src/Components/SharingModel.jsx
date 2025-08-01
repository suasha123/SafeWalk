import { useState } from "react";
import "../Style/SharingModel.css";
import { IoCloseCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
const ModalOverlay = ({ link, onClose }) => {
const [copied, setCopied] = useState(false);
const navigate = useNavigate();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy.");
    }
  };

  const handleProceed = () => {
    navigate("/chat");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Share Safe Walk Link</h2>
        <p className="modal-link" title={link}>{link}</p>
        <div className="modal-actions">
          <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button className="proceed-btn" onClick={handleProceed}>
            Proceed
          </button>
          <button className="close-btn" onClick={onClose}>
            <IoCloseCircleSharp />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOverlay;
