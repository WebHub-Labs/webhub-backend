import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shops",
    required: true,
  },
  type: {
    type: String,
    enum: ['order_placed', 'order_updated', 'order_cancelled', 'payment_received', 'low_stock', 'product_review'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ shop: 1, type: 1 });

export default mongoose.model("Notification", notificationSchema);
