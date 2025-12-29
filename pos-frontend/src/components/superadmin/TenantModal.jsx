import React from "react";
import { X, Building2, Users, ShoppingBag, Menu as MenuIcon, DollarSign } from "lucide-react";

const TenantModal = ({ tenant, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{tenant.name}</h2>
            <p className="text-gray-400 text-sm">@{tenant.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Owner Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Owner Information</h3>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-medium">{tenant.owner?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{tenant.owner?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="text-white font-medium">{tenant.owner?.phone}</span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Subscription</h3>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400">
                  {tenant.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tenant.status === "active"
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                }`}>
                  {tenant.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-white font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-400/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-gray-400 text-sm">Users</span>
                </div>
                <p className="text-2xl font-bold text-white">{tenant.stats?.users || 0}</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-400/10">
                    <ShoppingBag className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-400 text-sm">Orders</span>
                </div>
                <p className="text-2xl font-bold text-white">{tenant.stats?.orders || 0}</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-400/10">
                    <MenuIcon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-gray-400 text-sm">Menu Items</span>
                </div>
                <p className="text-2xl font-bold text-white">{tenant.stats?.menuItems || 0}</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-400/10">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-gray-400 text-sm">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${tenant.stats?.revenue?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Customer */}
          {tenant.stripeCustomerId && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Billing</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stripe Customer ID:</span>
                  <span className="text-white font-mono text-sm">{tenant.stripeCustomerId}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantModal;
