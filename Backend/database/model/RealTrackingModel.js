const mongoose = require("mongoose");

const liveTracker = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trackingid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Track",
    required: true,
  },
  lastindex: {
    type: Number,
    required: true,
  },
  nearestlat: {
    type: Number,
    required: true,
  },
  nearestLong: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  access: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
   remainingDist : {
    type : Number
  },
   totalDist :{
    type : Number
  },
});

liveTracker.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("LiveTracking", liveTracker);
