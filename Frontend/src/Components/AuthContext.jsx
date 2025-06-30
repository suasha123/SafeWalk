import { useEffect } from "react";
import { createContext, useContext } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [msg, setmsg] = useState("");
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setprofilecard] = useState(false);
  const [visitedsignup, setvisited] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [userdeatils, setDetails] = useState({ email: "", password: "" });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newsocket = io("http://localhost:3000", {
      withCredentials: true,
    });
    setSocket(newsocket);
    const checklogin = async () => {
      try {
        const response = await fetch("/auth/check", {
          credentials: "include",
        });
        if (response) {
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        }
        const data = await response.json();
        if (response.ok) {
          setLoggedIn(true);
          setuser(data);
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
    return () => newsocket.disconnect();
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
        visitedsignup,
        setvisited,
        setprofilecard,
        profile,
        showOverlay,
        setShowOverlay,
        socket
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
