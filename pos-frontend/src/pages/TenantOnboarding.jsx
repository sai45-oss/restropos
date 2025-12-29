import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTenant } from "../https/index";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { Building2, User, Mail, Phone, Lock, Tag } from "lucide-react";
import logo from "../assets/images/logo.png";

const TenantOnboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    plan: "free",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-generate slug from restaurant name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const createTenantMutation = useMutation({
    mutationFn: (data) => createTenant(data),
    onSuccess: (res) => {
      enqueueSnackbar(
        "Restaurant created successfully! Please login with your credentials.",
        { variant: "success" }
      );
      navigate("/auth");
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to create restaurant",
        { variant: "error" }
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTenantMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="RestoPOS Logo"
              className="h-16 w-16 border-2 rounded-full p-1"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Start Your Restaurant POS
          </h1>
          <p className="text-gray-400">
            Create your account and start managing your restaurant efficiently
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-yellow-400" />
                Restaurant Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Pizza Palace"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    Slug (URL identifier) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">restropos.com/</span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="pizza-palace"
                      pattern="[a-z0-9-]+"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                Admin Account
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="john@pizzapalace.com"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">10-digit number</p>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-medium">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password *
                  </label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength="8"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-yellow-400" />
                Choose Your Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["free", "basic", "premium"].map((plan) => (
                  <label
                    key={plan}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.plan === plan
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan}
                      checked={formData.plan === plan}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-lg font-semibold text-white capitalize mb-1">
                      {plan}
                    </span>
                    <span className="text-sm text-gray-400">
                      {plan === "free" && "Perfect to get started"}
                      {plan === "basic" && "For growing restaurants"}
                      {plan === "premium" && "Full-featured solution"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createTenantMutation.isLoading}
              className="w-full py-4 bg-yellow-400 text-gray-900 font-bold text-lg rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTenantMutation.isLoading
                ? "Creating Restaurant..."
                : "Create Restaurant"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-yellow-400 hover:text-yellow-300 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOnboarding;
