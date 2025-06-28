import styles from "../Style/Signin.module.css";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { Backgroundcover } from "./bgcover";
export const Otp = () => {
  const navigate = useNavigate();
  const {
    userdeatils,
    visitedsignup,
    setLoggedIn,
    setuser,
    isLoggedIn,
    loading,
  } = useAuth();

  const [otpnumber, setotp] = useState("");
  useEffect(() => {
    if (!visitedsignup) {
      navigate("/signup");
      return ;
    }
    if (!isLoggedIn || !loading) {
      enqueueSnackbar("OTP send successfully", { variant: "success" });
    }
  }, []);
    useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);
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
        setuser(res);
        setLoggedIn(true);
        navigate("/");
      } else {
        setLoggedIn(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return  loading || isLoggedIn ? (
    <Backgroundcover />
  ) : (
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
