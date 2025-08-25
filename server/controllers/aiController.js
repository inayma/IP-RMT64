const { Post } = require("../models");
const GeminiService = require("../services/geminiService");

class AIController {
  static async generatePostSummary(req, res, next) {
    try {
      const postId = +req.params.id;
      const post = await Post.findByPk(postId);

      if (!post) {
        throw { name: "NotFound", message: `Post id ${postId} not found` };
      }

      const summary = await GeminiService.generateSummary(
        post.description,
        post.title
      );

      // Update post with generated summary
      await post.update({ summary });

      res.json({
        summary,
        message: "AI tech breakdown generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;
