const express = require("express");
const router = express.Router();
const shopRegisterModel = require("../db/shop.registerModel");
const registerUserController = require("../controller/registerUser");

router.post("/", registerUserController);

router.get("/", async (req, res) => {
  const data = await shopRegisterModel
    .findOne({ email: "prajwal@fm.co" })
    .populate("owner");
  res.send(data.owner.phone);
});

module.exports = router;
