import { useEffect } from "react";
import { createContext, useContext } from "react";
import { useState } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [msg, setmsg] = useState("");
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedsignup , setvisited] = useState(false);
  const [userdeatils, setDetails] = useState({ email: "", password: "" });
  useEffect(() => {
    const checklogin = async () => {
      try {
        const response = await fetch("/auth/check", {
          credentials: "include",
        });
        if (response) {
          setTimeout(()=>{
           setLoading(false);
          },2000);
        }
        const data = await response.json();
        if (response.ok) {
          setLoggedIn(true);
          setuser(data.useremail);
          if (localStorage.getItem("attemptedGoogleLogIn") != null) {
            localStorage.removeItem("attemptedGoogleLogIn");
          }
        } else {
          if (localStorage.getItem("attemptedGoogleLogIn") && !response.ok) {
            setmsg("Try Another Method");
          }
        }
      } catch (err) {
        setLoggedIn(false);
        setuser(null);
      }
    };
    checklogin();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        msg,
        isLoggedIn,
        setLoggedIn,
        user,
        setuser,
        userdeatils,
        setDetails,
        loading,
        setLoading,
        visitedsignup ,
         setvisited
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
