require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const config = require('./config/config');

/**
 * Script to create a super admin user
 * Usage: node backend/create-superadmin.js
 */

async function createSuperAdmin() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(config.mongodb_uri);
        console.log('✅ Connected to database');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        if (existingSuperAdmin) {
            console.log('⚠️  Super admin already exists:');
            console.log('   Email:', existingSuperAdmin.email);
            console.log('   Name:', existingSuperAdmin.name);
            console.log('\n💡 If you forgot the password, you can:');
            console.log('   1. Delete this user from MongoDB');
            console.log('   2. Run this script again');
            process.exit(0);
        }

        // Create super admin user
        console.log('\n📦 Creating super admin user...');
        const superAdmin = new User({
            name: "Super Admin",
            email: "superadmin@restropos.com",
            phone: "9999999999",
            password: "admin123",  // Will be auto-hashed by the User model
            role: "superadmin"
            // Note: No tenantId for super admin
        });

        await superAdmin.save();

        console.log('\n✅ Super admin created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: superadmin@restropos.com');
        console.log('   Password: admin123');
        console.log('\n🌐 Access the dashboard:');
        console.log('   1. Go to http://localhost:5173/auth');
        console.log('   2. Login with the credentials above');
        console.log('   3. You will be redirected to /superadmin');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('\n❌ Error creating super admin:', error.message);
        if (error.code === 11000) {
            console.log('   A user with this email already exists.');
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from database');
        process.exit(0);
    }
}

// Run the script
createSuperAdmin();
