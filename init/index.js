const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to database");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data =  initData.data.map((obj) => ({...obj,owner: "676815252b5fd07b1acfbeca"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();
