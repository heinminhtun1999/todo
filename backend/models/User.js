const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = mongoose;
const ExpressError = require("../utils/ExpressError");

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: "https://tleliteracy.com/wp-content/uploads/2017/02/default-avatar.png"
    },
    boards: [
        {
            type: Schema.Types.ObjectId,
            ref: "Board"
        }
    ]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

userSchema.pre("register", async function (next, data) {
    const user = await this.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (user) throw new ExpressError("username or email already exists", 400)
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;