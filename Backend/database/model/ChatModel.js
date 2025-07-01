const mongoose = require ('mongoose');
const chatmodel = new mongoose.Schema({
    from:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    to:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    msg:{
        type : String,
        required : true
    },
    seen:{
        type : Boolean,
        required : true,
        default : false,
    }
   
},{timestamps : true})

module.exports = mongoose.model("chatmodel" , chatmodel);