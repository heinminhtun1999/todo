const express = require("express");
const router = express.Router();
const { verifyLogin } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const Board = require("../models/Board");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");

const generateToken = (board, owner) => {
    return jwt.sign({ board_owner: owner, board }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
}

router.get("/", verifyLogin, catchAsync(async (req, res) => {
    const boards = await Board.find({ owner: req.user.id }).populate("owner", "-createdAt -updatedAt");
    res.status(200).json(boards);
}));

router.post("/", verifyLogin, catchAsync(async (req, res) => {
    const { title } = req.body;
    const board = new Board({ title, owner: req.user.id });
    const user = await User.findById(req.user.id);
    user.boards.push(board);
    await board.save();
    await user.save();
    res.status(200).json(board);
}));

router.post("/generate_invite", verifyLogin, catchAsync(async (req, res) => {
    const { board_id, setPassword } = req.body;
    if (!board_id) return res.status(400).send("Board id is required");
    if (!mongoose.isValidObjectId(board_id)) return res.status(400).send("Invalid board id");
    try {
        const board = await Board.findById(board_id).populate("owner");
        if (!board) return res.status(404).send("Board not found");
        if (board.owner.id !== req.user.id) return res.status(403).send("You're not the owner of this board");
        const board_owner = await User.findById(board.owner.id);
        const token = generateToken(board.id, req.user.id);

        return res.status(200).json(token)
    } catch (e) {
        throw new ExpressError(e.message, 500);
    }
}))

router.get("/invite", catchAsync(async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("invitation token is required");
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        return res.status(200).json(verifiedToken);
    } catch (e) {
        return res.status(400).send(e.message);
    }

}));

module.exports = router;