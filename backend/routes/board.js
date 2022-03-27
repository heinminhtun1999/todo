const express = require("express");
const router = express.Router();
const { verifyLogin, verifyBoardAndUser } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const Board = require("../models/Board");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcrypt");

const generateInviteLink = (board) => {
    const token = jwt.sign({ board }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
    return `http://localhost:5000/api/boards/invite?token=${token}`;
};

router.get("/", verifyLogin, catchAsync(async (req, res) => {
    const boards = await Board.find({ owner: req.user.id }).populate("owner", "-createdAt -updatedAt");
    return res.status(200).json(boards);
}));

router.post("/", verifyLogin, catchAsync(async (req, res) => {
    const { title } = req.body;
    const board = new Board({ title, owner: req.user.id });
    const invite_link = generateInviteLink(board.id);
    board.invite_link = { link: invite_link, set_password: false, password: null };
    const user = await User.findById(board.owner);
    user.boards.push(board);
    await board.save();
    await user.save();
    return res.status(200).json(board);
}));

router.put("/:board_id", verifyLogin, verifyBoardAndUser, catchAsync(async (req, res) => {
    const { board_id } = req.params;
    const { title, visibility } = req.body;
    const board = await Board.findByIdAndUpdate(board_id, { title, visibility });
    return res.status(200).json(board)
}))

router.post("/generate_invite/:board_id", verifyLogin, verifyBoardAndUser, catchAsync(async (req, res) => {
    const { board_id } = req.params;
    try {
        const board = await Board.findById(board_id);
        const invite_link = generateInviteLink(board.id);
        board.invite_link = { ...board.invite_link, link: invite_link };
        await board.save();
        return res.status(200).json(invite_link);
    } catch (e) {
        throw new ExpressError(e.message, 500);
    }
}));

router.post("/generate_invite/set_password/:board_id", verifyLogin, verifyBoardAndUser, catchAsync(async (req, res) => {
    const { set_password, password } = req.body;
    const { board_id } = req.params;
    const board = await Board.findById(board_id);
    if (!set_password) return res.status(400).send("'set_password field is required");
    if (set_password.toLowerCase() !== "true" && set_password.toLowerCase() !== "false") throw new ExpressError("'set_password' must be whether 'true' or 'false'", 400);
    if (set_password.toLowerCase() === "false") {
        board.invite_link = { ...board.invite_link, set_password: false };
        await board.save();
        return res.status(200).json(board);
    }
    if (set_password.toLowerCase() === "true" && !password) throw new ExpressError("password is required when set 'set_password' to true", 400);
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        board.invite_link = { ...board.invite_link, set_password: true, password: hash };
        await board.save();
        return res.status(200).json(board);
    } catch (e) {
        throw new ExpressError(e.message, 500);
    }
}));

router.get("/invite", catchAsync(async (req, res) => {
    const { token } = req.query;
    if (!token) throw new ExpressError("invitation token is required", 400);
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const board = await Board.findById(verifiedToken.board).populate("owner").select("");
        return res.status(200).json(board);
    } catch (e) {
        switch (e.message) {
            case "invalid token":
                throw new ExpressError("invalid invite link", 400);
            case "jwt expired":
                throw new ExpressError("invite link expired", 401);
            default:
                throw new ExpressError(e.message, e.statusCode);
        }
    }
}));

// const checkPassword = async()

router.post("/invite", verifyLogin, catchAsync(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token) throw new ExpressError("invitation token is required", 400);
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const board = await Board.findById(verifiedToken.board);
        if (board.owner.equals(req.user.id)) throw new ExpressError("you are the owner of the board. you cannot invite yourself", 400);
        const board_members = board.board_members.map(member => member.id);
        if (board_members.includes(req.user.id)) throw new ExpressError("you are already a member of this board", 400);
        if (board.invite_link.set_password) {
            if (!password) throw new ExpressError("'password' field is required", 400);
            const checkPassword = await bcrypt.compare(password, board.invite_link.password);
            if (!checkPassword) throw new ExpressError("wrong invite password", 403);
            board.board_members.push(req.user);
            await board.save();
            return res.status(200).json(board);
        }
        board.board_members.push(req.user);
        await board.save();
        return res.status(200).json(board);
    } catch (e) {
        switch (e.message) {
            case "invalid token":
                throw new ExpressError("invalid invite link", 400);
            case "jwt expired":
                throw new ExpressError("invite link expired", 401);
            default:
                throw new ExpressError(e.message, e.statusCode);
        }
    }
}));

router.delete("/:board_id", verifyLogin, catchAsync(async (req, res) => {
    const { board_id } = req.params;
    const board = await Board.findByIdAndDelete(board_id);
    return res.status(200).json({
        message: "delete successful",
        deleted_board: board
    });
}));

module.exports = router;