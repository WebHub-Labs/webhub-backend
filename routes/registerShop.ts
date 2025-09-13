import express from "express";
import shopRegisterModel from "../models/shop.registerModel";
import userRegisterModel from "../models/user.registerModel";
import { validate, shopRegistrationSchema } from "../validation/schemas";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/", authenticateToken, validate(shopRegistrationSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { shopName, theme, email } = req.body;
  const userId = req.user._id;

  // Check if user exists
  const user = await userRegisterModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if shop name already exists
  const existingShop = await shopRegisterModel.findOne({ shopName });
  if (existingShop) {
    throw new AppError("Shop with this name already exists", 409);
  }

  // Create new shop
  const shop = new shopRegisterModel({
    shopName,
    theme,
    email,
    owner: userId,
  });

  await shop.save();

  // Update user with shop reference
  user.shops.push(shop._id);
  await user.save();

  res.status(201).json({
    success: true,
    message: "Shop registered successfully",
    data: shop
  });
}));

// Get all shops for authenticated user
router.get("/", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user._id;
  
  const shops = await shopRegisterModel.find({ owner: userId });
  
  res.status(200).json({
    success: true,
    data: shops
  });
}));

// Get specific shop
router.get("/:id", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  const shop = await shopRegisterModel.findOne({ _id: id, owner: userId });
  if (!shop) {
    throw new AppError("Shop not found", 404);
  }
  
  res.status(200).json({
    success: true,
    data: shop
  });
}));

export default router;
