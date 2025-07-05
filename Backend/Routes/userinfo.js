const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinaryconfig");
const usermodel = require("../database/model/usermodel");
const chatAddModel = require("../database/model/addtochatmodel");
const chatmodel = require("../database/model/ChatModel");
const GroupModal = require("../database/model/groupmodel");
const { nanoid } = require("nanoid");
const GroupChatModel = require("../database/model/GroupChatModel");
const parser = multer({ storage });
router.post("/joingrp", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ msg: "Cannot join group" });
    }

    const userId = req.user._id;
    const { inviteCode } = req.body;

    const grp = await GroupModal.findOne({ invitecode: inviteCode });

    if (!grp) {
      return res.status(403).json({ msg: "No Group exists" });
    }
    if (!grp.member.includes(userId)) {
      grp.member.push(userId);
      await grp.save();
    }

    return res.status(200).json({ grplink: grp._id, msg: "Joined group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/addgroup", parser.single("groupimg"), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ msg: "Cannot crate a group" });
    }
    const { groupname } = req.body;
    const groupurl = req.file.path;
    const invitecode = "SW" + nanoid(6) + Date.now().toString().slice(-4);
    const newgroup = await GroupModal.create({
      name: groupname,
      groupimg: groupurl,
      member: [req.session.passport.user],
      invitecode,
    });
    if (newgroup) {
      res.status(200).json({ newgroup, msg: "Group Created succesufully" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/getgroups", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = req.session.passport.user;

    const groups = await GroupModal.find({ member: userId }).populate("member" , "username");

    res.status(200).json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/groupmsg/:groupId", async (req, res) => {
  try {
    const currentuserId = req.session?.passport?.user;
    if (!currentuserId) {
      return res.status(401).json({ msg: "Log In again" });
    }

    const groupId = req.params.groupId;

    const isUserInGroup = await GroupModal.findOne({
      _id: groupId,
      member: currentuserId,
    });

    if (!isUserInGroup) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const messages = await GroupChatModel.find({ group: groupId })
      .populate("from", "name")
      .sort({ createdAt: 1 });

    const formatted = messages.map((msg) => ({
      _id: msg._id,
      msg: msg.msg,
      from: msg.from._id,
      name: msg.from.name || "",
      profile: msg.from.profile || "",
    }));

    res.status(200).json({ messages: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch messages" });
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
