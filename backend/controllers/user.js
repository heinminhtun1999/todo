const User = require("../models/User");

module.exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username) return res.status(400).send("username is required");
    if (!email) return res.status(400).send("email is required");
    if (!password) return res.status(400).send("password is required");
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        res.status(200).json({ registeredUser, isAuthenticated: req.isAuthenticated() });
    });
}

module.exports.loginUser = (req, res) => {
    res.status(200).send(req.user);
}

module.exports.logoutUser = (req, res) => {
    req.logOut();
    res.status(200).send("Successfully Logged Out")
}

module.exports.isAuthenticated = (req, res) => {
    res.status(200).send(req.isAuthenticated());
}