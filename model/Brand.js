const mongoose = require('mongoose')
const {Schema} = mongoose

const brandSchema = new Schema({
    brand: { type: String, unique: true}
  });
  
  exports.Brand = mongoose.model("Brand", brandSchema);