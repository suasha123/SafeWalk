const express = require("express");
const app = express();
const passport = require("passport");
const argon2 = require("argon2");
const router = express.Router();
app.use(express.json());
const sendmail = require("../utils/mail");
const otpmodel = require("../database/model/otpmodel");
const usermodel = require("../database/model/usermodel");
require("dotenv").config();
router.get("/check-username", async (req, res) => {
   console.log(req);
   console.log(req.query.username)
  try {
    const username = req.query.username;
    const user = await usermodel.findOne({ username });
    console.log(user);
    if(!user){
     return res.status(200).json({ available: true });
    }
    else{
     return res.status(200).json({ available: false });
    }
  } catch (err) {
   return res.status(500).json({msg : "Server error"})
  }
});
router.get("/signout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ msg: "Logout error" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ msg: "Logged out" });
    });
  });
});
router.post("/otp", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Enter credentials" });
  }
  const userexists = await usermodel.findOne({ email });
  if (userexists) {
    return res.status(400).json({ msg: "User Already exists" });
  }
  await otpmodel.deleteMany({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedotp = await argon2.hash(otp);
  try {
    await sendmail(email, otp);
    await otpmodel.create({
      email,
      otp: hashedotp,
      expire: Date.now() + 2 * 60 * 1000,
    });
    return res.status(200).json({ msg: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ msg: "Failed to send OTP" });
  }
});

router.post("/verifyuser", async (req, res) => {
  try {
    const { otpcode, email, password } = req.body;
    const storedotp = await otpmodel.findOne({ email });
    if (!storedotp) {
      return res.status(404).json({ msg: "OTP not found" });
    }
    const isvalid = await argon2.verify(
      storedotp.otp,
      otpcode.toString().trim()
    );
    if (!isvalid) {
      return res.status(403).json({ msg: "Invalid OTP" });
    }
    if (storedotp.expire < Date.now()) {
      return res.status(403).json({ msg: "Invalid OTP" });
    }
    await otpmodel.deleteOne({ email });
    const hashedpassword = await argon2.hash(password);
    const newuser = await usermodel.create({
      email,
      password: hashedpassword,
    });
    req.logIn(newuser, (err) => {
      if (err) {
        return res.status(500).json({ msg: "Registration failed" });
      }
      const { email } = req.user;
      return res.status(200).json({ useremail: email, msg: "User Registered" });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ msg: "Missing credentials" });
  }
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ info });
    }
    if (!user) {
      return res.status(401).json({ info });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ msg: "Login failed" });
      }
      const { email, profile, name } = req.user;
      return res
        .status(200)
        .json({ useremail: email, profile, name, msg: "User LoggedIn" });
    });
  })(req, res, next);
});
router.get("/check", (req, res) => {
  if (req.isAuthenticated()) {
    const { email, profile, name } = req.user;
    return res.status(200).json({
      useremail: email,
      name,
      profile,
      isgoogleid: req.user.googleId ? "yes" : "no",
    });
  } else {
    return res.status(404).json({ msg: "Not loggedIn" });
  }
});
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "https://safee-walk.vercel.app",
    failureRedirect: "https://safee-walk.vercel.app/signin",
  })
);
module.exports = router;
