import mongoose from "mongoose"
import { Schema } from "mongoose"

const ProductSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  color: { 
    type: String, 
    required: true,
    trim: true,
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: { 
    type: Number, 
    required: true,
    min: 0,
  },
  image: { 
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shops",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Product", ProductSchema);
