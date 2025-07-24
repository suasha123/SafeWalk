const mongoose = require("mongoose");
const ReportSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required: true,
    },
    lat: {
      type: String,
      required: true,
    },
    long: {
      type: String,
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
