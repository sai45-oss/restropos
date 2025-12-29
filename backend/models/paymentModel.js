const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: String,
    orderId: String,
    amount: Number,
    currency: String,
    status: String,
    method: String,
    email: String,
    contact: String,
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: false,
        index: true
    },
    createdAt: { type: Date, default: Date.now }
})

// Index for tenant-scoped queries
paymentSchema.index({ tenantId: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;