const config = require('config'),
    jwt = require('jsonwebtoken'),
    logger = require('../../logger'),
    acl = require('express-acl');

const loggerName = "[ValidateRequest]: ";

module.exports = function (req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (req.originalUrl === '/api/v1/auth') {
        logger.debug(loggerName, "Validate request skipped because of /api/v1/auth");
        next();
    } else {
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    logger.info(loggerName, err);
                    return res.status(401).json({success: false, message: err});
                } else {
                    req.decoded = decoded;
                    req.token = token;
                    next();
                }
            });
        } else {
            return res.status(403).json({
                success: false,
                message: 'No token provided.'
            });
        }
    }
};
