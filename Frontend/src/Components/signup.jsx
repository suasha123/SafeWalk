import styles from "../Style/Signin.module.css";
import { FcGoogle } from "react-icons/fc";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import { Backgroundcover } from "./bgcover";

export const SignUp = () => {
  const navigate = useNavigate();
  const { userdeatils, isLoggedIn, setDetails, msg, setvisited, loading } =
    useAuth();

  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (localStorage.getItem("attemptedGoogleLogIn") && msg) {
      enqueueSnackbar(msg, { variant: "warning" });
    }
    localStorage.removeItem("attemptedGoogleLogIn");
  }, [msg]);

  const handleGoogleLogin = () => {
    localStorage.setItem("attemptedGoogleLogIn", "true");
    window.location.href = "https://safewalk-xbkj.onrender.com/auth/google";
  };

  const checkUsername = async (value) => {
    setUsernameLoading(true);
    try {
      const res = await fetch(
        `https://safewalk-xbkj.onrender.com/auth/check-username?username=${value}`
      );
      const data = await res.json();
       setUsernameAvailable(data.available);
    } catch (err) {
      setUsernameAvailable(false);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameAvailable(null);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (value.trim().length > 2) {
        checkUsername(value.trim());
      }
    }, 600);
  };

  const sendotp = async () => {
    setvisited(true);
    if (!userdeatils.email || !userdeatils.password || !usernameAvailable) {
      enqueueSnackbar("Missing or invalid credentials", { variant: "warning" });
      return;
    }
    try {
      const res = await fetch("https://safewalk-xbkj.onrender.com/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userdeatils.email,
          password: userdeatils.password,
          username: username,
        }),
      });
      const resbody = await res.json();
      if (res.ok) {
        navigate("/otp-verify");
      } else {
        enqueueSnackbar(resbody.msg, { variant: "warning" });
      }
    } catch (err) {
      enqueueSnackbar("Error occurred", { variant: "error" });
    }
  };

  return loading || isLoggedIn ? (
    <Backgroundcover />
  ) : (
    <div className={styles.maindiv}>
      <div className={styles.secondiv}>
        <div style={{ textAlign: "center" }} className={styless.logo}>
          safeWalk
        </div>
        <h1 className={styles.h1}>Signup to make account</h1>
        <div className={styles.login}>
          <button onClick={handleGoogleLogin} className={styles.googlebutton}>
            <FcGoogle style={{ fontSize: "18px" }} />
            Continue with Google
          </button>
          <div className={styles.line}>or</div>

          {/* ✅ Username Field */}
          <label className={styles.label} htmlFor="username">
            Username :
          </label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type="text"
              id="username"
              value={username}
              placeholder="Enter username"
              onChange={handleUsernameChange}
              style={{
                borderColor:
                  usernameAvailable === null
                    ? "#e7e9ed"
                    : usernameAvailable
                    ? "green"
                    : "red",
              }}
            />
            {usernameLoading && <div className={styles.spinner}></div>}
          </div>

          {/* Email Field */}
          <label className={styles.label} htmlFor="email">
            Email address :
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={userdeatils.email}
            placeholder="Enter your email"
            onChange={(e) =>
              setDetails({ ...userdeatils, email: e.target.value })
            }
          />

          {/* Password Field */}
          <label className={styles.label} htmlFor="password">
            Enter password :
          </label>
          <input
            value={userdeatils.password}
            onChange={(e) =>
              setDetails({ ...userdeatils, password: e.target.value })
            }
            className={styles.input}
            type="password"
            id="password"
            placeholder="Enter your password"
          />

          {/* OTP Button */}
          <button onClick={sendotp} className={styles.button}>
            Verify OTP
          </button>
        </div>

        <div style={{ marginTop: "35px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link style={{ textDecoration: "none", color: "blue" }} to="/signin">
            SignIn
          </Link>
        </div>
      </div>
    </div>
  );
};
