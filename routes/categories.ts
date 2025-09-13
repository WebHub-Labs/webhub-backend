import express from "express";
import Category from "../models/categoryModel";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { z } from "zod";

const router = express.Router();

// Category validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
  parent: z.string().optional(),
  sortOrder: z.number().default(0),
});

// Get all active categories
router.get("/", asyncHandler(async (req, res) => {
  const { parent } = req.query;
  
  const filter: any = { isActive: true };
  if (parent) {
    filter.parent = parent;
  }

  const categories = await Category.find(filter)
    .populate('parent', 'name')
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories
  });
}));

// Get category tree (hierarchical structure)
router.get("/tree", asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 });

  // Build tree structure
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: create map of all categories
  categories.forEach(category => {
    categoryMap.set(category._id.toString(), {
      ...category.toObject(),
      children: []
    });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const categoryObj = categoryMap.get(category._id.toString());
    if (category.parent) {
      const parent = categoryMap.get(category.parent.toString());
      if (parent) {
        parent.children.push(categoryObj);
      }
    } else {
      rootCategories.push(categoryObj);
    }
  });

  res.status(200).json({
    success: true,
    data: rootCategories
  });
}));

// Get single category
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id)
    .populate('parent', 'name')
    .populate({
      path: 'children',
      match: { isActive: true },
      options: { sort: { sortOrder: 1, name: 1 } }
    });

  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    data: category
  });
}));

// Get products in category
router.get("/:id/products", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, shop } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const category = await Category.findById(id);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404);
  }

  // Get all subcategories recursively
  const getAllSubcategories = async (categoryId: string): Promise<string[]> => {
    const subcategories = await Category.find({ parent: categoryId, isActive: true });
    let allIds = [categoryId];
    
    for (const sub of subcategories) {
      const subIds = await getAllSubcategories(sub._id.toString());
      allIds = allIds.concat(subIds);
    }
    
    return allIds;
  };

  const categoryIds = await getAllSubcategories(id);

  const filter: any = {
    category: { $in: categoryIds },
    isActive: true
  };

  if (shop) {
    filter.shop = shop;
  }

  const Product = require('../models/productModel').default;
  const products = await Product.find(filter)
    .populate('shop', 'shopName theme')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      category,
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

// Create category (admin only - will be protected by admin middleware)
router.post("/", asyncHandler(async (req, res) => {
  const validatedData = categorySchema.parse(req.body);
  const { name, description, image, parent, sortOrder } = validatedData;

  // Check if parent category exists
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory || !parentCategory.isActive) {
      throw new AppError('Parent category not found', 404);
    }
  }

  const category = new Category({
    name,
    description,
    image,
    parent,
    sortOrder
  });

  await category.save();
  await category.populate('parent', 'name');

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
}));

// Update category (admin only)
router.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = categorySchema.partial().parse(req.body);

  const category = await Category.findById(id);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404);
  }

  // Check if parent category exists
  if (validatedData.parent) {
    const parentCategory = await Category.findById(validatedData.parent);
    if (!parentCategory || !parentCategory.isActive) {
      throw new AppError('Parent category not found', 404);
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    validatedData,
    { new: true, runValidators: true }
  ).populate('parent', 'name');

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory
  });
}));

// Delete category (admin only)
router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has subcategories
  const subcategories = await Category.countDocuments({ parent: id, isActive: true });
  if (subcategories > 0) {
    throw new AppError('Cannot delete category with subcategories', 400);
  }

  // Check if category has products
  const Product = require('../models/productModel').default;
  const productCount = await Product.countDocuments({ category: id, isActive: true });
  if (productCount > 0) {
    throw new AppError('Cannot delete category with products', 400);
  }

  await Category.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

export default router;
