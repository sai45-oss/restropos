const express = require("express");
const { register, login, getUserData, logout, getAllUsers } = require("../controllers/userController");
const { isVerifiedUser } = require("../middleWares/tokenVerification");

const router = express.Router();

const { authorizeRoles } = require("../middleWares/authMiddleware");

// authentication
router.route("/register").post(isVerifiedUser, authorizeRoles("admin"), register);
router.route("/login").post(login);
router.route("/logout").post(isVerifiedUser, logout);
router.route("/me").get(isVerifiedUser ,getUserData);
router.route("/").get(isVerifiedUser, authorizeRoles("admin"), getAllUsers);

module.exports=router;
