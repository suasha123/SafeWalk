const express = require("express");
const router = express.Router();
require("dotenv").config();
const Track = require("../database/model/TrackingModel");
const RealTrackingModel = require("../database/model/RealTrackingModel");
router.get("/activesession", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ msg: "Log In again" });
  }
  try {
    const userId = req.session.passport.user;
    const isActiveSession = await Track.findOne({
      userid: userId,
    });
    if (!isActiveSession) {
      return res.status(404).json({ msg: "No active session found" });
    }
    const trackingid = await RealTrackingModel.findOne({ userid: userId });
    return res.status(200).json({
      id: isActiveSession._id,
      trackedid:
        trackingid && trackingid.status === "active" ? trackingid?._id : null,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Error occured" });
  }
});
router.get("/cpath/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ msg: "Log In again" });
  }
  const trackid = req.params.id;
  if (!trackid) {
    return res.status(404).json({ msg: "Not Found" });
  }
  try {
    const userId = req.session.passport.user;
    const Trackingexist = await RealTrackingModel.findOne({ userid: userId });
    if (!Trackingexist) {
      return res.status(404).json({ msg: "No Tracking Found" });
    }
    if (Trackingexist._id.toString() !== trackid) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    const Fpath = await Track.findOne({ userid: userId });
    const fullPath = Fpath.path;
    console.log(Trackingexist);
    return res.status(200).json({
      index: Trackingexist.lastindex,
      lat: Trackingexist.nearestlat,
      long: Trackingexist.nearestLong,
      src: Fpath.src,
      dest: Fpath.dest,
      completed: Trackingexist.status,
      path: fullPath,
      cdist: Trackingexist.cdist,
      tdist: Trackingexist.totaldist,
      isNearD: Trackingexist.isIndanger,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error occured" });
  }
});
router.get("/path/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ msg: "Log In again" });
  }
  try {
    const userId = req.session.passport.user;
    const doc = await Track.findOne({ userid: userId });
    if (!doc) {
      return res.status(404).json({ msg: "Walk not found" });
    }
    if (doc._id.toString() !== req.params.id) {
      return res.status(404).json({ msg: "Walk not found" });
    }
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
      alternative_routes: {
        target_count: 3,
        share_factor: 0.6,
        weight_factor: 1.4,
      },
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
