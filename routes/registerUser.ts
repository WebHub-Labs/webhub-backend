import express from "express";
import userRegisterModel from "../models/user.registerModel";
import shopRegisterModel from "../models/shop.registerModel";
import { validate, userRegistrationSchema } from "../validation/schemas";
import { asyncHandler, AppError } from "../utils/errorHandler";
import jwt from "jsonwebtoken";
import config from "../config";

const router = express.Router();

router.post("/", validate(userRegistrationSchema), asyncHandler(async (req, res) => {
  const { user_fullname, user_email, user_password, user_phNo, shopName, theme } = req.body;

  // Check if user already exists
  const existingUser = await userRegisterModel.findOne({ email: user_email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  // Check if shop name already exists
  const existingShop = await shopRegisterModel.findOne({ shopName });
  if (existingShop) {
    throw new AppError("Shop with this name already exists", 409);
  }

  // Create user
  const user = new userRegisterModel({
    fullName: user_fullname,
    email: user_email,
    password: user_password,
    phone: user_phNo,
  });

  await user.save();

  // Create shop
  const shop = new shopRegisterModel({
    shopName,
    theme,
    email: user_email,
    owner: user._id,
  });

  await shop.save();

  // Update user with shop reference
  user.shops.push(shop._id);
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user.toObject();

  res.status(201).json({
    success: true,
    message: "User and shop registered successfully",
    data: {
      user: userWithoutPassword,
      shop,
      token
    }
  });
}));

export default router;
