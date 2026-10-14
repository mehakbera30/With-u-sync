const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "careconnect_default_fallback_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

module.exports = generateToken;
