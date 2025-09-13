import express from "express";
import userRegisterModel from "../models/user.registerModel";
import shopRegisterModel from "../models/shop.registerModel";
import Product from "../models/productModel";
import Order from "../models/orderModel";
import Category from "../models/categoryModel";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin, requireSuperAdmin } from "../middleware/adminAuth";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { z } from "zod";

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

// Dashboard Statistics
router.get("/dashboard", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const [
    totalUsers,
    totalShops,
    totalProducts,
    totalOrders,
    recentOrders,
    activeShops,
    totalRevenue
  ] = await Promise.all([
    userRegisterModel.countDocuments({ role: 'user' }),
    shopRegisterModel.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('shop', 'shopName'),
    shopRegisterModel.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        totalUsers,
        totalShops,
        totalProducts,
        totalOrders,
        activeShops,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    }
  });
}));

// User Management
router.get("/users", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) {
    filter.role = role;
  }

  const users = await userRegisterModel.find(filter)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await userRegisterModel.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

router.put("/users/:id/status", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await userRegisterModel.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
}));

router.put("/users/:id/role", requireSuperAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'super_admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await userRegisterModel.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
}));

// Shop Management
router.get("/shops", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (search) {
    filter.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (status !== undefined) {
    filter.isActive = status === 'active';
  }

  const shops = await shopRegisterModel.find(filter)
    .populate('owner', 'fullName email')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await shopRegisterModel.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      shops,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalShops: total,
        hasNext: skip + shops.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

router.put("/shops/:id/status", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const shop = await shopRegisterModel.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  ).populate('owner', 'fullName email');

  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  res.status(200).json({
    success: true,
    message: `Shop ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: shop
  });
}));

// Order Management
router.get("/orders", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10, status, shop } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = {};
  if (status) {
    filter.status = status;
  }
  if (shop) {
    filter.shop = shop;
  }

  const orders = await Order.find(filter)
    .populate('shop', 'shopName')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

router.put("/orders/:id/status", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const updateData: any = { status };
  if (trackingNumber) {
    updateData.trackingNumber = trackingNumber;
  }
  if (status === 'shipped') {
    updateData.shippedAt = new Date();
  }
  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  const order = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate('shop', 'shopName');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
}));

// Category Management
router.get("/categories", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name')
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories
  });
}));

router.post("/categories", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { name, description, image, parent, sortOrder } = req.body;

  const category = new Category({
    name,
    description,
    image,
    parent,
    sortOrder
  });

  await category.save();

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
}));

router.put("/categories/:id", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
}));

router.delete("/categories/:id", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

// Analytics
router.get("/analytics/revenue", requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { period = '30d' } = req.query;
  
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const revenueData = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      revenueData
    }
  });
}));

export default router;
