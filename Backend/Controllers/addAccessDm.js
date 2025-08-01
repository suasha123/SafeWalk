const RealTrackModel = require("../database/model/RealTrackingModel");

const addAccessDM = async (to, trackid) => {
  try {
    const isIdExists = await RealTrackModel.findById(trackid);
    if (!isIdExists) {
      return false;
    }
    if (!isIdExists.access.includes(to)) {
      isIdExists.access.push(to);
      await isIdExists.save();
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};

module.exports = addAccessDM;
