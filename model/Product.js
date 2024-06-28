const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    rating: {
      type: Number,
    },
    stock: {
      type: Number,
    },
    brand: {
      type: String,
    },
    category: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    images: {
      type: [String], // Array of strings representing image URLs
      default: [], // Default is an empty array
    },
    colors: { type: [Schema.Types.Mixed] },
    sizes: { type: [Schema.Types.Mixed] },
    highlights: { type: [String], default: [] },
    deleted: { type: Boolean, default: false },
    discountPrice: { type: Number },
  });
  
  exports.Product = mongoose.model("Product", productSchema);