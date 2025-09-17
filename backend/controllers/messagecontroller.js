const { User } = require("../models/model");
const { Message } = require("../models/message");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const cloudinary = require("../models/cloudinary.js");
const jwt = require("jsonwebtoken");
const { io, usersocketmap } = require("../index.js");

exports.getallusers = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userid = decoded.id;
    const filterusers = await User.find({ _id: { $ne: userid } }).select(
      "-password"
    );

    res.json({ success: true, users: filterusers });
  } catch (error) {
    console.log(error);
  }
};

exports.getid = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userid = decoded.id;

    res.json({ id: userid });
  } catch (error) {
    console.log(error);
  }
};

exports.getmessages = async (req, res) => {
  try {
    const selecteduser = req.headers["senderid"];
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const myid = decoded.id;
    const messages = await Message.find({
      $or: [
        { senderId: myid, receiverId: selecteduser },
        { senderId: selecteduser, receiverId: myid },
      ],
    }).sort({ createdAt: 1 }); 
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error in getmessages:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.markmessagesseen = async (req, res) => {
  try {
    const senderId = req.headers["receiverid"];
    const receiverId = req.headers["senderid"];

    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);
    const result = await Message.updateMany(
      { senderId: senderId, receiverId: receiverId, seen: false },
      { $set: { seen: true } }
    );

    res.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} message(s) marked as seen.`,
    });
  } catch (error) {
    console.error("Error updating seen status:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.sendmessage = async (req, res) => {
  try {
    const selecteduser = req.headers["receiverid"];
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const myid = decoded.id;

    const { text, image } = req.body;

    const receiverId = selecteduser;
    const senderId = myid;
    const newmessage = await Message.create({
      senderId,
      receiverId,
      text: text,
      image: image
    });
    res.status(200).json({ message: newmessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};


