const { Post } = require('../models');

module.exports = async function postAuthorization(req, res, next) {
  try {
    const id = +req.params.id;
    const post = await Post.findByPk(id);

    if (!post) {
      throw { name: 'NotFound', message: `Post id ${id} not found` };
    }

    if (post.userId !== req.user.id) {
      throw { name: 'Forbidden', message: 'Not your post!' };
    }

    next();
  } catch (error) {
    next(error);
  }
};
