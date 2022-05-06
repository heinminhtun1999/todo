const express = require("express");
const router = express.Router();
const { viewInviteLink, acceptInviteLink } = require("../controllers/board");
const { verifyLogin } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

router.route("/")
    .get(catchAsync(viewInviteLink))
    .post(verifyLogin, catchAsync(acceptInviteLink));

module.exports = router;