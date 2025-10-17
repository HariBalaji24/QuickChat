const express = require("express")
const usercontroller = require("../controllers/usercontroller")
const messagecontroller = require("../controllers/messagecontroller")
const { protectroute } = require("../middleware/auth")

const userrouter = express.Router()

userrouter.route("/getuserdetails").get(usercontroller.getuserdetails)
userrouter.route("/signup").post(usercontroller.signup)
userrouter.route("/login").post(usercontroller.login)
userrouter.route("/update-profile").patch(protectroute,usercontroller.updateprofile )

userrouter.route("/getallusers").get(messagecontroller.getallusers)
userrouter.route("/getid").get(messagecontroller.getid)
userrouter.route("/getmessages").get(protectroute,messagecontroller.getmessages)
userrouter.route("/mark").patch(protectroute,messagecontroller.markmessagesseen)
userrouter.route("/postnewmessage").post(protectroute,messagecontroller.sendmessage)


module.exports = userrouter