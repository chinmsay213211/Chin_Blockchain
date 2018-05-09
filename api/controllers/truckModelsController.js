'use strict';

const mongoose = require('mongoose'),
    truckModelsModel = mongoose.model('truckModels'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    truckModelsConverter = require("../converters/truckModelsConverter"),
    logger = require('../../logger');

const loggerName = "[TruckmodelsController]: ";

exports.getTruck_models = function (req, res) {
    truckModelsModel.find({}, function (err, truck_models) {
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
                    result: truck_models
                });
        }
    });
};

exports.createTruck_model = function (req, res) {
    let newTruckModel = new truckModelsModel(req.body);

    newTruckModel.save(function (err, savedTruckModel) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(truckModelsConverter.convertToChaincode(savedTruckModel))];
            sendRabbitMQ.send(config.TRUCK_MODELS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedTruckModel
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

exports.getTruck_model = function (req, res) {
    truckModelsModel.findById(req.params.truck_modelId, function (err, truck_model) {
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
                    result: truck_model
                });
        }
    });
};

exports.updateTruck_model = function (req, res) {
    truckModelsModel.findOneAndUpdate({_id: req.params.truck_modelId}, req.body, {new: true}, function (err, truck_model) {

        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(truckModelsConverter.convertToChaincode(truck_model))];
            sendRabbitMQ.send(config.TRUCK_MODELS_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }else
                {
                    if(result.success)
                    {
                        res.status(200).json(
                            {
                                success: true,
                                result: truck_model
                            });
                        logger.info(loggerName, 'truck_make updated');

                    }
                    else
                    {
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

exports.deleteTruck_model = function (req, res) {
    truckModelsModel.findOneAndUpdate({_id: req.params.truck_modelId}, {deleted: true}, {new: true}, function (err, truck_model) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'truck_model successfully deleted'}});
            logger.info(loggerName, 'truck_model Deleted');
        }
    });
};
