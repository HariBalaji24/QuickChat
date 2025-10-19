const { User } = require("../models/model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secretkey = process.env.SECRETKEY;

exports.signup = async (req, res) => {
  const { email, name, password, bio } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      bio,
    });
    const token = jwt.sign({ id: newUser._id }, secretkey, { expiresIn: "30d" });


    res
      .status(201)
      .header("authorization", token)
      .json({ message: "User created", user: newUser, token: token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Signup failed", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.send(500).json({ message: "no such email found" });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      res.send(400).json({ message: "password is incorrect" });
    }
    const token = jwt.sign({ id: user._id }, secretkey, { expiresIn: "7d" });
    res
      .status(200)
      .json({ token });
  } catch (error) {
    console.log(error);
  }
};
exports.updateprofile = async (req, res) => {
  try {
    const { profilepic, name, bio } = req.body;
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const id = decoded.id;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilepic, name, bio },
      { new: true }
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.getuserdetails = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRETKEY);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
