import { useEffect } from "react";
import { createContext, useContext } from "react";
import { useState } from "react";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setuser] = useState(null);
  const [userdeatils, setDetails] = useState({ email: "", password: "" });
  useEffect(() => {
    const checklogin = async () => {
      try {
        const response = await fetch("/auth/check", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setLoggedIn(true);
          setuser(response.useremail);
        }
      } catch (err) {
        setLoggedIn(false);
        setuser(null);
      }
    };
    checklogin();
  }, []);
  return <AuthContext.Provider value={{isLoggedIn , setLoggedIn , user , setuser ,userdeatils , setDetails}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
