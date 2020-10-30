const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campusSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Campus = mongoose.model("campus", campusSchema);

module.exports = Campus;
