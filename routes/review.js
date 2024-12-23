const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

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

//Reviews Create Route
router.post("/", 
    validateReview,
    wrapAsync(async (req,res) => {
        // console.log(req.body);
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        req.flash("success","New Review Created!");
        res.redirect(`/listings/${listing._id}`);
    })
);

//Reviews Delete Route
router.delete("/:reviewId", 
    wrapAsync(async (req,res) =>{
        let {id,reviewId} = req.params;
        // console.log(reviewId);
        await Review.findByIdAndDelete(reviewId);
        await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
        req.flash("success","Review Deleted Successfully!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;