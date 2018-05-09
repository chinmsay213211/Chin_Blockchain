'use strict';

const mongoose = require('mongoose'),
    lotsModel = mongoose.model('lots'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    lotConverter = require("../converters/lotsConverter"),
    logger = require('../../logger'),
    util = require('util');

const loggerName = "[LotsController]: ";

exports.getLots = function (req, res) {
    logger.debug(loggerName, loggerName, "getLots executed");
    lotsModel.find({}, function (err, lots) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: lots
            });
        }
    });
};

exports.createLot = function (req, res) {
    logger.debug(loggerName, "createLot executed with " + util.inspect(req.body, {showHidden: false}));
    let newLot = new lotsModel(req.body);
    newLot.save(function (err, savedLot) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(lotConverter.convertToChaincode(savedLot))];
            sendRabbitMQ.send(config.LOTS_CHAINCODE, "create", args,function (err,result) {
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
                            result: savedLot
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

exports.getLot = function (req, res) {
    logger.debug(loggerName, "getLot executed");
    lotsModel.findById(req.params.lotId, function (err, lot) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: lot
            });
        }
    });
};

exports.updateLot = function (req, res) {
    lotsModel.findOneAndUpdate({_id: req.params.lotId}, req.body, {new: true}, function (err, lot) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(lotConverter.convertToChaincode(lot))];
            sendRabbitMQ.send(config.LOTS_CHAINCODE, "update", args,function (err,result) {
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
                            result: lot
                        });
                        logger.info(loggerName, 'Lot updated');
                    }
                    else
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

exports.deleteLot = function (req, res) {
    lotsModel.findOneAndUpdate({_id: req.params.lotId}, {deleted: true}, {new: true}, function (err, lot) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: {message: 'lot successfully deleted'}
            });
            logger.info(loggerName, 'Lot Deleted');
        }
    });
};
