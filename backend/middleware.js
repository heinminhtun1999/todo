module.exports.verifyLogin = (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("You're not logged in.");
    next();
}