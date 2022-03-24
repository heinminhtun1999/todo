const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { registerUser, loginUser, logoutUser, isAuthenticated } = require("../controllers/user");

// middleware

const validateBody = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username or password is required");
    }
    next();
}

// routes

router.post("/login", validateBody, passport.authenticate("local"), loginUser);

router.post("/register", catchAsync(registerUser));

router.get("/logout", logoutUser);

router.get("/is_authenticated", isAuthenticated);

module.exports = router;