const express = require("express");
const shopRegisterModel = require("../db/shop.registerModel");
const userRegisterModel = require("../db/user.registerModel");
const router = express.Router();

router.post("/", registerShopController);

router.get("/", async (req, res) => {
  const data = await shopRegisterModel
    .findOne({ email: "gh@gm.co" })
    .populate("owner");
});

export default router;
