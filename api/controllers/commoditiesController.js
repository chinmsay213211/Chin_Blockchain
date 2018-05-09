'use strict';

const mongoose = require('mongoose'),
    commoditiesModel = mongoose.model('commodities'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    logger = require('../../logger'),
    commodityConverter = require("../converters/commoditiesConverter");

const loggerName = "[CommoditiesController]: ";

exports.getCommodities = function (req, res) {
    commoditiesModel.find({}, function (err, commodities) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: commodities
            });
        }
    });
};

exports.createCommodity = function (req, res) {
    logger.debug("createCommodity executed");
    let newCommodity = new commoditiesModel(req.body);

    newCommodity.save(function (err, savedCommodity) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(commodityConverter.convertToChaincode(savedCommodity))];
            sendRabbitMQ.send(config.COMMODITIES_CHAINCODE, "create", args,function (err,result) {
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
                            result: savedCommodity
                        });
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

exports.getCommodity = function (req, res) {
    commoditiesModel.findById(req.params.commodityId, function (err, commodity) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: commodity
            });
        }
    });
};

exports.updateCommodity = function (req, res) {
    commoditiesModel.findOneAndUpdate({_id: req.params.commodityId}, req.body, {new: true}, function (err, commodity) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(commodityConverter.convertToChaincode(commodity))];
            sendRabbitMQ.send(config.COMMODITIES_CHAINCODE, "update", args,function (err,result) {
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
                            result: commodity
                        });
                        logger.info(loggerName, 'Commodity updated');
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

exports.deleteCommodity = function (req, res) {
    commoditiesModel.findOneAndUpdate({_id: req.params.commodityId}, {deleted: true}, {new: true}, function (err, commodity) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: {message: 'Commodity successfully deleted'}
            });
            logger.info(loggerName, 'Commodity Deleted');
        }
    });
};
