import express from "express";
import Notification from "../models/notificationModel";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireShopOwner } from "../middleware/adminAuth";
import { asyncHandler, AppError } from "../utils/errorHandler";

const router = express.Router();

// Get notifications for authenticated user
router.get("/", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { user: req.user._id };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .populate('shop', 'shopName')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalNotifications: total,
        hasNext: skip + notifications.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

// Mark notification as read
router.put("/:id/read", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate('shop', 'shopName');

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
}));

// Mark all notifications as read
router.put("/read-all", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// Delete notification
router.delete("/:id", authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: req.user._id
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get shop notifications (for shop owners)
router.get("/shop/:shopId", authenticateToken, requireShopOwner, asyncHandler(async (req: AuthRequest, res) => {
  const { shopId } = req.params;
  const { page = 1, limit = 20, type } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { shop: shopId };
  if (type) {
    filter.type = type;
  }

  const notifications = await Notification.find(filter)
    .populate('user', 'fullName email')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalNotifications: total,
        hasNext: skip + notifications.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
}));

// Create notification (internal use - for order updates, etc.)
export const createNotification = async (data: {
  user: string;
  shop: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) => {
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

export default router;
