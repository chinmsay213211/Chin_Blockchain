'use strict';

const mongoose = require('mongoose'),
    truckMakesModel = mongoose.model('truckMakes'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    truckMakesConverter = require("../converters/truckMakesConverter"),
    logger = require('../../logger');

const loggerName = "[TruckmakesController]: ";

exports.getTruck_makes = function (req, res) {
    truckMakesModel.find({}, function (err, truck_makes) {
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
                    result: truck_makes
                });
        }
    });
};

exports.createTruck_make = function (req, res) {
    let newTruckMake = new truckMakesModel(req.body);

    newTruckMake.save(function (err, savedTruckMake) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(truckMakesConverter.convertToChaincode(savedTruckMake))];
            sendRabbitMQ.send(config.TRUCK_MAKES_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedTruckMake
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

exports.getTruck_make = function (req, res) {
    truckMakesModel.findById(req.params.truck_makeId, function (err, truck_make) {
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
                    result: truck_make
                });
        }
    });
};

exports.updateTruck_make = function (req, res) {
    truckMakesModel.findOneAndUpdate({_id: req.params.truck_makeId}, req.body, {new: true}, function (err, truck_make) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(truckMakesConverter.convertToChaincode(truck_make))];
            sendRabbitMQ.send(config.TRUCK_MAKES_CHAINCODE, "update", args, function (err, result) {
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
                                result: truck_make
                            });
                        logger.info(loggerName, 'truck_make updated');
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

exports.deleteTruck_make = function (req, res) {
    truckMakesModel.findOneAndUpdate({_id: req.params.truck_makeId}, {deleted: true}, {new: true}, function (err, truck_make) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'truck_make successfully deleted'}});
            logger.info(loggerName, 'truck_make Deleted');
        }
    });
};
