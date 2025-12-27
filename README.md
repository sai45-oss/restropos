# RestoPOS - Multi-Tenant Restaurant POS System

A comprehensive Point of Sale (POS) system designed for restaurants, now with **multi-tenant SaaS architecture** supporting multiple restaurants on a single platform.

## 🌟 Features

### Core POS Features
- 📋 **Menu Management**: Create, update, and organize menu items by categories
- 🪑 **Table Management**: Track table status, seats, and current orders
- 📝 **Order Management**: Create and track orders with real-time status updates
- 💳 **Payment Processing**: Integrated with Razorpay for online payments
- 👥 **User Management**: Role-based access control (Admin, Waiter, Cashier)
- 📊 **Dashboard**: Real-time metrics and order tracking
- 🔔 **Real-time Updates**: WebSocket support for live order notifications

### Multi-Tenant SaaS Features
- 🏢 **Tenant Isolation**: Complete data separation between restaurants
- 👤 **Tenant Onboarding**: Self-service restaurant registration
- 📦 **Subscription Plans**: Support for free, basic, premium tiers
- 💰 **Billing Integration**: Optional Stripe integration for subscriptions
- 🔐 **Secure Access**: Tenant-scoped authentication and authorization
- 🚀 **Scalable**: Optimized for handling multiple tenants efficiently

## 🏗️ Architecture

This is a full-stack application with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + TailwindCSS
- **Real-time**: Socket.io for live updates
- **Multi-tenancy**: Tenant-scoped data isolation

## 📚 Documentation

For detailed multi-tenant architecture and usage guide, see [MULTI_TENANT_GUIDE.md](./MULTI_TENANT_GUIDE.md)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sai45-oss/restropos.git
cd restropos
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/pos
PORT=3000
EOF

# Start the backend
npm run dev
```

3. **Frontend Setup**
```bash
cd pos-frontend
npm install

# Start the frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🔄 Migration from Single-Tenant

If you have existing data from a single-tenant installation:

```bash
cd backend
node migrate-to-multitenant.js
```

This will:
1. Create a default tenant
2. Associate all existing data with the default tenant
3. Create/update admin user with tenant association

## 🏢 Creating a New Tenant (Restaurant)

### Via API
```bash
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "adminName": "Restaurant Owner",
    "adminEmail": "owner@myrestaurant.com",
    "adminPhone": "1234567890",
    "adminPassword": "securePassword123",
    "plan": "free"
  }'
```

### Login with Tenant Context
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@myrestaurant.com",
    "password": "securePassword123",
    "tenantSlug": "my-restaurant"
  }'
```

## 👥 User Roles

- **Admin**: Full access to all features, can manage users and settings
- **Waiter**: Can create orders, view tables and menu
- **Cashier**: Can view and update orders, process payments

## 🔐 Authentication

The system uses JWT-based authentication with:
- HTTP-only cookies for secure token storage
- Role-based access control
- Tenant-scoped authorization

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/tenant` - Create new tenant
- `POST /api/user/login` - User login
- `GET /api/menu` - View menu (requires tenant context)

### Protected Endpoints
All protected endpoints require authentication via cookie:
- `GET /api/user/me` - Get current user
- `POST /api/user/register` - Register new user (admin only)
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Create menu item (admin only)
- `GET /api/category` - Get categories
- `POST /api/category` - Create category (admin only)
- `GET /api/table` - Get tables
- `POST /api/table` - Create table (admin only)
- `GET /api/order` - Get orders
- `POST /api/order` - Create order
- `PUT /api/order/:id` - Update order
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## 🔧 Environment Variables

### Required
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/pos
```

### Optional
```env
PORT=3000
NODE_ENV=development

# Stripe Integration (for subscription billing)
STRIPE_ENABLED=false
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay Integration (for payment processing)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## 📦 Database Schema

### Key Models
- **Tenant**: Restaurant information and subscription details
- **User**: System users with tenant association
- **Menu**: Menu items (tenant-scoped)
- **Category**: Menu categories (tenant-scoped)
- **Table**: Restaurant tables (tenant-scoped)
- **Order**: Customer orders (tenant-scoped)
- **Payment**: Payment records (tenant-scoped)

All models include `tenantId` for data isolation.

## 🧪 Testing

### Test Multi-Tenant Isolation

1. Create two test tenants:
```bash
# Create Tenant A
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{"name":"Restaurant A","slug":"restaurant-a","adminName":"Admin A","adminEmail":"admin@a.com","adminPhone":"1234567890","adminPassword":"password123"}'

# Create Tenant B
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{"name":"Restaurant B","slug":"restaurant-b","adminName":"Admin B","adminEmail":"admin@b.com","adminPhone":"0987654321","adminPassword":"password123"}'
```

2. Login as Tenant A and create menu items
3. Login as Tenant B and verify you cannot see Tenant A's data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### "Tenant context is required" error
Ensure you're passing tenant ID via:
- Query parameter: `?tenantId=restaurant-slug`
- Header: `X-Tenant-Id: restaurant-slug`
- Or authenticate with a user that has tenantId

### "User is not associated with a tenant" error
User needs a tenantId. Either:
- Create user through tenant creation flow
- Register user as admin (will inherit tenantId)
- Manually set tenantId on existing user

### Database connection issues
Check MongoDB is running and URI is correct in `.env`

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

Built with modern web technologies:
- Express.js for the backend API
- React for the frontend UI
- MongoDB for data storage
- Socket.io for real-time features
- TailwindCSS for styling
