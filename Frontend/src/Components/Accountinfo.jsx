import { useState, useRef, useEffect } from "react";
import styles from "../Style/Accountoverlay.module.css";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";

const AccountOverlay = ({ onClose }) => {
  const { user, setprofilecard, setuser ,   isLoggedIn } = useAuth();
  const [name, setName] = useState(user.username || "");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [image, setImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setprofilecard(false);
    if(isLoggedIn && !user.username){
        enqueueSnackbar("Please update your Username!", { variant: "warning" });
    }
  }, []);

  useEffect(() => {
    if (name !== user.username && name.length > 2) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => checkUsername(name), 600);
    } else {
      setUsernameAvailable(null);
    }
  }, [name, user.username]);

  const checkUsername = async (value) => {
    setCheckingUsername(true);
    try {
      const res = await fetch(
        `https://safewalk-xbkj.onrender.com/auth/check-username?username=${value}`
      );
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUpdate = async () => {
    if ((!image && name === user.username) || usernameAvailable === false) {
      enqueueSnackbar("Please make valid changes", { variant: "warning" });
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      if (name && name !== user.username) formData.append("username", name);

      const res = await fetch(
        "https://safewalk-xbkj.onrender.com/upload/profile",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setuser((prev) => ({
          ...prev,
          username: updated.username || prev.username,
          profile: updated.profile || prev.profile,
        }));
        setPreviewImage(null);
        setImage(null);
        setName(updated.username || user.username);
        onClose();
      } else {
        enqueueSnackbar("Cannot update profile", { variant: "warning" });
      }
    } catch {
      enqueueSnackbar("Server error", { variant: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const getAvatarLetter = () =>
    user.name?.[0]?.toUpperCase() || user.useremail?.[0]?.toUpperCase() || "?";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
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
              <img src={user.profile} alt="Profile" className={styles.avatar} />
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
                  {user.isgoogleid === "yes"
                    ? "Google verified"
                    : "Email verified"}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Edit Profile</h3>
          <div style={{ position: "relative", maxWidth: "250px" }}>
            <input
              className={styles.nameInput}
              style={{
                borderColor:
                  usernameAvailable === null
                    ? "#444"
                    : usernameAvailable
                    ? "green"
                    : "red",
              }}
              type="text"
              placeholder="Enter new username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {checkingUsername && (
              <span
                className={styles.spinner}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></span>
            )}
          </div>

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
            <button
              className={styles.updateBtn}
              disabled={
                updating || (name !== user.username && !usernameAvailable)
              }
              onClick={handleUpdate}
            >
              {updating ? (
                <>
                  <span className={styles.spinner}></span> Updating...
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Security</h3>
          <p className={styles.link}>+ Set password</p>
        </section>

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
