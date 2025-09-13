import mongoose from "mongoose"

const shopRegisterSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  theme: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("shops", shopRegisterSchema);
