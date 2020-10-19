const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertSchema = new Schema(
  {
    creator: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    ratings: [
      {
        value: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
        },
        // author id
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Advert = mongoose.model("Advert", advertSchema);

module.exports = Advert;
