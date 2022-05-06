require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db");
const User = require("./models/User");
const passport = require("passport");
const session = require("express-session");
const user = require("./routes/user");
const board = require("./routes/board");
const list = require("./routes/list");
const card = require("./routes/card");
const label = require("./routes/label");
const resetPassword = require("./routes/resetPassword");
const boardInvite = require("./routes/boardInvite");
const ExpressError = require("./utils/ExpressError");

connectDB();

const app = express();

app.use(cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    origin: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes 

app.use("/auth", user);
app.use("/reset", resetPassword);
app.use("/board/invite", boardInvite);
app.use("/api/boards", board);
app.use("/api/boards/:board_id/lists", list);
app.use("/api/boards/:board_id/lists/:list_id/cards", card);
app.use("/api/boards/:board_id/lists/:list_id/cards/:card_id/label", label);

app.get("/", (req, res) => {
    res.redirect("Hello World")
});

app.all("*", (req, res) => {
    throw new ExpressError("route not found", 404);
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "internal server error";
    return res.status(statusCode).json(err.message);
});

app.listen(5000, () => {
    console.log("Server running on PORT: 5000");
});