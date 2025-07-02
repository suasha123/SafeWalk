const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinaryconfig");
const usermodel = require("../database/model/usermodel");
const parser = multer({ storage });
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
      name : updatedUser.username,
      profile : updatedUser.profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
