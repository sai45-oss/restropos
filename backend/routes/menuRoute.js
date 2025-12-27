const express = require("express");
const {
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCategory,
} = require("../controllers/menuController");
const { isVerifiedUser } = require("../middleWares/tokenVerification");
const tenantMiddleware = require("../middleWares/tenantMiddleware");

const router = express.Router();

const { authorizeRoles } = require("../middleWares/authMiddleware");

// Get menu items (with optional filters) - can use tenant middleware for public access
router.route("/").get(tenantMiddleware, getMenuItems);

// Get menu items by category - can use tenant middleware for public access
router.route("/category/all").get(tenantMiddleware, getMenuByCategory);

// Add menu item
router
  .route("/")
  .post(isVerifiedUser, authorizeRoles("admin"), addMenuItem);

// Get menu item by ID - can use tenant middleware for public access
router.route("/:id").get(tenantMiddleware, getMenuItemById);

// Update menu item
router
  .route("/:id")
  .put(isVerifiedUser, authorizeRoles("admin"), updateMenuItem);

// Delete menu item
router
  .route("/:id")
  .delete(isVerifiedUser, authorizeRoles("admin"), deleteMenuItem);

module.exports = router;
