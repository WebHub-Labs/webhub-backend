import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from '../utils/errorHandler';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Admin access required', 403);
  }

  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'super_admin') {
    throw new AppError('Super admin access required', 403);
  }

  next();
};

export const requireShopOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  // Allow admin and super_admin to access any shop
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }

  // For regular users, check if they own the shop
  const shopId = req.params.shopId || req.body.shop || req.query.shop;
  if (!shopId) {
    throw new AppError('Shop ID required', 400);
  }

  if (!req.user.shops.includes(shopId)) {
    throw new AppError('You do not have permission to access this shop', 403);
  }

  next();
};
