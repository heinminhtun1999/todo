const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/hein-s-cloud/image/upload/v1651469923/ToDO/Avatars/afzblll1thb9ghyrj71z.png"
    },
    boards: [
        {
            type: Schema.Types.ObjectId,
            ref: "Board"
        }
    ],
    highlighted_boards: [{
        type: Schema.Types.ObjectId,
        ref: "Board"
    }],
    to_be_done: [
        {
            card: {
                type: Schema.Types.ObjectId,
                ref: "Card"
            },
            status: {
                type: Boolean,
                default: false
            }
        }
    ]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

const User = mongoose.model("User", userSchema);

module.exports = User;