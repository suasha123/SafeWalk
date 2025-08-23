const mongooose = require('mongoose');
const userSchema = new mongooose.Schema({
   name : {
    type : String,
   },
   email : {
    type : String,
    required : true
   },
   username : {
     type : String,
   },
   password : {
    type : String
   },
   googleId : {
    type : String
   },
   profile :{
      type : String
   }
})
module.exports = mongooose.model ('User' , userSchema);