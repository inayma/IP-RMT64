const { User } = require('../models');
const { comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });

      res.status(201).json({
        message: 'User registered successfully',
        id: user.id,
        email: user.email
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user || !comparePassword(password, user.password)) {
        throw { name: 'Unauthorized', message: 'Invalid email/password' };
      }

      const access_token = signToken({ id: user.id });

      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
