import mongoose from "mongoose"

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

export default mongoose.model("shops", shopRegisterSchema);
