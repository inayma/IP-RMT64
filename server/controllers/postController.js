const { Post, User } = require("../models");

class PostController {
  static async getAll(req, res, next) {
    try {
      const posts = await Post.findAll({
        include: { model: User, attributes: ["id", "username", "email"] },
      });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const id = +req.params.id;
      const post = await Post.findByPk(id, {
        include: { model: User, attributes: ["id", "username", "email"] },
      });

      if (!post) throw { name: "NotFound", message: `Post id ${id} not found` };

      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { title, description } = req.body;
      const post = await Post.create({
        title,
        description,
        votes: 0,
        userId: req.user.id,
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  static async vote(req, res, next) {
    try {
      const id = +req.params.id;
      const post = await Post.findByPk(id);
      if (!post) throw { name: "NotFound", message: `Post id ${id} not found` };

      post.votes++;
      await post.save();

      res.json({ message: "Vote counted", votes: post.votes });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const id = +req.params.id;
      const { title, description } = req.body;

      const post = await Post.findByPk(id);
      if (!post) throw { name: "NotFound", message: `Post id ${id} not found` };

      await post.update({ title, description });
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const id = +req.params.id;
      const post = await Post.findByPk(id);
      if (!post) throw { name: "NotFound", message: `Post id ${id} not found` };

      await post.destroy();
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
