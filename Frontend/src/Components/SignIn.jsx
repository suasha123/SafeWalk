import styles from "../Style/Signin.module.css";
import { FcGoogle } from "react-icons/fc";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
import { Backgroundcover } from "./bgcover";
export const SignIn = () => {
  const navigate = useNavigate();
  const {
    setLoggedIn,
    isLoggedIn,
    setuser,
    userdeatils,
    setDetails,
    msg,
    loading,
  } = useAuth();
  useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate("/");
    }
  }, [loading, isLoggedIn, navigate]);
  const handleGoogleLogin = () => {
    localStorage.setItem("attemptedGoogleLogIn", "true");
    window.location.href = "https://safewalk-xbkj.onrender.com/auth/google";
  };
  useEffect(() => {
    if (localStorage.getItem("attemptedGoogleLogIn") && msg) {
      enqueueSnackbar(msg, { variant: "warning" });
      localStorage.removeItem("attemptedGoogleLogIn");
    }
  }, [msg]);
  const handlelogin = async () => {
    try {
      const response = await fetch("https://safewalk-xbkj.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userdeatils.email,
          password: userdeatils.password,
        }),
      });
      setDetails({ email: "", password: "" });
      const res = await response.json();
      if (response.ok) {
        setuser(res);
        setLoggedIn(true);
        navigate("/");
      } else {
        setLoggedIn(false);
        enqueueSnackbar(res.info ? res.info.msg : res.msg, {
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error occured", { variant: "error" });
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
          <button className={styles.button} onClick={handlelogin}>
            Submit
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
