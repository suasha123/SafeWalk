import styles from "../Style/Signin.module.css";
import { FcGoogle } from "react-icons/fc";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
export const SignIn = () => {
  const [userdeatils, setDetails] = useState({ email: "", password: "" });
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  function displaydetails() {
    console.log(userdeatils);
  }
  return (
    <div className={styles.maindiv}>
      <div className={styles.secondiv}>
        <div style={{ textAlign: "center" }} className={styless.logo}>
          safeWalk
        </div>
        <h1 className={styles.h1}>Log In to continue</h1>
        <div className={styles.login}>
          <button onClick={handleGoogleLogin} className={styles.googlebutton}>
            <FcGoogle style={{ fontSize: "18px" }} />
            Continue with Google
          </button>
          <div className={styles.line}>or</div>
          <label className={styles.label} htmlFor="email">
            Email address :
          </label>
          <input
            className={styles.input}
            value={userdeatils.email}
            type="email"
            id="email"
            placeholder="Enter your email"
            onChange={(e) =>
              setDetails({ ...userdeatils, email: e.target.value })
            }
          />
          <label className={styles.label} htmlFor="password">
            Enter password :
          </label>
          <input
            className={styles.input}
            value={userdeatils.password}
            type="password"
            id="password"
            placeholder="Enter your password"
            onChange={(e) =>
              setDetails({ ...userdeatils, password: e.target.value })
            }
          />
          <button className={styles.button} onClick={() => displaydetails()}>
            Sumbit
          </button>
        </div>
        <div style={{ marginTop: "35px", fontSize: "14px" }}>
          Don't have account?{" "}
          <Link style={{ textDecoration: "none", color: "blue" }} to="/signup">
            SignUp
          </Link>
        </div>
      </div>
    </div>
  );
};
