const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { v4: uuid4 } = require("uuid");
const multer = require("multer");

const userController = require("../controllers/users");
const isAuth = require("../middleware/is-auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Images/profile");
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

//@route - GET /users/all
//@desc - Get all of the users in database (For Admin Purpose)
//@access - Admin
router.get("/all", isAuth, userController.getAllUsers);

//@route - GET /users/
//@desc - Get a specific user that is logged in using req.user param
//@access - Private
router.get("/", isAuth, userController.getCurrentUser);

//@route - GET /users/profile
//@desc - Get all the data to load profile
//@access Private
router.get("/profile/:id", userController.getUserProfileData);

//@route - POST /users/register
//@desc - Create a new user in database and check that doesn't exist yet, and then gen token
//@access - Public
router.post(
  "/register",
  [
    check("username", "Please add username").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  userController.registerUser
);

//@route - POST /users/login
//@desc - Check users if exists and gen token and login
//@access - Public
router.post(
  "/login",
  [
    check("email", "Please enter valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  userController.loginUser
);

//@route - PUT /users/:id
//@desc - Update anything on the user enitity
//@access - Private
router.put(
  "/:id",
  isAuth,
  upload.single("imageUrl"),
  userController.updateUser
);

//@route - DELETE /users/:id
//@desc - Delete user
//@access - Admin
router.delete("/:id", isAuth, userController.deleteUser);

module.exports = router;
