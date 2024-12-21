const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
const {reviewSchema} = require("./schema.js");

const port = 8000;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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

//validateListing
const validateListing = (req,res,next)=>{
    // console.log(req.body)
    let {error} = listingSchema.validate(req.body);
    console.log(error);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

// validateReview
const validateReview = (req, res, next) => {
    // console.log("Headers:", req.headers);
    // console.log("Request body for validateReview:", req.body);
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        // console.error("Validation Error:", errMsg); 
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Index Route
app.get("/listings", 
        wrapAsync(async (req,res) =>{
        const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    })
);

//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});


// Create Route
app.post("/listings", 
    validateListing,
    wrapAsync(async (req,res,next) => {
        let listing = req.body.listing;
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Show Route
app.get("/listings/:id", 
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id).populate("reviews");
        res.render("listings/show.ejs",{listing});
    })
);

//Edit Route
app.get("/listings/:id/edit",
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs",{listing});
    })
);

//Update Route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
app.delete("/listings/:id",
    
    wrapAsync(async (req,res)=>{
        let {id} = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
    })
);

//Reviews 
//Reviews Create Route
app.post("/listings/:id/reviews", 
    validateReview,
    wrapAsync(async (req,res) => {
        // console.log(req.body);
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    })
);

//Reviews Delete Route
app.delete("/listings/:id/reviews/:reviewId", 
    wrapAsync(async (req,res) =>{
        let {id,reviewId} = req.params;
        console.log(reviewId);
        await Review.findByIdAndDelete(reviewId);
        await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
        res.redirect(`/listings/${id}`);
    })
);

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