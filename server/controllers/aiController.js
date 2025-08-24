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
        message: "AI summary generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async generate5W1H(req, res, next) {
    try {
      const postId = +req.params.id;
      const post = await Post.findByPk(postId);

      if (!post) {
        throw { name: "NotFound", message: `Post id ${postId} not found` };
      }

      const analysis = await GeminiService.generate5W1H(
        post.description,
        post.title
      );

      res.json({
        analysis,
        type: "5W1H",
        message: "5W1H analysis generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateComparison(req, res, next) {
    try {
      const postId = +req.params.id;
      const post = await Post.findByPk(postId);

      if (!post) {
        throw { name: "NotFound", message: `Post id ${postId} not found` };
      }

      const comparison = await GeminiService.generateComparison(
        post.description,
        post.title
      );

      res.json({
        comparison,
        type: "market_comparison",
        message: "Market comparison generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate all three analyses at once
  static async generateAllAnalyses(req, res, next) {
    try {
      const postId = +req.params.id;
      const post = await Post.findByPk(postId);

      if (!post) {
        throw { name: "NotFound", message: `Post id ${postId} not found` };
      }

      // Generate all three analyses in parallel
      const [summary, analysis, comparison] = await Promise.all([
        GeminiService.generateSummary(post.description, post.title),
        GeminiService.generate5W1H(post.description, post.title),
        GeminiService.generateComparison(post.description, post.title),
      ]);

      // Update post with summary
      await post.update({ summary });

      res.json({
        summary,
        analysis,
        comparison,
        message: "All AI analyses generated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;
