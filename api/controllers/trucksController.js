'use strict';

const mongoose = require('mongoose'),
    trucksModel = mongoose.model('trucks'),
    truckModelsModel = mongoose.model('truckModels'),
    truckMakesModel = mongoose.model('truckMakes'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    trucksConverter = require("../converters/trucksConverter"),
    logger = require('../../logger');

const loggerName = "[TrucksController]: ";


exports.getTrucks = function (req, res) {
    trucksModel.find({}, function (err, trucks) {
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
                    result: trucks
                });
        }
    });
};

exports.createTruck = function (req, res) {
    let newTruck = new trucksModel(req.body);

    newTruck.save(function (err, savedTruck) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(trucksConverter.convertToChaincode(savedTruck))];
            sendRabbitMQ.send(config.TRUCKS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedTruck
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

exports.getTruck = function (req, res) {
    trucksModel.findById(req.params.truckId, function (err, truck) {
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
                    result: truck
                });
        }
    });
};

exports.updateTruck = function (req, res) {
    trucksModel.findOneAndUpdate({_id: req.params.truckId}, req.body, {new: true}, function (err, truck) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(trucksConverter.convertToChaincode(truck))];
            sendRabbitMQ.send(config.TRUCKS_CHAINCODE, "update", args, function (err, result) {
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
                                result: truck
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

exports.deleteTruck = function (req, res) {
    trucksModel.findOneAndUpdate({_id: req.params.truckId}, {deleted: true}, {new: true}, function (err, truck) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'truck successfully deleted'}});
            logger.info(loggerName, 'Truck Deleted');
        }
    });
};


exports.getAll_Trucks_Models_Makes = function (req, res) {
    trucksModel.find({}).populate("truck_makes_id").populate("truck_models_id").exec(function (err, trucks) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            truckModelsModel.find({}).populate("truck_makes_id").exec(function (err, truckmodels) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                } else {
                    truckMakesModel.find({}, function (err, truckmakes) {
                        if (err) {
                            res.status(400).json({
                                success: false,
                                result: err
                            });
                        } else {
                            res.status(200).json(
                                {
                                    success: true,
                                    result: {
                                        trucks: trucks,
                                        truckmodels: truckmodels,
                                        truckmakes: truckmakes
                                    }
                                });
                        }
                    });
                }
            });

        }
    });
};
