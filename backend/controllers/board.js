const Board = require("../models/Board");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const bcrypt = require("bcrypt");
const List = require("../models/List");
const mongoose = require("mongoose");

const generateInviteLink = (board) => {
    const token = jwt.sign({ board }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
    return `http://localhost:5000/board/invite?token=${token}`;
};

module.exports.showAllBoards = async (req, res) => {
    const boards = await Board.find({ owner: req.user.id }).populate("owner", "-createdAt -updatedAt");
    const memberOf = await Board.find({ "board_members.user": req.user.id });
    const highlightedBoards = await User.findById(req.user.id).select("highlighted_boards");
    const sharedBoards = await Board.find({ $and: [{ owner: req.user.id }, { $where: "this.board_members.length>0" }] });
    return res.status(200).json({ boards, shared_boards: sharedBoards, highlighted_boards: highlightedBoards.highlighted_boards, member_of: memberOf });
};

module.exports.showBoard = (req, res) => {
    res.status(200).json(req.board);
};

module.exports.createBoard = async (req, res) => {
    const { title } = req.body;
    if (!title) throw new ExpressError("title is required", 400);
    if (typeof (title) !== "string") throw new ExpressError(`title is expected to be a string but got ${typeof (title)}`, 400);
    const board = new Board({ title, owner: req.user.id });
    const invite_link = generateInviteLink(board.id);
    board.invite_link = { link: invite_link, set_password: false, password: null };
    const user = await User.findById(board.owner);
    user.boards.push(board);
    await board.save();
    await user.save();
    return res.status(200).json({
        message: "Successfully created board",
        board
    });
};

module.exports.editBoard = async (req, res) => {
    const { board_id } = req.params;
    const { title, visibility } = req.body;
    if (!title && !visibility) throw new ExpressError("you're not updating anything", 400);
    if (typeof (title) !== "string") throw new ExpressError(`title is expected to be a string but got ${typeof (title)}`, 400);
    if (typeof (visibility) !== "string") throw new ExpressError(`visibility is expected to be a string but got ${typeof (visibility)}`, 400);
    const board = await Board.findByIdAndUpdate(board_id, { title, visibility }, { new: true, runValidators: true });
    await User.findByIdAndUpdate(board.owner, { $pull: { boards: board.id } });
    return res.status(200).json({
        message: "Successfully updated board",
        board
    });
};

module.exports.deleteBoard = async (req, res) => {
    const { board_id } = req.params;
    const board = await Board.findByIdAndDelete(board_id);
    await List.deleteMany({ board: board.id });
    return res.status(200).json({
        message: "Successfully deleted board",
        deleted_board: board
    });
};

module.exports.highlightBoard = async (req, res) => {
    const board = req.board;
    const checkMember = board.board_members.find(member => member.user.equals(req.user.id));
    if (!checkMember && !board.owner._id.equals(req.user.id)) throw new ExpressError("you're not the member of this board", 403);
    let user = await User.findById(req.user.id);
    const highlightedBoards = user.highlighted_boards.find(boards => boards.equals(board.id));
    if (!highlightedBoards) {
        user.highlighted_boards.push(board);
        await user.save();
    } else {
        user = await User.findByIdAndUpdate(user.id, { $pull: { highlighted_boards: highlightedBoards } }, { new: true });
    }
    return res.status(200).json({
        message: "Successfully highlighted board",
        highlighted_boards: board
    });
};

module.exports.generateInvite = async (req, res) => {
    const { board_id } = req.params;
    try {
        const board = await Board.findById(board_id);
        const invite_link = generateInviteLink(board.id);
        board.invite_link = { ...board.invite_link, link: invite_link };
        await board.save();
        return res.status(200).json({
            message: "Successfully generated new invite link",
            invite_link
        });
    } catch (e) {
        throw new ExpressError(e.message, 500);
    }
};

module.exports.setPasswordToInviteLink = async (req, res) => {
    const { set_password, password } = req.body;
    const board = req.board;
    if (!set_password) return res.status(400).json("'set_password field is required");
    if (set_password.toLowerCase() !== "true" && set_password.toLowerCase() !== "false") throw new ExpressError("'set_password' must be whether 'true' or 'false'", 400);
    if (set_password.toLowerCase() === "true" && !password) throw new ExpressError("password is required when set 'set_password' to true", 400);
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        board.invite_link = { ...board.invite_link, set_password, password: hash };
        await board.save();
        return res.status(200).json({
            message: "Successfully updated invite link setting"
        });
    } catch (e) {
        throw new ExpressError(e.message, 500);
    }
};

module.exports.viewInviteLink = async (req, res) => {
    const { token } = req.query;
    if (!token) throw new ExpressError("invitation token is required", 400);
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const board = await Board.findById(verifiedToken.board).populate("owner");
        if (!board) throw new ExpressError("the board for this invite link may have been deleted or invalid invite link", 404);
        return res.status(200).json({
            title: board.title,
            background: board.background,
            name: board.owner.username
        });
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
};

module.exports.acceptInviteLink = async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token) throw new ExpressError("invitation token is required", 400);
    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const board = await Board.findById(verifiedToken.board);
        if (!board) throw new ExpressError("this board is not available", 404);
        if (board.owner.equals(req.user.id)) throw new ExpressError("you are the owner of the board. you cannot invite yourself", 400);
        const checkMember = board.board_members.find(member => member.user.equals(req.user.id));
        if (checkMember) throw new ExpressError("you are already a member of this board", 400);
        if (board.invite_link.set_password) {
            if (!password) throw new ExpressError("this invitation is protected with password, enter password in 'password' field", 400);
            const checkPassword = await bcrypt.compare(password, board.invite_link.password);
            if (!checkPassword) throw new ExpressError("invalid invite password", 403);
        }
        board.board_members.push({ user: req.user.id, role: "member", joined_at: new Date() });
        await board.save();
        return res.status(200).json({
            message: `You're now the member of ${board.title}`
        });
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
};

module.exports.changeMemberRole = async (req, res) => {
    const { role } = req.body;
    const { user_id } = req.params;
    if (!mongoose.isValidObjectId(user_id)) throw new ExpressError("invalid user id", 400);
    const checkUser = req.board.board_members.find(member => member.user.equals(user_id));
    if (!checkUser) throw new ExpressError("this user is not a member of this board");
    await Board.findOneAndUpdate({ _id: req.board.id, "board_members.user": user_id },
        { $set: { "board_members.$.user": user_id, "board_members.$.role": role } },
        { new: true, runValidators: true });
    const updatedUser = await User.findById(user_id);
    return res.status(200).json({
        message: `${updatedUser.username}'s role is now changed to ${role}`
    });
};

module.exports.removeBoardMember = async (req, res) => {
    const { user_id } = req.params;
    if (!mongoose.isValidObjectId(user_id)) throw new ExpressError("invalid user id", 400);
    const checkUser = req.board.board_members.find(member => member.user.equals(user_id));
    if (!checkUser) throw new ExpressError("this user is not a member of this board");
    const removedUser = await User.findById(member_id);
    await Board.findByIdAndUpdate(req.board.id, { $pull: { board_members: { user: member_id } } });
    res.status(200).json({
        message: `${removedUser.username} is now removed from the board`
    });
};

module.exports.leaveBoard = async (req, res) => {
    const board = req.board;
    if (board.owner.equals(req.user.id)) throw new ExpressError("you are the owner of this board. you cannot leave this board", 400);
    await Board.findByIdAndUpdate(board.id, { $pull: { board_members: { user: req.user.id } } });
    res.status(200).json({
        message: `You're now removed from the ${board.title}`
    });
};