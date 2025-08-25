const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const authentication = require("../middlewares/authentication");
const postAuthorization = require("../middlewares/postAuthorization");

// Public
router.get("/", PostController.getAll);
router.get("/categories", PostController.getAvailableCategories);
router.get("/category/:categoryName", PostController.getPostsByCategory);
router.get("/:id", PostController.getById);

// Protected (requires login)
router.use(authentication);
router.post("/", PostController.create);
router.post("/:id/vote", PostController.vote);
router.put("/:id", postAuthorization, PostController.update);
router.delete("/:id", postAuthorization, PostController.delete);

module.exports = router;
