const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    campus: {
      type: String,
    },
    major: {
      type: String,
    },
    adverts: [{ type: "ObjectId", ref: "Advert" }],
    successTrades: {
      type: Number,
      default: 0,
    },
    profileRating: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
