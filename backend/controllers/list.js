const List = require("../models/List");
const Board = require("../models/Board");
const ExpressError = require("../utils/ExpressError");
const Card = require("../models/Card");

module.exports.getAllLists = async (req, res) => {
    const lists = await List.find({ board: req.board.id }).sort("list_position");
    return res.status(200).json(lists);
};

module.exports.createList = async (req, res) => {
    const { title } = req.body;
    const board = req.board;
    if (!title) throw new ExpressError("title is required", 400);
    if (typeof (title) !== "string") throw new ExpressError(`title is expected to be a string but got ${typeof (title)}`, 400);
    const list = new List({ title, board, list_position: board.lists.length + 1 });
    await list.save();
    await Board.findByIdAndUpdate(board.id, { $push: { lists: list } });
    return res.status(200).json(list);
};

module.exports.viewList = (req, res) => {
    const list = req.list;
    return res.status(200).json(list);
};

module.exports.editList = async (req, res) => {
    const { title } = req.body;
    if (!title) throw new ExpressError("title field is required", 400);
    if (typeof (title) !== "string") throw new ExpressError(`title is expected to be a string but got ${typeof (title)}`, 400);
    const list = await List.findByIdAndUpdate(req.list.id, { title }, { new: true });
    return res.status(200).json(list);
};

module.exports.deleteList = async (req, res) => {
    const list = req.list;
    const deletedList = await List.findByIdAndDelete(list.id);
    const lists = await List.find({ board: list.board }).sort("list_position");
    await Board.findByIdAndUpdate(deletedList.board, { $pull: { lists: deletedList.id } });
    await Card.deleteMany({ list: deletedList._id });
    for (let i = deletedList.list_position - 1; i < lists.length; i++) {
        await List.findByIdAndUpdate(lists[i].id, { $inc: { list_position: -1 } });
    }
    return res.status(200).json({
        message: "Successfully deleted list",
        deleted_list: deletedList
    });
};

module.exports.deleteLists = async (req, res) => {
    const { lists } = req.body;
    let board = req.board;
    for (let i = 0; i < lists.length; i++) {
        await List.findByIdAndDelete(lists[i]);
        board = await Board.findByIdAndUpdate(board.id, { $pull: { lists: lists[i] } }, { new: true });
        await Card.deleteMany({ list: lists[i] });
    }
    for (let i = 0; i < board.lists.length; i++) {
        await List.findByIdAndUpdate(board.lists[i], { list_position: i + 1 });
    }
    return res.status(200).json({
        message: `Successfully deleted lists from ${board.title}`
    });
};

module.exports.deleteAllLists = async (req, res) => {
    const board = req.board;
    const lists = board.lists;
    await Board.findByIdAndUpdate(board.id, { lists: [] });
    await List.deleteMany({ board: board.id });
    for (let i = 0; i < lists.length; i++) {
        await Card.deleteMany({ list: lists[i] });
    }
    return res.status(200).json({
        message: `Successfully deleted all lists from ${board.title}`
    });
};

module.exports.changeListPosition = async (req, res) => {
    const list = req.list;
    const from = parseInt(req.body.from);
    const to = parseInt(req.body.to);
    if (!from && !to) throw new ExpressError("'from' & 'to' field is required");
    const lists = await List.find({ board: list.board }).sort("list_position");
    if (list.list_position !== parseInt(from)) throw new ExpressError(`${from} is not the correct position of this list`, 400);
    if (to > lists.length) throw new ExpressError(`${to} is larger than numbers of lists`, 400);
    await List.findByIdAndUpdate(list.id, { list_position: to });
    if (from > to) {
        for (let i = 0; i < from - to; i++) {
            await List.findByIdAndUpdate(lists[to - 1 + i]._id, { $inc: { list_position: 1 } });
        }
    }
    if (from < to) {
        for (let i = 0; i < to - from; i++) {
            await List.findByIdAndUpdate(lists[to - i - 1]._id, { $inc: { list_position: -1 } });
        }
    }
    return res.status(200).json({
        message: `Successfully changed list's position, ${list.title}'s position is now ${to}`
    });
};

module.exports.moveList = async (req, res) => {
    let oldBoard = req.board;
    let newBoard = req.newBoard;
    const list = req.list;
    const position_cache = list.list_position;
    list.board = newBoard.id;
    list.list_position = newBoard.lists.length + 1;
    await list.save();
    newBoard = await Board.findByIdAndUpdate(newBoard._id, { $push: { lists: list } }, { new: true, setDefaultsOnInsert: false, upsert: true });
    oldBoard = await Board.findByIdAndUpdate(oldBoard.id, { $pull: { lists: list.id } }, { new: true });
    if (oldBoard.lists.length) {
        for (let i = position_cache - 1; i < oldBoard.lists.length; i++) {
            await List.findByIdAndUpdate(oldBoard.lists[i]._id, { $inc: { list_position: -1 } });
        }
    }
    return res.status(200).json({
        message: `Successfully moved list from ${oldBoard.title} into ${newBoard.title}`,
        new_board: newBoard,
        old_board: oldBoard
    });
};

