import express from "express"
const router = express.Router();
import shopRegisterModel from "../models/shop.registerModel";


router.get("/", async (req, res) => {
  const data = await shopRegisterModel
    .findOne({ email: "prajwal@fm.co" })
    .populate("owner");
  res.send(data?.owner?.phone);
});

export default router;
