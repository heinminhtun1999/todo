const mongoose = require("mongoose");
const { Schema } = mongoose;

const cardSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    due_date: Number,
    labels: [
        {
            type: Schema.Types.ObjectId,
            ref: "Label"
        }
    ],
    assignments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            completed: Boolean,
            _id: false
        }
    ],
    list: {
        type: Schema.Types.ObjectId,
        ref: "List"
    },
    card_position: Number
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;