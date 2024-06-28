const mongoose = require('mongoose')
const {Schema} = mongoose

const cartSchema = new Schema ({
    userId: String,
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: Number,
  });

  exports.CartItem = mongoose.model("CartItem",cartSchema)