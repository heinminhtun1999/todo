const mongoose = require("mongoose");
const { Schema } = mongoose;

const listSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    list_position: {
        type: Number,
        unique: false
    },
    cards: [
        {
            type: Schema.Types.ObjectId,
            ref: "Card"
        }
    ],
    board: {
        type: Schema.Types.ObjectId,
        ref: "Board"
    }
}, { timestamps: true });

const List = mongoose.model("List", listSchema);

module.exports = List;