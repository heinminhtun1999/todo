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
            ref: "Lists"
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
            }
        }
    ],
    highlighted: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ["private", "member", "public"],
        default: "private"
    },
    background: {
        type: String,
        default: "#838C91"
    },
    invite_link: {
        token: String,
        set_password: {
            type: Boolean,
            defautl: false
        },
        password: String
    }
}, { timestamps: true });

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;