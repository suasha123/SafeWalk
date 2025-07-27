const express = require("express");
const router = express.Router();
require("dotenv").config();
const Track = require("../database/model/TrackingModel")
router.get("/path/:id", async (req, res) => {
  try {
    const walk = await Track.findById(req.params.id);

    if (!walk) {
      return res.status(404).json({ msg: "Walk not found" });
    }

    res.status(200).json({
      src: walk.src,
      dest: walk.dest,
      path: walk.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/searchPlace", async (req, res) => {
  const location = req.query.query;
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

router.get("/findPath", async (req, res) => {
  try {
    const { src, dest } = req.query;
    console.log(src, dest);
    if (!src || !dest) {
      return res.status(400).json({ msg: "src and dest required" });
    }

    const srcCoords = src.split(",").map(Number);
    const destCoords = dest.split(",").map(Number);

    const body = {
      coordinates: [
        [srcCoords[1], srcCoords[0]],
        [destCoords[1], destCoords[0]],
      ],
    };

    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: process.env.ROUTE_API,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ msg: "ORS error", error: errText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error("Error in /getPath:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
