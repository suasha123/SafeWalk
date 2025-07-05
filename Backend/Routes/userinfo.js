const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinaryconfig");
const usermodel = require("../database/model/usermodel");
const chatAddModel = require("../database/model/addtochatmodel");
const chatmodel = require("../database/model/ChatModel");
const GroupModal = require("../database/model/groupmodel");
const parser = multer({ storage });
router.post("/addgroup", parser.single("groupimg"), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ msg: "Cannot crate a group" });
    }
    const { groupname } = req.body;
    const groupurl = req.file.path;
    const newgroup = await GroupModal.create({
      name: groupname,
      groupimg: groupurl,
      member: [req.session.passport.user],
    });
    if (newgroup) {
      res.status(200).json({ newgroup, msg: "Group Created succesufully" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/messages/:userId", async (req, res) => {
  try {
    const currentuserId = req.session?.passport?.user;
    if (!currentuserId) {
      return res.status(404).json({ msg: "Log In again" });
    }
    const selectedUserId = req.params.userId;
    const messages = await chatmodel
      .find({
        $or: [
          { from: currentuserId, to: selectedUserId },
          { from: selectedUserId, to: currentuserId },
        ],
      })
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch messages" });
  }
});
router.get("/getaddedchat", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(404).json({ msg: "Cannot process" });
    }
    const userId = req.session?.passport?.user;
    const addedlist = await chatAddModel
      .findOne({ addedby: userId })
      .populate("added", "name email _id profile");
    return res
      .status(200)
      .json({ msg: "ok", userslist: addedlist ? addedlist.added : [] });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ msg: "Cannot process" });
  }
});
router.post("/addchat", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ msg: "Not authenticated" });
  }
  const { addeduser } = req.body;
  const userId = req.session?.passport?.user;
  if (!addeduser) {
    return res.status(400).json({ msg: "No user provided to add" });
  }
  try {
    let existing = await chatAddModel.findOne({ addedby: userId });
    if (!existing) {
      existing = new chatAddModel({
        addedby: userId,
        added: [addeduser],
      });
    } else {
      if (!existing.added.includes(addeduser)) {
        existing.added.push(addeduser);
      } else {
        return res.status(409).json({ msg: "User already added" });
      }
    }
    await existing.save();
    res.status(200).json({ msg: "User added successfully" });
  } catch (err) {
    console.error("Error adding chat user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.post("/getusers", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(404).json({ msg: "Cannot process" });
  }
  const { username } = req.body;
  const user = await usermodel.findOne({ username });
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  return res.status(200).json({
    profile: user.profile,
    name: user.name,
    email: user.email,
    id: user.id,
    username: user.username,
  });
});
module.exports = router;
