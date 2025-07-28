const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinaryconfig");
const usermodel = require("../database/model/usermodel");
const GroupModal = require("../database/model/groupmodel");
const ReportModel = require("../database/model/ReportModel");
const Track = require("../database/model/TrackingModel");
const  RealTrack = require("../database/model/RealTrackingModel");
const parser = multer({ storage });
router.post("/trackedPath", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ msg: "Log In again" });
  }
  try{
  const curruserid = req.session.passport.user;
  const { nearestLat, nearestLng, index, userid } = req.body;
  if (curruserid !== userid) {
    return res.status(403).json({ msg: "Unauthorized" });
  }
  const safeWalk = await Track.findOne({userid : curruserid});
  if(!safeWalk){
    return res.status(403).json({ msg: "No walk Found" });
  }
  const doc = await RealTrack.create({
    nearestlat : nearestLat,
    nearestLong : nearestLng,
    lastindex : index,
    userid : curruserid,
    trackingid : safeWalk._id
  })
  return res.status(200).json({id : doc._id});
}
catch(err){
  return res.status(500).json({msg : "Server Error"});
}

});
router.post("/fetchedpath", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ msg: "Unauthorized" });
  }
  const payload = req.body;
  const userid = req.session.passport.user;
  if (!payload) {
    console.log("Payload not recieved");
    return res.status(400).json({ msg: "No payload" });
  }
  try {
    const doc = await Track.create({
      userid,
      src: payload.src,
      dest: payload.des,
      path: payload.path,
      status: "pending",
    });
    return res.status(200).json({ id: doc._id });
  } catch (err) {
    return res.status(500).json({ msg: "Server Error" });
  }
});
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
      incidenttype: payload.type,
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
