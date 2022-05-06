const Board = require("./models/Board");
const User = require("./models/User");
const Card = require("./models/Card");
const List = require("./models/List");
const Label = require("./models/Label");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");

const checkUsername = (username) => {
    const regEx = /^[a-zA-Z0-9]{6,25}$/;
    if (!regEx.test(username)) return;
    return true;
};

const checkEmail = (email) => {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regEx.test(email)) return;
    return true;
};

const checkPassword = (password) => {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    if (!regEx.test(password)) return;
    return true;
};

// validate body from incoming request before register

module.exports.validateRegister = catchAsync(async (req, res, next) => {
    const { username, email, password, name } = req.body;
    if (!name) throw new ExpressError("name is required", 400);
    if (!username) throw new ExpressError("username is required", 400);
    if (!email) throw new ExpressError("email is required", 400);
    if (!password) throw new ExpressError("password is required", 400);
    if (!checkUsername(username)) throw new ExpressError("username must be between 6 to 25 characters long and special characters must be excluded", 400);
    if (!checkEmail(email)) throw new ExpressError("invalid email", 400);
    if (!checkPassword(password)) throw new ExpressError("password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number", 400);
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) throw new ExpressError("username or email already exists", 400);
    next();
});

// validate body before login

module.exports.validateBody = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new ExpressError("username or password is required", 400);
    }
    next();
};

// verify that user is loggedin

module.exports.verifyLogin = (req, res, next) => {
    if (!req.isAuthenticated()) throw new ExpressError("you're not logged in", 401);
    if (!next) return;
    next();
};

// verify that board exists

module.exports.verifyBoard = catchAsync(async (req, res, next) => {
    const { board_id } = req.params;
    if (!board_id) throw new ExpressError("board_id is required", 400);
    if (!mongoose.isValidObjectId(board_id)) throw new ExpressError("invalid board id", 400);
    const board = await Board.findById(board_id).populate("owner");
    if (!board) throw new ExpressError("board not found", 404);
    req.board = board;
    next();
});

// check board visibility before responding the requested board

module.exports.checkVisibility = (req, res, next) => {
    const board = req.board;
    if (board.visibility === "private") {
        if (!req.isAuthenticated()) throw new ExpressError("this board is private and you must be logged in to verify that you are the owner of this board");
        if (!board.owner._id.equals(req.user.id)) throw new ExpressError("this board is private and you don't have permission to 'view', 'update or modify' and 'delete' unless you are the owner of this board", 403);
        next();
    } else if (board.visibility === "member_only") {
        if (!req.isAuthenticated()) throw new ExpressError("this board is for member only and you must be logged in to verify hat you are the member of this board");
        const checkMember = board.board_members.find(member => member.user.equals(req.user.id));
        if (!checkMember && !board.owner._id.equals(req.user.id)) throw new ExpressError("this board is for member only and you don't have permission to 'view', 'update or modify' and 'delete' unless you are the member of this board", 403);
        next();
    } else {
        next();
    }
};

// verify that requesting user is owner of the board before making changes to the board

module.exports.verifyOwner = (req, res, next) => {
    if (!req.board.owner._id.equals(req.user.id)) throw new ExpressError("you don't have permission to do this", 403);
    next();
};

// verify that requesting user is editor of the board to have enough privileges to make changes to the board

module.exports.verifyEditor = (req, res, next) => {
    const board = req.board;
    if (board.visibility === "private" && !board.owner._id.equals(req.user.id)) throw new ExpressError("this board is private and you don't have permission to 'view', 'update or modify' and 'delete' unless you are the owner of this board", 403);
    const checkMember = board.board_members.find(member => member.user.equals(req.user.id));
    if (!checkMember && !board.owner._id.equals(req.user.id)) throw new ExpressError("you're not the member of this board", 403);
    if (checkMember && checkMember.role !== "editor") throw new ExpressError("you don't have permission to do this", 403);
    next();
};

// verify that requesting user is member of the board to get details of board

module.exports.verifyMember = (req, res, next) => {
    const board = req.board;
    const checkMember = board.board_members.find(member => member.user.equals(req.user.id));
    if (!checkMember && !board.owner._id.equals(req.user.id)) throw new ExpressError("you're not the member of this board", 403);
    next();
}

// verify that list exists and list is from the valid board

module.exports.verifyList = catchAsync(async (req, res, next) => {
    const { list_id } = req.params;
    const board = req.board;
    if (!list_id) throw new ExpressError("list_id is required", 400);
    if (!mongoose.isValidObjectId(list_id)) throw new ExpressError("invalid list id", 400);
    const list = await List.findById(list_id);
    if (!list) throw new ExpressError("list not found", 404);
    if (!board._id.equals(list.board)) throw new ExpressError("this list is not from that board", 400);
    req.list = list;
    next();
});

// verify that new board exists and requested user has enough privileges before moving or copying from the old board

