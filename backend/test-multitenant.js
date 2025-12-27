#!/usr/bin/env node
/**
 * Multi-Tenant Testing Script
 * 
 * This script demonstrates and tests multi-tenant functionality by:
 * 1. Creating two test tenants
 * 2. Creating data for each tenant
 * 3. Verifying data isolation between tenants
 * 
 * Usage: node backend/test-multitenant.js
 * 
 * Requirements:
 * - Backend server running on http://localhost:3000
 * - MongoDB running
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = []) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (cookies.length > 0) {
            options.headers['Cookie'] = cookies.join('; ');
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    resolve({ 
                        status: res.statusCode, 
                        data: parsedBody,
                        cookies: res.headers['set-cookie'] || []
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, cookies: [] });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Multi-Tenant Testing Script\n');
    console.log('📡 Testing server at:', BASE_URL);
    console.log('');

    try {
        // Test 1: Create Tenant A
        console.log('📦 Test 1: Creating Tenant A...');
        const tenantA = await makeRequest('POST', '/api/tenant', {
            name: 'Restaurant A',
            slug: 'restaurant-a',
            adminName: 'Admin A',
            adminEmail: 'admin-a@test.com',
            adminPhone: '1111111111',
            adminPassword: 'password123',
            plan: 'free'
        });

        if (tenantA.status !== 201) {
            console.log('❌ Failed to create Tenant A:', tenantA.data);
            if (tenantA.data?.message?.includes('duplicate')) {
                console.log('   (Tenant may already exist from previous test)');
            } else {
                return;
            }
        } else {
            console.log('✅ Tenant A created:', tenantA.data.tenant.name);
        }

        // Test 2: Create Tenant B
        console.log('\n📦 Test 2: Creating Tenant B...');
        const tenantB = await makeRequest('POST', '/api/tenant', {
            name: 'Restaurant B',
            slug: 'restaurant-b',
            adminName: 'Admin B',
            adminEmail: 'admin-b@test.com',
            adminPhone: '2222222222',
            adminPassword: 'password123',
            plan: 'free'
        });

        if (tenantB.status !== 201) {
            console.log('❌ Failed to create Tenant B:', tenantB.data);
            if (tenantB.data?.message?.includes('duplicate')) {
                console.log('   (Tenant may already exist from previous test)');
            } else {
                return;
            }
        } else {
            console.log('✅ Tenant B created:', tenantB.data.tenant.name);
        }

        // Test 3: Login as Tenant A admin
        console.log('\n🔐 Test 3: Logging in as Tenant A admin...');
        const loginA = await makeRequest('POST', '/api/user/login', {
            email: 'admin-a@test.com',
            password: 'password123',
            tenantSlug: 'restaurant-a'
        });

        if (loginA.status !== 200) {
            console.log('❌ Failed to login as Tenant A:', loginA.data);
            return;
        }
        console.log('✅ Logged in as Tenant A admin');
        const cookiesA = loginA.cookies;

        // Test 4: Login as Tenant B admin
        console.log('\n🔐 Test 4: Logging in as Tenant B admin...');
        const loginB = await makeRequest('POST', '/api/user/login', {
            email: 'admin-b@test.com',
            password: 'password123',
            tenantSlug: 'restaurant-b'
        });

        if (loginB.status !== 200) {
            console.log('❌ Failed to login as Tenant B:', loginB.data);
            return;
        }
        console.log('✅ Logged in as Tenant B admin');
        const cookiesB = loginB.cookies;

        // Test 5: Create category for Tenant A
        console.log('\n📁 Test 5: Creating category for Tenant A...');
        const categoryA = await makeRequest('POST', '/api/category', {
            name: 'Pizza A',
            description: 'Pizza items for Restaurant A'
        }, cookiesA);

        if (categoryA.status !== 201) {
            console.log('❌ Failed to create category for Tenant A:', categoryA.data);
            return;
        }
        console.log('✅ Category created for Tenant A:', categoryA.data.data.name);
        const categoryAId = categoryA.data.data._id;

        // Test 6: Create category for Tenant B
        console.log('\n📁 Test 6: Creating category for Tenant B...');
        const categoryB = await makeRequest('POST', '/api/category', {
            name: 'Pizza B',
            description: 'Pizza items for Restaurant B'
        }, cookiesB);

        if (categoryB.status !== 201) {
            console.log('❌ Failed to create category for Tenant B:', categoryB.data);
            return;
        }
        console.log('✅ Category created for Tenant B:', categoryB.data.data.name);

        // Test 7: Get categories for Tenant A (should only see Tenant A's categories)
        console.log('\n📋 Test 7: Getting categories for Tenant A...');
        const categoriesA = await makeRequest('GET', '/api/category', null, cookiesA);

        if (categoriesA.status !== 200) {
            console.log('❌ Failed to get categories for Tenant A:', categoriesA.data);
            return;
        }
        console.log(`✅ Tenant A sees ${categoriesA.data.data.length} category(ies)`);
        console.log('   Categories:', categoriesA.data.data.map(c => c.name).join(', '));

        // Test 8: Get categories for Tenant B (should only see Tenant B's categories)
        console.log('\n📋 Test 8: Getting categories for Tenant B...');
        const categoriesB = await makeRequest('GET', '/api/category', null, cookiesB);

        if (categoriesB.status !== 200) {
            console.log('❌ Failed to get categories for Tenant B:', categoriesB.data);
            return;
        }
        console.log(`✅ Tenant B sees ${categoriesB.data.data.length} category(ies)`);
        console.log('   Categories:', categoriesB.data.data.map(c => c.name).join(', '));

        // Test 9: Verify data isolation
        console.log('\n🔒 Test 9: Verifying data isolation...');
        const hasIsolation = !categoriesA.data.data.some(c => c.name === 'Pizza B') &&
                             !categoriesB.data.data.some(c => c.name === 'Pizza A');
        
        if (hasIsolation) {
            console.log('✅ Data isolation working correctly!');
            console.log('   Tenant A cannot see Tenant B\'s data');
            console.log('   Tenant B cannot see Tenant A\'s data');
        } else {
            console.log('❌ Data isolation FAILED - tenants can see each other\'s data!');
            return;
        }

        // Test 10: Create menu item for Tenant A
        console.log('\n🍕 Test 10: Creating menu item for Tenant A...');
        const menuA = await makeRequest('POST', '/api/menu', {
            name: 'Margherita Pizza',
            category: categoryAId,
            price: 12.99,
            description: 'Classic pizza with tomato and mozzarella'
        }, cookiesA);

        if (menuA.status !== 201) {
            console.log('❌ Failed to create menu item for Tenant A:', menuA.data);
            return;
        }
        console.log('✅ Menu item created for Tenant A:', menuA.data.data.name);

        // Test 11: Get menu items for Tenant A
        console.log('\n📋 Test 11: Getting menu items for Tenant A...');
        const menuItemsA = await makeRequest('GET', '/api/menu', null, cookiesA);

        if (menuItemsA.status !== 200) {
            console.log('❌ Failed to get menu items for Tenant A:', menuItemsA.data);
            return;
        }
        console.log(`✅ Tenant A has ${menuItemsA.data.data.length} menu item(s)`);

        // Test 12: Get menu items for Tenant B (should be empty)
        console.log('\n📋 Test 12: Getting menu items for Tenant B...');
        const menuItemsB = await makeRequest('GET', '/api/menu', null, cookiesB);

        if (menuItemsB.status !== 200) {
            console.log('❌ Failed to get menu items for Tenant B:', menuItemsB.data);
            return;
        }
        console.log(`✅ Tenant B has ${menuItemsB.data.data.length} menu item(s)`);

        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests passed successfully!');
        console.log('='.repeat(60));
        console.log('✅ Tenant creation working');
        console.log('✅ User authentication working');
        console.log('✅ Data isolation working');
        console.log('✅ Multi-tenant queries working');
        console.log('\n📊 Summary:');
        console.log(`   - Tenant A: ${categoriesA.data.data.length} categories, ${menuItemsA.data.data.length} menu items`);
        console.log(`   - Tenant B: ${categoriesB.data.data.length} categories, ${menuItemsB.data.data.length} menu items`);
        console.log('\n✨ Multi-tenant system is working correctly!');

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error('\n💡 Make sure the backend server is running on http://localhost:3000');
        process.exit(1);
    }
}

// Run the tests
console.log('⏳ Starting tests in 2 seconds...\n');
setTimeout(runTests, 2000);
