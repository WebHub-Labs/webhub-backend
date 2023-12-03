const  mongoose = require("mongoose") 
const {Schema} = require("mongoose");

const ProductSchema = new Schema({
  name: { type: String, required: true },  
  color: { type: String, required: true },
  category: { type: String ,required:true},
  price: { type: Number, required: true },
  image: { type: String },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
