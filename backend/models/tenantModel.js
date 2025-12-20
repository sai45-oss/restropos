const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, default: 'free' },
    status: { type: String, default: 'active' },
    stripeCustomerId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
