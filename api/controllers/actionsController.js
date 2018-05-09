'use strict';

const mongoose = require('mongoose'),
    actionsModel = mongoose.model('actions'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    logger = require('../../logger'),
    actionConverter = require("../converters/actionsConverter"),
    util = require('util');

const loggerName = "[ActionsController]: ";

exports.getActions = function (req, res) {
    logger.debug(loggerName, "getActions executed");
    actionsModel.find({}, function (err, actions) {
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
                    result: actions
                });
        }
    });
};

exports.createAction = function (req, res) {
    logger.debug("createAction executed with " + util.inspect(req.body));
    let newAction = new actionsModel(req.body);

    newAction.save(function (err, savedAction) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(actionConverter.convertToChaincode(savedAction))];
            sendRabbitMQ.send(config.ACTIONS_CHAINCODE, "create", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }
                else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: savedAction
                            });
                    }
                    else {
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

exports.getAction = function (req, res) {
    actionsModel.findById(req.params.actionId, function (err, action) {
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
                    result: action
                });
        }
    });
};

exports.updateAction = function (req, res) {
    actionsModel.findOneAndUpdate({_id: req.params.actionId}, req.body, {new: true}, function (err, action) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(actionConverter.convertToChaincode(action))];
            sendRabbitMQ.send(config.ACTIONS_CHAINCODE, "update", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }
                else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: action
                            });
                        logger.debug(loggerName, "Action updated");
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

exports.deleteAction = function (req, res) {
    actionsModel.findOneAndUpdate({_id: req.params.actionId}, {deleted: true}, {new: true}, function (err, action) {
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
                    result: {message: 'action successfully deleted'}
                });
            logger.debug(loggerName, "Action deleted");
        }
    });
};
