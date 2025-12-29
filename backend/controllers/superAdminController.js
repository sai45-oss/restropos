const Tenant = require('../models/tenantModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Menu = require('../models/menuModel');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

/**
 * Super Admin Controller
 * Handles tenant management and cross-tenant analytics
 */

// Get all tenants with statistics
exports.getAllTenants = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        const tenants = await Tenant.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Get statistics for each tenant
        const tenantsWithStats = await Promise.all(
            tenants.map(async (tenant) => {
                const [userCount, orderCount, menuCount] = await Promise.all([
                    User.countDocuments({ tenantId: tenant._id }),
                    Order.countDocuments({ tenantId: tenant._id }),
                    Menu.countDocuments({ tenantId: tenant._id })
                ]);

                return {
                    ...tenant,
                    stats: {
                        users: userCount,
                        orders: orderCount,
                        menuItems: menuCount
                    }
                };
            })
        );

        const total = await Tenant.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tenantsWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single tenant details
exports.getTenantById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, 'Invalid tenant ID'));
        }

        const tenant = await Tenant.findById(id)
            .populate('owner', 'name email phone')
            .lean();

        if (!tenant) {
            return next(createHttpError(404, 'Tenant not found'));
        }

        // Get detailed statistics
        const [userCount, orderCount, menuCount, totalRevenue] = await Promise.all([
            User.countDocuments({ tenantId: tenant._id }),
            Order.countDocuments({ tenantId: tenant._id }),
            Menu.countDocuments({ tenantId: tenant._id }),
            Order.aggregate([
                { $match: { tenantId: new mongoose.Types.ObjectId(id), orderStatus: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$bills.totalWithTax' } } }
            ])
        ]);

        tenant.stats = {
            users: userCount,
            orders: orderCount,
            menuItems: menuCount,
            revenue: totalRevenue[0]?.total || 0
        };

        res.status(200).json({
            success: true,
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

// Update tenant
exports.updateTenant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, plan } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, 'Invalid tenant ID'));
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (plan) updateData.plan = plan;

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('owner', 'name email phone');

        if (!tenant) {
            return next(createHttpError(404, 'Tenant not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Tenant updated successfully',
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

// Delete tenant (soft delete by setting status to inactive)
exports.deleteTenant = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, 'Invalid tenant ID'));
        }

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            { status: 'inactive' },
            { new: true }
        );

        if (!tenant) {
            return next(createHttpError(404, 'Tenant not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Tenant deactivated successfully',
            data: tenant
        });
    } catch (error) {
        next(error);
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            totalOrders,
            recentTenants
        ] = await Promise.all([
            Tenant.countDocuments(),
            Tenant.countDocuments({ status: 'active' }),
            User.countDocuments({ role: { $ne: 'superadmin' } }),
            Order.countDocuments(),
            Tenant.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('owner', 'name email')
                .lean()
        ]);

        // Get revenue by tenant
        const revenueByTenant = await Order.aggregate([
            { $match: { orderStatus: 'Completed' } },
            {
                $group: {
                    _id: '$tenantId',
                    revenue: { $sum: '$bills.totalWithTax' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        // Populate tenant details
        const revenueWithTenants = await Promise.all(
            revenueByTenant.map(async (item) => {
                const tenant = await Tenant.findById(item._id).select('name slug');
                return {
                    tenant,
                    revenue: item.revenue,
                    orderCount: item.orderCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalTenants,
                    activeTenants,
                    inactiveTenants: totalTenants - activeTenants,
                    totalUsers,
                    totalOrders
                },
                recentTenants,
                topRevenue: revenueWithTenants
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all users across tenants
exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, tenantId, role } = req.query;

        const query = { role: { $ne: 'superadmin' } };
        if (tenantId) query.tenantId = tenantId;
        if (role) query.role = role;

        const users = await User.find(query)
            .populate('tenantId', 'name slug')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
