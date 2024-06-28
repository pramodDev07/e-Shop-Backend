const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    bio: String,
    addresses: { type: [Schema.Types.Mixed] },
    resetToken: String,
    resetTokenExpiry: Date,
  });

  exports.User = mongoose.model("User", userSchema)