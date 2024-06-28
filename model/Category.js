const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    category: { type: String, unique: true, required: true }
  });

  exports.Category = mongoose.model("Category", categorySchema);
  