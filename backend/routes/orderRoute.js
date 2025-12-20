const express = require("express");
const { getOrders, addOrder, updateOrder, getOrderById } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middleWares/tokenVerification");
const router = express.Router();


const { authorizeRoles } = require("../middleWares/authMiddleware");

router
  .route("/")
  .post(isVerifiedUser, authorizeRoles("admin", "waiter"), addOrder);
router
  .route("/")
  .get(
    isVerifiedUser,
    authorizeRoles("admin", "waiter", "cashier"),
    getOrders
  );
router
  .route("/:id")
  .get(
    isVerifiedUser,
    authorizeRoles("admin", "waiter", "cashier"),
    getOrderById
  );
router
  .route("/:id")
  .put(
    isVerifiedUser,
    authorizeRoles("admin", "waiter", "cashier"),
    updateOrder
  );

module.exports = router;