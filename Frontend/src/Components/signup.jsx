import styles from "../Style/Signin.module.css";
import { FcGoogle } from "react-icons/fc";
import styless from "../Style/Navbar.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
export const SignUp = () => {
  const navigate = useNavigate();
  const {userdeatils , setDetails} = useAuth();
  const sendotp = async () => {
    if(!userdeatils.email || !userdeatils.password){
      return;
    }
    try {
      const res = await fetch("/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userdeatils.email , password : userdeatils.password }),
      });
      if (res.ok) {
        navigate('/otp-verify');
      }
      else{
        console.log("otp not send");
      }
    } catch (err) {
       console.log(err);
    }
  };
  return (
    <div className={styles.maindiv}>
      <div className={styles.secondiv}>
        <div style={{ textAlign: "center" }} className={styless.logo}>
          safeWalk
        </div>
        <h1 className={styles.h1}>Signup to make account</h1>
        <div className={styles.login}>
          <button className={styles.googlebutton}>
            <FcGoogle style={{ fontSize: "18px" }} />
            Continue with Google
          </button>
          <div className={styles.line}>or</div>
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
          <button
            onClick={sendotp}
            className={styles.button}
          >
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
