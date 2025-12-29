const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { isVerifiedUser } = require('../middleWares/tokenVerification');
const { authorizeRoles } = require('../middleWares/authMiddleware');

// All routes require superadmin role
router.use(isVerifiedUser);
router.use(authorizeRoles('superadmin'));

// Dashboard stats
router.get('/dashboard/stats', superAdminController.getDashboardStats);

// Tenant management
router.get('/tenants', superAdminController.getAllTenants);
router.get('/tenants/:id', superAdminController.getTenantById);
router.put('/tenants/:id', superAdminController.updateTenant);
router.delete('/tenants/:id', superAdminController.deleteTenant);

// User management across tenants
router.get('/users', superAdminController.getAllUsers);

module.exports = router;
