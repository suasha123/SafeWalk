const mongoose = require("mongoose");
const RouteSchema = new mongoose.Schema({
  index: {
    type: Number,
    default : 0
  },
  routes: {
    type: [String],
    required: true,
  },
  trackid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});
module.exports = mongoose.model("AllRoute", RouteSchema);
