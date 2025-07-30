const mongoose = require("mongoose");
const dangerSchema = new mongoose.Schema({
  trackid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Track",
    required: true,
  },
  locations: [
    {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Danger", dangerSchema);
