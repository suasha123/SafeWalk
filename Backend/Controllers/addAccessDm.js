const RealTrackModel = require("../database/model/RealTrackingModel");

const addAccessDM = async (to, trackid) => {
  const isIdExists = await RealTrackModel.findById(trackid);
  if (!isIdExists) {
    return false;
  }
  if (!isIdExists.access.includes(to)) {
    isIdExists.access.push(to);
    await isIdExists.save();
  }
  return true;
};

module.exports = addAccessDM;
