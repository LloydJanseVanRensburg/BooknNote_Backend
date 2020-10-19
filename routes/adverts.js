const express = require("express");
const router = express.Router();

const advertsController = require("../controllers/adverts");

// @ROUTE - Get /adverts/
// @DESC - Get all the adverts in the database
// @ACCESS - Public
router.get("/", advertsController.getAllAdverts);

// @ROUTE - Post /adverts/
// @DESC - Create a new advert in the database
// @ACCESS - Private
router.post("/", advertsController.createAdvert);

// @ROUTE - PUT /adverts/:id
// @DESC - Update a advert by ID
// @ACCESS - Private
router.put("/:id", advertsController.updateAdvert);

// @ROUTE - DELETE /adverts/:id
// @DESC - Delete a advert by ID
// @ACCESS - Private
router.delete("/:id", advertsController.deleteAdvert);

module.exports = router;
