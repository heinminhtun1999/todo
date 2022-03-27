const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");

module.exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username) throw new ExpressError("username is required", 400);
    if (!email) throw new ExpressError("email is required", 400);
    if (!password) throw new ExpressError("password is required", 400);
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        res.status(200).json(registeredUser);
    });
}

module.exports.loginUser = (req, res) => {
    res.status(200).json(req.user);
}

module.exports.logoutUser = (req, res) => {
    req.logOut();
    res.status(200).send("Successfully Logged Out")
}

module.exports.isAuthenticated = (req, res) => {
    res.status(200).send(req.isAuthenticated());
}