module.exports.verifyNewBoard = catchAsync(async (req, res, next) => {
    const { board_id } = req.body;
    if (!board_id) throw new ExpressError("'board_id' for the board that you're trying to move list into is required", 400);
    if (!mongoose.isValidObjectId(board_id)) throw new ExpressError("invalid id for the board that you are trying to move cards into", 400);
    const newBoard = await Board.findById(board_id);
    if (!newBoard) throw new ExpressError("the board you're trying to move list into is not found", 404);
    if (newBoard.visibility === "private" && !newBoard.owner._id.equals(req.user.id)) throw new ExpressError("the board you are trying to move list into is private and you don't have permission to 'view', 'update or modify' and 'delete' unless you are the owner of this board", 403);
    const userInBoard = newBoard.board_members.find(member => member.user.equals(req.user.id));
    if (!userInBoard && !newBoard.owner.equals(req.user.id)) throw new ExpressError("you are not the member of the board that you're trying to move list into", 403);
    if (userInBoard && userInBoard.role !== "editor") throw new ExpressError("you must be the owner or editor of the board that you're trying to move list into", 403);
    req.newBoard = newBoard;
    next();
});

// verify that request lists are valid and exist before making changes

module.exports.verifyMultipleLists = catchAsync(async (req, res, next) => {
    const { lists } = req.body;
    let oldBoard = req.board;
    if (!Array.isArray(lists)) throw new ExpressError(`'lists' field is expected to be an array but got '${typeof (lists)}'`, 400);
    const checkBoard = lists.filter(list => {
        return !oldBoard.lists.includes(list);
    });
    const checkList = lists.filter(list => {
        return !mongoose.isValidObjectId(list);
    });
    const sortedLists = lists.sort();
    const checkDuplicate = sortedLists.filter((list, i, ary) => {
        return list === ary[i + 1];
    });
    const format = (ary) => {
        const lastTwoItems = ary.slice(-2);
        const joinedTwoItems = lastTwoItems.join(" & ");
        return `${ary.slice(0, ary.length - 2).join(", ")}${checkBoard.length > 2 ? "," : ""} ${joinedTwoItems}`.trim();
    }
    if (checkList.length) throw new ExpressError(`${format(checkList)} ${checkList.length > 1 ? "are" : "is"} invalid id${checkList.length > 1 ? "s" : ""}`, 400);
    if (checkDuplicate.length) throw new ExpressError(`duplicate id${checkDuplicate.length > 1 ? "s" : ""} ${format(checkDuplicate)}`, 400);
    if (checkBoard.length) throw new ExpressError(`${format(checkBoard)} ${checkBoard.length > 1 ? "are" : "is"} not in the ${oldBoard.title}`, 400);
    next();
});

// verify that request card is exist 

module.exports.verifyCard = catchAsync(async (req, res, next) => {
    const { card_id } = req.params;
    const list = req.list;
    if (!card_id) throw new ExpressError("card id is required");
    if (!mongoose.isValidObjectId(card_id)) throw new ExpressError("invalid card id", 400);
    let card = await Card.findById(card_id);
    if (!card) throw new ExpressError("card not found", 404);
    if (!list._id.equals(card.list)) throw new ExpressError("this card is not from that list", 400);
    req.card = card;
    next();
});

// verify that new list is exist 

module.exports.verifyNewList = catchAsync(async (req, res, next) => {
    const { list_id } = req.body;
    if (!list_id) throw new ExpressError("'list_id' for the list that you're trying to move card into is required", 400);
    if (!mongoose.isValidObjectId(list_id)) throw new ExpressError("invalid id for the list you are trying to move card into", 400);
    const newList = await List.findById(list_id);
    if (!newList) throw new ExpressError("the list you're trying to move card into is not found", 404);
    req.newList = newList;
    next();
});

// verify that requested cards are valid and exist before making changes

module.exports.verifyMultipleCards = catchAsync(async (req, res, next) => {
    const { cards } = req.body;
    let oldList = req.list;
    if (!Array.isArray(cards)) throw new ExpressError(`'lists' field is expected to be an array but got '${typeof (lists)}'`, 400);
    const checkList = cards.filter(card => {
        return !oldList.cards.includes(card);
    });
    const checkCard = cards.filter(card => {
        return !mongoose.isValidObjectId(card);
    });
    const sortedCards = cards.sort();
    const checkDuplicate = sortedCards.filter((card, i, ary) => {
        return card === ary[i + 1];
    });
    const format = (ary) => {
        const lastTwoItems = ary.slice(-2);
        const joinedTwoItems = lastTwoItems.join(" & ");
        return `${ary.slice(0, ary.length - 2).join(", ")}${checkCard.length > 2 ? "," : ""} ${joinedTwoItems}`.trim();
    }
    if (checkCard.length) throw new ExpressError(`${format(checkCard)} ${checkCard.length > 1 ? "are" : "is"} invalid id${checkCard.length > 1 ? "s" : ""}`, 400);
    if (checkDuplicate.length) throw new ExpressError(`duplicate id${checkDuplicate.length > 1 ? "s" : ""} ${format(checkDuplicate)}`, 400);
    if (checkList.length) throw new ExpressError(`${format(checkList)} ${checkList.length > 1 ? "are" : "is"} not in the ${oldList.title}`, 400);
    next();
});

// verify a label

module.exports.verifyLabel = catchAsync(async (req, res, next) => {
    const { label_id } = req.params;
    if (!mongoose.isValidObjectId(label_id)) throw new ExpressError("invalid label id", 400);
    const label = await Label.findById(label_id);
    if (!label) throw new ExpressError("label not found", 404);
    next();
});