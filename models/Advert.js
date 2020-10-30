const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "user",
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
    reviews: {
      averageRating: {
        type: Number,
      },
      ratings: [
        {
          author: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
          },
          dateTime: {
            type: Date,
            default: Date.now,
          },
          body: {
            type: String,
            required: true,
          },
          value: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Advert = mongoose.model("Advert", advertSchema);

module.exports = Advert;
