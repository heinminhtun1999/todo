const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./User");

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
        set_password: {
            type: Boolean,
            defautl: false
        },
        password: String
    }
}, { timestamps: true });

boardSchema.post("findOneAndDelete", async function (data, next) {
    await User.findByIdAndUpdate(data.owner, { $pull: { boards: data.id } });
});

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;