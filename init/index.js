const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");
require('dotenv').config();

// Load environment variables
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
const MAP_API = process.env.MAP_API;

if (!MAP_API) {
    throw new Error("MAP_API environment variable is not defined");
}

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process if the database connection fails
    }
}

// Geocode Address Function
const geocodeAddress = async (address) => {
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apikey=${MAP_API}`;
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].position; // Return the geocoded position
        } else {
            throw new Error("No results found for the address");
        }
    } catch (error) {
        console.error("Error geocoding address:", address, error.message);
        return null; // Return null for failed geocoding
    }
};

// Initialize Database
const initDB = async () => {
    try {
        await Listing.deleteMany({});
        console.log("Cleared existing data from the database");

        for (let obj of initData.data) {
            const address = `${obj.location}, ${obj.country}`;
            const position = await geocodeAddress(address);
            if (!position) {
                console.log("Skipping entry due to geocoding failure:", address);
                continue;
            }
            obj.owner = "676bdb5532f8f98e8b8014e9";
            obj.geometry = {
                type: "Point",
                coordinates: [position.lng, position.lat],
            };
        }

        await Listing.insertMany(initData.data);
        console.log("Data was initialized successfully");
    } catch (error) {
        console.error("Error during database initialization:", error);
    } finally {
        mongoose.connection.close(); // Ensure the connection is closed
        console.log("Database connection closed");
    }
};

// Run the script
(async () => {
    await connectDB();
    await initDB();
})();
