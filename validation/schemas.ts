import { z } from 'zod';

// User registration validation
export const userRegistrationSchema = z.object({
    user_fullname: z.string().min(2, 'Full name must be at least 2 characters'),
    user_email: z.string().email('Invalid email format'),
    user_password: z.string().min(6, 'Password must be at least 6 characters'),
    user_phNo: z.string().min(10, 'Phone number must be at least 10 digits'),
    shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
    theme: z.string().min(1, 'Theme is required')
});

// User login validation
export const userLoginSchema = z.object({
    user_email: z.string().email('Invalid email format'),
    user_password: z.string().min(1, 'Password is required')
});

// Shop registration validation
export const shopRegistrationSchema = z.object({
    shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
    theme: z.string().min(1, 'Theme is required'),
    email: z.string().email('Invalid email format')
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  color: z.string().min(1, 'Color is required'),
  category: z.string().min(1, 'Category ID is required'),
  price: z.number().positive('Price must be a positive number'),
  image: z.string().url('Invalid image URL').optional(),
  description: z.string().optional(),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  shop: z.string().min(1, 'Shop ID is required')
});

// Product update validation
export const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  color: z.string().min(1, 'Color is required').optional(),
  category: z.string().min(1, 'Category ID is required').optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  image: z.string().url('Invalid image URL').optional(),
  description: z.string().optional(),
  stock: z.number().min(0, 'Stock cannot be negative').optional()
});

// Order validation
export const orderSchema = z.object({
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

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
  parent: z.string().optional(),
  sortOrder: z.number().default(0),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
