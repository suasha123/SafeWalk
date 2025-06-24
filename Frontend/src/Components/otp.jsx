import styles from "../Style/Signin.module.css";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
export const Otp = () => {
  return (
    <div className={styles.maindiv}>
      <div className={styles.secondivv}>
        <div style={{ textAlign: "center" }} className={styless.logo}>
          safeWalk
        </div>
        <h1 className={styles.h1}>Verify Otp</h1>
        <div className={styles.login}>
          <label className={styles.label} htmlFor="otp">
            Enter Otp :
          </label>
          <input
            className={styles.input}
            type="text"
            id="otp"
            placeholder="Enter the otp"
          />
          <button className={styles.button}>Sumbit</button>
        </div>
        <div style={{ marginTop: "35px", fontSize: "14px" }}>
          Resend Otp in{" "}
          <Link style={{ textDecoration: "none", color: "blue" }} to="/signup">
            Resend
          </Link>
        </div>
      </div>
    </div>
  );
};
