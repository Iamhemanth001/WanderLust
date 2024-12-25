const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const isLoggedIn = (req,res,next) => {
    // console.log(req.user);
    console.log(req.path,"..",req.originalUrl);

    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

const saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

const isOwner = async (req,res,next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(req.user && !listing.owner.equals(req.user._id)){
        req.flash("error","You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

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

const isReviewAuthor = async (req,res,next) =>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports = {isLoggedIn,saveRedirectUrl,isOwner,validateListing,validateReview,isReviewAuthor};