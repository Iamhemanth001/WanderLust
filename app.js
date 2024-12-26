if (process.env.NODE_ENV != "production") {
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

const User = require("./models/user");
const authRoutes = require('./routes/auth'); 

const listingRouter = require("./routes/listing"); 
const reviewRouter = require("./routes/review"); 
const userRouter = require("./routes/user");
// const { Server } = require("http");// Required for server

const pageRoutes = require("./routes/pages");
const ExpressError = require('./utils/ExpressError');
require('./config/passport');

const app = express();

const port = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

main()
.then(() => {
    console.log("connected to DB")
})
.catch(() => {
    console.log(err);
});

async function main() {  
    await mongoose.connect(MONGO_URL);  
}


// View Engine and Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")) 
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session Store
const store = MongoStore.create({
    mongoUrl: MONGO_URL, 
    crypto : {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, 
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Initialization
app.use(passport.session());
app.use(passport.initialize());

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local Variables Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", pageRoutes);

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
    let {statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).send(message);
}); 


app.listen(port, () => {
    console.log("server is listening to port ", port);
}); 