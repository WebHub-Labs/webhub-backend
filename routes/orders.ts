import express from "express";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import shopRegisterModel from "../models/shop.registerModel";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireShopOwner } from "../middleware/adminAuth";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { z } from "zod";

const router = express.Router();

// Order validation schema
const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required'),
      country: z.string().min(1, 'Country is required'),
    }),
  }),
  shop: z.string().min(1, 'Shop ID is required'),
  items: z.array(z.object({
    product: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery']),
  notes: z.string().optional(),
});

// Create new order
router.post("/", asyncHandler(async (req, res) => {
  const validatedData = orderSchema.parse(req.body);
  const { customer, shop, items, paymentMethod, notes } = validatedData;

  // Verify shop exists and is active
  const shopData = await shopRegisterModel.findOne({ _id: shop, isActive: true });
  if (!shopData) {
    throw new AppError('Shop not found or inactive', 404);
  }

  // Verify products and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOne({ _id: item.product, shop, isActive: true });
    if (!product) {
      throw new AppError(`Product ${item.product} not found`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product ${product.name}`, 400);
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal,
    });
  }

  // Calculate totals (simplified - in real app, you'd have tax calculation, shipping, etc.)
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Create order
  const order = new Order({
    customer,
    shop,
    items: orderItems,
    paymentMethod,
    notes,
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
    paymentStatus: 'pending',
  });

  await order.save();

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    );
  }

  await order.populate('shop', 'shopName theme');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
}));

// Get orders for a specific shop (shop owner only)
router.get("/shop/:shopId", authenticateToken, requireShopOwner, asyncHandler(async (req: AuthRequest, res) => {
  const { shopId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { shop: shopId };
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('items.product', 'name image')
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

// Get single order
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('shop', 'shopName theme')
    .populate('items.product', 'name image price');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    success: true,
    data: order
  });
}));

// Update order status (shop owner only)
router.put("/:id/status", authenticateToken, requireShopOwner, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify shop ownership
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    if (!req.user.shops.includes(order.shop.toString())) {
      throw new AppError('You do not have permission to update this order', 403);
    }
  }

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

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate('shop', 'shopName theme');

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrder
  });
}));

// Update payment status
router.put("/:id/payment", authenticateToken, requireShopOwner, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentId } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify shop ownership
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    if (!req.user.shops.includes(order.shop.toString())) {
      throw new AppError('You do not have permission to update this order', 403);
    }
  }

  const updateData: any = { paymentStatus };
  if (paymentId) {
    updateData.paymentId = paymentId;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate('shop', 'shopName theme');

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    data: updatedOrder
  });
}));

// Get order analytics for shop
router.get("/shop/:shopId/analytics", authenticateToken, requireShopOwner, asyncHandler(async (req: AuthRequest, res) => {
  const { shopId } = req.params;
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

  const analytics = await Order.aggregate([
    {
      $match: {
        shop: shopId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);

  const statusBreakdown = await Order.aggregate([
    {
      $match: {
        shop: shopId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      analytics: analytics[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0
      },
      statusBreakdown
    }
  });
}));

export default router;
