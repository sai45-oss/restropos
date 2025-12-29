# Troubleshooting Guide - Multi-Tenant RestoPOS

## Common Issues and Solutions

### 1. "User is not associated with a tenant" Error (400 Bad Request)

**Symptoms:**
- GET `/api/table` returns 400 Bad Request
- GET `/api/order` returns 400 Bad Request
- Error message: "User is not associated with a tenant"

**Causes:**
1. You're logged in as a **super admin** trying to access tenant-specific resources
2. You're using an old user account created before multi-tenant conversion
3. No restaurant tenant has been created yet

**Solutions:**

#### Solution 1: If You're Using Super Admin Account
Super admins **cannot** access regular POS features like tables and orders. They can only:
- View the super admin dashboard at `/superadmin`
- Manage tenants (restaurants)
- View system-wide statistics

**What to do:**
1. Logout from super admin account
2. Create a restaurant tenant via `/signup` or use the API
3. Login with the restaurant admin credentials

#### Solution 2: Create a Restaurant Tenant

**Option A: Via Frontend (Recommended)**
```
1. Navigate to http://localhost:5173/signup
2. Fill in restaurant details:
   - Restaurant Name: "My Restaurant"
   - Slug: auto-generated (e.g., "my-restaurant")
   - Admin Name: "John Doe"
   - Admin Email: "john@myrestaurant.com"
   - Admin Phone: "1234567890"
   - Password: "securepassword"
   - Plan: free/basic/premium
3. Click "Create Restaurant"
4. Login with the credentials you just created
```

**Option B: Via API**
```bash
curl -X POST http://localhost:3000/api/tenant \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "adminName": "John Doe",
    "adminEmail": "john@myrestaurant.com",
    "adminPhone": "1234567890",
    "adminPassword": "securepass123",
    "plan": "free"
  }'
```

Then login at `/auth` with:
- Email: `john@myrestaurant.com`
- Password: `securepass123`

#### Solution 3: Migrate Existing Data

If you have existing users/data from before the multi-tenant conversion:

```bash
cd backend
node migrate-to-multitenant.js
```

This will:
1. Create a default tenant
2. Assign all existing users to that tenant
3. Associate all data with the default tenant

Then login with your existing credentials.

### 2. Super Admin Cannot Login

**Symptoms:**
- "Invalid credentials" error when trying to login as super admin

**Solution:**
Run the helper script to create a super admin:

```bash
cd backend
node create-superadmin.js
```

Then login with:
- Email: `superadmin@restropos.com`
- Password: `admin123`

**Important:** Do NOT provide `tenantId` or `tenantSlug` when logging in as super admin.

### 3. Cannot See Tables/Orders After Login

**Symptoms:**
- Successfully logged in
- Dashboard loads but shows no data
- API calls return 400 errors

**Diagnosis:**
Check if you're logged in with the correct account type:

1. **Super Admin**: Should be at `/superadmin`, NOT the regular dashboard
2. **Restaurant User**: Should be at `/` or `/dashboard`

**Solution:**
1. Check your user role in Redux DevTools or browser console:
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('persist:root'))
   ```

2. If role is `superadmin`:
   - You need to create a restaurant tenant first
   - Then login with restaurant credentials

3. If role is `admin`/`waiter`/`cashier` but still getting errors:
   - Check if user has `tenantId` in database
   - May need to recreate the user account

### 4. "Tenant not found" During Login

**Symptoms:**
- Providing `tenantSlug` or `tenantId` during login
- Getting 404 "Tenant not found" error

**Solution:**
1. Verify the tenant exists:
   ```bash
   # In MongoDB
   use pos
   db.tenants.find({slug: "your-slug"})
   ```

2. Create the tenant if missing (see Solution 2 above)

3. Use the correct slug (check for typos)

### 5. Old Tokens Causing Issues

**Symptoms:**
- Recently updated the code
- Getting unexpected errors
- User data seems outdated

**Solution:**
Clear browser cookies and localStorage:

```javascript
// In browser console
localStorage.clear();
// Then reload and login again
```

Or manually delete the `accessToken` cookie in DevTools.

### 6. Database Has Old Data Without tenantId

**Symptoms:**
- Migrated from old version
- Some data works, some doesn't
- Inconsistent behavior

**Solution:**
Run the migration script:

```bash
cd backend
node migrate-to-multitenant.js
```

Or manually update in MongoDB:

```javascript
// In MongoDB shell
use pos

// Check for users without tenantId
db.users.find({tenantId: {$exists: false}, role: {$ne: "superadmin"}})

// Get default tenant ID
var defaultTenant = db.tenants.findOne({slug: "default-restaurant"})

// Update users
db.users.updateMany(
  {tenantId: {$exists: false}, role: {$ne: "superadmin"}},
  {$set: {tenantId: defaultTenant._id}}
)

// Do the same for other collections
db.menus.updateMany({tenantId: {$exists: false}}, {$set: {tenantId: defaultTenant._id}})
db.tables.updateMany({tenantId: {$exists: false}}, {$set: {tenantId: defaultTenant._id}})
db.orders.updateMany({tenantId: {$exists: false}}, {$set: {tenantId: defaultTenant._id}})
db.categories.updateMany({tenantId: {$exists: false}}, {$set: {tenantId: defaultTenant._id}})
```

## Quick Start Checklist

For a fresh installation:

- [ ] Backend installed: `cd backend && npm install`
- [ ] Frontend installed: `cd pos-frontend && npm install`
- [ ] MongoDB running
- [ ] Created super admin: `node backend/create-superadmin.js`
- [ ] Created restaurant tenant via `/signup` or API
- [ ] Logged in with restaurant admin credentials
- [ ] Can access tables, orders, menu, etc.

## Architecture Quick Reference

```
Super Admin (role: superadmin)
├── NO tenantId
├── Access: /superadmin dashboard only
├── Can: Manage all tenants, view system stats
└── Cannot: Access regular POS features (tables, orders, menu)

Restaurant Admin (role: admin)
├── HAS tenantId
├── Access: /, /dashboard, /tables, /orders, /menu, /users
├── Can: Full access to their restaurant's data
└── Cannot: See other restaurants' data or super admin features

Restaurant Staff (role: waiter/cashier)
├── HAS tenantId
├── Access: /, /dashboard, /tables, /orders, /menu
├── Can: Limited access based on role
└── Cannot: Manage users or see other restaurants' data
```

## Still Having Issues?

1. **Check backend logs** for detailed error messages
2. **Check browser console** for frontend errors
3. **Verify MongoDB connection** and data
4. **Clear cookies and localStorage**
5. **Try creating a fresh tenant and user**

## Debug Commands

```bash
# Check MongoDB connection
cd backend
node -e "require('./config/database')().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"

# List all tenants
mongo pos --eval "db.tenants.find().pretty()"

# List all users
mongo pos --eval "db.users.find({}, {name:1, email:1, role:1, tenantId:1}).pretty()"

# Check if user has tenantId
mongo pos --eval "db.users.findOne({email: 'your@email.com'})"
```

## Getting Help

If you're still stuck:
1. Check the documentation: `MULTI_TENANT_GUIDE.md`, `FRONTEND_MULTITENANT_GUIDE.md`
2. Review the architecture: `ARCHITECTURE.md`
3. Check the conversion summary: `CONVERSION_SUMMARY.md`
