const Tenant = require('../models/tenantModel');
const mongoose = require('mongoose');

module.exports = async function tenantResolver(req, res, next) {
    try {
        const tid = req.params.tenantId || req.headers['x-tenant-id'] || req.query.tenantId;
        if (!tid) {
            return res.status(400).json({ message: 'Tenant identifier missing in path/header/query' });
        }

        let tenant = null;
        if (mongoose.Types.ObjectId.isValid(tid)) {
            tenant = await Tenant.findById(tid).lean();
        }
        if (!tenant) {
            tenant = await Tenant.findOne({ slug: tid }).lean();
        }

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        req.tenant = tenant;
        req.tenantId = tenant._id;
        next();
    } catch (err) {
        next(err);
    }
};
