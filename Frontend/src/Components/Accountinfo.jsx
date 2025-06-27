import { useState, useRef, useEffect } from "react";
import styles from "../Style/Accountoverlay.module.css";
import { useAuth } from "./AuthContext";

const AccountOverlay = ({ onClose }) => {
  const { user, setprofilecard } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    setprofilecard(false);
  }, []);
  const getAvatarLetter = () => {
    if (user.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    } else if (user.useremail) {
      return user.useremail.charAt(0).toUpperCase();
    }
    return "?";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      console.log("Selected file:", file);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.heading}>Account</h2>
        <p className={styles.subheading}>Manage your account information</p>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Profile</h3>
          <div className={styles.profileRow}>
            {user.profile ? (
              <img
                src={user.profile}
                alt="Profile"
                className={styles.avatar}
                style={{ objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <div className={styles.avatar}>{getAvatarLetter()}</div>
            )}
            <div>
              <p className={styles.name}>
                {user.name || user.useremail.split("@")[0]}
              </p>
              <p className={styles.email}>
                {user.useremail}
                <span className={styles.badge} style={{ marginLeft: "8px" }}>
                  Primary
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Edit Profile Section (Now moved here) */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Edit Profile</h3>

          <input
            className={styles.nameInput}
            type="text"
            placeholder="Enter new name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div
            className={styles.link}
            onClick={() => fileInputRef.current.click()}
          >
            Change profile picture
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />

          {previewImage && (
            <div className={styles.previewBox}>
              <img
                src={previewImage}
                alt="Preview"
                className={styles.previewImage}
              />
            </div>
          )}

          <div className={styles.updateBtnRow}>
            <button className={styles.updateBtn}>Update</button>
          </div>
        </section>

        {/* Security Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Security</h3>
          <p className={styles.link}>+ Set password</p>
        </section>

        {/* Danger Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Danger</h3>
          <div className={styles.dangerRow}>
            <div>
              <p className={styles.dangerTitle}>Delete Account</p>
              <p className={styles.dangerDesc}>
                Delete your account and all its associated data
              </p>
            </div>
            <button className={styles.deleteBtn}>Delete Account</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountOverlay;
