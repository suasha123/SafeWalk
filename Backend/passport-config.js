const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    console.log("use hai -> " + user.id);
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    return done(null, {
      _id: id,
      username: "testuser",
      email: "test@example.com",
    });
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ClientId,
        clientSecret: process.env.GOOGLE_ClientSecetKey,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          return done(null, profile, {msg : "LoggedIn"});
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
