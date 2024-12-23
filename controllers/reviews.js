const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req,res) => {
    // console.log(req.body);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    // console.log(newReview);
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.distroyReview = async (req,res) =>{
    let {id,reviewId} = req.params;
    // console.log(reviewId);
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    req.flash("success","Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
};
