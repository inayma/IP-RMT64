const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

module.exports = async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id);

    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    next(error);
  }
};
