# Frontend Multi-Tenant Updates Guide

## Overview
The frontend has been updated to support the multi-tenant architecture with the following new features:

1. **Tenant Context Management** - User's tenant information is stored in Redux
2. **Super Admin Dashboard** - Complete tenant management interface
3. **Tenant Onboarding** - Self-service restaurant signup
4. **Role-Based Routing** - Super admins see different dashboard

## New Features

### 1. Tenant Onboarding Page (`/signup`)
- Self-service restaurant registration
- Creates tenant + admin user in one flow
- Auto-generates slug from restaurant name
- Plan selection (free, basic, premium)
- Redirects to login after successful signup

### 2. Super Admin Dashboard (`/superadmin`)
- **Access**: Only for users with `role: 'superadmin'`
- **Features**:
  - System-wide statistics (total tenants, active tenants, users, orders)
  - Tenant list with search and filtering
  - Tenant details modal with statistics
  - Tenant status management (activate/deactivate)
  - Pagination support
  - Real-time stats per tenant

### 3. Multi-Tenant Authentication
- Login now captures and stores `tenantId`
- Super admins are routed to `/superadmin`
- Regular users are routed to `/` (home)
- User state includes tenant information

## Installation

### Backend Setup
The backend already has all necessary changes. Just ensure the server is running:

```bash
cd backend
npm install
npm run dev  # or npm start
```

### Frontend Setup

1. **Install Dependencies**:
```bash
cd pos-frontend
npm install
```

This will install the new dependency: `lucide-react` (for icons)

2. **Start Frontend**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### Creating a Super Admin User

Since super admin users can't be created through the normal flow, you need to create one directly in MongoDB:

```javascript
// Connect to MongoDB
use pos  // or your database name

// Create a super admin user
db.users.insertOne({
  name: "Super Admin",
  email: "superadmin@restropos.com",
  phone: "9999999999",
  password: "$2b$10$YourHashedPasswordHere",  // Use bcrypt to hash "admin123" or any password
  role: "superadmin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the backend to create one programmatically:

```javascript
const User = require('./models/userModel');

const createSuperAdmin = async () => {
  const superAdmin = new User({
    name: "Super Admin",
    email: "superadmin@restropos.com",
    phone: "9999999999",
    password: "admin123",  // Will be hashed automatically
    role: "superadmin"
  });
  await superAdmin.save();
  console.log("Super admin created");
};

createSuperAdmin();
```

### Creating a Restaurant (Tenant)

#### Option 1: Via Frontend (Recommended)
1. Go to `http://localhost:5173/signup`
2. Fill in restaurant and admin details
3. Click "Create Restaurant"
4. Login with the created credentials

#### Option 2: Via API
```bash
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

### Logging In

#### As Super Admin:
1. Go to `http://localhost:5173/auth`
2. Enter super admin credentials
3. You'll be redirected to `/superadmin`

#### As Restaurant Admin/Staff:
1. Go to `http://localhost:5173/auth`
2. Enter your credentials
3. You'll be redirected to `/` (regular dashboard)

## Routes

### Public Routes
- `/auth` - Login page
- `/signup` - Tenant onboarding (restaurant signup)

### Protected Routes (Requires Authentication)
- `/` - Home dashboard
- `/dashboard` - Analytics dashboard
- `/orders` - Orders management
- `/tables` - Table management
- `/menu` - Menu management
- `/users` - User management

### Super Admin Routes (Requires `role: 'superadmin'`)
- `/superadmin` - Super admin dashboard with tenant management

## API Endpoints Used by Frontend

### Authentication
- `POST /api/user/login` - User login (returns tenantId)
- `POST /api/user/logout` - User logout

### Tenant Management (Public)
- `POST /api/tenant` - Create new tenant (onboarding)

