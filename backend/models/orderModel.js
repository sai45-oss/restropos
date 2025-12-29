const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      guests: { type: Number, required: true },
    },

    orderStatus: {
      type: String,
      required: true,
      default: "In Progress",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    bills: {
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalWithTax: { type: Number, required: true },
    },

    items: {
      type: Array,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentData: {
      type: Object,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for tenant-scoped queries
orderSchema.index({ tenantId: 1, orderStatus: 1 });
orderSchema.index({ tenantId: 1, orderDate: -1 });

module.exports = mongoose.model("Order", orderSchema);
