// Run this script to geocode existing listings that don't have coordinates
// node geocodeExistingListings.js

const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); // Adjust path as needed
const fetch = require('node-fetch'); // Import node-fetch at the top
require('dotenv').config();

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// Free geocoding function using Nominatim (OpenStreetMap)
async function geocodeLocation(location) {
    try {
        const encodedLocation = encodeURIComponent(location);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`;
        
        console.log(`Fetching coordinates for: ${location}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'WanderLust-App/1.0 (your-email@example.com)' // Be respectful to the API
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
            console.log(`Found coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
            return {
                type: "Point",
                coordinates: coordinates
            };
        }
        console.log(`No coordinates found for: ${location}`);
        return null;
    } catch (error) {
        console.error(`Geocoding error for location "${location}":`, error.message);
        return null;
    }
}

async function geocodeExistingListings() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");
        
        // Find listings without geometry
        const listingsWithoutGeometry = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { geometry: null },
                { "geometry.coordinates": { $exists: false } }
            ]
        });
        
        console.log(`Found ${listingsWithoutGeometry.length} listings without coordinates`);
        
        for (let i = 0; i < listingsWithoutGeometry.length; i++) {
            const listing = listingsWithoutGeometry[i];
            
            if (listing.location && listing.location.trim() !== '') {
                console.log(`\n[${i + 1}/${listingsWithoutGeometry.length}] Processing: ${listing.title}`);
                console.log(`Location: ${listing.location}`);
                
                const geometry = await geocodeLocation(listing.location);
                
                if (geometry) {
                    listing.geometry = geometry;
                    await listing.save();
                    console.log(`✅ Successfully updated "${listing.title}"`);
                } else {
                    console.log(`❌ Could not geocode "${listing.title}" - "${listing.location}"`);
                }
                
                // Rate limiting - wait 1.5 seconds between requests to be respectful to the API
                console.log('Waiting 1.5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                console.log(`⚠️  "${listing.title}" has no valid location specified`);
            }
        }
        
        console.log("\n🎉 Geocoding completed!");
        
        // Show summary
        const updatedCount = await Listing.countDocuments({
            "geometry.coordinates": { $exists: true }
        });
        console.log(`📍 Total listings with coordinates: ${updatedCount}`);
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from DB");
    }
}

// Run the script
geocodeExistingListings();