### Super Admin (Protected)
- `GET /api/superadmin/dashboard/stats` - System-wide statistics
- `GET /api/superadmin/tenants` - List all tenants (with pagination)
- `GET /api/superadmin/tenants/:id` - Get tenant details
- `PUT /api/superadmin/tenants/:id` - Update tenant (status, plan)
- `DELETE /api/superadmin/tenants/:id` - Deactivate tenant
- `GET /api/superadmin/users` - List all users across tenants

## Components

### New Components Created

#### Super Admin Components (`pos-frontend/src/components/superadmin/`)
1. **StatsOverview.jsx** - Dashboard statistics cards
2. **TenantList.jsx** - Tenant table with actions
3. **TenantModal.jsx** - Tenant details modal

#### New Pages (`pos-frontend/src/pages/`)
1. **SuperAdminDashboard.jsx** - Main super admin page
2. **TenantOnboarding.jsx** - Restaurant signup page

### Updated Components
1. **Login.jsx** - Now extracts tenantId and routes based on role
2. **Auth.jsx** - Added link to signup page
3. **App.jsx** - Added super admin and onboarding routes
4. **userSlice.js** - Redux store now includes tenantId

## Redux State

The user state now includes:
```javascript
{
  _id: string,
  name: string,
  email: string,
  phone: string,
  role: string,
  tenantId: string | null,  // NEW
  isAuth: boolean
}
```

## Styling

The application uses:
- TailwindCSS for styling
- Dark theme (gray-900, gray-800, gray-700 backgrounds)
- Yellow accent color (yellow-400) for primary actions
- Lucide-react for icons

## Testing

### Test Super Admin Dashboard:
1. Create a super admin user
2. Login as super admin
3. Verify you're redirected to `/superadmin`
4. Check system statistics are displayed
5. Create some test tenants
6. Verify tenant list shows correctly
7. Test tenant search and filtering
8. Test tenant status toggle
9. Test viewing tenant details

### Test Tenant Onboarding:
1. Go to `/signup`
2. Fill in all fields
3. Submit form
4. Verify tenant is created in database
5. Verify admin user is created
6. Login with created credentials
7. Verify you're on the regular dashboard (not super admin)

### Test Multi-Tenant Isolation:
1. Create two tenants
2. Login as admin of tenant A
3. Create some menu items
4. Logout and login as admin of tenant B
5. Verify you don't see tenant A's menu items

## Troubleshooting

### "lucide-react not found"
```bash
cd pos-frontend
npm install lucide-react
```

### "Cannot read property 'tenantId' of undefined"
- Ensure backend is returning tenantId in login response
- Check userController.js login function

### "Forbidden: Not authorized"
- For super admin routes, ensure user has `role: 'superadmin'`
- Check browser console for auth errors

### Navigation not working
- Verify React Router is properly configured
- Check browser console for routing errors

## Future Enhancements

Potential improvements to consider:

1. **Tenant Context Provider**: Create a React context for tenant data
2. **Tenant Switcher**: Allow users with multiple tenant access to switch
3. **Tenant Branding**: Custom colors/logos per tenant
4. **Tenant Settings Page**: Allow tenants to configure their settings
5. **Subscription Management**: Integrate with Stripe for payments
6. **Usage Analytics**: Per-tenant usage metrics and limits
7. **Audit Logs**: Track admin actions in super admin dashboard
8. **Bulk Operations**: Bulk activate/deactivate tenants
9. **Export Functionality**: Export tenant data
10. **Email Notifications**: Send notifications to tenant admins

## Security Notes

- Super admin role has full access to all tenants
- Regular admins can only access their own tenant's data
- Tenant IDs are validated on the backend for all operations
- Authentication tokens are stored as HTTP-only cookies
- All super admin routes require authentication + role check

## Support

For issues or questions:
1. Check this guide first
2. Review the backend MULTI_TENANT_GUIDE.md
3. Check browser console for errors
4. Verify backend API is responding correctly
5. Test with curl/Postman to isolate frontend vs backend issues
