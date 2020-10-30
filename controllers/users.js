require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const deleteFile = require("../utils/deleteFile");
const { deleteAdvert } = require("./adverts");

exports.getAllUsers = async (req, res) => {
  if (req.admin) {
    try {
      const users = await User.find();
      res.json({ count: users.length, users });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  } else {
    res.status(400).json({ msg: "Only Admin Allowed" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await await User.findById(req.user.id)
      .populate("adverts")
      .select("-password");

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    if (user.isAdmin) {
      payload.isAdmin = true;
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  //get data

  const { username, firstName, lastName, email, campus, major } = req.body;
  let imageUrl = req.body.imageUrl;

  if (!imageUrl) {
    imageUrl = req.file.path;
  }

  //create new object with fields
  const updateUser = {};

  if (imageUrl) updateUser.imageUrl = imageUrl;
  if (username) updateUser.username = username;
  if (firstName) updateUser.firstName = firstName;
  if (lastName) updateUser.lastName = lastName;
  if (email) updateUser.email = email;
  if (campus) updateUser.campus = campus;
  if (major) updateUser.major = major;

  try {
    //find user exist
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    //check user authoriation
    if (req.params.id !== req.user.id) {
      return res.status(400).json({ msg: "Invalid permissions" });
    }

    // Delete Current User Profile to save the new one
    if (req.file) {
      deleteFile(user.imageUrl);
    }

    //update
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateUser },
      { new: true }
    ).select("-password");

    //return update version
    res.status(200).json({ user: updated });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  if (req.admin) {
    const user = await User.findById(req.params.id);

    const imagePath = user.imageUrl;

    deleteAdvert(imagePath);

    await User.findByIdAndRemove(req.params.id);

    res.json({ msg: "User successfully removed" });
  } else {
    res.status(400).json({ msg: "Only Admin Allowed" });
  }
};

exports.getUserProfileData = async (req, res) => {
  try {
    const profile = await User.findOne({ _id: req.params.id })
      .populate("adverts")
      .select("-password");

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json({ profile });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};
