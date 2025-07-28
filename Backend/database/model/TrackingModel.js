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
