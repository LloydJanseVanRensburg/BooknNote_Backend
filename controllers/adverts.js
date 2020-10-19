const Advert = require("../models/Advert");

exports.getAllAdverts = async (req, res) => {
  const query = req.query;

  const querySortString = {};
  const queryFindString = {};

  if (query.price) {
    const val = query.price;
    if (val === "desc") {
      querySortString.price = -1;
    } else if (val === "asc") {
      querySortString.price = 1;
    }
  }

  if (query.ratings) {
    const val = query.ratings;
    if (val === "desc") {
      querySortString["ratings.value"] = -1;
    } else if (val === "asc") {
      querySortString["ratings.value"] = 1;
    }
  }

  if (query.type) {
    const val = query.type;
    if (val === "note") {
      queryFindString.type = "note";
    } else if (val === "book") {
      queryFindString.type = "book";
    }
  }

  console.log({ querySortString });
  console.log({ queryFindString });

  try {
    const adverts = await Advert.find(queryFindString).sort(querySortString);
    res.status(200).json({ count: adverts.length, adverts });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.createAdvert = async (req, res) => {
  const { creator, type, moduleId, title, description, price } = req.body;

  const newAdvert = new Advert({
    creator,
    type,
    moduleId,
    title,
    description,
    price,
  });

  try {
    const advert = await Advert.create(newAdvert);
    res.status(201).json(advert);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.updateAdvert = async (req, res) => {
  const { type, moduleId, title, description, price } = req.body;

  const updatedAdvert = {};

  if (type) updatedAdvert.type = type;
  if (moduleId) updatedAdvert.moduleId = moduleId;
  if (title) updatedAdvert.title = title;
  if (description) updatedAdvert.description = description;
  if (price) updatedAdvert.price = price;

  try {
    let advert = await Advert.findById(req.params.id);

    if (!advert) {
      return res.status(404).json({ msg: "Advert not found" });
    }

    advert = await Advert.findByIdAndUpdate(
      req.params.id,
      { $set: updatedAdvert },
      { new: true }
    );

    res.status(200).json(advert);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteAdvert = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);

    if (!advert) {
      return res.status(404).json({ msg: "Advert not found" });
    }

    await Advert.findByIdAndRemove(req.params.id);

    res.status(200).json({ msg: "Advert successfully deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};
