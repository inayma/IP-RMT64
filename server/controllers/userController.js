const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { Op } = require("sequelize");

const GOOGLE_CLIENT_ID =
  "584929634825-8j870f1f1dsv9cd2g8fj6g265b1r3b14.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });

      res.status(201).json({
        message: "User registered successfully",
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;

      // Find user by either email or username
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
      });

      if (!user || !comparePassword(password, user.password)) {
        throw {
          name: "Unauthorized",
          message: "Invalid email/username or password",
        };
      }

      const access_token = signToken({ id: user.id });

      res.status(200).json({
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req, res, next) {
    try {
      const { credential } = req.body;

      // Verify Google ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email: verifiedEmail, name, picture } = payload;

      // Check if user already exists
      let user = await User.findOne({
        where: {
          email: verifiedEmail,
        },
      });

      if (!user) {
        // Create new user
        user = await User.create({
          username: name || verifiedEmail.split("@")[0],
          email: verifiedEmail,
          password: "google_oauth_" + googleId, // Placeholder password
          googleId: googleId,
          picture: picture,
        });
      }

      // Generate JWT token
      const access_token = signToken({ id: user.id });

      res.status(200).json({
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
