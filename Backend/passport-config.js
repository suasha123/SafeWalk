const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require('mongoose')
const argon2 = require("argon2");
const User = require("./database/model/usermodel");
const { Session } = require("express-session");
require("dotenv").config();
module.exports = async function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  });
  passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ClientId,
      clientSecret: process.env.GOOGLE_ClientSecetKey,
      callbackURL: "https://safewalk-xbkj.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        // If user not found by googleId
        if (!user) {
          // Check if another account exists with the same email
          const findemailuser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (findemailuser) {
            return done(null, false, { msg: "Log in with another method" });
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profile: profile.photos[0]?.value || null,
            username : profile.emails[0].value.split("@")[0]
          });
        } else {
          // Update profile photo if it wasn't stored before
          if (!user.profile && profile.photos?.[0]?.value) {
            user.profile = profile.photos[0].value;
            await user.save();
          }
        }

        // Optional: clear existing session for the same user
        await mongoose.connection.db.collection("sessions").deleteMany({
          "session.passport.user": user._id.toString(),
        });
        return done(null, user, { msg: "LoggedIn" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          let user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { msg: "User Not found" });
          }
          if (user && user.password == null) {
            return done(null, false, { msg: "Login Via Google" });
          }
          const iscorrect = await argon2.verify(user.password, password);
          if (!iscorrect) {
            return done(null, false, { msg: "Wrong password" });
          }
           await mongoose.connection.db.collection("sessions").deleteMany({
            "session.passport.user": user._id.toString()
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
