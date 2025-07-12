import { useAuth } from "./AuthContext";
import styles from "../Style/overlay.module.css";
import styless from "../Style/Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { CiSettings } from "react-icons/ci";
import { GoSignOut } from "react-icons/go";

const OverlayCard = () => {
  const navigate = useNavigate();
  const { profile, user, setShowOverlay, setuser, setLoggedIn } = useAuth();

  const signout = async () => {
    try {
      const response = await fetch("https://safewalk-xbkj.onrender.com/auth/signout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setuser(null);
        setLoggedIn(false);
      } else {
        enqueueSnackbar("Cannot Signout", { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Cannot Signout", { variant: "warning" });
    }
  };

  return (
    profile && (
      <div className={styles.cardContainer}>
        <div className={styles.profileSection}>
          {user.profile ? (
            <img className={styless.profile} src={user.profile} />
          ) : (
            <div className={styles.avatar}>
              { user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className={styles.name}>
              {user.username}
            </p>
            <p className={styles.email}>{user.useremail}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => {
              setShowOverlay(true);
            }}
            className={styles.actionBtn}
          >
            <CiSettings className={styles.icon} />
            Manage account
          </button>
          <button onClick={signout} className={styles.actionBtn}>
            <GoSignOut className={styles.icon} />
            Sign out
          </button>
        </div>

        <p className={styles.footer}>{user.isgoogleid=== "yes" ? "Verified by Google" : "Verified by email"}</p>
      </div>
    )
  );
};

export default OverlayCard;
