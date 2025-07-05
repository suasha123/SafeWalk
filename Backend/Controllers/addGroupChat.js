const groupChatModel = require ("../database/model/GroupChatModel");
const addGroupChat = async (from , groupId , msg)=>{
     try{
       const newgroupchat =  await groupChatModel.create({
            from,
            msg,
            group : groupId
        })
        if(newgroupchat){
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
module.exports = addGroupChat;