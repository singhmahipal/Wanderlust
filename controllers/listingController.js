const Listing = require("../models/listing.js");
const fetch = require('node-fetch');

// Free geocoding function using Nominatim (OpenStreetMap)
async function geocodeLocation(location) {
    try {
        const encodedLocation = encodeURIComponent(location);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                type: "Point",
                coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {   
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => { 
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // Geocoding and adding geometry using a more specific query
        const geometry = await geocodeLocation(newListing.location + ", " + newListing.country);
        if (geometry) {
            newListing.geometry = geometry;
        }

        let url = req.file.path;
        let filename = req.file.filename;   
        newListing.image = {url, filename};
        
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        next(error);
    }
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author" }}).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist.");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {listing});
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist.");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    try {
        const {id} = req.params;
        let listing = await Listing.findById(id);

        // Update listing properties from the request body
        Object.assign(listing, req.body.listing);
        
        // Geocoding and adding geometry with updated location and country
        const newLocation = req.body.listing.location || listing.location;
        const newCountry = req.body.listing.country || listing.country;
        const geometry = await geocodeLocation(newLocation + ", " + newCountry);
        if (geometry) {
            listing.geometry = geometry;
        }
        
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
        }
        
        await listing.save();
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        req.flash("error", "Error updating listing");
        res.redirect(`/listings/${id}`);
    }
};

module.exports.deleteListing = async (req, res) => {
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);    
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};