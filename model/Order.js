const  mongoose = require('mongoose')
const {Schema} = mongoose

const orderSchema = new Schema(
    {
      items: { type: [Schema.Types.Mixed], required: true },
      totalAmount: { type: Number, required: true },
      totalItems: { type: Number, required: true },
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      paymentMethod: { type: String, required: true },
      paymentStatus: { type: String, default: "pending" },
      status: { type: String, default: "pending" },
      selectedAddress: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true }
  );
  
  exports.Order = mongoose.model("Order", orderSchema);