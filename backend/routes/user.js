const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { registerUser, loginUser, logoutUser, isAuthenticated, changePassword, forgotPassowrd } = require("../controllers/user");
const { validateRegister, validateBody, verifyLogin } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage })

router.post("/login", validateBody, passport.authenticate("local"), loginUser);

router.post("/register", upload.single("avatar"), validateRegister, catchAsync(registerUser));

router.put("/change_password", verifyLogin, catchAsync(changePassword));

router.post("/forgot", catchAsync(forgotPassowrd));

router.get("/logout", logoutUser);

router.get("/is_authenticated", isAuthenticated);

module.exports = router;



