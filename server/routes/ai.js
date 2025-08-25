const express = require("express");
const AIController = require("../controllers/aiController");
const authentication = require("../middlewares/authentication");

const router = express.Router();

// AI analysis route - generates natural Gen Z-style tech breakdowns
router.post(
  "/posts/:id/summary",
  authentication,
  AIController.generatePostSummary
);

module.exports = router;
