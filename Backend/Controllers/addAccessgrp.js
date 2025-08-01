const RealTrackingModel = require("../database/model/RealTrackingModel");
const GroupModel = require("../database/model/groupmodel");
const addAccessGrp = async (grpid, trackid) => {
  const isExist = await RealTrackingModel.findById(trackid);
  if (!isExist) {
    return false;
  }
  const group = await GroupModel.findById(grpid).select("member");
  if (group && group.member.length > 0) {
    await RealTrackingModel.updateOne(
      { $addToSet: { access: { $each: group.member } } } 
    );
  }
  return true;
};
module.exports = addAccessGrp;
