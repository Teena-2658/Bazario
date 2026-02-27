import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
 status: {
    type: String,
    enum: ["active", "outofstock"],
    default: "active",
  },
  image: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  section: {
    type: String,
    enum: ["spotlight", "trending", "indemand", "everybody"],
    required: true,
  },

    vendorId: {
      type: String,
      required: true,
    },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  averageRating: {
  type: Number,
  default: 0,
},

totalReviews: {
  type: Number,
  default: 0,
},  
});

export default mongoose.model("Product", productSchema);
