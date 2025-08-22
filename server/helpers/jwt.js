const jwt = require("jsonwebtoken");

const SECRET = "your_secret_key"; // 🔒 change to process.env.JWT_SECRET later

function signToken(payload) {
  return jwt.sign(payload, SECRET);
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
