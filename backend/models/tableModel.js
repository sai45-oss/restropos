const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    tableNo: { type: Number, required: true },
    status: {
        type: String,
        default: "Available"
    },
    seats: { 
        type: Number,
        required: true
    },
    currentOrder: {type: mongoose.Schema.Types.ObjectId, ref: "Order"},
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true,
        index: true
    }
});

// Compound unique index for tenant-scoped uniqueness
tableSchema.index({ tenantId: 1, tableNo: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);