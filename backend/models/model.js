const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const connecttodb = async () => {
  try {
    const db = process.env.MONGOOSE;
    await mongoose.connect(db);
    console.log("connected");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

const userschema = new mongoose.Schema({
    email : {type:String,required:true,unique:true},
    name : {type:String,required:true},
    password : {type:String,required:true},
    profilepic : {type:String,default:""},
    bio : {type:String, default:"Hey there , I am using QuickChat"},
})

const User = mongoose.model("user",userschema)


module.exports = { connecttodb,User };
