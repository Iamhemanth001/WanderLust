if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");

const User = require("./models/user");
const authRoutes = require('./routes/auth'); 
const listingRouter = require("./routes/listing"); 
const reviewRouter = require("./routes/review"); 
const pageRoutes = require("./routes/pages");
const userRouter = require("./routes/user");
const ExpressError = require('./utils/ExpressError');
require('./config/passport');

const app = express();
const port = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

// MongoDB Connection
mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// View Engine and Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:8000', // Adjust as needed for your environment
    credentials: true
}));

// Session Store
const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});

store.on("error", function (e) {
    console.error("Session Store Error", e);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Initialization
passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local Variables Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null; // Ensure currUser is always defined
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", pageRoutes);
app.use("/", userRouter);

// Default Route
app.get("/", (req, res) => {
    res.redirect('/listings');
});

// Catch-All for Undefined Routes
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("listings/error.ejs", { err });
});

// Start Server
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
