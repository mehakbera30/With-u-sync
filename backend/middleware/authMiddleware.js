const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "careconnect_default_fallback_secret_key"
      );

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found with this token",
        });
      }

      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token invalid or expired",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

// Authorize roles (e.g. authorize("doctor"), authorize("patient", "doctor"))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "unknown"}' is not authorized to access this resource`,
      });
    }

    // WithUSync has one authorized administrator account.
    if (req.user.role === "admin" && process.env.ADMIN_EMAIL) {
      if (req.user.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: "This administrator account is not authorized.",
        });
      }
    }

    next();
  };
};

module.exports = { protect, authorize };
