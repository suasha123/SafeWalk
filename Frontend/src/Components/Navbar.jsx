import { Fragment, useState } from "react";
import styles from "../Style/Navbar.module.css";
import stylepfp from "../Style/overlay.module.css";
import { FaUserGroup } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiMenu } from "react-icons/fi"; // Better hamburger
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import OverlayCard from "./overlaycard";
import AccountOverlay from "./Accountinfo";

export const NavBar = () => {
  const { isLoggedIn, user, setprofilecard, profile ,showOverlay , setShowOverlay} = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (menuOpen) setMenuOpen(false);
    setprofilecard(!profile);
  };
  return (
    <div className={styles.maindiv}>
      {(showOverlay || (isLoggedIn && !user.username)) && <AccountOverlay onClose={() => setShowOverlay(false)} />}
      <a href="#" className={styles.logo}>
        safeWalk
      </a>
      {isLoggedIn && (
        <div className={styles.groupdiv}>
          <div onClick={() => navigate("/chat")} className={styles.groupinner}>
            <FaUserGroup style={{ color: "white", fontSize: "20px" }} />
            <span className={styles.d}>Groups & Chats</span>
          </div>
          <div className={styles.groupinner}>
            <IoMdNotificationsOutline
              style={{ color: "white", fontSize: "24px" }}
            />
            <span className={styles.d}>Notifications</span>
          </div>
        </div>
      )}

      <div className={styles.rightSide}>
        {isLoggedIn && (
          <Fragment>
            <div className={styles.outer} onClick={handleProfileClick}>
              {user.profile ? (
                <img className={styles.profile} src={user.profile} />
              ) : (
                <div className={stylepfp.avatar}>
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.useremail.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div
              className={styles.menuIcon}
              onClick={() => {
                setMenuOpen((prev) => !prev), setprofilecard(false);
              }}
            >
              <FiMenu size={26} color="white" />
            </div>
          </Fragment>
        )}

        {menuOpen && (
          <div className={styles.overlayMenu}>
            <div
              onClick={() => {
                navigate("/chat");
                setMenuOpen(false);
              }}
              className={styles.groupinner}
            >
              <FaUserGroup style={{ color: "white", fontSize: "20px" }} />
              <span className={styles.d}>Groups & Chats</span>
            </div>
            <div className={styles.groupinner}>
              <IoMdNotificationsOutline
                style={{ color: "white", fontSize: "24px" }}
              />
              <span className={styles.d}>Notifications</span>
            </div>
          </div>
        )}
      </div>

      {!isLoggedIn && (
        <Link to="/signin">
          <button className={styles.button}>Sign-In</button>
        </Link>
      )}

      {isLoggedIn && <OverlayCard />}
    </div>
  );
};
