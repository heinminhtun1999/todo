const mongoose = require("mongoose");
const List = require("../models/List");
const Card = require("../models/Card");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

module.exports.getAllLists = async (req, res) => {
    const list = req.list;
    const cards = await Card.find({ list: list.id }).sort("card_position");
    return res.status(200).json(cards);
};

module.exports.createCard = async (req, res) => {
    const { title } = req.body;
    if (!title) throw new ExpressError("'title' is required", 400);
    const list = req.list;
    const card = new Card({ title, list, card_position: list.cards.length + 1 });
    await card.save();
    await List.findByIdAndUpdate(list.id, { $push: { cards: card } });
    return res.status(200).json({
        message: "Successfully created new card",
        card
    });
};

module.exports.getSingleCard = (req, res) => {
    const card = req.card;
    return res.status(200).json(card);
};

module.exports.editCard = async (req, res) => {
    const { title, description, due_date } = req.body;
    let card = req.card;
    if (!title && !description && typeof (due_date) === "undefined") throw new ExpressError("you're not updating anything", 400);
    let timestamp = (!due_date && typeof (due_date) !== "undefined") ? null : card.due_date;
    if (due_date) {
        const d = new Date(due_date);
        if (d == "Invalid Date" && due_date !== null) throw new ExpressError("invalid date format. if you're sending due_date as a timestamp, you must send it as number", 400);
        timestamp = d.getTime();
    }
    card = await Card.findByIdAndUpdate(card.id, { $set: { title, description, due_date: timestamp } }, { new: true });
    return res.status(200).json({
        message: "Successfully updated card",
        card
    });
};

module.exports.deleteCard = async (req, res) => {
    const card = req.card;
    const deletedCard = await Card.findByIdAndDelete(card.id);
    await List.findByIdAndUpdate(card.list, { $pull: { cards: card.id } });
    const cards = await Card.find({ list: card.list }).sort("card_position");
    for (let i = deletedCard.card_position - 1; i < cards.length; i++) {
        await Card.findByIdAndUpdate(cards[i].id, { $inc: { card_position: -1 } });
    }
    return res.status(200).json({
        message: "Succesfully deleted card"
    });
};

module.exports.changeCardPosition = async (req, res) => {
    const card = req.card;
    const from = parseInt(req.body.from);
    const to = parseInt(req.body.to);
    if (!from && !to) throw new ExpressError("'from' & 'to' field is required");
    const cards = await Card.find({ list: card.list }).sort("card_position");
    if (card.card_position !== parseInt(from)) throw new ExpressError(`${from} is not the correct position of this card`, 400);
    if (to > cards.length) throw new ExpressError(`${to} is larger than numbers of cards`, 400);
    await Card.findByIdAndUpdate(card.id, { card_position: to });
    if (from > to) {
        for (let i = 0; i < from - to; i++) {
            await Card.findByIdAndUpdate(cards[to - 1 + i]._id, { $inc: { card_position: 1 } });
        }
    }
    if (from < to) {
        for (let i = 0; i < to - from; i++) {
            await Card.findByIdAndUpdate(cards[to - i - 1]._id, { $inc: { card_position: -1 } });
        }
    }
    return res.status(200).json({
        message: `Successfully changed card's position, ${card.title}'s position is now ${to}`
    });
};

module.exports.moveCard = async (req, res) => {
    let oldList = req.list;
    let newList = req.newList;
    const card = req.card;
    const position_cache = card.card_position;
    const position = parseInt(req.body.position);
    card.list = newList.id;
    if (position) {
        const cards = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cards.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        card.card_position = position;
        for (let i = 0; i < cards.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cards[position - 1 + i].id, { $inc: { card_position: 1 } });
        }
    } else {
        card.card_position = newList.cards.length + 1;
    }
    await card.save();
    newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: card } }, { new: true });
    oldList = await List.findByIdAndUpdate(oldList.id, { $pull: { cards: card.id } }, { new: true });
    if (oldList.cards.length) {
        for (let i = position_cache - 1; i < oldList.cards.length; i++) {
            await Card.findByIdAndUpdate(oldList.cards[i]._id, { $inc: { card_position: -1 } });
        }
    }
    return res.status(200).json({
        message: `Successfully moved card from ${oldList.title} into ${newList.title}`,
        new_list: newList,
        old_list: oldList
    });
};

module.exports.moveMultiCards = async (req, res) => {
    let oldList = req.list;
    let newList = req.newList;
    const { cards } = req.body;
    const position = parseInt(req.body.position);
    if (position) {
        const cardsFromNewList = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cardsFromNewList.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        const cardPositionFromNewList = cardsFromNewList[position - 1].card_position;
        for (let i = 0; i < cardsFromNewList.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cardsFromNewList[position - 1 + i].id, { card_position: cardPositionFromNewList + cards.length + i });
        }

        for (let i = 0; i < cards.length; i++) {
            const card = await Card.findByIdAndUpdate(cards[i], { list: newList.id, card_position: position + i }, { new: true });
            await List.findByIdAndUpdate(newList.id, { $push: { cards: card } });
            await List.findByIdAndUpdate(oldList.id, { $pull: { cards: cards[i] } });
        }
    } else {
        for (let i = 0; i < cards.length; i++) {
            const card = await Card.findByIdAndUpdate(cards[i], { list: newList.id, card_position: newList.cards.length + 1 }, { new: true });
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: card } }, { new: true });
            oldList = await List.findByIdAndUpdate(oldList.id, { $pull: { cards: cards[i] } }, { new: true });
        }
    }
    const cardsFromOld = await Card.find({ list: oldList.id }).sort("card_position");
    if (cardsFromOld.length) {
        for (let i = 0; i < cardsFromOld.length; i++) {
            await Card.findByIdAndUpdate(cardsFromOld[i], { card_position: i + 1 });
        }
    }
    return res.status(200).json({
        message: `Successfully moved cards from ${oldList.title} into ${newList.title}`
    });
};

