const mongoose = require("mongoose");
const { Schema } = mongoose;

const boardSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    lists: [
        {
            type: Schema.Types.ObjectId,
            ref: "List"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    board_members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            role: {
                type: String,
                enum: ["editor", "member"]
            },
            _id: false,
            joined_at: Date
        }
    ],
    visibility: {
        type: String,
        enum: ["private", "member_only", "public"],
        default: "private"
    },
    background: {
        type: String,
        default: "#838C91"
    },
    invite_link: {
        link: String,
        set_password: Boolean,
        password: String
    },
    labels: [
        {
            type: Schema.Types.ObjectId,
            ref: "Label"
        }
    ]
}, { timestamps: true });

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;