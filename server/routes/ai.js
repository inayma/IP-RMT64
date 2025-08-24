const express = require("express");
const AIController = require("../controllers/aiController");
const authentication = require("../middlewares/authentication");

const router = express.Router();

// AI analysis routes
router.post(
  "/posts/:id/summary",
  authentication,
  AIController.generatePostSummary
);
router.post("/posts/:id/5w1h", authentication, AIController.generate5W1H);
router.post(
  "/posts/:id/comparison",
  authentication,
  AIController.generateComparison
);
router.post(
  "/posts/:id/analyze-all",
  authentication,
  AIController.generateAllAnalyses
);

module.exports = router;
