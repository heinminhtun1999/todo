require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/db");
const User = require("./models/User");
const passport = require("passport");
const session = require("express-session");
const user = require("./routes/user");
const board = require("./routes/board");

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
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes 

app.use("/auth", user);
app.use("/api/boards", board);

app.get("/", (req, res) => {
    res.send("Hello World")
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Internal Server";
    res.status(statusCode).send(err.message);
})

app.listen(5000, () => {
    console.log("Server running on PORT: 5000");
});