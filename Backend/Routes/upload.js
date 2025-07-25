const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinaryconfig");
const usermodel = require("../database/model/usermodel");
const GroupModal = require("../database/model/groupmodel");
const ReportModel = require("../database/model/ReportModel");
const parser = multer({ storage });
router.post("/report", async (req, res) => {
  const payload = req.body;

  if (!payload) {
    return res.status(403).json({ msg: "Invalid Request" });
  }

  const userId = req.session?.passport?.user;
  if (!userId) {
    return res.status(403).json({ msg: "Not Logged In" });
  }

  try {
    await ReportModel.create({
      id: userId,
      desc: payload.description,
      lat: payload.location.lat,
      long: payload.location.lng,
      timeofReport: payload.datetime,
      incidenttype : payload.type, 
    });
    return res.status(200).json({ msg: "Uploaded Data" });
  } catch (err) {
    return res.status(500).json({ msg: "Failed to upload data" });
  }
});

router.post("/updategrp", parser.single("grpimg"), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  const { grpname, grpid } = req.body;
  const newgrpimgg = req.file;
  try {
    if (grpname) {
      await GroupModal.findByIdAndUpdate(grpid, { name: grpname });
    }
    if (newgrpimgg) {
      await GroupModal.findByIdAndUpdate(grpid, { groupimg: newgrpimgg.path });
    }
    res.status(200).json({
      msg: "Changed Successfully",
      name: grpname,
      image: newgrpimgg?.path || null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.post("/profile", parser.single("image"), async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const { username } = req.body;
  const image = req.file;
  const userId = req.user._id;

  try {
    const updateFields = {};
    if (username) updateFields.username = username;
    if (image) updateFields.profile = image.path;
    const updatedUser = await usermodel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );
    res.status(200).json({
      msg: "Profile updated successfully",
      username: updatedUser.username,
      profile: updatedUser.profile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
