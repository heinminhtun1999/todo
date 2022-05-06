const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const { viewPasswordReset, resetPassword } = require("../controllers/user");

router.route("/")
    .get(catchAsync(viewPasswordReset))
    .post(catchAsync(resetPassword));

module.exports = router;