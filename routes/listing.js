const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});

const listingController = require("../controllers/listings.js");

// Index Route & Create Route
router.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createNewListing
));


//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

// Search Route
router.get("/search", wrapAsync(listingController.searchListings));

//Show Route && Update Route && Delete Route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));

module.exports = router;