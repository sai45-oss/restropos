const express = require("express");
const router = express.Router();
const { isVerifiedUser } = require("../middleWares/tokenVerification");
const { createOrder, verifyPayment, webHookVerification } = require("../controllers/paymentController");
 
const { authorizeRoles } = require("../middleWares/authMiddleware");

router
  .route("/create-order")
  .post(isVerifiedUser, authorizeRoles("admin", "cashier"), createOrder);
router
  .route("/verify-payment")
  .post(isVerifiedUser, authorizeRoles("admin", "cashier"), verifyPayment);
router.route("/webhook-verification").post(webHookVerification);


module.exports = router;