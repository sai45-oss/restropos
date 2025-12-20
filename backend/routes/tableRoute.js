const express = require("express");
const { addTable, getTables, updateTable, deleteTable } = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middleWares/tokenVerification")
 
const { authorizeRoles } = require("../middleWares/authMiddleware");

router
  .route("/")
  .post(isVerifiedUser, authorizeRoles("admin"), addTable);
router
  .route("/")
  .get(isVerifiedUser, authorizeRoles("admin", "waiter"), getTables);
router
  .route("/:id")
  .put(isVerifiedUser, authorizeRoles("admin", "waiter"), updateTable);
router
  .route("/:id")
  .delete(isVerifiedUser, authorizeRoles("admin"), deleteTable);

module.exports = router;