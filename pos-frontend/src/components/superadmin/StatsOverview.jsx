import React from "react";
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  TrendingUp 
} from "lucide-react";

const StatsOverview = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Tenants",
      value: data?.overview?.totalTenants || 0,
      icon: Building2,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Active Tenants",
      value: data?.overview?.activeTenants || 0,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Total Users",
      value: data?.overview?.totalUsers || 0,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Total Orders",
      value: data?.overview?.totalOrders || 0,
      icon: ShoppingBag,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
