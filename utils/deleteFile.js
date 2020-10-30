const fs = require("fs");
const path = require("path");

const deleteFile = (filepath) => {
  if (!filepath) {
    return;
  }

  filepath = path.join(__dirname, "..", filepath);

  fs.unlink(filepath, (err) => {
    if (err) {
      return;
    }
    console.log("deleted");
  });
};

module.exports = deleteFile;
