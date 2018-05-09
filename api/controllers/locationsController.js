'use strict';

const mongoose = require('mongoose'),
    locationsModel = mongoose.model('locations'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    locationConverter = require("../converters/locationsConverter"),
    logger = require('../../logger');

const loggerName = "[LocationsController]: ";

exports.getLocations = function (req, res) {
    locationsModel.find({}).populate("company_id").exec(function (err, locations) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: locations
            });
        }
    });
};

exports.createLocation = function (req, res) {
    let newLocation = new locationsModel(req.body);

    newLocation.save(function (err, savedLocation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(locationConverter.convertToChaincode(savedLocation))];
            sendRabbitMQ.send(config.LOCATIONS_CHAINCODE, "create", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: savedLocation
                        });
                    }else
                    {
                        res.status(400).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });

        }
    });
};

exports.getLocation = function (req, res) {
    locationsModel.findById(req.params.locationId, function (err, location) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: location
            });
        }
    });
};

exports.updateLocation = function (req, res) {
    locationsModel.findOneAndUpdate({_id: req.params.locationId}, req.body, {new: true}, function (err, location) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {


            let args = [JSON.stringify(locationConverter.convertToChaincode(location))];
            sendRabbitMQ.send(config.LOCATIONS_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }
                else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: location
                        });
                        logger.info(loggerName, 'Location updated');
                    }else
                    {
                        res.status(400).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });
        }
    });
};

exports.deleteLocation = function (req, res) {
    locationsModel.findOneAndUpdate({_id: req.params.locationId}, {deleted: true}, {new: true}, function (err, location) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: {message: 'location successfully deleted'}
            });
            logger.info(loggerName, 'Location Deleted');
        }
    });
};
