const config = require("../config/config");

const globalerrorhandle = (err, req, res, next) => {
    const statuscode = err.statusCode || 500;

    return res.status(statuscode).json({
        status: statuscode,
        message: err.message,
        errorstack: config.nodeEnv === "development" ? err.stack:""
    })
}

module.exports = globalerrorhandle;