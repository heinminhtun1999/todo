const Label = require("../models/Label");
const Board = require("../models/Board");
const Card = require("../models/Card");
const ExpressError = require("../utils/ExpressError");

module.exports.getAllLabel = async (req, res) => {
    const board = req.board;
    const labels = await Label.find({ board: board.id });
    return res.status(200).json(labels);
};

module.exports.createOrAddLabel = async (req, res) => {
    const { title } = req.body;
    if (!title) throw new ExpressError("title is required", 400);
    const board = req.board;
    const card = req.card;
    // chcek if label exists
    const label = await Label.findOne({ board: board.id, title });
    if (label) {
        // find that existing label
        const oldLabel = await Label.findOne({ _id: { $in: board.labels }, title });
        // check that label is already in the card
        const labelExistsInCard = card.labels.find(label => {
            return label.equals(oldLabel.id);
        })
        // throw error when label is in the card
        if (labelExistsInCard) throw new ExpressError("this label is already in the card", 400);
        oldLabel.cards.push(card.id);
        await oldLabel.save();
        await Card.findByIdAndUpdate(card.id, { $push: { labels: oldLabel } });
        return res.status(200).json({
            message: "label added to the card",
            label: oldLabel
        });
    } else {
        const newLabel = new Label({ title, board: board.id });
        newLabel.cards.push(card);
        await newLabel.save()
        await Board.findByIdAndUpdate(board.id, { $push: { labels: newLabel } });
        await Card.findByIdAndUpdate(card.id, { $push: { labels: newLabel } });
        return res.status(200).json({
            message: "Successfully created new label",
            label: newLabel
        });
    }
};

module.exports.deleteLabel = async (req, res) => {
    const { label_id } = req.params;
    const label = await Label.findByIdAndDelete(label_id);
    for (let i = 0; i < label.cards.length; i++) {
        await Card.findByIdAndUpdate(label.cards[i], { $pull: { labels: label.id } });
    }
    await Board.findByIdAndUpdate(req.board.id, { $pull: { labels: label_id } });
    return res.status(200).json({
        message: "label deleted"
    });
};

module.exports.removeLabelFromCard = async (req, res) => {
    const { label_id } = req.params;
    const card = req.card;
    const checkLabelInCard = card.labels.find(label => label.equals(label_id))
    await Card.findByIdAndUpdate(card.id, { $pull: { labels: label_id } });
    await Label.findByIdAndUpdate(label_id, { $pull: { cards: card.id } });
    return res.status(200).json({
        message: "label removed from card"
    });
};