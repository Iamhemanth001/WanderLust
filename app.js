if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing"); 
const reviewRouter = require("./routes/review"); 
const userRouter = require("./routes/user");

const port = 8000;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const sessionOptions = {
    secret: "mySecretCode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);

app.listen(port,()=>{
    console.log("app is listening to port ",port);
});


app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//local variables

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

main().then(()=>{
    console.log("Connected to DB");
}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next) => {
    let {statusCode = 500,message = "Something Went Wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{err});
});