const mongoose = require("mongoose");
const ReportSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    long: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    timeofReport: {
      type: String,
      required: true,
    },
    incidenttype :{
      type : String ,
      required : true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportModel", ReportSchema);
