const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};

        if (category) {
            if (category === "MyListings" && req.user) {
                filter.owner = req.user._id;
            } else if (category === "MyListings" && !req.user) {
                req.flash("error", "You need to be logged in to view your listings.");
                return res.redirect("/login");
            } else {
                filter.category = category;
            }
        }

        const allListings = await Listing.find(filter);
        if (allListings.length === 0) {
            req.flash("error", "No listings available in this category.");
            return res.redirect("/listings");
        }
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/listings");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req,res,next) => {
    const fetch = (await import('node-fetch')).default;
    const address = req.body.listing.location + ', ' + req.body.listing.country;
    const mapApi = process.env.MAP_API;

    const geocodeAddress = async (address) => {
        const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apikey=${mapApi}`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.items[0].position; // Return the geocoded position
        } catch (error) {
            console.error("Error geocoding address:", error);
            return null;
        }
    };

    const position = await geocodeAddress(address);
    if (!position) {
        req.flash("error", "Error geocoding address. Please try again.");
        return res.redirect("/listings/new");
    }

    // console.log(position);

    let url = req.file.path;
    let filename = req.file.filename;
    let listing = req.body.listing;

    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = {
        type: "Point",
        coordinates: [position.lng, position.lat]
    };
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews",populate: {path: "author"},}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exits");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImgUrl = listing.image.url;
    originalImgUrl = originalImgUrl.replace("/upload", "/upload/w_250"); // Resize image

    res.render("listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.updateListing = async (req,res) => {
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

        if(typeof req.file != "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url,filename};
            await listing.save();
        }

        req.flash("success","Listing Updated Successfully!");
        res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    const { s } = req.query;
    if (!s || typeof s !== 'string') {
        req.flash("error", "Please enter a valid search term.");
        return res.redirect("/listings");
    }
    const listings = await Listing.find({
        $or: [
            { location: { $regex: s, $options: "i" } },
            { title: { $regex: s, $options: "i" } },
            { category: { $regex: s, $options: "i" } },
            { country: { $regex: s, $options: "i" } }
        ]
    });

    if(listings.length === 0){
        req.flash("error","No Listings Found!");
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", { allListings: listings });
};