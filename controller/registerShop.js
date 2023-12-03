const userDb = require("../db/user.registerModel");
const registerShop = require("../db/shop.registerModel");
const registerShopController = async (req, res) => {
  const { shopName, theme, email } = req.body;

  const owner = await userDb.findOne({ email: email });
  const shop = await registerShop.findOne({ shopName });

  if (!shop && owner) {
    const register = await new registerShop({
      shopName,
      theme,
      email,
      owner: owner._id,
    }).save();
    if (register) {
      res.send("successfull");
    } else {
      res.send("err");
    }
  } else {
    res.send("err shop already exists or you havent registered");
  }
};
module.exports = registerShopController;
