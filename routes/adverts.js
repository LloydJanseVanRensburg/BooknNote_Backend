const express = require("express");
const router = express.Router();
const { v4: uuid4 } = require("uuid");
const multer = require("multer");
const { check } = require("express-validator");

const advertController = require("../controllers/adverts");
const isAuth = require("../middleware/is-auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Images/advert");
  },
  filename: (req, file, cb) => {
    cb(null, uuid4() + "--" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

//==================================================================ADVERTS
//@route - GET /adverts/all
//@desc - Get all of the adverts from database
//@access - Private/Admin
router.get("/all", isAuth, advertController.getAllAdverts);

//@route - GET /adverts/allbooks
//@desc - Gets all the book adverts
//@access - Public
router.get("/allbooks", advertController.getAllBooks);

//@route - GET /adverts/allnotes
//@desc - Gets all the notes adverts
//@access - Public
router.get("/allnotes", advertController.getAllNotes);

//@route - GET /adverts/homepage
//@desc - Get all homepage data from database
//@access - Public
router.get("/homepage", advertController.getHomepageData);

//@route - GET /adverts/search
//@desc - Query based on searchbar contents
//@access Public
router.get("/search/:text", advertController.getSearchQuery);

//@route - POST /adverts/
//@desc - create a new post entry in database
//@access - Private
router.post(
  "/",
  isAuth,
  upload.single("imageUrl"),
  [
    check("type", "Please supply advert with a type (Note or Book)")
      .not()
      .isEmpty(),
    check(
      "moduleId",
      "Please supply advert with a moduleId (BMAN111 or STTN111)"
    )
      .not()
      .isEmpty(),
    check("title", "Please supply advert with a title").not().isEmpty(),
    check("price", "Please supply advert with a price").not().isEmpty(),
    check("description", "Please supply advert with a description")
      .not()
      .isEmpty(),
  ],
  advertController.createAdvert
);

//@route - PUT /adverts/:id
//@desc - Update post with id
//@access - Private
router.put(
  "/:id",
  isAuth,
  upload.single("imageUrl"),
  [
    check(
      "moduleId",
      "Please supply advert with a moduleId (BMAN111 or STTN111)"
    )
      .not()
      .isEmpty(),
    check("title", "Please supply advert with a title").not().isEmpty(),
    check("price", "Please supply advert with a price").not().isEmpty(),
    check("description", "Please supply advert with a description")
      .not()
      .isEmpty(),
  ],
  advertController.editAdvert
);

//@route - DELETE /adverts/:id
//@desc - Delete advert with id
//@access - Private
router.delete("/:id", isAuth, advertController.deleteAdvert);

//@route - GET /adverts/singleadvert:id
//@desc - Get advert by id
//@access Public
router.get("/singleadvert/:id", advertController.getSingleAdvert);

//@route - GET /adverts/:type/:subjectCode
//@desc - Get all adverts by type and moduleId
//@access - Private/Admin
router.get(
  "/:type/:subjectCode",
  isAuth,
  advertController.getAdvertsTypeBySubjectCode
);

//==================================================================REVIEWS

//@route - PUT /adverts/review/new/:advertId
//@desc - Create new review on post
//@access Private
router.put(
  "/review/new/:advertId",
  isAuth,
  [
    check("body", "Please enter body with your rating").not().isEmpty(),
    check("value").exists(),
  ],

  advertController.createAdvertReview
);

//@route - PUT /adverts/review/update/:reviewId
//@desc - Update review by id
//@access Private
router.put(
  "/review/update/:reviewId",
  isAuth,
  [
    check("body", "Please enter body with your rating").not().isEmpty(),
    check("value")
      .exists()
      .custom((value, { req }) => {
        if (value > 5 || value < 0) {
          throw new Error("Invalid value please enter correct range [0-5]");
        }
        return true;
      }),
  ],
  advertController.editAdvertReview
);

//@route - PUT /adverts/review/remove/:reviewId
//@desc - Delete review by id
//@access Private
router.put(
  "/review/remove/:reviewId",
  isAuth,
  advertController.deleteAdvertReview
);

//==================================================================Emailing
//@route - POST /adverts/sendemail
//@desc - Handling emails
//@access Private
router.post("/sendemail", isAuth, advertController.sendEmail);

module.exports = router;
