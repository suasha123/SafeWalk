const mongooose = require ('mongoose');
require('dotenv').config();
const url = process.env.uri;

const connectdb = async ()=>{
    try{
        await mongooose.connect(url);
        console.log("Database connection successful");
    }
    catch(err){
        console.log(err);
    }
}
module.exports = connectdb;