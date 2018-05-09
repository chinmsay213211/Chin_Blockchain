'use strict';

const mongoose = require('mongoose'),
    transportationLogsModel = mongoose.model('transportationLogs'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    transportationLogsConverter = require("../converters/transportationLogsConverter"),
    logger = require('../../logger');

const loggerName = "[TransportaionLogsController]: ";

exports.getTransportation_logs = function (req, res) {
    transportationLogsModel.find({}, function (err, transportation_logs) {
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
                    result: transportation_logs
                });
        }
    });
};

exports.createTransportation_log = function (req, res) {
    let newTransportationLog = new transportationLogsModel(req.body);

    newTransportationLog.save(function (err, savedTransportationLog) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(transportationLogsConverter.convertToChaincode(savedTransportationLogs))];
            sendRabbitMQ.send(config.TRANSPORTATION_LOGS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedTransportationLog
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

exports.getTransportation_log = function (req, res) {
    transportationLogsModel.findById(req.params.transportation_logId, function (err, transportation_log) {
        if (err)
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
                        result: transportation_log
                    });
            }
    });
};

exports.updateTransportation_log = function (req, res) {
    transportationLogsModel.findOneAndUpdate({_id: req.params.transportation_logId}, req.body, {new: true}, function (err, transportation_log) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(transportationLogsConverter.convertToChaincode(transportation_log))];
            sendRabbitMQ.send(config.TRANSPORTATION_LOGS_CHAINCODE, "UPDATE", args, function (err, result) {
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
                                result: transportation_log
                            });
                        logger.info(loggerName, 'Transportation_log updated');

                    } else {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                        logger.info(loggerName, 'Transportation_log updated');
                    }
                }
            });
        }
    });
};

exports.deleteTransportation_log = function (req, res) {
    transportationLogsModel.findOneAndUpdate({_id: req.params.transportation_logId}, {deleted: true}, {new: true}, function (err, transportation_log) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'transportation_log successfully deleted'}});
            logger.info(loggerName, 'Transportation_log Deleted');
        }
    });
};
