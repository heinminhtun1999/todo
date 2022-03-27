const Board = require("./models/Board");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");

module.exports.verifyLogin = (req, res, next) => {
    if (!req.isAuthenticated()) throw new ExpressError("you're not logged in", 401);
    next();
}

module.exports.verifyBoardAndUser = catchAsync(async (req, res, next) => {
    const { board_id } = req.params;
    if (!board_id) throw new ExpressError("board_id is required", 400);
    if (!mongoose.isValidObjectId(board_id)) throw new ExpressError("invalid board id", 400);
    const board = await Board.findById(board_id).populate("owner");
    if (!board) throw new ExpressError("board not found", 404);
    if (board.owner.id !== req.user.id) throw new ExpressError("you are not the owner of this board", 403);
    next();
})

module.exports.checkBoard = catchAsync(async (req, res, next) => {
    const { board__id } = req.params;
})

// if (board.visibility === "private") {
//     if (!req.isAuthenticated()) throw new ExpressError("you're not logged in", 401);
//     if (board.owner.id !== req.user.id) throw new ExpressError("this board is private and you don't have permission to view", 403);
//     next();
// } else if (board.visibility === "member_only") {
//     if (!req.isAuthenticated()) throw new ExpressError("you're not logged in", 401);
// }