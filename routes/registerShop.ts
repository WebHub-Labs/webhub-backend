const express = require("express");
const registerShopController = require("../controller/registerShop");
const shopRegisterModel = require("../db/shop.registerModel");
const userRegisterModel = require("../db/user.registerModel");
const router = express.Router();

router.post("/", registerShopController);

router.get("/", async (req, res) => {
  const data = await shopRegisterModel
    .findOne({ email: "gh@gm.co" })
    .populate("owner");
});

module.exports = router;
