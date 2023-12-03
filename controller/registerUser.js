const shopRegisterModel = require("../db/shop.registerModel");
const registerUser = require("../db/user.registerModel");
const userRegisterModel = require("../db/user.registerModel");

const registerUserController = async (req, res) => {
  const { shopName, theme } = req.body;
  const { user_fullname, user_phNo, user_email, user_password } = req.body;

  const shop = await shopRegisterModel.findOne({ shopName: shopName });
  const email = await userRegisterModel.findOne({ email: user_email });
  const ph = await userRegisterModel.findOne({ phone: user_phNo });

  if (shop) {
    res.send("shop name already exists").status(409);
  } else if (email && ph) {
    res.send("email or phone already exists").status(409);
  } else {
    var user = await new registerUser({
      fullName: user_fullname,
      email: user_email,
      password: user_password,
      phone: user_phNo,
    });
    const regShop = await new shopRegisterModel({
      shopName,
      theme,
      email: user_email,
    });
    Promise.all([await user.save(), await regShop.save()])
      .then(async () => {
        console.log("successfully registered");
        const id = await userRegisterModel.findOne({ email: user_email });
        const updateID = await shopRegisterModel.findOneAndUpdate(
          { email: user_email },
          { owner: id._id }
        );

        const shopName = await shopRegisterModel.find({ email: user_email });
        const shop_ids = shopName.map((e) => e._id);

        const updateShops = await userRegisterModel.findOneAndUpdate(
          { email: user_email },
          { shops: shop_ids }
        );
      })
      .catch((err) => {
        console.log(err);
        res.send("error");
      });
  }
};

module.exports = registerUserController;
