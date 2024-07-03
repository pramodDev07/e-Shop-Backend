const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
  },
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  reviews: [
    {
      rating: Number,
      comment: String,
      date: Date,
      reviewerName: String,
      reviewerEmail: String,
    },
  ],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  meta: {
    createdAt: Date,
    updatedAt: Date,
    barcode: String,
    qrCode: String,
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