module.exports.moveAllCards = async (req, res) => {
    let oldList = req.list;
    let newList = req.newList;
    const position = parseInt(req.body.position);
    if (!oldList.cards.length) throw new ExpressError(`${oldList.title} does not have any board to move`, 400);
    const cards = await Card.find({ list: oldList.id }).sort("card_position");
    if (position) {
        const cardsFromNewList = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cardsFromNewList.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        const position_cache = cardsFromNewList[position - 1].card_position;
        for (let i = 0; i < cardsFromNewList.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cardsFromNewList[position - 1 + i].id, { card_position: position_cache + cards.length + i });
        }

        for (let i = 0; i < cards.length; i++) {
            const card = await Card.findByIdAndUpdate(cards[i]._id, { list: newList.id, card_position: position + i }, { new: true });
            await List.findByIdAndUpdate(newList.id, { $push: { cards: card } });
            await List.findByIdAndUpdate(oldList.id, { $pull: { cards: card._id } });
        }
    } else {
        for (let i = 0; i < oldList.cards.length; i++) {
            let card = await Card.findByIdAndUpdate(cards[i].id, { list: newList.id, card_position: newList.cards.length + 1 }, { new: true });
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: card } }, { new: true });
            await List.findByIdAndUpdate(oldList.id, { $pull: { cards: card.id } });
        }
    }
    return res.status(200).json({
        message: `Successfully moved all cards from ${oldList.title} to ${newList.title}`
    });
};

module.exports.copyCard = async (req, res) => {
    const oldList = req.list;
    const newList = req.newList;
    const position = parseInt(req.body.position);
    const card = req.card.toObject();
    delete card._id;
    delete card.createdAt;
    delete card.updatedAt;
    let copiedCard;
    if (position) {
        const cards = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cards.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        for (let i = 0; i < cards.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cards[position - 1 + i].id, { $inc: { card_position: 1 } });
        }
        copiedCard = new Card({ ...card, card_position: position, list: newList.id });
    } else {
        copiedCard = new Card({ ...card, card_position: newList.cards.length + 1, list: newList.id });
    }
    await copiedCard.save();
    await List.findByIdAndUpdate(newList.id, { $push: { cards: copiedCard } });
    return res.status(200).json({
        message: `Successfully copied card:${card.title} from ${oldList.title} to ${newList.title}`,
        copiedCard
    });
};

module.exports.copyMultiCards = async (req, res) => {
    let oldList = req.list;
    let newList = req.newList;
    const { cards } = req.body;
    const position = parseInt(req.body.position);
    if (position) {
        const cardsFromNewList = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cardsFromNewList.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        const cardPositionFromNewList = cardsFromNewList[position - 1].card_position;
        for (let i = 0; i < cardsFromNewList.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cardsFromNewList[position - 1 + i].id, { card_position: cardPositionFromNewList + cards.length + i });
        }
        for (let i = 0; i < cards.length; i++) {
            const oldCard = await Card.findById(cards[i]);
            const card = oldCard.toObject();
            delete card._id;
            delete card.createdAt;
            delete card.updatedAt;
            const copiedCard = new Card({ ...card, card_position: position + i, list: newList.id });
            await copiedCard.save();
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: copiedCard } }, { new: true });
        }
    } else {
        for (let i = 0; i < cards.length; i++) {
            const oldCard = await Card.findById(cards[i]);
            const card = oldCard.toObject();
            delete card._id;
            delete card.createdAt;
            delete card.updatedAt;
            const copiedCard = new Card({ ...card, card_position: newList.cards.length + 1, list: newList.id });
            await copiedCard.save();
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: copiedCard } }, { new: true });
        }
    }
    return res.status(200).json({
        message: `Successfully copied cards from ${oldList.title} to ${newList.title}`
    });
};

