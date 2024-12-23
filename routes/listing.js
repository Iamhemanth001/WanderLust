const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

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

//Index Route
router.get("/", 
        wrapAsync(async (req,res) =>{
        const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    })
);

//New Route
router.get("/new",isLoggedIn,(req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
});

// Create Route
router.post("/", 
    isLoggedIn,
    validateListing,
    wrapAsync(async (req,res,next) => {
        let listing = req.body.listing;
        const newListing = new Listing(listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    })
);

//Show Route
router.get("/:id", 
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id).populate("reviews").populate("owner");
        if(!listing){
            req.flash("error","Listing you requested for does not exits");
            res.redirect("/listings");
        }
        // console.log(listing);
        res.render("listings/show.ejs",{listing});
    })
);

//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            req.flash("error","Listing you requested for does not exits");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs",{listing});
    })
);

//Update Route
router.put("/:id",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req,res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        req.flash("success","Listing Updated Successfully!");
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
router.delete("/:id",
    isLoggedIn,
    wrapAsync(async (req,res)=>{
        let {id} = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success","Listing Deleted Successfully!");
        res.redirect("/listings");
    })
);

module.exports = router;