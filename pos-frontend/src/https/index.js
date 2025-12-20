import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user/me");
export const getUsers = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) =>
  axiosWrapper.delete(`/api/table/${tableId}`);

// Menu Endpoints
export const getMenuItems = (filters) =>
  axiosWrapper.get("/api/menu", { params: filters });
export const getMenuByCategory = () =>
  axiosWrapper.get("/api/menu/category/all");
export const getMenuItemById = (id) =>
  axiosWrapper.get(`/api/menu/${id}`);
export const addMenuItem = (data) =>
  axiosWrapper.post("/api/menu", data);
export const updateMenuItem = ({ menuId, ...data }) =>
  axiosWrapper.put(`/api/menu/${menuId}`, data);
export const deleteMenuItem = (id) =>
  axiosWrapper.delete(`/api/menu/${id}`);

// Category Endpoints
export const getCategories = () => axiosWrapper.get("/api/category");
export const createCategory = (data) =>
  axiosWrapper.post("/api/category", data);
export const updateCategory = ({ categoryId, ...data }) =>
  axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (id) =>
  axiosWrapper.delete(`/api/category/${id}`);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment//verify-payment", data);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
