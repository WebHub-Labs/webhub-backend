import express from "express";
import Product from "../models/productModel";
import shopRegisterModel from "../models/shop.registerModel";
import { validate, productSchema, productUpdateSchema } from "../validation/schemas";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Get all products with optional filtering
router.get("/", asyncHandler(async (req, res) => {
  const { category, shop, page = 1, limit = 10 } = req.query;
  
  const filter: any = { isActive: true };
  
  if (category) {
    filter.category = category;
  }
  
  if (shop) {
    filter.shop = shop;
  }

  const skip = (Number(page) - 1) * Number(limit);
  
  const products = await Product.find(filter)
    .populate('shop', 'shopName theme')
    .populate('category', 'name slug')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

// Get single product
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const product = await Product.findById(id)
    .populate('shop', 'shopName theme')
    .populate('category', 'name slug');
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
}));

// Create new product (authenticated users only)
router.post("/", authenticateToken, validate(productSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { name, color, category, price, image, description, stock, shop } = req.body;
  const userId = req.user._id;

  // Verify that the shop belongs to the user
  const userShop = await shopRegisterModel.findOne({ _id: shop, owner: userId });
  if (!userShop) {
    throw new AppError("Shop not found or you don't have permission to add products to this shop", 403);
  }

  const product = new Product({
    name,
    color,
    category,
    price,
    image,
    description,
    stock,
    shop
  });

  await product.save();
  await product.populate('shop', 'shopName theme');
  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product
  });
}));

// Update product (authenticated users only)
router.put("/:id", authenticateToken, validate(productUpdateSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  // Find product and verify ownership
  const product = await Product.findById(id).populate('shop', 'owner');
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Check if user owns the shop
  if (product.shop.owner.toString() !== userId.toString()) {
    throw new AppError("You don't have permission to update this product", 403);
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('shop', 'shopName theme')
   .populate('category', 'name slug');

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct
  });
}));

// Delete product (authenticated users only)
router.delete("/:id", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find product and verify ownership
  const product = await Product.findById(id).populate('shop', 'owner');
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Check if user owns the shop
  if (product.shop.owner.toString() !== userId.toString()) {
    throw new AppError("You don't have permission to delete this product", 403);
  }

  // Soft delete by setting isActive to false
  await Product.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully"
  });
}));

// Get products by shop
router.get("/shop/:shopId", asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find({ shop: shopId, isActive: true })
    .populate('shop', 'shopName theme')
    .populate('category', 'name slug')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments({ shop: shopId, isActive: true });

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

export default router;
