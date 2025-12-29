# Multi-Tenant RestoPOS System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   RestoPOS Multi-Tenant SaaS                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /signup    │  │    /auth     │  │ /superadmin  │      │
│  │  Onboarding  │  │    Login     │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Protected Routes (Tenant-Scoped)                  │    │
│  │   / | /dashboard | /orders | /tables | /menu       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/S + Cookies
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Public Routes                                        │   │
│  │  POST /api/tenant (create tenant)                    │   │
│  │  POST /api/user/login (authenticate)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tenant Routes (requires tenantId)                   │   │
│  │  /api/menu | /api/category | /api/table             │   │
│  │  /api/order | /api/payment | /api/user              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Super Admin Routes (role: superadmin)               │   │
│  │  GET /api/superadmin/dashboard/stats                 │   │
│  │  GET/PUT/DELETE /api/superadmin/tenants              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose
                              │
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Tenants │  │   Users  │  │   Menus  │  │  Tables  │   │
│  │          │  │ tenantId │  │ tenantId │  │ tenantId │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Orders  │  │Categories│  │ Payments │                  │
│  │ tenantId │  │ tenantId │  │ tenantId │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## User Flows

### 1. Restaurant Onboarding Flow

```
User visits /signup
       │
       ├─> Fills restaurant info (name, slug)
       ├─> Fills admin info (name, email, phone, password)
       ├─> Selects plan (free, basic, premium)
       │
       ├─> POST /api/tenant
       │      │
       │      ├─> Create Tenant document
       │      ├─> Create Admin User (role: admin, tenantId: X)
       │      └─> Return success
       │
       └─> Redirect to /auth (login page)
```

### 2. Login Flow

```
User enters credentials
       │
       ├─> POST /api/user/login
       │      │
       │      ├─> Validate credentials
       │      ├─> Check tenantId (if applicable)
       │      ├─> Generate JWT token
       │      └─> Return user data (including tenantId, role)
       │
       ├─> Store in Redux (tenantId included)
       ├─> Set HTTP-only cookie
       │
       └─> Route based on role:
              │
              ├─> role === 'superadmin' → /superadmin
              └─> role !== 'superadmin' → /
```

### 3. Regular User Operations (Tenant-Scoped)

```
User makes API request (e.g., GET /api/menu)
       │
       ├─> Cookie sent automatically
       ├─> Backend: isVerifiedUser middleware
       │      ├─> Verify JWT token
       │      ├─> Load user from DB
       │      └─> Extract tenantId from user
       │
       ├─> Controller: getMenuItems
       │      ├─> Query: { tenantId: req.user.tenantId }
       │      └─> Return only tenant's menu items
       │
       └─> Frontend receives filtered data
```

### 4. Super Admin Operations (Cross-Tenant)

```
Super Admin makes API request (e.g., GET /api/superadmin/tenants)
       │
       ├─> Cookie sent automatically
       ├─> Backend: isVerifiedUser middleware
       │      ├─> Verify JWT token
       │      ├─> Load user from DB
       │      └─> Check role === 'superadmin'
       │
       ├─> Controller: getAllTenants
       │      ├─> Query ALL tenants (no tenantId filter)
       │      ├─> Calculate stats for each tenant
       │      └─> Return complete list
       │
       └─> Frontend displays in dashboard
```

## Data Isolation Model

### Tenant A Data
```
Tenant: { _id: "A1", name: "Pizza Palace", slug: "pizza-palace" }
└─> Users: [
    { role: "admin", tenantId: "A1" },
    { role: "waiter", tenantId: "A1" }
]
└─> Menu Items: [
    { name: "Margherita", tenantId: "A1" },
    { name: "Pepperoni", tenantId: "A1" }
]
└─> Tables: [
    { tableNo: 1, tenantId: "A1" },
    { tableNo: 2, tenantId: "A1" }
]
└─> Orders: [
    { _id: "O1", tenantId: "A1", items: [...] }
]
```

### Tenant B Data (Isolated)
```
Tenant: { _id: "B1", name: "Burger Joint", slug: "burger-joint" }
└─> Users: [
    { role: "admin", tenantId: "B1" }
]
└─> Menu Items: [
    { name: "Cheeseburger", tenantId: "B1" }
]
└─> Tables: [
    { tableNo: 1, tenantId: "B1" }  ← Same tableNo, different tenant!
]
└─> Orders: [
    { _id: "O2", tenantId: "B1", items: [...] }
]
```

### Query Examples

```javascript
// Tenant A admin queries menu
Menu.find({ tenantId: "A1" })
// Returns: [Margherita, Pepperoni]

// Tenant B admin queries menu
Menu.find({ tenantId: "B1" })
// Returns: [Cheeseburger]

// Super admin queries all tenants
Tenant.find({})
// Returns: [Pizza Palace, Burger Joint, ...]
```

## Database Schema with Tenant Isolation

### Before (Single-Tenant)
```javascript
// ❌ Global uniqueness
Table: { tableNo: 1 }  // Can't have duplicate tableNo
Category: { name: "Pizza" }  // Can't have duplicate name
```

### After (Multi-Tenant)
```javascript
// ✅ Tenant-scoped uniqueness
Table: {
  tableNo: 1,
  tenantId: "A1"
}
// Compound index: { tenantId: 1, tableNo: 1 } (unique)
// Allows tableNo: 1 for both tenant A and tenant B!

Category: {
  name: "Pizza",
  tenantId: "A1"
}
// Compound index: { tenantId: 1, name: 1 } (unique)
// Allows "Pizza" category for multiple tenants!
```

