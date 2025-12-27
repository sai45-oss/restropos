# Multi-Tenant SaaS Architecture Guide

## Overview

This RestoPOS application has been converted from a single-tenant system to a **multi-tenant SaaS** architecture. Each restaurant (tenant) now has isolated data, allowing multiple restaurants to use the same application instance while maintaining complete data separation.

## Architecture Changes

### 1. Tenant Model
Every tenant represents a restaurant with:
- **name**: Restaurant name
- **slug**: Unique URL-friendly identifier
- **owner**: Admin user who owns the tenant
- **plan**: Subscription plan (free, basic, premium, etc.)
- **status**: active/inactive
- **stripeCustomerId**: For payment integration (optional)

### 2. Data Isolation
All core resources now include a `tenantId` field:
- **Menu Items**: Menu items are tenant-specific
- **Categories**: Categories are unique per tenant
- **Tables**: Table numbers are unique per tenant
- **Orders**: Orders belong to a specific tenant
- **Payments**: Payments are tracked per tenant
- **Users**: Users belong to a tenant (except super admins)

### 3. Database Indexes
Compound indexes ensure optimal query performance:
```javascript
// Menu: { tenantId: 1, category: 1 }
// Category: { tenantId: 1, name: 1 } - unique
// Table: { tenantId: 1, tableNo: 1 } - unique
// Order: { tenantId: 1, orderStatus: 1 }
```

## API Usage

### Creating a New Tenant (Restaurant Onboarding)

```bash
POST /api/tenant
Content-Type: application/json

{
  "name": "Pizza Palace",
  "slug": "pizza-palace",
  "adminName": "John Doe",
  "adminEmail": "john@pizzapalace.com",
  "adminPhone": "1234567890",
  "adminPassword": "securePassword123",
  "plan": "basic"
}
```

Response:
```json
{
  "tenant": {
    "id": "60d5ec49f1b2c8b1f8c8e4a1",
    "name": "Pizza Palace",
    "slug": "pizza-palace"
  },
  "admin": {
    "id": "60d5ec49f1b2c8b1f8c8e4a2",
    "email": "john@pizzapalace.com"
  }
}
```

### Logging In with Tenant Context

```bash
POST /api/user/login
Content-Type: application/json

{
  "email": "john@pizzapalace.com",
  "password": "securePassword123",
  "tenantSlug": "pizza-palace"
}
```

Or use tenant ID:
```json
{
  "email": "john@pizzapalace.com",
  "password": "securePassword123",
  "tenantId": "60d5ec49f1b2c8b1f8c8e4a1"
}
```

### Accessing Resources

#### For Authenticated Users
After login, all API calls automatically use the user's `tenantId`:
```bash
GET /api/menu
Cookie: accessToken=...
# Returns only menu items for the logged-in user's tenant
```

#### For Public Access (e.g., Customer Menu)
Pass tenant identifier via header or query parameter:
```bash
GET /api/menu?tenantId=pizza-palace
# or
GET /api/menu
X-Tenant-Id: pizza-palace
```

### Creating Resources
All create operations automatically include the tenant context:
```bash
POST /api/menu
Cookie: accessToken=...
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "category": "60d5ec49f1b2c8b1f8c8e4a3",
  "price": 12.99
}
# tenantId is automatically added from the authenticated user
```

## Frontend Integration

### Setting Tenant Context
The frontend should:
1. Store the tenant slug/ID after login
2. Include tenant identifier in public API calls
3. Pass tenant context when navigating between pages

Example:
```javascript
// During login, store tenant info
localStorage.setItem('tenantSlug', 'pizza-palace');

// For public menu access (customer view)
fetch(`/api/menu?tenantId=${tenantSlug}`)

// For authenticated operations, just use the cookie
fetch('/api/menu', {
  credentials: 'include' // Send auth cookie
})
```

## Multi-Tenant Middleware

### Tenant Resolution Strategy
The `tenantMiddleware` resolves tenant context in this order:
1. From authenticated user's `tenantId` (if logged in)
2. From request parameters: `req.params.tenantId`
3. From request headers: `X-Tenant-Id`
4. From query parameters: `req.query.tenantId`

