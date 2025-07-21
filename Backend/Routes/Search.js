const express = require("express");
const router = express.Router();
require("dotenv").config();
router.get("/searchPlace", async (req, res) => {
  const location = req.query.query;
  console.log("Token being sent:", process.env.SEARCHTOKEN);
  if (!location || typeof location !== "string" || location.length < 2) {
    return res.status(400).json({ msg: "Invalid query" });
  }
  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${process.env.SEARCHTOKEN}&q=${encodeURIComponent(location)}&limit=5&dedupe=1&`
    );
    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server Error" });
  }
});
module.exports = router;
