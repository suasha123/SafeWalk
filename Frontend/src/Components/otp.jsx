import styles from "../Style/Signin.module.css";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
export const Otp = () => {
  const navigate = useNavigate();
  const { userdeatils, setLoggedIn, setuser } = useAuth();
  const [otpnumber, setotp] = useState("");
  const verifyotp = async () => {
    try {
      const response = await fetch("/auth/verifyuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpcode: otpnumber,
          email: userdeatils.email,
          password: userdeatils.password,
        }),
      });
      setotp("");
      const res = await response.json();
      if (response.ok) {
        setuser(res.useremail);
        setLoggedIn(true);
        navigate('/');
      } else {
        setLoggedIn(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
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
            value={otpnumber}
            className={styles.input}
            type="text"
            id="otp"
            placeholder="Enter the otp"
            onChange={(e) => setotp(e.target.value)}
          />
          <button onClick={verifyotp} className={styles.button}>
            Sumbit
          </button>
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
