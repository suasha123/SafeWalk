const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectdb = require("./database/config");
const path = require("path");
const MongoStore = require("connect-mongo");
const { Server } = require("socket.io");
const sharedSession = require("express-socket.io-session");
const addchat = require('./Controllers/addchat');
require("dotenv").config();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
//DEFINE sessionMiddleware FIRST
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.uri,
    stringify: false,
    ttl: 24 * 60 * 60,
  }),
  cookie: {
    secure: true,         
    httpOnly: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  },
});

//Then use it with express
app.set("trust proxy", 1); // ✅ Required for secure cookies on Render
app.use(sessionMiddleware);

//Then set up CORS and body parser
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

require("./passport-config")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Create HTTP server and set up socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach session to socket
io.use(
  sharedSession(sessionMiddleware, {
    autoSave: true,
  })
);

//Socket logic
io.on("connection", (socket) => {
  const userId = socket.handshake.session?.passport?.user;
  console.log("User ID from session:", userId);
  socket.join(userId);
  socket.on("sendmsg" , async(msgObj , ack)=>{
    const {msg , to} = msgObj;
    const newmsobj = {msg , to , from : userId}
    const res = await addchat(newmsobj);
    if(res){
       io.to(to).emit("receivemsg" , newmsobj);
       ack && ack({ok : true});
    }
    else{
      ack && ack({ok : false});
    }
  })
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//Routes
app.use("/upload", require("./Routes/upload"));
app.use("/auth", require("./Routes/auth"));
app.use("/api", require("./Routes/userinfo"))
app.use(express.static(path.join(__dirname, "../Frontend/dist")));
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});
//Start server
server.listen(3000, () => {
  connectdb();
  console.log("Server started on http://localhost:3000");
});
