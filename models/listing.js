const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point" // Add a default value
        },
        coordinates: {
            type: [Number],
            required: true,
            default: [0, 0] // Add a default value
        },
    },
    category: {
        type: String,
        required: true,
        enum: ["Trending", "Cottage", "Island", "Beds", "Iconic Cities", "Safari", "Mountains", "Castles", "Amazing Pools", "Camping", "Farm", "Arctic", "Beachfront"],
        default: "Trending"
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;