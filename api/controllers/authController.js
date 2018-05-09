'use strict';

const mongoose = require('mongoose'),
    config = require('config'),
    logger = require('../../logger'),
    jwt = require('jsonwebtoken'),
    randomstring = require("randomstring"),
    ursa = require('ursa'),
    QRCode = require('qrcode'),
    sendEmail = require('../middlewares/QRcodeEmailVerification'),
    usersModel = mongoose.model('users'),
    util = require('util'),
    asnController = require('./asnController');

const loggerName = "[AuthController]: ";

exports.verifySignature = function (req, res) {

    let signature = req.headers.signature;
    let public_key = req.body.public_key;
    //let code = req.body.code;

    let pk = '-----BEGIN PUBLIC KEY-----\n' + public_key + '\n' + '-----END PUBLIC KEY-----';

    let pub = ursa.createPublicKey(pk);
    let verifier = ursa.createVerifier('SHA256');
    //verifier.update(code, 'utf8');
    let result = verifier.verify(pub, signature, 'base64');

    if (result) {
        res.status(200).json({success: true});
        logger.info(loggerName, 'Public Key Verified');
    }
    else {
        res.status(400).json({success: false});
        logger.debug(loggerName, 'Public Key Verification failed');
    }
};

/**
 * @param req
 * @param res
 *
 * @param req.body.invitation_code - invitation code that user has received from his email
 * @param req.body.public_key
 */

exports.auth = function (req, res) {
    logger.debug(loggerName, "auth executed with args " + util.inspect(req.body, {showHidden: false}));
    let invitationCode = req.body.invitation_code;
    let publicKey = req.body.public_key;

    usersModel.findOne({'invitation_code': invitationCode}, function (err, storedUser) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).send({
                success: false,
                result: err
            });
        } else {
            if (!storedUser) {
                logger.debug(loggerName, "Authentication failed");
                res.json({success: false, message: 'Authentication failed. User not found.'});
            } else if (storedUser) {
                storedUser.public_keys.push(publicKey);

                let authData = {
                    _id: storedUser._id,
                    role: storedUser.role,
                    email: storedUser.email,
                    phone_number: storedUser.phone_number
                };

                let token = jwt.sign(authData, config.secret, {
                    expiresIn: config.jwt_expiretime
                });

                logger.debug(loggerName, "Successfully authorized");

                res.status(200).json({
                    success: true,
                    token: token,
                    user_id: storedUser._id,
                    user_fname: storedUser.first_name,
                    user_lname: storedUser.last_name,
                    user_role: storedUser.role,
                    user_company_id: storedUser.company_id,
                    user_email: storedUser.email
                });
            }
        }
    });
};

exports.generateQRCode = function (user) {
    QRCode.toDataURL(user.invitation_code, function (err, base64) {
        if (err) {
            return logger.debug(loggerName, 'There was an error ' + err);
        } else {
            let base64img = base64.substring(22);
            sendEmail.QRcodeEmailVerification(user, base64img);
        }
    });
};
