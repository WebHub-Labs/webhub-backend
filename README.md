# WebHub Backend API

A comprehensive Shopify-like e-commerce platform backend built with Node.js/Express, TypeScript, MongoDB, and JWT authentication. Supports multi-shop management with admin panel functionality.

## Features

### 🔐 Authentication & Authorization
- JWT Authentication & Authorization
- Role-based access control (User, Admin, Super Admin)
- Password hashing with bcrypt
- Protected routes and middleware

### 👤 User Management
- User Registration & Login
- Profile management with addresses
- Multi-role support (user, admin, super_admin)
- User status management (active/inactive)

### 🏪 Multi-Shop Management
- Create and manage multiple shops per user
- Shop themes and customization
- Shop-specific product catalogs
- Shop analytics and reporting

### 📦 Product Management
- Complete CRUD operations for products
- Category-based product organization
- Inventory tracking and stock management
- Product images and descriptions
- Advanced filtering and search

### 🛒 E-commerce Features
- Order management system
- Payment status tracking
- Order status workflow (pending → delivered)
- Customer information management
- Order analytics and reporting

### 🏷️ Category Management
- Hierarchical category structure
- Category-based product filtering
- Admin-managed categories
- Category tree navigation

### 🔔 Notification System
- Real-time notifications for orders
- Shop owner notifications
- User notification management
- Notification read/unread status

### 👨‍💼 Admin Panel
- Comprehensive admin dashboard
- User management and role assignment
- Shop management and monitoring
- Order management and tracking
- Category management
- Analytics and reporting
- Revenue tracking

### 🛡️ Security & Performance
- Input validation with Zod
- Rate limiting and DDoS protection
- Security headers with Helmet
- CORS configuration
- Request logging with Morgan
- Error handling and logging

### 🚀 Development & Deployment
- TypeScript throughout
- Docker containerization
- Environment configuration
- Database seeding
- Health check endpoints
- Comprehensive API documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, bcrypt, rate limiting
- **Containerization**: Docker

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webhub-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # Database Configuration
   DATABASE_URI=mongodb://localhost:27017/webhub

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=3d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and shop
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Shops
- `GET /api/shops` - Get user's shops (authenticated)
- `POST /api/shops` - Create new shop (authenticated)
- `GET /api/shops/:id` - Get specific shop (authenticated)
- `PUT /api/shops/:id` - Update shop (authenticated)
- `DELETE /api/shops/:id` - Delete shop (authenticated)

### Products
- `GET /api/products` - Get all products (with pagination & filtering)
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create new product (authenticated)
- `PUT /api/products/:id` - Update product (authenticated)
- `DELETE /api/products/:id` - Delete product (authenticated)
- `GET /api/products/shop/:shopId` - Get products by shop

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/shop/:shopId` - Get orders for shop (authenticated)
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status (authenticated)
- `PUT /api/orders/:id/payment` - Update payment status (authenticated)
- `GET /api/orders/shop/:shopId/analytics` - Get order analytics (authenticated)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree structure
- `GET /api/categories/:id` - Get specific category
- `GET /api/categories/:id/products` - Get products in category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)
- `PUT /api/notifications/:id/read` - Mark notification as read (authenticated)
- `PUT /api/notifications/read-all` - Mark all notifications as read (authenticated)
- `DELETE /api/notifications/:id` - Delete notification (authenticated)
- `GET /api/notifications/shop/:shopId` - Get shop notifications (authenticated)

### Admin Panel
- `GET /api/admin/dashboard` - Get admin dashboard stats (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/status` - Update user status (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (super admin only)
- `GET /api/admin/shops` - Get all shops (admin only)
- `PUT /api/admin/shops/:id/status` - Update shop status (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `PUT /api/admin/orders/:id/status` - Update order status (admin only)
- `GET /api/admin/analytics/revenue` - Get revenue analytics (admin only)

### Health Check
- `GET /status` - Server health check

## API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_fullname": "John Doe",
    "user_email": "john@example.com",
    "user_password": "password123",
    "user_phNo": "1234567890",
    "shopName": "Johns Store",
    "theme": "modern"
  }'
```

### User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "john@example.com",
    "user_password": "password123"
  }'
```

### Create Product (with authentication)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sample Product",
    "color": "Blue",
    "category": "Electronics",
    "price": 99.99,
    "description": "A sample product",
    "stock": 10,
    "shop": "SHOP_ID"
  }'
```

## Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t webhub-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Development

### Project Structure
```
webhub-backend/
├── config/           # Configuration files
├── loaders/          # Application loaders
├── middleware/       # Custom middleware
├── models/           # MongoDB models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── validation/       # Input validation schemas
├── index.ts          # Application entry point
└── package.json      # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- Error handling without sensitive data exposure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
