import userDb from "../models/user.registerModel"
import registerShop from "../models/shop.registerModel"
import { Request, Response } from "express";

export async function registerShopController(req: Request, res: Response) {
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
    res.send("Err Shop already exists or you havent registered");
  }
};
