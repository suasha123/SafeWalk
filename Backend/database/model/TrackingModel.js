const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  src: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  dest: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  path: {
    type: [[Number]], // Array of [lng, lat]
    required: true,
  },
  lastindex: {
    type: Number,
    required: true,
    default: -1, // -1 means tracking not started yet
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
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
  },
});

TrackSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Track", TrackSchema);
