import { useAuth } from "./AuthContext";
import styles from "../Style/overlay.module.css";
import styless from "../Style/Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
const OverlayCard = () => {
  const navigate = useNavigate();
  const { profile, user, setShowOverlay, setuser, setLoggedIn } = useAuth();
  const signout = async () => {
    try {
      const response = await fetch("/auth/signout", {
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
              {user.name || user.useremail.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className={styles.name}>
              {user.name || user.useremail?.split("@")[0]}
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
            Manage account
          </button>
          <button onClick={signout} className={styles.actionBtn}>
            Sign out
          </button>
        </div>

        <p className={styles.footer}>Secured by Clerk</p>
      </div>
    )
  );
};

export default OverlayCard;
