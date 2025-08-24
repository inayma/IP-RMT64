const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

// Public routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/google-auth", UserController.googleAuth);

module.exports = router;
