const mongoose  = require('mongoose');
const groupChat = new mongoose.Schema({
    from : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    msg : {
        type : String,
        required : true
    },
    group:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Group',
        required : true
    }

} , {timestamps : true})

module.exports = mongoose.model("groupChat" , groupChat);