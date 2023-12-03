const mongoose = require("mongoose");

const userRegisterSchema = new mongoose.Schema({
  fullName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  shops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
    },
  ],
});

module.exports = mongoose.model("users", userRegisterSchema);