### Route Protection
Routes are protected with:
- `isVerifiedUser`: Requires authentication
- `authorizeRoles`: Requires specific role (admin, waiter, cashier)
- `tenantMiddleware`: Resolves tenant context (can work with or without auth)

## Security Features

### Data Isolation
✅ All queries automatically filter by `tenantId`
✅ Users can only access their tenant's data
✅ Tenant admins cannot see other tenants' data

### User-Tenant Association
✅ Users are validated against tenant during login
✅ Users can only create resources within their tenant
✅ Admin users cannot create other admin users

### Uniqueness Constraints
✅ Table numbers are unique per tenant (not globally)
✅ Category names are unique per tenant (not globally)
✅ Email addresses can exist across tenants

### Recommended Production Security Enhancements
⚠️ **Rate Limiting**: Add rate limiting to API endpoints to prevent abuse
⚠️ **Request Validation**: Add input sanitization and validation middleware
⚠️ **CORS Configuration**: Restrict CORS to specific production domains
⚠️ **HTTPS Only**: Enforce HTTPS in production
⚠️ **Security Headers**: Add helmet.js for security headers

Example rate limiting setup:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Subscription & Billing

### Stripe Integration (Optional)
Set environment variables:
```bash
STRIPE_ENABLED=true
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

When creating a tenant with Stripe enabled:
- A Stripe customer is automatically created
- The customer ID is stored in the tenant record
- Webhook endpoint: `/api/tenant/webhook`

## Environment Variables

Required:
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/pos
```

Optional:
```env
PORT=3000
STRIPE_ENABLED=true
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## Migration from Single-Tenant

If you have existing data, you'll need to:
1. Create a default tenant
2. Update all existing records to include the default tenant's ID
3. Update existing users to associate with the tenant

Example migration script:
```javascript
const Tenant = require('./models/tenantModel');
const Menu = require('./models/menuModel');
// ... import other models

async function migrate() {
  // Create default tenant
  const defaultTenant = await Tenant.create({
    name: "Default Restaurant",
    slug: "default",
    owner: existingAdminUserId,
    plan: "free"
  });

  // Update all existing resources
  await Menu.updateMany({}, { tenantId: defaultTenant._id });
  await Category.updateMany({}, { tenantId: defaultTenant._id });
  await Table.updateMany({}, { tenantId: defaultTenant._id });
  await Order.updateMany({}, { tenantId: defaultTenant._id });
  // ... update other models
}
```

## Best Practices

1. **Always validate tenant context**: Ensure users can only access their tenant's data
2. **Use compound indexes**: Optimize queries with `tenantId` as the first field
3. **Test isolation**: Verify that tenants cannot access each other's data
4. **Monitor performance**: Add indexes as needed for tenant-scoped queries
5. **Handle edge cases**: Some operations (webhooks) may need special handling

## Testing Multi-Tenancy

### Create Test Tenants
```bash
# Tenant 1
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{"name":"Restaurant A","slug":"restaurant-a","adminName":"Admin A","adminEmail":"admin@a.com","adminPhone":"1234567890","adminPassword":"password123"}'

# Tenant 2
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{"name":"Restaurant B","slug":"restaurant-b","adminName":"Admin B","adminEmail":"admin@b.com","adminPhone":"0987654321","adminPassword":"password123"}'
```

### Verify Isolation
1. Login as Tenant A admin
2. Create some menu items
3. Login as Tenant B admin
4. Verify you cannot see Tenant A's menu items

## Troubleshooting

### "Tenant context is required" error
- Ensure you're passing tenant ID in headers/query for public endpoints
- For authenticated endpoints, ensure the user has a `tenantId`

### "User is not associated with a tenant" error
- User record doesn't have a `tenantId` field set
- Re-create the user or update existing user to include tenant reference

### Duplicate key errors
- Compound unique indexes (e.g., table number) are tenant-scoped
- Ensure you're passing the correct tenantId when creating resources

## Future Enhancements

- [ ] Super admin dashboard to manage all tenants
- [ ] Tenant usage analytics and reporting
- [ ] Tenant-specific customization (branding, themes)
- [ ] Automated billing and subscription management
- [ ] Tenant data export/backup functionality
- [ ] Multi-location support per tenant
