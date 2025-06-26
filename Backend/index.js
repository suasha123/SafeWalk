const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectdb = require("./database/config");
const path = require("path");
const MongoStore = require("connect-mongo");
require("dotenv").config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store : MongoStore.create({
     mongoUrl : process.env.uri,
     stringify: false ,
     ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
require("./passport-config")(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", require("./Routes/auth"));
app.use(express.static(path.join(__dirname, "../Frontend/dist")));
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});
app.listen(3000, () => {
  connectdb();
  console.log("Server started on http://localhost:3000");
});
