const chatmodel = require("../database/model/ChatModel");
const addchat = async (msginfo) => {
    try{
    const { from, to, msg } = msginfo;
      const newchat =   await chatmodel.create({
            from ,
            to,
            msg
        })
        if(newchat){
            return true;
        }
        else{
            return false;
        }
    }
    catch(err){
         return false;
    }
  
};
module.exports = addchat;
