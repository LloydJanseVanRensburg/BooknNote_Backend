const { validationResult } = require("express-validator");

const Advert = require("../models/Advert");
const User = require("../models/User");
const deleteFile = require("../utils/deleteFile");
const sendEmail = require("../utils/sendEmail");

//==============================================================Adverts
exports.getAllAdverts = async (req, res) => {
  if (req.admin) {
    try {
      const adverts = await Advert.find();
      res.json({ count: adverts.length, adverts });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  } else {
    res.status(400).json({ msg: "Only Admin Allowed" });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const adverts = await Advert.find({ type: "book" }).sort({ price: -1 });
    res.json({ count: adverts.length, books: adverts });
  } catch (error) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const adverts = await Advert.find({ type: "note" }).sort({ price: -1 });
    res.json({ count: adverts.length, notes: adverts });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getHomepageData = async (req, res) => {
  try {
    const topNotes = await Advert.find({ type: "note" })
      .sort({ "reviews.averageRating": -1 })
      .limit(4);
    const newBooks = await Advert.find({ type: "book" })
      .sort({ createdAt: -1 })
      .limit(4);
    const newNotes = await Advert.find({ type: "note" })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json([topNotes, newBooks, newNotes]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getSingleAdvert = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id)
      .populate({
        path: "reviews.ratings.author",
        select: "username",
      })
      .populate({ path: "creator", select: "username email" });

    if (!advert) {
      return res.status(404).json({ msg: "Advert not found" });
    }

    res.json({ advert });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getSearchQuery = async (req, res) => {
  if (req.params.text !== "") {
    try {
      let adverts = await Advert.find({ moduleId: req.params.text });

      res.json({ count: adverts.length, adverts });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  } else {
    res.status(400).json({ msg: "No queries added" });
  }
};

exports.getAdvertsTypeBySubjectCode = async (req, res) => {
  if (req.admin) {
    try {
      const adverts = await Advert.find({
        type: req.params.type,
        moduleId: req.params.subjectCode,
      });

      if (!adverts) {
        return res
          .status(404)
          .json({ msg: "Adverts with this subject code not found" });
      }

      res.json({ count: adverts.length, adverts });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  } else {
    res.status(400).json({ msg: "Only Admin Allowed" });
  }
};

exports.createAdvert = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, moduleId, title, description, price } = req.body;
  const imageUrl = req.file.path;

  const userId = req.user.id;

  const newAdd = new Advert({
    creator: userId,
    type,
    moduleId,
    imageUrl,
    title,
    description,
    price,
  });

  try {
    const advert = await newAdd.save();

    const populatedAdvert = await Advert.findById(advert._id).populate({
      path: "creator",
      select: "username email",
    });

    let user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Something went wrong please try again" });
    }

    await User.findByIdAndUpdate(
      { _id: userId },
      { $push: { adverts: advert._id } }
    );

    res.status(201).json({ advert: populatedAdvert });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.editAdvert = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    deleteFile(req.file.path);
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, moduleId, title, description, price } = req.body;
  let imageUrl = req.body.imageUrl;

  if (!imageUrl) {
    imageUrl = req.file.path;
  }

  const updateAdvert = {};
  if (type) updateAdvert.type = type;
  if (moduleId) updateAdvert.moduleId = moduleId;
  if (imageUrl) updateAdvert.imageUrl = imageUrl;
  if (title) updateAdvert.title = title;
  if (description) updateAdvert.description = description;
  if (price) updateAdvert.price = price;

  try {
    let advert = await Advert.findById(req.params.id);

    if (!advert) {
      return res.status(404).json({ msg: "Advert not found" });
    }

    if (advert.creator.toString() !== req.user.id) {
      return res.status(400).json({ msg: "Invalid permissions" });
    }

    if (req.file) {
      deleteFile(advert.imageUrl);
    }

    advert = await Advert.findByIdAndUpdate(
      req.params.id,
      { $set: updateAdvert },
      { new: true }
    ).populate({ path: "creator", select: "username email" });

    res.json({ advert });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteAdvert = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);

    if (!advert) {
      return res.status(404).json({ msg: "Advert not found" });
    }

    if (advert.creator.toString() !== req.user.id && !req.admin) {
      return res.status(400).json({ msg: "Invalid permissions" });
    }

    deleteFile(advert.imageUrl);

    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { adverts: req.params.id },
      },
      { new: true }
    );

    await Advert.findByIdAndRemove(req.params.id);
    res.json({ msg: "Advert Removed Successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

//==============================================================Reviews
exports.createAdvertReview = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.stautus(400).json({ errors: errors.array() });
  }

  const { body, value } = req.body;

  const newReview = {
    author: req.user.id,
    body,
    value,
  };

  try {
    let advert = await Advert.findById(req.params.advertId);

    if (!advert) {
      return res.status(404).json({ msg: "Advert Not Found" });
    }

    if (advert.type !== "note") {
      return res.status(400).json({ msg: "Unable to make Book review" });
    }

    let avgCount = 0,
      count = 0;
    const list = advert.reviews.ratings;

    list.forEach((rating) => {
      count += rating.value;
    });

    avgCount = (count + value) / (list.length + 1);

    advert = await Advert.findByIdAndUpdate(
      req.params.advertId,
      {
        $push: { "reviews.ratings": { $each: [newReview] } },
        "reviews.averageRating": avgCount,
      },
      { new: true }
    )
      .populate("creator", "username")
      .populate({ path: "reviews.ratings.author", select: "username" });

    res.json({ advert });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.editAdvertReview = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.stautus(400).json({ errors: errors.array() });
  }

  const { body, value } = req.body;

  const updatedReview = {
    author: req.user.id,
  };

  if (body) updatedReview.body = body;
  if (value) updatedReview.value = value;

  try {
    // Find Advert by reviewId
    let advert = await Advert.findOne(
      {
        "reviews.ratings._id": req.params.reviewId,
      },
      { reviews: 1 }
    );

    // Check if found advert
    if (!advert) {
      return res.status(404).json({ msg: "Review Not Found" });
    }

    //
    advert = await Advert.findOneAndUpdate(
      { "reviews.ratings._id": req.params.reviewId },
      {
        $set: { "reviews.ratings.$": updatedReview },
      },

      { new: true }
    );

    const list = advert.reviews.ratings;
    let count = 0;
    let avgCount;

    list.forEach((rating) => {
      count += rating.value;
    });

    avgCount = count / list.length;

    advert = await Advert.findByIdAndUpdate(
      advert._id,
      {
        $set: { "reviews.averageRating": avgCount },
      },

      { new: true }
    );

    res.json({ advert });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteAdvertReview = async (req, res) => {
  try {
    let advert = await Advert.findOne({
      "reviews.ratings._id": req.params.reviewId,
    });

    if (!advert) {
      return res.status(404).json({ msg: "Review not found" });
    }

    const ratings = advert.reviews.ratings.filter((rating) => {
      if (rating._id.toString() !== req.params.reviewId) {
        return rating;
      }
    });

    let count = 0;
    let avgCount;

    if (ratings.length > 0) {
      ratings.forEach((rating) => {
        count += rating.value;
      });

      avgCount = count / ratings.length;
    }

    advert = await Advert.findByIdAndUpdate(
      advert._id,
      {
        $set: { "reviews.ratings": ratings, "reviews.averageRating": avgCount },
      },
      { new: true }
    )
      .populate("reviews.ratings.author", "username")
      .populate({ path: "creator", select: "username email" });

    res.json({ advert, msg: "Review successfully removed" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

//==============================================================Emailing
exports.sendEmail = async (req, res) => {
  const { emailFrom, emailTo, body, title, username } = req.body;

  const from = "thefullstackjunkie@gmail.com";
  const to = emailTo;
  const subject = title;

  const output = `
  <p>You have a new potential buyer</p>

  <p>${body}</p>

  <h3>Contact Details</h3>
  <ul>
    <li>Name: ${username}</li>
    <li>Email: ${emailFrom}</li>
  </ul>
  `;

  try {
    sendEmail(to, from, subject, output);

    res.json({ msg: "Email Sent" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};
