const mongoose = require("mongoose");

const shopRegisterSchema = new mongoose.Schema({
  shopName: {
    type: String,
    require: true,
  },
  theme: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("shops", shopRegisterSchema);
