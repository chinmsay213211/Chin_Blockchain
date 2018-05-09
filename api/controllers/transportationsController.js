'use strict';

const mongoose = require('mongoose'),
    transportationsModel = mongoose.model('transportations'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    transportationsConverter = require("../converters/transportationsConverter"),
    logger = require('../../logger');

const loggerName = "[TransportationsController]: ";

exports.getTransportations = function (req, res) {
    transportationsModel.find({}, function (err, transportations) {
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
                    result: transportations
                });
        }
    });
};

exports.createTransportation = function (req, res) {
    let newTransportation = new transportationsModel(req.body);

    newTransportation.save(function (err, savedTransportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(transportationsConverter.convertToChaincode(savedTransportation))];
            sendRabbitMQ.send(config.TRANSPORTATIONS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedTransportation
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

exports.getTransportation = function (req, res) {
    transportationsModel.findById(req.params.transportationId, function (err, transportation) {
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
                    result: transportation
                });
        }
    });
};

exports.updateTransportation = function (req, res) {
    transportationsModel.findOneAndUpdate({_id: req.params.transportationId}, req.body, {new: true}, function (err, transportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {


            let args = [JSON.stringify(transportationsConverter.convertToChaincode(transportations))];
            sendRabbitMQ.send(config.TRANSPORTATIONS_CHAINCODE, "update", args, function (err, result) {
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
                                result: transportation
                            });
                        logger.info(loggerName, 'Transportation updated');
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

exports.deleteTransportation = function (req, res) {
    transportationsModel.remove({_id: req.params.transportationId}, {deleted: true}, {new: true}, function (err, transportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'transportation successfully deleted'}});
            logger.info(loggerName, 'Transportation Deleted');
        }
    });
};
