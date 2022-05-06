const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/todo", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Connected");
    } catch (e) {
        console.log({ error: { description: "MongoDB Error", message: e.message } });
    }
}

module.exports = connectDB;