module.exports.copyAllCards = async (req, res) => {
    const oldList = req.list;
    if (!oldList.cards.length) throw new ExpressError(`${oldList.title} does not have any board to copy`, 400);
    let newList = req.newList;
    const position = parseInt(req.body.position);
    const cards = await Card.find({ list: oldList.id }).sort("card_position");
    if (position) {
        const cardsFromNewList = await Card.find({ list: newList.id }).sort("card_position");
        if (position > cardsFromNewList.length) throw new ExpressError(`${position} is larger than the length of cards from the list you are trying to move into`, 400);
        const cardPositionFromNewList = cardsFromNewList[position - 1].card_position;
        for (let i = 0; i < cardsFromNewList.length - position + 1; i++) {
            await Card.findByIdAndUpdate(cardsFromNewList[position - 1 + i].id, { card_position: cardPositionFromNewList + cards.length + i });
        }
        for (let i = 0; i < oldList.cards.length; i++) {
            const oldCard = await Card.findById(cards[i]);
            const card = oldCard.toObject();
            delete card._id;
            delete card.createdAt;
            delete card.updatedAt;
            const copiedCard = new Card({ ...card, card_position: position + i, list: newList.id });
            await copiedCard.save();
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: copiedCard } }, { new: true });
        }
    } else {
        for (let i = 0; i < oldList.cards.length; i++) {
            const oldCard = await Card.findById(cards[i]);
            const card = oldCard.toObject();
            delete card._id;
            delete card.createdAt;
            delete card.updatedAt;
            const copiedCard = new Card({ ...card, card_position: newList.cards.length + 1, list: newList.id });
            await copiedCard.save();
            newList = await List.findByIdAndUpdate(newList.id, { $push: { cards: copiedCard } }, { new: true });
        }
    }
    return res.status(200).json({
        message: `Successfully copied all cards from ${oldList.title} to ${newList.title}`
    });
};

module.exports.deleteMultiCards = async (req, res) => {
    const { cards } = req.body;
    let list = req.list;
    for (let i = 0; i < cards.length; i++) {
        await Card.findByIdAndDelete(cards[i]);
        list = await List.findByIdAndUpdate(list.id, { $pull: { cards: cards[i] } }, { new: true });
    }
    for (let i = 0; i < list.cards.length; i++) {
        await Card.findByIdAndUpdate(list.cards[i], { card_position: i + 1 });
    }
    return res.status(200).json({
        message: `Successfully deleted cards from ${list.title}`
    });
};

module.exports.deleteAllCard = async (req, res) => {
    const list = req.list;
    if (!list.cards.length) throw new ExpressError("this list has no cards to deleted", 400);
    await List.findByIdAndUpdate(list.id, { cards: [] });
    await Card.deleteMany({ list: list.id });
    return res.status(200).json({
        message: `Successfully deleted all cards from ${list.title}`
    });
};

module.exports.assignMemberToCard = async (req, res) => {
    let card = req.card;
    const board = req.board;
    const { user_id } = req.body;
    if (!user_id) throw new ExpressError("user_id is required", 400);
    if (!mongoose.isValidObjectId(user_id)) throw new ExpressError("invalid user_id", 400);
    const user = await User.findById(user_id);
    if (!user) throw new ExpressError("user not found", 404);
    const checkUser = board.board_members.find(member => member.user.equals(user.id));
    if (!checkUser && !board.owner.equals(user.id)) throw new ExpressError("this user is not in the board", 400);
    const checkUserInAssignment = card.assignments.find(a => a.user.equals(user.id));
    if (checkUserInAssignment) throw new ExpressError("user already assigned to this card", 400);
    if (board.owner.equals(user_id) && !req.user._id.equals(user_id)) throw new ExpressError("you cannot assign board owner to card", 403);
    card = await Card.findByIdAndUpdate(card.id, { $push: { assignments: { user, completed: false } } }, { new: true });
    return res.status(200).json({
        message: `assigend ${user.firstname + " " + user.lastname} to ${card.title}`,
        card
    });
};

module.exports.unAssignMemeberFromCard = async (req, res) => {
    let card = req.card;
    const board = req.board;
    const { user_id } = req.body;
    if (!user_id) throw new ExpressError("user_id is required", 400);
    if (!mongoose.isValidObjectId(user_id)) throw new ExpressError("invalid user_id", 400);
    const user = await User.findById(user_id);
    if (!user) throw new ExpressError("user not found", 404);
    const checkUser = board.board_members.find(member => member.user.equals(user.id));
    if (!checkUser && !board.owner.equals(user.id)) throw new ExpressError("this user is not in the board", 400);
    const checkUserInAssignment = card.assignments.find(a => a.user.equals(user.id));
    if (!checkUserInAssignment) throw new ExpressError("this user has not been assigned to this card", 400);
    if (board.owner.equals(user_id) && !req.user._id.equals(user_id)) throw new ExpressError("you cannot unassign board owner to card", 403);
    card = await Card.findByIdAndUpdate(card.id, { $pull: { assignments: { user: user.id } } });
    return res.status(200).json({
        message: `${user.firstname + " " + user.lastname} has unassigned from ${card.title}`
    });
};

module.exports.updateAssignmentStatus = async (req, res) => {
    let card = req.card;
    const checkUserInAssignment = card.assignments.find(a => a.user.equals(req.user.id));
    if (!checkUserInAssignment) throw new ExpressError("you are not assigned to this card", 403);
    card = await Card.findOneAndUpdate({ _id: card.id, "assignments.user": req.user.id }, { $set: { "assignments.$.completed": !checkUserInAssignment.completed } }, { new: true });
    return res.status(200).json({
        message: "updated assignment successful",
        card
    });
};