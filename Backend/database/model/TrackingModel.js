const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  src: {
    type: [Number], 
    required: true,
  },
  dest: {
    type: [Number], 
    required: true,
  },
  path: {
    type: [[Number]], 
    required: true,
  },
  lastindex: {
    type: Number,
    required: true,
    default: -1, 
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
});

TrackSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Track", TrackSchema);
