const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
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

// Compound unique index for tenant-scoped uniqueness
categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
