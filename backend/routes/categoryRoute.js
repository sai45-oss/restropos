const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { isVerifiedUser } = require("../middleWares/tokenVerification");
const { authorizeRoles } = require("../middleWares/authMiddleware");

router.route("/").get(isVerifiedUser, getAllCategories);
router
  .route("/")
  .post(isVerifiedUser, authorizeRoles("admin"), createCategory);
router
  .route("/:id")
  .put(isVerifiedUser, authorizeRoles("admin"), updateCategory);
router
  .route("/:id")
  .delete(isVerifiedUser, authorizeRoles("admin"), deleteCategory);

module.exports = router;
