const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const nodemailer = require("nodemailer");

const sendResetPasswordLink = async (reciever, resetLink) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: '"Hein Min Htun" <heinminhtun27@gmail.com>',
        to: reciever,
        subject: "Password reset for todo app",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
                Please click on the following link, or paste this into your browser to complete the process: ${resetLink}
                If you did not request this, please ignore this email and your password will remain unchanged.`,
    });
};

module.exports.registerUser = async (req, res, next) => {
    const { username, email, password, name } = req.body;
    const user = new User({ username, email, name, avatar: req.file ? req.file.path : undefined });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        res.status(200).json({
            message: "register successful",
            user
        });
    });
};

module.exports.loginUser = (req, res) => {
    res.status(200).json({
        message: "login successful",
        user: req.user
    });
};

module.exports.logoutUser = (req, res) => {
    req.logOut();
    res.status(200).json({
        message: "logout successful"
    })
};

module.exports.isAuthenticated = (req, res) => {
    res.status(200).json({
        isLoggedIn: req.isAuthenticated(),
        user: req.user
    });
};

module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) throw new ExpressError("both old password and new password is required to change password");
    const user = await User.findById(req.user.id);
    try {
        await user.changePassword(oldPassword, newPassword);
        return res.status(200).json({
            message: "successfully changed password"
        });
    } catch (e) {
        if (e.message === "Password or username is incorrect") throw new ExpressError("old password is incorrect", 403);
        throw new ExpressError(e.message, 500);
    }
};

module.exports.forgotPassowrd = async (req, res) => {
    const { username } = req.body;
    if (!username) throw new ExpressError("username is required", 400);
    const user = await User.findOne({ $or: [{ email: username }, { username }] });
    if (!user) throw new ExpressError("user not found", 404);
    const token = jwt.sign({ user: user.id }, process.env.TOKEN_SECRET, { expiresIn: "10m" });
    const resetLink = `http://localhost:3000/reset?token=${token}`;
    await sendResetPasswordLink(user.email, resetLink);
    const formatEmail = user.email.replace(/(?!^).(?=[^@]+@)/g, "*");
    return res.status(200).json({
        message: `Password reset request successful. Password reset link has been sent to ${formatEmail}`
    });
};

module.exports.viewPasswordReset = async (req, res) => {
    const { token } = req.query;
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedToken.user).select("username avatar");
        if (!user) throw new ExpressError("user no longer available on todo app", 410);
        return res.status(200).json(user);
    } catch (e) {
        if (e.message === "jwt expired") {
            throw new ExpressError("Password Reset Link Expired", 401);
        } else {
            throw new ExpressError("Invalid Password Reset Link", 400);
        }
    }
};

module.exports.resetPassword = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!password) throw new ExpressError("password is required", 400);
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedToken.user);
        if (!user) throw new ExpressError("user no longer available on todo app", 410);
        if (!regEx.test(password)) throw new ExpressError("password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number", 400);
        const updatedUser = await user.setPassword(password);
        console.log(verifiedToken)
        await updatedUser.save();
        if (req.isAuthenticated()) {
            req.logOut();
        }
        return res.status(200).json({
            message: "Password reset successful"
        })
    } catch (e) {
        throw new ExpressError(e.message, e.statusCode);
    }
};