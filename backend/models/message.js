const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const messageschema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
    image: { type: String },
    seen: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageschema);

module.exports = { Message };
