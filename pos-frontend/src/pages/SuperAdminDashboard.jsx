import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuperAdminStats, getAllTenants } from "../https/index";
import { enqueueSnackbar } from "notistack";
import TenantList from "../components/superadmin/TenantList";
import StatsOverview from "../components/superadmin/StatsOverview";

const SuperAdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Super Admin Dashboard";
  }, []);

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: getSuperAdminStats,
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to load stats", {
        variant: "error",
      });
    },
  });

  // Fetch tenants
  const { data: tenantsData, isLoading: tenantsLoading, refetch } = useQuery({
    queryKey: ["tenants", page, searchTerm, statusFilter],
    queryFn: () =>
      getAllTenants({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      }),
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to load tenants", {
        variant: "error",
      });
    },
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage all tenants and monitor system-wide metrics
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <StatsOverview
          data={statsData?.data}
          isLoading={statsLoading}
        />

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search tenants by name or slug..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "inactive"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Tenant List */}
        <TenantList
          data={tenantsData?.data}
          pagination={tenantsData?.data?.pagination}
          isLoading={tenantsLoading}
          onPageChange={setPage}
          currentPage={page}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
