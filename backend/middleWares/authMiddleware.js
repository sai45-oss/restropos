const createHttpError = require("http-errors");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        createHttpError(
          403,
          `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