## Role Hierarchy

```
┌────────────────────────────────────────────┐
│           Super Admin (God Mode)            │
│  • Manages all tenants                      │
│  • Views cross-tenant analytics             │
│  • Can activate/deactivate tenants          │
│  • No tenantId (or tenantId: null)          │
└────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐          ┌──────▼───────┐
│   Tenant A   │          │   Tenant B   │
└──────────────┘          └──────────────┘
        │                         │
   ┌────┴────┐              ┌────┴────┐
   │         │              │         │
┌──▼──┐ ┌───▼───┐      ┌───▼──┐ ┌───▼───┐
│Admin│ │Waiter │      │Admin │ │Cashier│
└─────┘ └───────┘      └──────┘ └───────┘

Admin: Full access to tenant's data
Waiter: Orders, tables, menu (read)
Cashier: Orders, payments
```

## API Security Matrix

| Endpoint | Public | Authenticated | Tenant-Scoped | Super Admin Only |
|----------|--------|---------------|---------------|------------------|
| POST /api/tenant | ✅ | ❌ | ❌ | ❌ |
| POST /api/user/login | ✅ | ❌ | ❌ | ❌ |
| GET /api/menu | ✅* | ❌ | ✅ | ❌ |
| POST /api/menu | ❌ | ✅ | ✅ | ❌ |
| GET /api/order | ❌ | ✅ | ✅ | ❌ |
| GET /api/superadmin/* | ❌ | ✅ | ❌ | ✅ |

*Public menu access requires tenant header/param

## Component Architecture

### Frontend Component Tree

```
App
├── Router
    ├── Public Routes
    │   ├── /auth (Login)
    │   └── /signup (TenantOnboarding)
    │
    ├── Protected Routes (ProtectedRoutes wrapper)
    │   ├── / (Home)
    │   ├── /dashboard (Dashboard)
    │   ├── /orders (Orders)
    │   ├── /tables (Tables)
    │   ├── /menu (Menu)
    │   └── /users (Users)
    │
    └── Super Admin Routes (SuperAdminRoutes wrapper)
        └── /superadmin (SuperAdminDashboard)
            ├── StatsOverview
            ├── TenantList
            │   └── TenantModal
            └── Filters
```

### Redux Store Structure

```javascript
{
  user: {
    _id: "userId",
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    role: "admin" | "waiter" | "cashier" | "superadmin",
    tenantId: "tenantId" | null,  // null for superadmin
    isAuth: true | false
  },
  cart: { ... },
  customer: { ... }
}
```

## Migration Path

### Existing Single-Tenant Database → Multi-Tenant

```
Step 1: Run migration script
        ↓
node backend/migrate-to-multitenant.js
        ↓
Creates default tenant
        ↓
Updates all existing records with default tenantId
        ↓
Updates admin user with tenantId
        ↓
✅ Migration complete
        ↓
Step 2: Create super admin user manually in MongoDB
        ↓
Step 3: Test with default tenant
        ↓
Step 4: Create new tenants via /signup or API
```

## Key Files

### Backend
- `models/*Model.js` - All models have tenantId
- `controllers/*Controller.js` - All controllers filter by tenantId
- `controllers/superAdminController.js` - Cross-tenant operations
- `middleware/tenantMiddleware.js` - Tenant resolution
- `routes/superAdminRoute.js` - Super admin routes

### Frontend
- `pages/SuperAdminDashboard.jsx` - Super admin UI
- `pages/TenantOnboarding.jsx` - Restaurant signup
- `components/superadmin/*` - Super admin components
- `redux/slices/userSlice.js` - User state with tenantId
- `App.jsx` - Route configuration with role-based access

### Documentation
- `MULTI_TENANT_GUIDE.md` - Backend architecture
- `FRONTEND_MULTITENANT_GUIDE.md` - Frontend setup
- `CONVERSION_SUMMARY.md` - Complete change list
- `SECURITY_RECOMMENDATIONS.md` - Production hardening

## Quick Start Commands

```bash
# Backend
cd backend
npm install
node migrate-to-multitenant.js  # If migrating existing data
npm run dev

# Frontend
cd pos-frontend
npm install
npm run dev

# Create super admin (in MongoDB shell)
db.users.insertOne({
  name: "Super Admin",
  email: "admin@example.com",
  phone: "1234567890",
  password: "$2b$10$hashedPassword",
  role: "superadmin",
  createdAt: new Date(),
  updatedAt: new Date()
})

# Test tenant creation
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "slug": "test-restaurant",
    "adminName": "John Doe",
    "adminEmail": "john@test.com",
    "adminPhone": "1234567890",
    "adminPassword": "password123",
    "plan": "free"
  }'
```

## Summary

This multi-tenant architecture provides:

✅ **Complete Data Isolation** - Each tenant's data is separate
✅ **Scalable Design** - Single codebase serves multiple restaurants
✅ **Flexible Onboarding** - Self-service restaurant signup
✅ **Centralized Management** - Super admin dashboard for system oversight
✅ **Role-Based Access** - Different permissions for different user types
✅ **Production Ready** - With proper security recommendations documented

The system is now a true SaaS platform capable of serving unlimited restaurants from a single deployment!
