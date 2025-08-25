const express = require("express");
const router = express.Router();
const newsApiService = require("../services/newsApiService");

// Get tech headlines with optional category filter
router.get("/headlines", async (req, res, next) => {
  console.log("🌐 NEWS ROUTE: /headlines called with query:", req.query);
  try {
    const {
      category = null,
      count = 20,
      page = 1,
      sortBy = "date",
      lang = "eng",
    } = req.query;

    const options = {
      category,
      count: parseInt(count),
      page: parseInt(page),
      sortBy,
      lang,
    };

    const result = await newsApiService.getTechHeadlines(options);
    res.json(result);
  } catch (error) {
    console.error("Error fetching headlines:", error);
    next(error);
  }
});

// Get articles by specific category
router.get("/category/:categoryName", async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { count = 15, page = 1, sortBy = "date", lang = "eng" } = req.query;

    const options = {
      count: parseInt(count),
      page: parseInt(page),
      sortBy,
      lang,
    };

    const result = await newsApiService.getArticlesByCategory(
      categoryName,
      options
    );
    res.json(result);
  } catch (error) {
    console.error(
      `Error fetching articles for category ${req.params.categoryName}:`,
      error
    );
    next(error);
  }
});

// Search articles with custom keywords
router.get("/search", async (req, res, next) => {
  try {
    const {
      q,
      count = 20,
      page = 1,
      sortBy = "date",
      lang = "eng",
    } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Search query (q) parameter is required",
      });
    }

    // Split keywords by comma if multiple provided
    const keywords = q
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const options = {
      count: parseInt(count),
      page: parseInt(page),
      sortBy,
      lang,
    };

    const result = await newsApiService.searchArticles(keywords, options);
    res.json(result);
  } catch (error) {
    console.error("Error searching articles:", error);
    next(error);
  }
});

// Get available categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = newsApiService.getAvailableCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
});

module.exports = router;
