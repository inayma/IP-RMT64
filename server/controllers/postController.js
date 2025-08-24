const { Post, User, Vote } = require("../models");

class PostController {
  static async getAll(req, res, next) {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "username", "email", "picture"],
          },
          {
            model: Vote,
            attributes: ["value"],
            separate: true,
          },
        ],
      });

      // Calculate vote totals for each post
      const postsWithVotes = posts.map((post) => {
        const votes = post.Votes || [];
        const upvotes = votes.filter((vote) => vote.value === 1).length;
        const downvotes = votes.filter((vote) => vote.value === -1).length;
        const totalVotes = upvotes - downvotes;

        return {
          ...post.toJSON(),
          votes: totalVotes,
          upvotes,
          downvotes,
        };
      });

      res.json(postsWithVotes);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const id = +req.params.id;
      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "email", "picture"],
          },
          {
            model: Vote,
            attributes: ["value"],
            separate: true,
          },
        ],
      });

      if (!post) throw { name: "NotFound", message: `Post id ${id} not found` };

      // Calculate vote totals
      const votes = post.Votes || [];
      const upvotes = votes.filter((vote) => vote.value === 1).length;
      const downvotes = votes.filter((vote) => vote.value === -1).length;
      const totalVotes = upvotes - downvotes;

      const postWithVotes = {
        ...post.toJSON(),
        votes: totalVotes,
        upvotes,
        downvotes,
      };

      res.json(postWithVotes);
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
      const postId = +req.params.id;
      const userId = req.user.id;
      const { voteType } = req.body; // 'up' or 'down'

      const post = await Post.findByPk(postId);
      if (!post)
        throw { name: "NotFound", message: `Post id ${postId} not found` };

      const voteValue = voteType === "up" ? 1 : -1;

      // Check if user already voted on this post
      const existingVote = await Vote.findOne({
        where: { userId, postId },
      });

      if (existingVote) {
        if (existingVote.value === voteValue) {
          // User clicked same vote - remove vote
          await existingVote.destroy();
        } else {
          // User clicked opposite vote - update vote
          await existingVote.update({ value: voteValue });
        }
      } else {
        // Create new vote
        await Vote.create({
          userId,
          postId,
          value: voteValue,
        });
      }

      // Get updated post with vote counts
      const updatedPost = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "email", "picture"],
          },
          {
            model: Vote,
            attributes: ["value"],
            separate: true,
          },
        ],
      });

      const votes = updatedPost.Votes || [];
      const upvotes = votes.filter((vote) => vote.value === 1).length;
      const downvotes = votes.filter((vote) => vote.value === -1).length;
      const totalVotes = upvotes - downvotes;

      const result = {
        ...updatedPost.toJSON(),
        votes: totalVotes,
        upvotes,
        downvotes,
      };

      res.json(result);
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

      // Check if user owns this post
      if (post.userId !== req.user.id) {
        throw {
          name: "Forbidden",
          message: "You can only edit your own posts",
        };
      }

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

      // Check if user owns this post
      if (post.userId !== req.user.id) {
        throw {
          name: "Forbidden",
          message: "You can only delete your own posts",
        };
      }

      await post.destroy();
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
