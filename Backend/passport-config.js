const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const argon2 = require('argon2');
const User = require("./database/model/usermodel");
require("dotenv").config();
module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    // console.log("use hai -> " + user.id);
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
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id});
          if (!user) {
            const findemailuser = await User.findOne({email : profile.emails[0].value});
            if(findemailuser){
              return done(null , false , {msg : "Log in with another method"});
            }
            await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            });
          }
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
        try{
          let user = await User.findOne({email});
          if(!user){
            return done(null , false , {msg : "User Not found"});
          }
          if(user && user.password==null){
            return done(null , false , {msg : "Login Via Google"});
          }
          const iscorrect = await argon2.verify(password , user.password);
          if(!iscorrect){
            return done(null , false , {msg  : "Wrong password"});
          }
          return done(null , user);
        }
        catch(err){
          return done(err);
        }

      }
    )
  );
};
