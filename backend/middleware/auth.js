const jwt = require("jsonwebtoken");
const { User } = require("../models/model");

exports.protectroute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);

    // decoded is { id: ..., iat: ..., exp: ... }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    req.token=token;
    req.user = user; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
};
