const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default : "https://i.pinimg.com/originals/50/c6/31/50c6315606313ce170174420b8b7b77f.jpg",
        set: (v) => v === "" ? "https://i.pinimg.com/originals/50/c6/31/50c6315606313ce170174420b8b7b77f.jpg" : v,
    },
    price: {
        type: Number,
        default: 1500
    },
    location: String,
    country: String,
    reviews : [{
        type: Schema.Types.ObjectId,
        ref : "Review"
    }],
});

listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const listing = mongoose.model("listing",listingSchema);
module.exports = listing;

