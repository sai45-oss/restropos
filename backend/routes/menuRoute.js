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

const router = express.Router();

const { authorizeRoles } = require("../middleWares/authMiddleware");

// Get menu items (with optional filters)
router.route("/").get(getMenuItems);

// Get menu items by category
router.route("/category/all").get(getMenuByCategory);

// Add menu item
router
  .route("/")
  .post(isVerifiedUser, authorizeRoles("admin"), addMenuItem);

// Get menu item by ID
router.route("/:id").get(getMenuItemById);

// Update menu item
router
  .route("/:id")
  .put(isVerifiedUser, authorizeRoles("admin"), updateMenuItem);

// Delete menu item
router
  .route("/:id")
  .delete(isVerifiedUser, authorizeRoles("admin"), deleteMenuItem);

module.exports = router;
