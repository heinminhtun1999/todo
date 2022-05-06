const mongoose = require("mongoose");
const { Schema } = mongoose;

const labelSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    board: {
        type: Schema.Types.ObjectId,
        ref: "Board"
    },
    cards: [
        {
            type: Schema.Types.ObjectId,
            ref: "Card"
        }
    ]
});

const Label = mongoose.model("Label", labelSchema);

module.exports = Label;