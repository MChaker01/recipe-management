const User = require("../models/User");
const jwt = require("jsonwebtoken");

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // decoded contient le payload : { id: "user_id", iat: ..., exp: ... }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return next();
    }
  } else {
    return next();
  }
};

module.exports = { optionalAuth };
