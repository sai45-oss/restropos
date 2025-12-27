require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config/config');
const Tenant = require('./models/tenantModel');
const User = require('./models/userModel');
const Menu = require('./models/menuModel');
const Category = require('./models/categoryModel');
const Table = require('./models/tableModel');
const Order = require('./models/orderModel');
const Payment = require('./models/paymentModel');

/**
 * Migration script to convert existing single-tenant data to multi-tenant
 * 
 * Usage:
 * 1. Set MONGODB_URI in .env to your existing database
 * 2. Run: node backend/migrate-to-multitenant.js
 * 3. Follow the prompts to create a default tenant and migrate data
 */

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(config.mongodb_uri);
        console.log('✅ Connected to database');

        // Check if any data already has tenantId
        const menuWithTenant = await Menu.findOne({ tenantId: { $exists: true, $ne: null } });
        if (menuWithTenant) {
            console.log('⚠️  Data already appears to be migrated (found records with tenantId)');
            console.log('   If you want to re-migrate, please drop the tenantId fields first');
            process.exit(0);
        }

        // Find existing admin user or create a default one
        let adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
            console.log('⚠️  No admin user found. Creating default admin...');
            adminUser = new User({
                name: 'Default Admin',
                email: 'admin@restaurant.com',
                phone: '1234567890',
                password: 'admin123', // This will be hashed automatically
                role: 'admin'
            });
            await adminUser.save();
            console.log('✅ Default admin created (email: admin@restaurant.com, password: admin123)');
            console.log('   ⚠️  IMPORTANT: Change this password after migration!');
        }

        // Create default tenant
        console.log('\n📦 Creating default tenant...');
        const defaultTenant = new Tenant({
            name: 'Default Restaurant',
            slug: 'default-restaurant',
            owner: adminUser._id,
            plan: 'free',
            status: 'active'
        });
        await defaultTenant.save();
        console.log(`✅ Default tenant created: ${defaultTenant.name} (slug: ${defaultTenant.slug})`);

        // Update admin user with tenantId
        adminUser.tenantId = defaultTenant._id;
        await adminUser.save();

        // Count records to migrate
        const counts = {
            users: await User.countDocuments({ tenantId: { $exists: false } }),
            menus: await Menu.countDocuments({ tenantId: { $exists: false } }),
            categories: await Category.countDocuments({ tenantId: { $exists: false } }),
            tables: await Table.countDocuments({ tenantId: { $exists: false } }),
            orders: await Order.countDocuments({ tenantId: { $exists: false } }),
            payments: await Payment.countDocuments({ tenantId: { $exists: false } })
        };

        console.log('\n📊 Records to migrate:');
        console.log(`   Users: ${counts.users}`);
        console.log(`   Categories: ${counts.categories}`);
        console.log(`   Menu Items: ${counts.menus}`);
        console.log(`   Tables: ${counts.tables}`);
        console.log(`   Orders: ${counts.orders}`);
        console.log(`   Payments: ${counts.payments}`);

        // Migrate data
        console.log('\n🔄 Migrating data...');

        const results = {
            users: await User.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            ),
            menus: await Menu.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            ),
            categories: await Category.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            ),
            tables: await Table.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            ),
            orders: await Order.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            ),
            payments: await Payment.updateMany(
                { tenantId: { $exists: false } },
                { $set: { tenantId: defaultTenant._id } }
            )
        };

        console.log('\n✅ Migration completed successfully!');
        console.log(`   Users: ${results.users.modifiedCount} updated`);
        console.log(`   Categories: ${results.categories.modifiedCount} updated`);
        console.log(`   Menu Items: ${results.menus.modifiedCount} updated`);
        console.log(`   Tables: ${results.tables.modifiedCount} updated`);
        console.log(`   Orders: ${results.orders.modifiedCount} updated`);
        console.log(`   Payments: ${results.payments.modifiedCount} updated`);

        console.log('\n📝 Next steps:');
        console.log('   1. Login with: admin@restaurant.com / admin123');
        console.log('   2. Change the default admin password immediately');
        console.log('   3. Test the application to verify all data is accessible');
        console.log('   4. Create additional tenants using POST /api/tenant');

        console.log('\n🎉 Migration complete!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from database');
        process.exit(0);
    }
}

// Run migration
migrate();
