import { useState, useRef, useEffect } from "react";
import styles from "../Style/Accountoverlay.module.css";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const AccountOverlay = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, setprofilecard, setuser } = useAuth();
  const [name, setName] = useState(user.username);
  const [previewImage, setPreviewImage] = useState(null);
  const [changename, setchanename] = useState(false);
  const [image, setimage] = useState(null);
  const [updating, setUpdating] = useState(false); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    setprofilecard(false);
  }, []);

  const handlechange = async () => {
    if (!changename && !image) {
      enqueueSnackbar("Input required", { variant: "warning" });
      return;
    }

    setUpdating(true); 

    try {
      const formdata = new FormData();
      if (image) formdata.append("image", image);
      if (name) formdata.append("username", name);

      const res = await fetch("https://safewalk-xbkj.onrender.com/upload/profile", {
        method: "POST",
        body: formdata,
        credentials: "include",
      });

      if (res.ok) {
        const updated = await res.json();
        setuser(prev => ({
          ...prev,
          username: updated.username || prev.username,
          profile: updated.profile || prev.profile,
        }));
        setPreviewImage(null);
        setimage(null);
        setName(updated.username || user.username);
        onClose();
      } else {
        enqueueSnackbar("Cannot Update Profile", { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Cannot Update Profile", { variant: "error" });
    } finally {
      setUpdating(false);
    }
  };

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
      setimage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
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
                  {user.isgoogleid=="yes" ? "Google verified" : "Email verified"}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Edit Profile</h3>

          <input
            className={styles.nameInput}
            type="text"
            placeholder="Enter new username"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setchanename(true);
            }}
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

          <div onClick={!updating ? handlechange : undefined} className={styles.updateBtnRow}>
            <button className={styles.updateBtn} disabled={updating}>
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
