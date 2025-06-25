import { useState } from "react";
import styles from "../Style/Navbar.module.css";
import { FaUserGroup } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import Profilepic from "../assets/ss.jpg";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
export const NavBar = () => {
  const {isLoggedIn, setLoggedIn , user, setuser}  = useAuth();
  return (
    <div className={styles.maindiv}>
      <a href="#" className={styles.logo}>
        safeWalk
      </a>
      <div className={styles.groupdiv}>
        <div className={styles.groupinner }  style={{display : isLoggedIn ? "block" : "none"}}>
          <FaUserGroup style={{ color: "white", fontSize: "20px" }} />
          <span className={styles.d}>Your Group</span>
        </div>
        <div className={styles.groupinner} style={{display : isLoggedIn ? "block" : "none"}}>
          <IoMdNotificationsOutline
            style={{ color: "white", fontSize: "24px" }}
          />
          <span className={styles.d}>Notifications</span>
        </div>
      </div>
      <div>
        {isLoggedIn ? (
          <div className={styles.outer}>
            <img className={styles.profile} src={Profilepic} />
          </div>
        ) : (
          <Link to='/signin'>
          <button className={styles.button}>Sign-In</button>
          </Link>
        )}
      </div>
    </div>
  );
};
