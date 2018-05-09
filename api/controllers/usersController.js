'use strict';

const mongoose = require('mongoose'),
    randomstring = require('randomstring'),
    usersModel = mongoose.model('users'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    authController = require('./authController'),
    userConverter = require("../converters/usersConverter"),
    logger = require('../../logger');

const loggerName = "[UsersController]: ";

exports.getUsers = function (req, res) {
    logger.debug(loggerName, "getUsers executed");
    usersModel.find({}).populate("company_id").exec(function (err, users) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: users
                });
        }
    });
};

exports.getCompanyUsers = function (req, res) {
    logger.debug(loggerName, "getCompanyUsers executed with: " + req.params.companyId);
    usersModel.find({company_id: req.params.companyId}, function (err, users) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: users
                });
        }
    });
};

exports.createUser = function (req, res) {
    let newUser = new usersModel(req.body);
    newUser.invitation_code = randomstring.generate(32);

    newUser.save(function (err, savedUser) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(userConverter.convertToChaincode(savedUser))];
            sendRabbitMQ.send(config.USERS_CHAINCODE, "create", args, function (err, resultnode
            ) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                } else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: savedUser
                            });
                    } else {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                    }
                }
            });

        }
    });
};

exports.getUser = function (req, res) {
    usersModel.findById(req.params.userId, function (err, user) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: user
                });
        }
    });
};

exports.updateUser = function (req, res) {
    usersModel.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function (err, user) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(userConverter.convertToChaincode(user))];
            sendRabbitMQ.send(config.USERS_CHAINCODE, "update", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                } else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: user
                            });
                        logger.info(loggerName, 'User updated');

                    } else {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                    }
                }
            });
        }
    });
};

exports.deleteUser = function (req, res) {
    usersModel.findOneAndUpdate({_id: req.params.userId}, {deleted: true}, {new: true}, function (err, user) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'User successfully deleted'}});
            logger.info(loggerName, 'User Deleted');
        }
    });
};
