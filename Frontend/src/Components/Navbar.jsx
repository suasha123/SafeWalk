import { Fragment, useState } from "react";
import styles from "../Style/Navbar.module.css";
import stylepfp from "../Style/overlay.module.css";
import { FaUserGroup } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import Profilepic from "../assets/ss.jpg";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import OverlayCard from "./overlaycard";
export const NavBar = () => {
  const { isLoggedIn, setLoggedIn, user, setuser, setprofilecard, profile } =
    useAuth();
  return (
    <div className={styles.maindiv}>
      <a href="#" className={styles.logo}>
        safeWalk
      </a>
      <div className={styles.groupdiv}>
        <div
          className={styles.groupinner}
          style={{ display: isLoggedIn ? "block" : "none" }}
        >
          <FaUserGroup style={{ color: "white", fontSize: "20px" }} />
          <span className={styles.d}>Your Group</span>
        </div>
        <div
          className={styles.groupinner}
          style={{ display: isLoggedIn ? "block" : "none" }}
        >
          <IoMdNotificationsOutline
            style={{ color: "white", fontSize: "24px" }}
          />
          <span className={styles.d}>Notifications</span>
        </div>
      </div>
      <div>
        {isLoggedIn ? (
          <Fragment>
            <div
              className={styles.outer}
              onClick={() => {
                setprofilecard(!profile);
              }}
            >
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
            <OverlayCard />
          </Fragment>
        ) : (
          <Link to="/signin">
            <button className={styles.button}>Sign-In</button>
          </Link>
        )}
      </div>
    </div>
  );
};