module.exports.moveMultiLists = async (req, res) => {
    const { lists } = req.body;
    let oldBoard = req.board;
    let newBoard = req.newBoard;
    for (let i = 0; i < lists.length; i++) {
        const list = await List.findByIdAndUpdate(lists[i], { board: newBoard.id, list_position: newBoard.lists.length + 1 }, { new: true });
        newBoard = await Board.findByIdAndUpdate(newBoard.id, { $push: { lists: list } }, { new: true });
        oldBoard = await Board.findByIdAndUpdate(oldBoard.id, { $pull: { lists: lists[i] } }, { new: true });
    }
    const listsFromOld = await List.find({ board: oldBoard.id }).sort("list_position");
    if (listsFromOld.length) {
        for (let i = 0; i < listsFromOld.length; i++) {
            await List.findByIdAndUpdate(listsFromOld[i], { list_position: i + 1 });
        }
    }
    return res.status(200).json({
        message: `Successfully moved lists from ${oldBoard.title} into ${newBoard.title}`
    });
};

module.exports.moveAllLists = async (req, res) => {
    let oldBoard = req.board;
    let newBoard = req.newBoard;
    if (!oldBoard.lists.length) throw new ExpressError(`${oldBoard.title} does not have any board to move`, 400);
    const lists = await List.find({ board: oldBoard.id }).sort("list_position");
    for (let i = 0; i < oldBoard.lists.length; i++) {
        let list = await List.findByIdAndUpdate(lists[i].id, { board: newBoard.id, list_position: newBoard.lists.length + 1 }, { new: true });
        newBoard = await Board.findByIdAndUpdate(newBoard.id, { $push: { lists: list } }, { new: true });
        await Board.findByIdAndUpdate(oldBoard.id, { $pull: { lists: list.id } });
    }
    return res.status(200).json({
        message: `Successfully moved all lists from ${oldBoard.title} to ${newBoard.title}`
    });
};

module.exports.copyList = async (req, res) => {
    const oldBoard = req.board;
    const newBoard = req.newBoard;
    const list = req.list.toObject();
    delete list._id;
    delete list.createdAt;
    delete list.updatedAt;
    const copiedList = new List({ ...list, list_position: newBoard.lists.length + 1, board: newBoard.id });
    await copiedList.save();
    await Board.findByIdAndUpdate(newBoard.id, { $push: { lists: copiedList } });
    return res.status(200).json({
        message: `Successfully copied list:${list.title} from ${oldBoard.title} to ${newBoard.title}`,
        copiedList
    });
};

module.exports.copyMultiLists = async (req, res) => {
    const { lists } = req.body;
    let oldBoard = req.board;
    let newBoard = req.newBoard;
    for (let i = 0; i < lists.length; i++) {
        const oldList = await List.findById(lists[i]);
        const list = oldList.toObject();
        delete list._id;
        delete list.createdAt;
        delete list.updatedAt;
        const copiedList = new List({ title: list.title, list_position: newBoard.lists.length + 1, cards: list.cards, board: newBoard.id });
        await copiedList.save();
        newBoard = await Board.findByIdAndUpdate(newBoard.id, { $push: { lists: copiedList } }, { new: true });
    }
    return res.status(200).json({
        message: `Successfully copied lists from ${oldBoard.title} to ${newBoard.title}`
    });
};

module.exports.copyAllLists = async (req, res) => {
    const oldBoard = req.board;
    let newBoard = req.newBoard;
    if (!oldBoard.lists.length) throw new ExpressError(`${oldBoard.title} does not have any board to copy`, 400);
    const lists = await List.find({ board: oldBoard.id }).sort("list_position");
    for (let i = 0; i < oldBoard.lists.length; i++) {
        const oldList = await List.findById(lists[i]);
        const copiedList = new List({ title: oldList.title, list_position: newBoard.lists.length + 1, board: newBoard.id, cards: oldList.cards });
        await copiedList.save();
        newBoard = await Board.findByIdAndUpdate(newBoard.id, { $push: { lists: copiedList } }, { new: true });
    }
    return res.status(200).json({
        message: `Successfully copied all lists from ${oldBoard.title} to ${newBoard.title}`
    });
};
