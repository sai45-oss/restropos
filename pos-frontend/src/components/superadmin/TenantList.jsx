import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateTenant, deleteTenant } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  Menu as MenuIcon,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import TenantModal from "./TenantModal";

const TenantList = ({ data, pagination, isLoading, onPageChange, currentPage, refetch }) => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ tenantId, ...data }) => updateTenant({ tenantId, ...data }),
    onSuccess: () => {
      enqueueSnackbar("Tenant updated successfully", { variant: "success" });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to update tenant", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTenant(id),
    onSuccess: () => {
      enqueueSnackbar("Tenant deactivated successfully", { variant: "success" });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to deactivate tenant", {
        variant: "error",
      });
    },
  });

  const handleViewDetails = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const handleStatusToggle = (tenant) => {
    const newStatus = tenant.status === "active" ? "inactive" : "active";
    updateMutation.mutate({
      tenantId: tenant._id,
      status: newStatus,
    });
  };

  const handleDelete = (tenantId) => {
    if (window.confirm("Are you sure you want to deactivate this tenant?")) {
      deleteMutation.mutate(tenantId);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Tenants Found</h3>
        <p className="text-gray-500">No tenants match your search criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Restaurant
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Stats
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.data.map((tenant) => (
                <tr
                  key={tenant._id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-white">{tenant.name}</div>
                      <div className="text-sm text-gray-400">@{tenant.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white">{tenant.owner?.name}</div>
                      <div className="text-sm text-gray-400">{tenant.owner?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-blue-400">
                        <Users className="w-4 h-4" />
                        <span>{tenant.stats?.users || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <ShoppingBag className="w-4 h-4" />
                        <span>{tenant.stats?.orders || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <MenuIcon className="w-4 h-4" />
                        <span>{tenant.stats?.menuItems || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(tenant)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        tenant.status === "active"
                          ? "bg-green-400/10 text-green-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {tenant.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(tenant)}
                        className="p-2 rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant._id)}
                        className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} tenants
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tenant Details Modal */}
      {showModal && selectedTenant && (
        <TenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </>
  );
};

export default TenantList;
